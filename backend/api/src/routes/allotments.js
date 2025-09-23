const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

function sumRoomCapacity(rooms) { return rooms.reduce((a, r) => a + (r.capacity || 0), 0); }

async function loadEligibleStudents(round) {
  const students = await prisma.student.findMany({ include: { user: true } });
  let filtered = students.filter(s => !s.hostel_id || s.status === 'pending');
  if (round) {
    const from = round.open_date;
    const to = round.close_date || new Date();
    const apps = await prisma.application.findMany({
      where: {
        type: 'admission',
        created_at: { gte: from, lte: to }
      },
      select: { student_id: true }
    });
    const allowed = new Set(apps.map(a => a.student_id));
    // Also include prior waitlisted students
    const wl = await prisma.waitlist.findMany({ select: { student_id: true } });
    wl.forEach(w => allowed.add(w.student_id));
    filtered = filtered.filter(s => allowed.has(s.user_id));
  }
  return filtered;
}

async function getPreferencesMap() {
  const prefs = await prisma.studentPreference.findMany({});
  const map = new Map();
  for (const p of prefs) {
    if (!map.has(p.student_id)) map.set(p.student_id, []);
    map.get(p.student_id).push({ block_id: p.block_id, rank: p.rank, weight: p.weight || null });
  }
  for (const [k, arr] of map.entries()) arr.sort((a,b)=>a.rank-b.rank);
  return map;
}

function computeDeptTotals(students) {
  const totals = {};
  for (const s of students) {
    const d = s.user?.department || 'Unknown';
    totals[d] = (totals[d] || 0) + 1;
  }
  return totals;
}

async function loadBlocksWithCapacity() {
  const blocks = await prisma.hostelBlock.findMany({ include: { rooms: true } });
  const now = new Date();
  return blocks.map(b => {
    const isClosed = b.closed_until && new Date(b.closed_until) > now;
    const usableRooms = (b.rooms || []).filter(r => !r.maintenance && r.availability !== 'maintenance' && !(r.temp_closed_until && new Date(r.temp_closed_until) > now));
    const cap = isClosed ? 0 : (sumRoomCapacity(usableRooms) || b.capacity || 0);
    return { id: b.id, name: b.name, capacity: cap };
  });
}

function majorityChoice(students, blocks, prefsMap, quotasMap, opts) {
  const constraints = opts?.constraints || null;
  const waitlistedSet = opts?.waitlistedSet || new Set();
  const cap = Object.fromEntries(blocks.map(b => [b.id, b.capacity]));
  const accepted = Object.fromEntries(blocks.map(b => [b.id, []]));
  const deptTotals = computeDeptTotals(students);
  const quotas = {}; // block -> dept quotas
  for (const b of blocks) {
    quotas[b.id] = {};
    const configured = quotasMap?.[b.id];
    if (configured && Object.keys(configured).length) {
      quotas[b.id] = configured;
    } else {
      const total = Object.values(deptTotals).reduce((a,b)=>a+b,0) || 1;
      for (const [dept, cnt] of Object.entries(deptTotals)) quotas[b.id][dept] = Math.round((b.capacity * cnt) / total);
    }
  }
  const rejections = new Set();
  let unstable = true; let rounds = 0;
  const proposalsIdx = new Map(students.map(s => [s.user_id, 0]));

  function allowedForBlock(student, blockId) {
    const conf = constraints?.hard?.blocks?.[blockId];
    if (!conf) return true;
    const dept = student.user?.department || 'Unknown';
    const year = student.user?.year || 0;
    if (Array.isArray(conf.denyDepartments) && conf.denyDepartments.includes(dept)) return false;
    if (Array.isArray(conf.denyYears) && conf.denyYears.includes(year)) return false;
    if (Array.isArray(conf.allowDepartments) && conf.allowDepartments.length && !conf.allowDepartments.includes(dept)) return false;
    if (Array.isArray(conf.allowYears) && conf.allowYears.length && !conf.allowYears.includes(year)) return false;
    return true;
  }

  while (unstable && rounds < 20) {
    unstable = false; rounds++;
    for (const s of students) {
      const key = `${s.user_id}`;
      if (rejections.has(key)) continue;
      const prefs = prefsMap.get(s.user_id) || []; if (!prefs.length) continue;
      const i = proposalsIdx.get(s.user_id) || 0; if (i >= prefs.length) continue;
      const choice = prefs[i].block_id;
      if (!allowedForBlock(s, choice)) { proposalsIdx.set(s.user_id, i+1); unstable = true; continue; }
      const list = accepted[choice];
      // rank function favors under-quota departments first, then year desc
      function rank(entry) {
        const student = entry.student || entry; const dept = student.user?.department || 'Unknown';
        const currentDeptCount = list.filter(e => (e.student?.user?.department || 'Unknown') === dept).length;
        const under = currentDeptCount < (quotas[choice][dept] || 0) ? 1000 : 0;
        const yearScore = student.user?.year || 0;
        const waitBoost = waitlistedSet.has(student.user_id) ? (constraints?.waitlistBoost || 0) : 0;
        let score = under + yearScore + waitBoost;
        // Soft caps penalties
        const softBlock = constraints?.soft?.blocks?.[choice] || {};
        const deptCaps = softBlock.deptCaps || constraints?.soft?.deptCaps || null;
        const yearCaps = softBlock.yearCaps || constraints?.soft?.yearCaps || null;
        const overPenalty = constraints?.soft?.penaltyOverCap ?? 100;
        if (deptCaps && typeof deptCaps[dept] === 'number') {
          const capForDept = deptCaps[dept];
          if (currentDeptCount >= capForDept) score -= overPenalty;
        }
        if (yearCaps && typeof yearCaps[yearScore] === 'number') {
          const capForYear = yearCaps[yearScore];
          const currentYearCount = list.filter(e => (e.student?.user?.year || 0) === yearScore).length;
          if (currentYearCount >= capForYear) score -= overPenalty;
        }
        return score;
      }
      list.push({ student: s, rank: 0 });
      if (list.length > cap[choice]) {
        list.sort((a,b)=>rank(b)-rank(a));
        const removed = list.pop();
        if (removed.student.user_id === s.user_id) { proposalsIdx.set(s.user_id, i+1); unstable = true; }
        else { // someone else got removed; they will propose next
          proposalsIdx.set(removed.student.user_id, (proposalsIdx.get(removed.student.user_id) || 0) + 1);
          unstable = true;
        }
      }
    }
  }
  const result = [];
  for (const b of blocks) for (const e of accepted[b.id]) result.push({ student_id: e.student.user_id, block_id: b.id });
  return result;
}

function priorityBased(students, blocks, opts) {
  const { w_year=1, w_distance=1, w_semester=1 } = opts || {};
  const cap = Object.fromEntries(blocks.map(b => [b.id, b.capacity]));
  const remaining = new Set(students.map(s => s.user_id));
  const assignments = [];
  function score(s) {
    const year = s.user?.year || 0;
    const distance = (s.data_distance_km || 0); // attached later
    const semester = s.data_semester || 0;
    return w_year*year + w_distance*distance + w_semester*semester;
  }
  const sorted = [...students].sort((a,b)=>score(b)-score(a));
  const blockIds = blocks.map(b=>b.id);
  for (const s of sorted) {
    for (const bid of blockIds) {
      if (cap[bid] > 0) { assignments.push({ student_id: s.user_id, block_id: bid }); cap[bid]--; remaining.delete(s.user_id); break; }
    }
  }
  return assignments;
}

function computeMetrics(assignments, prefsMap) {
  let top1=0, top2=0, withPref=0;
  for (const a of assignments) {
    const prefs = prefsMap.get(a.student_id) || [];
    const idx = prefs.findIndex(p => p.block_id === a.block_id);
    if (idx !== -1) { withPref++; if (idx===0) top1++; if (idx<=1) top2++; }
  }
  const total = assignments.length || 1;
  return { top1_rate: top1/total, top2_rate: top2/total, with_pref_rate: withPref/total };
}

async function loadQuotasMap() {
  const rows = await prisma.blockQuota.findMany();
  const map = {};
  for (const r of rows) {
    if (!map[r.block_id]) map[r.block_id] = {};
    map[r.block_id][r.department] = r.quota_number || 0;
  }
  return map;
}

function computeFairness(assignments, students, blocks) {
  const byDept = {};
  const studentDept = new Map(students.map(s => [s.user_id, s.user?.department || 'Unknown']));
  const byBlockDept = Object.fromEntries(blocks.map(b => [b.id, {}]));
  for (const a of assignments) {
    const dept = studentDept.get(a.student_id) || 'Unknown';
    byDept[dept] = (byDept[dept] || 0) + 1;
    const m = byBlockDept[a.block_id] || (byBlockDept[a.block_id] = {});
    m[dept] = (m[dept] || 0) + 1;
  }
  return { per_dept: byDept, by_block_dept: byBlockDept };
}

function makeAllowedForBlock(constraints) {
  return function allowedForBlock(student, blockId) {
    const conf = constraints?.hard?.blocks?.[blockId];
    if (!conf) return true;
    const dept = student.user?.department || 'Unknown';
    const year = student.user?.year || 0;
    if (Array.isArray(conf.denyDepartments) && conf.denyDepartments.includes(dept)) return false;
    if (Array.isArray(conf.denyYears) && conf.denyYears.includes(year)) return false;
    if (Array.isArray(conf.allowDepartments) && conf.allowDepartments.length && !conf.allowDepartments.includes(dept)) return false;
    if (Array.isArray(conf.allowYears) && conf.allowYears.length && !conf.allowYears.includes(year)) return false;
    return true;
  };
}

router.post('/dry-run', auth, requireRole(Roles.admin), async (req, res) => {
  const { method = 'majority', weights = {}, round_id, tiebreaker = 'year', constraints = null } = req.body || {};
  let round = null;
  if (round_id) {
    round = await prisma.admissionRound.findUnique({ where: { id: round_id } });
    if (!round) return res.status(400).json({ error: 'Invalid round_id' });
  } else {
    round = await prisma.admissionRound.findFirst({ where: { status: 'open' }, orderBy: { open_date: 'desc' } });
    if (!round) return res.status(400).json({ error: 'No open round' });
  }
  const students = await loadEligibleStudents(round);
  // attach admission form fields for scoring
  const apps = await prisma.application.findMany({ where: { type: 'admission', student_id: { in: students.map(s=>s.user_id) } }, orderBy: { created_at: 'desc' } });
  const latest = new Map(); for (const a of apps) if (!latest.has(a.student_id)) latest.set(a.student_id, a);
  for (const s of students) { const a = latest.get(s.user_id); const d = (a?.data||{}); s.data_distance_km = d.distance_km||0; s.data_semester = d.semester||0; s.data_cgpa = d.cgpa || 0; }
  const blocks = await loadBlocksWithCapacity();
  const prefsMap = await getPreferencesMap();
  const quotasMap = await loadQuotasMap();
  const waitlisted = await prisma.waitlist.findMany({ select: { student_id: true } });
  const waitlistedSet = new Set(waitlisted.map(w => w.student_id));
  let assignments = [];
  if (method === 'majority') assignments = majorityChoice(students, blocks, prefsMap, quotasMap, { constraints, waitlistedSet });
  else if (method === 'weighted') {
    // Greedy weighted matching by preference rank (1/rank)
    const entries = [];
    const cap = Object.fromEntries(blocks.map(b => [b.id, b.capacity]));
    const assigned = new Set();
    for (const s of students) {
      const prefs = prefsMap.get(s.user_id) || [];
      for (const p of prefs) {
        const base = p.weight != null ? Number(p.weight) : (1 / Math.max(1, p.rank));
        entries.push({ s: s.user_id, b: p.block_id, score: base });
      }
    }
    function tie(a, b) {
      const sa = students.find(x=>x.user_id===a.s); const sb = students.find(x=>x.user_id===b.s);
      if (tiebreaker === 'cgpa') return (sb?.data_cgpa||0) - (sa?.data_cgpa||0);
      if (tiebreaker === 'distance') return (sb?.data_distance_km||0) - (sa?.data_distance_km||0);
      return (sb?.user?.year||0) - (sa?.user?.year||0);
    }
    entries.sort((a,b)=> (b.score - a.score) || tie(a,b));
    for (const e of entries) {
      if (assigned.has(e.s)) continue;
      if ((cap[e.b]||0) > 0) { assignments.push({ student_id: e.s, block_id: e.b }); cap[e.b]--; assigned.add(e.s); }
    }
  } else assignments = priorityBased(students, blocks, weights);
  const metrics = computeMetrics(assignments, prefsMap);
  const fairness = computeFairness(assignments, students, blocks);
  const assignedIds = new Set(assignments.map(a=>a.student_id));
  const waitlist = students.filter(s => !assignedIds.has(s.user_id)).map(s => ({ student_id: s.user_id, department: s.user?.department||'Unknown' }));
  res.json({ assignments, metrics, blocks, fairness, waitlist, round });
});

router.post('/roll-forward/preview', auth, requireRole(Roles.admin), async (req, res) => {
  const { from_round_id, to_round_id, maxReassign = 0, constraints = null } = req.body || {};
  // Identify rounds
  let from = null; let to = null;
  if (from_round_id) {
    from = await prisma.admissionRound.findUnique({ where: { id: from_round_id } });
  } else {
    from = await prisma.admissionRound.findFirst({ where: { status: 'finalized' }, orderBy: { close_date: 'desc' } });
  }
  if (!from) return res.status(400).json({ error: 'No finalized source round' });
  if (to_round_id) {
    to = await prisma.admissionRound.findUnique({ where: { id: to_round_id } });
  } else {
    to = await prisma.admissionRound.findFirst({ where: { status: 'open' }, orderBy: { open_date: 'desc' } });
  }
  if (!to) return res.status(400).json({ error: 'No open target round' });

  // Load state
  const blocks = await loadBlocksWithCapacity();
  const cap = Object.fromEntries(blocks.map(b => [b.id, b.capacity]));
  const currentTo = await prisma.allotment.findMany({ where: { round_id: to.id } });
  const currentByBlock = currentTo.reduce((m,a)=>{ m[a.block_id] = (m[a.block_id]||0)+1; return m; }, {});
  for (const b of blocks) cap[b.id] = Math.max(0, (cap[b.id]||0) - (currentByBlock[b.id]||0));

  const waitlist = await prisma.waitlist.findMany({ where: { round_id: from.id }, orderBy: { position: 'asc' }, include: { student: { include: { user: true } } } });
  const prefsMap = await getPreferencesMap();
  const quotasMap = await loadQuotasMap();
  const allowedForBlock = makeAllowedForBlock(constraints);

  // Helper: ranking inside a block (reuse majority logic pieces)
  function rankInBlock(blockId, listEntry) {
    const student = listEntry.student || listEntry; const dept = student.user?.department || 'Unknown';
    const list = (proposedAccepted[blockId] || []);
    const currentDeptCount = list.filter(e => (e.student?.user?.department || 'Unknown') === dept).length;
    const quota = (quotasMap?.[blockId]?.[dept] || 0);
    const under = currentDeptCount < quota ? 1000 : 0;
    const yearScore = student.user?.year || 0;
    const waitBoost = constraints?.waitlistBoost ? constraints.waitlistBoost : 0;
    let score = under + yearScore + waitBoost;
    const softBlock = constraints?.soft?.blocks?.[blockId] || {};
    const deptCaps = softBlock.deptCaps || constraints?.soft?.deptCaps || null;
    const yearCaps = softBlock.yearCaps || constraints?.soft?.yearCaps || null;
    const overPenalty = constraints?.soft?.penaltyOverCap ?? 100;
    if (deptCaps && typeof deptCaps[dept] === 'number') {
      const capForDept = deptCaps[dept];
      if (currentDeptCount >= capForDept) score -= overPenalty;
    }
    if (yearCaps && typeof yearCaps[yearScore] === 'number') {
      const capForYear = yearCaps[yearScore];
      const currentYearCount = list.filter(e => (e.student?.user?.year || 0) === yearScore).length;
      if (currentYearCount >= capForYear) score -= overPenalty;
    }
    return score;
  }

  // Build current accepted per block representation for ranking comparisons
  const studentsToRound = await prisma.student.findMany({ include: { user: true } });
  const studentById = new Map(studentsToRound.map(s=>[s.user_id, s]));
  const proposedAccepted = Object.fromEntries(blocks.map(b => [b.id, []]));
  for (const a of currentTo) {
    const s = studentById.get(a.student_id); if (s) proposedAccepted[a.block_id].push({ student: s });
  }

  const promotions = []; // { student_id, block_id }
  const reassignments = []; // { student_id, from_block_id, to_block_id }
  const nonPromoted = []; // { student_id, reason }
  let reassignUsed = 0;

  function tryAssignToPreferred(s) {
    const prefs = prefsMap.get(s.user_id) || [];
    let hadCapacityIssue = false; let hadConstraintIssue = false;
    for (const p of prefs) {
      const b = p.block_id;
      if (!allowedForBlock(s, b)) { hadConstraintIssue = true; continue; }
      if ((cap[b]||0) > 0) {
        cap[b]--; promotions.push({ student_id: s.user_id, block_id: b });
        proposedAccepted[b].push({ student: s });
        return true;
      }
      hadCapacityIssue = true;
      // attempt limited reassignment inside the same block
      if (maxReassign > 0 && reassignUsed < maxReassign) {
        const list = proposedAccepted[b]; if (!list || list.length === 0) continue;
        // Find the lowest-ranked existing student
        const ranked = list.map(e => ({ e, score: rankInBlock(b, e) }));
        ranked.sort((a,bx)=>a.score - bx.score);
        const lowest = ranked[0];
        const incomingScore = rankInBlock(b, { student: s });
        if (incomingScore > lowest.score) {
          // Try to move the displaced to an alternative block with free capacity
          const displaced = lowest.e.student;
          // Temporarily remove displaced from list
          const idx = list.indexOf(lowest.e); if (idx >= 0) list.splice(idx,1);
          // Look for another preferred block for displaced with capacity
          const dprefs = prefsMap.get(displaced.user_id) || [];
          let placed = false;
          for (const dp of dprefs) {
            const db = dp.block_id; if (db === b) continue;
            if (!allowedForBlock(displaced, db)) continue;
            if ((cap[db]||0) > 0) { cap[db]--; proposedAccepted[db].push({ student: displaced }); placed = true; break; }
          }
          if (placed) {
            // Accept incoming in desired block
            proposedAccepted[b].push({ student: s });
            reassignUsed++;
            const toBlk = (dprefs.find(dpx=> (cap[dpx.block_id]||0) >= 0 && allowedForBlock(displaced, dpx.block_id))?.block_id) || null;
            reassignments.push({ student_id: displaced.user_id, from_block_id: b, to_block_id: toBlk });
            promotions.push({ student_id: s.user_id, block_id: b });
            return true;
          } else {
            // put displaced back
            proposedAccepted[b].push(lowest.e);
          }
        }
      }
    }
    // No assignment happened
    nonPromoted.push({ student_id: s.user_id, reason: hadConstraintIssue ? 'blocked_by_constraints' : (hadCapacityIssue ? 'no_capacity_in_preferences' : 'no_preferences') });
    return false;
  }

  for (const w of waitlist) {
    const s = w.student; if (!s) continue;
    // skip if already assigned in target
    if (currentTo.find(a=>a.student_id===s.user_id)) continue;
    tryAssignToPreferred(s);
  }

  // Stats breakdowns
  function tally(list, pick) { return list.reduce((m,x)=>{ const k = pick(x); m[k]=(m[k]||0)+1; return m; },{}); }
  const userMap = new Map(studentsToRound.map(s=>[s.user_id,s]));
  const promoStudents = promotions.map(p=> userMap.get(p.student_id)).filter(Boolean);
  const nonPromoStudents = nonPromoted.map(np=> userMap.get(np.student_id)).filter(Boolean);
  const promotionsByDept = tally(promoStudents, s=> s.user?.department||'Unknown');
  const promotionsByYear = tally(promoStudents, s=> s.user?.year||0);
  const nonPromotedByReason = tally(nonPromoted, np=> np.reason||'unknown');
  const nonPromotedByDept = tally(nonPromoStudents, s=> s.user?.department||'Unknown');
  const nonPromotedByYear = tally(nonPromoStudents, s=> s.user?.year||0);

  // Audit preview
  try { await prisma.auditLog.create({ data: { actor_id: req.user.sub, action: 'roll_forward_preview', details: { from_round_id: from.id, to_round_id: to.id, maxReassign, constraints, promotions: promotions.length, reassignments: reassignments.length, nonPromoted: nonPromoted.length } } }); } catch {}
  res.json({ from_round: from, to_round: to, promotions, reassignments, nonPromoted, remaining_capacity: cap, stats: { promotionsByDept, promotionsByYear, nonPromotedByReason, nonPromotedByDept, nonPromotedByYear } });
});

router.post('/roll-forward/apply', auth, requireRole(Roles.admin), async (req, res) => {
  const { to_round_id, preview } = req.body || {};
  let to = null;
  if (to_round_id) to = await prisma.admissionRound.findUnique({ where: { id: to_round_id } });
  else to = await prisma.admissionRound.findFirst({ where: { status: 'open' }, orderBy: { open_date: 'desc' } });
  if (!to) return res.status(400).json({ error: 'No open target round' });
  const promotions = preview?.promotions || [];
  const reassignments = preview?.reassignments || [];
  if (!promotions.length && !reassignments.length) return res.status(400).json({ error: 'Nothing to apply' });

  // Snapshot existing target round before applying
  try {
    const existing = await prisma.allotment.findMany({ where: { round_id: to.id } });
    const snap = await prisma.allotmentSnapshot.create({ data: { round_id: to.id, meta: { kind: 'pre_roll_forward' } } });
    if (existing.length) {
      await prisma.allotmentSnapshotItem.createMany({ data: existing.map(a => ({ snapshot_id: snap.id, student_id: a.student_id, block_id: a.block_id })) });
    }
  } catch {}

  // Assign rooms similarly to finalize() but only for affected students
  const byBlock = promotions.reduce((m, a) => { (m[a.block_id] ||= []).push(a.student_id); return m; }, {});
  for (const [block_id, studentIds] of Object.entries(byBlock)) {
    const now = new Date();
    const rooms = await prisma.room.findMany({ where: { hostel_block_id: block_id, NOT: [{ availability: 'maintenance' }, { maintenance: true }] }, orderBy: [{ floor: 'asc' }, { room_no: 'asc' }] });
    const usable = rooms.filter(r => !(r.temp_closed_until && new Date(r.temp_closed_until) > now));
    // compute current occupancy and roommate groups by floor
    const occMap = new Map();
    const floorRooms = new Map();
    for (const r of usable) {
      const occ = await prisma.student.count({ where: { room_id: r.id } });
      occMap.set(r.id, occ);
      const f = r.floor||0; if (!floorRooms.has(f)) floorRooms.set(f, []); floorRooms.get(f).push(r);
    }
    const currentResidents = await prisma.student.findMany({ where: { hostel_id: block_id, room_id: { not: null } }, include: { user: true } });
    const residentFloor = new Map();
    for (const st of currentResidents) {
      const room = usable.find(u=>u.id===st.room_id); if (room) residentFloor.set(st.user_id, room.floor||0);
    }
    function bestRoomFor(studentId) {
      const prefFloor = residentFloor.get(studentId); // try keep floor if have one
      const candidates = prefFloor!=null && floorRooms.get(prefFloor) ? floorRooms.get(prefFloor) : usable;
      for (const r of candidates) {
        const occ = occMap.get(r.id) || 0; const cap = r.capacity || 0;
        if (occ < cap) return r.id;
      }
      for (const r of usable) { const occ = occMap.get(r.id) || 0; const cap = r.capacity || 0; if (occ < cap) return r.id; }
      return null;
    }
    for (const sid of studentIds) {
      const roomId = bestRoomFor(sid);
      if (roomId) { const o=occMap.get(roomId)||0; occMap.set(roomId, o+1); }
      await prisma.allotment.create({ data: { student_id: sid, block_id, round_id: to.id } });
      await prisma.student.update({ where: { user_id: sid }, data: { hostel_id: block_id, room_id: roomId, status: 'allotted' } });
      try { await prisma.notification.create({ data: { user_id: sid, title: 'Hostel allotment updated', body: `You have been allotted to ${block_id} for round ${to.round_type || ''} ${to.academic_year || ''}.` } }) } catch {}
    }
  }

  // Handle reassignments within target round
  for (const r of reassignments) {
    if (!r.student_id || !r.to_block_id) continue;
    const allot = await prisma.allotment.findFirst({ where: { student_id: r.student_id, round_id: to.id } });
    if (allot) {
      await prisma.allotment.update({ where: { id: allot.id }, data: { block_id: r.to_block_id } });
    } else {
      await prisma.allotment.create({ data: { student_id: r.student_id, block_id: r.to_block_id, round_id: to.id } });
    }
    await prisma.student.update({ where: { user_id: r.student_id }, data: { hostel_id: r.to_block_id } });
  }
  try { await prisma.auditLog.create({ data: { actor_id: req.user.sub, action: 'roll_forward_apply', details: { to_round_id: to.id, promotions: promotions.length, reassignments: reassignments.length } } }); } catch {}
  res.json({ ok: true, to_round: { id: to.id } });
});

router.post('/roll-forward/revert', auth, requireRole(Roles.admin), async (req, res) => {
  const { snapshot_id, round_id } = req.body || {};
  if (!snapshot_id || !round_id) return res.status(400).json({ error: 'snapshot_id and round_id required' });
  const snap = await prisma.allotmentSnapshot.findUnique({ where: { id: String(snapshot_id) }, include: { items: true } });
  if (!snap) return res.status(404).json({ error: 'Snapshot not found' });
  // Replace round allotments by snapshot items
  await prisma.allotment.deleteMany({ where: { round_id: String(round_id) } });
  if (snap.items.length) {
    await prisma.allotment.createMany({ data: snap.items.map(i => ({ student_id: i.student_id, block_id: i.block_id, round_id: String(round_id) })) });
    // Update students block (clear room assignment to avoid inconsistency)
    for (const it of snap.items) {
      await prisma.student.update({ where: { user_id: it.student_id }, data: { hostel_id: it.block_id, room_id: null } });
    }
  }
  try { await prisma.auditLog.create({ data: { actor_id: req.user.sub, action: 'roll_forward_revert', details: { snapshot_id, round_id, restored_count: snap.items.length } } }); } catch {}
  res.json({ ok: true, restored: snap.items.length });
});

router.post('/finalize', auth, requireRole(Roles.admin), async (req, res) => {
  const { assignments, round_id } = req.body;
  if (!Array.isArray(assignments) || !assignments.length) return res.status(400).json({ error: 'No assignments' });
  let round = null;
  if (round_id) {
    round = await prisma.admissionRound.findUnique({ where: { id: round_id } });
    if (!round) return res.status(400).json({ error: 'Invalid round_id' });
    if (round.status !== 'open') return res.status(400).json({ error: 'Round is not open' });
  } else {
    return res.status(400).json({ error: 'round_id required' });
  }
  // group by block and allocate rooms
  const byBlock = assignments.reduce((m, a) => { (m[a.block_id] ||= []).push(a.student_id); return m; }, {});
  for (const [block_id, studentIds] of Object.entries(byBlock)) {
    const now = new Date();
    const rooms = await prisma.room.findMany({ where: { hostel_block_id: block_id, NOT: [{ availability: 'maintenance' }, { maintenance: true }] }, orderBy: { room_no: 'asc' } });
    const usable = rooms.filter(r => !(r.temp_closed_until && new Date(r.temp_closed_until) > now));
    let ri = 0, inRoom = 0;
    for (const sid of studentIds) {
      let roomId = null;
      while (ri < usable.length) {
        const r = usable[ri];
        const occ = await prisma.student.count({ where: { room_id: r.id } });
        const cap = r.capacity || 0;
        if (occ < cap) { roomId = r.id; inRoom++; if (inRoom >= cap) { ri++; inRoom = 0; } break; }
        ri++; inRoom = 0;
      }
      await prisma.allotment.create({ data: { student_id: sid, block_id, round_id: round.id } });
      await prisma.student.update({ where: { user_id: sid }, data: { hostel_id: block_id, room_id: roomId, status: 'allotted' } });
    }
  }
  // Save waitlist for this round: all eligible students not assigned
  try {
    const eligible = await loadEligibleStudents(round);
    const assignedSet = new Set(assignments.map(a=>a.student_id));
    const wait = eligible.filter(s => !assignedSet.has(s.user_id));
    let pos = 1;
    for (const s of wait) { await prisma.waitlist.create({ data: { student_id: s.user_id, position: pos++, round_id: round.id } }); }
  } catch {}
  await prisma.admissionRound.update({ where: { id: round.id }, data: { status: 'finalized' } });
  res.json({ ok: true, round: { id: round.id, status: 'finalized' } });
});

router.get('/report', auth, requireRole(Roles.admin), async (_req, res) => {
  const counts = await prisma.allotment.groupBy({ by: ['block_id'], _count: { _all: true } });
  res.json({ by_block: counts });
});

module.exports = router;
