const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const xlsx = require('xlsx');
const { auth, requireRole, Roles } = require('../middleware/auth');
const { isStrongPassword } = require('../utils/validators');
const { logAudit } = require('../utils/audit');
const prisma = new PrismaClient();
const router = express.Router();
const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean)
const isDomainAllowed = (email)=>{
  if (!allowedDomains.length) return true
  const domain = String(email||'').split('@')[1]?.toLowerCase()
  return allowedDomains.includes(domain)
}
const normalizePhone = (p)=> String(p||'').replace(/\D/g,'')

// Users listing by role (for assignments)
router.get('/users', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (req, res) => {
  const { role, active } = req.query;
  const where = {};
  if (role) where.role = String(role);
  if (active !== undefined) where.active = String(active) === 'true';
  const users = await prisma.user.findMany({ where, orderBy: { name: 'asc' } });
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, active: u.active })));
});
// Admin Users management
router.post('/users', auth, requireRole(Roles.admin), async (req, res) => {
  const { name, email, phone, role, password } = req.body || {}
  if (!name || !email || !phone || !role || !password) return res.status(400).json({ error: 'name, email, phone, role, password required' })
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) return res.status(400).json({ error: 'invalid email' })
  if (!isDomainAllowed(email)) return res.status(400).json({ error: 'email domain not allowed' })
  const phoneNorm = normalizePhone(phone)
  if (phoneNorm.length < 7 || phoneNorm.length > 15) return res.status(400).json({ error: 'invalid phone' })
  if (!isStrongPassword(password)) return res.status(400).json({ error: 'Weak password (min 8, letter+number)' })
  const password_hash = await bcrypt.hash(String(password), 10)
  try {
    const created = await prisma.user.create({ data: { name, email: String(email).toLowerCase(), phone: phoneNorm, role, password_hash } })
    logAudit(req.user.sub, 'admin_create_user', { target: created.id, role })
    res.status(201).json({ id: created.id, name: created.name, email: created.email, phone: created.phone, role: created.role })
  } catch (e) { res.status(400).json({ error: 'Unique constraint failed or invalid data' }) }
})
router.put('/users/:id', auth, requireRole(Roles.admin), async (req, res) => {
  const { name, email, phone, role } = req.body || {}
  if (email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) return res.status(400).json({ error: 'invalid email' })
    if (!isDomainAllowed(email)) return res.status(400).json({ error: 'email domain not allowed' })
  }
  const data = { name, role }
  if (email) data.email = String(email).toLowerCase()
  if (phone !== undefined) {
    const phoneNorm = normalizePhone(phone)
    if (phoneNorm.length < 7 || phoneNorm.length > 15) return res.status(400).json({ error: 'invalid phone' })
    data.phone = phoneNorm
  }
  try {
    const updated = await prisma.user.update({ where: { id: req.params.id }, data })
    logAudit(req.user.sub, 'admin_update_user', { target: updated.id })
    res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role })
  } catch (e) { res.status(400).json({ error: 'Update failed' }) }
})
router.post('/users/:id/reset-password', auth, requireRole(Roles.admin), async (req, res) => {
  const { newPassword } = req.body || {}
  if (!newPassword) return res.status(400).json({ error: 'newPassword required' })
  if (!isStrongPassword(newPassword)) return res.status(400).json({ error: 'Weak password (min 8, letter+number)' })
  const password_hash = await bcrypt.hash(String(newPassword), 10)
  await prisma.user.update({ where: { id: req.params.id }, data: { password_hash } })
  logAudit(req.user.sub, 'admin_reset_password', { target: req.params.id })
  res.json({ ok: true })
})

// Admin self profile
router.get('/profile/me', auth, requireRole(Roles.admin), async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.user.sub } })
  res.json(u)
})
router.put('/profile/me', auth, requireRole(Roles.admin), async (req, res) => {
  try {
    const { name, phone, dob, avatar_url } = req.body || {}
    const data = {}
    if (name !== undefined) data.name = String(name)
    if (phone !== undefined) {
      const p = normalizePhone(phone)
      if (p.length < 7 || p.length > 15) return res.status(400).json({ error: 'invalid phone' })
      data.phone = p
    }
    if (dob !== undefined) {
      const d = new Date(String(dob))
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'invalid dob' })
      data.dob = d
    }
    if (avatar_url !== undefined) data.avatar_url = String(avatar_url)
    const updated = await prisma.user.update({ where: { id: req.user.sub }, data })
    logAudit(req.user.sub, 'profile_update', { scope: 'admin' })
    res.json(updated)
  } catch (e) {
    res.status(400).json({ error: 'Update failed' })
  }
})

// Bulk users upload (CSV/XLSX). Default columns: name,email,phone,role,password
// For students, the template also supports:
// reg_no, gender, dob (YYYY-MM-DD), community, father_name, mother_name,
// category, program_type, degree, branch, department, year, semester,
// lateral_entry, parent_contact, medical_info, active
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })
router.get('/users/template.csv', auth, requireRole(Roles.admin), async (_req, res) => {
  const header = [
    'role','name','email','phone','password','reg_no','gender','dob','community','father_name','mother_name',
    'category','program_type','degree','branch','department','year','semester','lateral_entry','parent_contact','medical_info','active'
  ].join(',') + '\n'
  const sample = [
    'student','Jane Doe','jane@example.com','9876543210','Temp@123','CEG2025CS001','F','2003-08-15','BC','John Doe','Jane Doe',
    'GEN','regular','BE','CSE','IT','3','5','no','9876543210','none','true'
  ].join(',') + '\n'
  res.setHeader('Content-Type','text/csv')
  res.setHeader('Content-Disposition','attachment; filename="users-template.csv"')
  res.send(header + sample)
})
router.post('/users/bulk', auth, requireRole(Roles.admin), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' })
  const buf = req.file.buffer
  let rows = []
  const name = (req.file.originalname||'').toLowerCase()
  try {
    if (name.endsWith('.csv')) {      
      const wb = xlsx.read(buf.toString('utf8'), { type: 'string' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      rows = xlsx.utils.sheet_to_json(ws)
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const wb = xlsx.read(buf, { type: 'buffer' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      rows = xlsx.utils.sheet_to_json(ws)
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use CSV or XLSX.' })
    }
  } catch (e) {
    return res.status(400).json({ error: 'Failed to parse file' })
  }
  const results = { created: 0, skipped: 0, errors: [] }
  const seenEmails = new Set()
  for (let i=0;i<rows.length;i++){
    const r = rows[i]
    const name = String(r.name||'').trim()
    const email = String(r.email||'').trim().toLowerCase()
    const phone = String(r.phone||'').trim()
    const role = (String(r.role||'').trim() || 'student').toLowerCase()
    const password = String(r.password||'').trim()

    // Optional/Student-specific fields
    const reg_no = (r.reg_no!==undefined ? String(r.reg_no).trim() : undefined)
    const gender = (r.gender!==undefined ? String(r.gender).trim() : undefined)
    const dobStr = (r.dob!==undefined ? String(r.dob).trim() : undefined)
    const community = (r.community!==undefined ? String(r.community).trim() : undefined)
    const father_name = (r.father_name!==undefined ? String(r.father_name).trim() : undefined)
    const mother_name = (r.mother_name!==undefined ? String(r.mother_name).trim() : undefined)
    const category = (r.category!==undefined ? String(r.category).trim() : undefined)
    const program_type = (r.program_type!==undefined ? String(r.program_type).trim() : undefined)
    const degree = (r.degree!==undefined ? String(r.degree).trim() : undefined)
    const branch = (r.branch!==undefined ? String(r.branch).trim() : undefined)
    const department = (r.department!==undefined ? String(r.department).trim() : undefined)
    const yearVal = (r.year!==undefined && r.year!==null && r.year!=='' ? Number(r.year) : undefined)
    const semesterVal = (r.semester!==undefined && r.semester!==null && r.semester!=='' ? Number(r.semester) : undefined)
    const lateral_entry = (r.lateral_entry!==undefined ? String(r.lateral_entry).trim() : undefined)
    const parent_contact = (r.parent_contact!==undefined ? String(r.parent_contact).trim() : undefined)
    const medical_info = (r.medical_info!==undefined ? String(r.medical_info).trim() : undefined)
    const activeStr = (r.active!==undefined ? String(r.active).trim().toLowerCase() : undefined)

    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    const roleOk = ['admin','rc','warden','student'].includes(role)
    if (!name || !email || !phone || !password) { results.skipped++; results.errors.push({ row:i+2, error:'Missing required fields' }); continue }
    if (!emailOk) { results.skipped++; results.errors.push({ row:i+2, error:'Invalid email' }); continue }
    if (!isDomainAllowed(email)) { results.skipped++; results.errors.push({ row:i+2, error:'Email domain not allowed' }); continue }
    if (!roleOk) { results.skipped++; results.errors.push({ row:i+2, error:'Invalid role' }); continue }
    if (seenEmails.has(email)) { results.skipped++; results.errors.push({ row:i+2, error:'Duplicate email in file' }); continue }
    seenEmails.add(email)
    const phoneNorm = normalizePhone(phone)
    if (phoneNorm.length < 7 || phoneNorm.length > 15) { results.skipped++; results.errors.push({ row:i+2, error:'Invalid phone' }); continue }
    try {
      if (!isStrongPassword(password)) { results.skipped++; results.errors.push({ row:i+2, error:'Weak password (min 8, letter+number)' }); continue }
      const password_hash = await bcrypt.hash(password, 10)

      // Build user data including optional fields
      const userData = { name, email, phone: phoneNorm, role, password_hash }
      if (reg_no) userData.reg_no = reg_no
      if (gender) userData.gender = gender
      if (community) userData.community = community
      if (father_name) userData.father_name = father_name
      if (mother_name) userData.mother_name = mother_name
      if (category) userData.category = category
      if (program_type) userData.program_type = program_type
      if (degree) userData.degree = degree
      if (branch) userData.branch = branch
      if (department) userData.department = department
      if (typeof yearVal === 'number' && !Number.isNaN(yearVal)) userData.year = yearVal
      if (typeof semesterVal === 'number' && !Number.isNaN(semesterVal)) userData.semester = semesterVal
      if (lateral_entry) userData.lateral_entry = lateral_entry
      if (medical_info) userData.medical_info = medical_info
      if (activeStr !== undefined) {
        userData.active = ['true','1','yes','y'].includes(activeStr)
      }
      if (dobStr) {
        const d = new Date(dobStr)
        if (isNaN(d.getTime())) { results.skipped++; results.errors.push({ row:i+2, error:'Invalid dob (use YYYY-MM-DD)' }); continue }
        userData.dob = d
      }

      // Create user
      const created = await prisma.user.create({ data: userData })

      // For students, ensure a Student row exists and map parent_contact
      if (role === 'student') {
        // Normalize parent contact if provided
        let pc = parent_contact ? normalizePhone(parent_contact) : undefined
        if (pc && (pc.length < 7 || pc.length > 15)) pc = undefined
        await prisma.student.create({ data: { user_id: created.id, parent_contact: pc } })
      }
      results.created++
    } catch (e) {
      results.skipped++
      results.errors.push({ row:i+2, error: 'Create failed (duplicate/invalid data?)' })
    }
  }
  if (results.errors.length) {
    const lines = ['row,error']
    for (const e of results.errors) lines.push(`${e.row},"${String(e.error).replaceAll('"','\"')}"`)
    results.errors_csv = lines.join('\n')
  }
  res.json(results)
})

// Technicians management
router.get('/technicians', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (_req, res) => {
  const items = await prisma.technician.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});
router.post('/technicians', auth, requireRole(Roles.admin), async (req, res) => {
  const created = await prisma.technician.create({ data: req.body });
  res.status(201).json(created);
});

// Block quotas (departmental quotas per block)
router.get('/blocks/:id/quotas', auth, requireRole(Roles.admin), async (req, res) => {
  const items = await prisma.blockQuota.findMany({ where: { block_id: req.params.id }, orderBy: { department: 'asc' } });
  res.json(items);
});
router.post('/blocks/:id/quotas', auth, requireRole(Roles.admin), async (req, res) => {
  const { quotas } = req.body; // [{department, quota_number}]
  await prisma.blockQuota.deleteMany({ where: { block_id: req.params.id } });
  if (Array.isArray(quotas) && quotas.length) {
    await prisma.blockQuota.createMany({ data: quotas.map(q => ({ block_id: req.params.id, department: String(q.department), quota_number: Number(q.quota_number)||0 })) });
  }
  res.json({ ok: true });
});

// Blocks CRUD
router.get('/blocks', auth, requireRole(Roles.admin), async (req, res) => {
  const items = await prisma.hostelBlock.findMany();
  const rooms = await prisma.room.findMany()
  const studentsCounts = await prisma.student.groupBy({ by: ['hostel_id'], _count: { _all: true } }).catch(()=>[])
  const studentMap = Object.fromEntries(studentsCounts.map(r => [r.hostel_id, r._count._all]))
  const out = items.map(b => ({ ...b, rooms_count: rooms.filter(r=>r.hostel_block_id===b.id).length, students_count: studentMap[b.id]||0 }))
  res.json(out);
});
router.post('/blocks', auth, requireRole(Roles.admin), async (req, res) => {
  const created = await prisma.hostelBlock.create({ data: req.body });
  res.status(201).json(created);
});
router.put('/blocks/:id', auth, requireRole(Roles.admin), async (req, res) => {
  const updated = await prisma.hostelBlock.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});
router.delete('/blocks/:id', auth, requireRole(Roles.admin), async (req, res) => {
  await prisma.hostelBlock.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Rooms under a block
router.get('/blocks/:id/rooms', auth, requireRole(Roles.admin), async (req, res) => {
  const rooms = await prisma.room.findMany({ where: { hostel_block_id: req.params.id } });
  const counts = await prisma.student.groupBy({ by: ['room_id'], _count: { _all: true } }).catch(()=>[])
  const countMap = Object.fromEntries(counts.map(c => [c.room_id, c._count._all]))
  res.json(rooms.map(r => ({ ...r, student_count: countMap[r.id]||0 })));
});
router.post('/blocks/:id/rooms', auth, requireRole(Roles.admin), async (req, res) => {
  const created = await prisma.room.create({ data: { ...req.body, hostel_block_id: req.params.id } });
  res.status(201).json(created);
});
router.post('/blocks/:id/rooms/generate', auth, requireRole(Roles.admin), async (req, res) => {
  const { count = 0, start = 1, prefix = '', capacity = 2 } = req.body || {}
  const n = Number(count)
  if (!n || n<1 || n>2000) return res.status(400).json({ error: 'count (1..2000) required' })
  const data = []
  for (let i=0;i<n;i++) data.push({ hostel_block_id: req.params.id, room_no: `${prefix}${start+i}`, capacity })
  await prisma.room.createMany({ data })
  res.json({ ok: true, created: n })
})

// Assign RC or Warden
router.post('/blocks/:id/assign-rc', auth, requireRole(Roles.admin), async (req, res) => {
  const { rc_id } = req.body;
  const updated = await prisma.hostelBlock.update({ where: { id: req.params.id }, data: { rc_id } });
  res.json(updated);
});
router.post('/blocks/:id/assign-warden', auth, requireRole(Roles.admin), async (req, res) => {
  const { warden_id } = req.body;
  const updated = await prisma.hostelBlock.update({ where: { id: req.params.id }, data: { warden_id } });
  res.json(updated);
});

// RC Assignments - Get all RC assignments with details
router.get('/rc-assignments', auth, requireRole(Roles.admin, Roles.warden), async (req, res) => {
  try {
    const assignments = await prisma.rCAssignment.findMany({
      orderBy: { start_date: 'desc' }
    });
    
    // Manually fetch related data
    const enrichedAssignments = await Promise.all(assignments.map(async (assignment) => {
      const [block, rc] = await Promise.all([
        prisma.hostelBlock.findUnique({
          where: { id: assignment.block_id },
          include: {
            students: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, phone: true, active: true }
                }
              }
            }
          }
        }),
        prisma.user.findUnique({
          where: { id: assignment.rc_id },
          select: { id: true, name: true, email: true, phone: true, active: true }
        })
      ]);
      
      return {
        ...assignment,
        block,
        rc
      };
    }));
    
    res.json(enrichedAssignments);
  } catch (error) {
    console.error('Failed to fetch RC assignments:', error);
    res.status(500).json({ error: 'Failed to fetch RC assignments' });
  }
});

// Payments summary
router.get('/payments/summary', auth, requireRole(Roles.admin), async (req, res) => {
  const byType = await prisma.payment.groupBy({ by: ['fee_type'], _sum: { amount: true }, _count: { _all: true } });
  const byStatus = await prisma.payment.groupBy({ by: ['status'], _sum: { amount: true }, _count: { _all: true } });
  res.json({ byType, byStatus });
});

// Overview for admin dashboard
router.get('/overview', auth, requireRole(Roles.admin, Roles.warden), async (_req, res) => {
  const [users, students, blocks, rooms, openComplaints, payments] = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.hostelBlock.count(),
    prisma.room.count(),
    prisma.complaint.count({ where: { status: { in: ['open','in_progress'] } } }),
    prisma.payment.findMany({ where: { status: 'success' }, select: { amount: true } })
  ])
  const revenue = payments.reduce((a,p)=>a + Number(p.amount||0), 0)
  res.json({ users, students, blocks, rooms, openComplaints, revenue })
})

// Overview for warden dashboard (their blocks)
router.get('/warden-overview', auth, requireRole(Roles.warden), async (req, res) => {
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  if (!blockIds.length) return res.json({ students: 0, boys: 0, girls: 0, occupancy: 0, openComplaints: 0, pendingFees: 0, attendance: 0 });

  const [students, rooms, complaints, payments] = await Promise.all([
    prisma.student.findMany({ where: { hostel_id: { in: blockIds } }, select: { user_id: true, hostel_id: true } }),
    prisma.room.findMany({ where: { hostel_block_id: { in: blockIds } }, select: { capacity: true, occupied_count: true } }),
    prisma.complaint.count({ where: { block_id: { in: blockIds }, status: { in: ['open','in_progress'] } } }),
    prisma.studentFee.findMany({ where: { student: { hostel_id: { in: blockIds } } }, select: { status: true } })
  ]);

  const totalCapacity = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
  const totalOccupied = students.length;
  const occupancy = totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  const boysBlocks = wardenBlocks.filter(b => b.type === 'boys').map(b => b.id);
  const girlsBlocks = wardenBlocks.filter(b => b.type === 'girls').map(b => b.id);
  let boys = 0, girls = 0;
  for (const s of students) {
    if (boysBlocks.includes(s.hostel_id)) boys++;
    else if (girlsBlocks.includes(s.hostel_id)) girls++;
  }

  const pendingFees = payments.filter(p => p.status !== 'paid').length;
  const totalFees = payments.length;
  const feePaymentRate = totalFees ? Math.round(((totalFees - pendingFees) / totalFees) * 100) : 0;

  // Simple attendance - for now just a placeholder, would need attendance data
  const attendance = 85; // placeholder

  res.json({
    students: totalOccupied,
    boys,
    girls,
    occupancy,
    openComplaints: complaints,
    feePaymentRate,
    attendance
  });
})

// Rooms maintenance toggle and moves
router.patch('/rooms/:id', auth, requireRole(Roles.admin), async (req, res) => {
  const { maintenance, availability, capacity } = req.body;
  const updated = await prisma.room.update({ where: { id: req.params.id }, data: { maintenance: maintenance ?? undefined, availability: availability ?? undefined, capacity: capacity ?? undefined } });
  res.json(updated);
});
router.post('/rooms/move', auth, requireRole(Roles.admin), async (req, res) => {
  const { student_id, room_id, block_id } = req.body;
  if (!student_id || (!room_id && !block_id)) return res.status(400).json({ error: 'student_id and room_id or block_id required' });
  // Block maintenance rooms
  if (room_id) {
    const r = await prisma.room.findUnique({ where: { id: room_id } });
    if (!r || r.maintenance || r.availability === 'maintenance') return res.status(400).json({ error: 'Room under maintenance' });
  }
  const data = { };
  if (block_id) data.hostel_id = block_id;
  if (room_id) data.room_id = room_id;
  const updated = await prisma.student.update({ where: { user_id: student_id }, data });
  res.json(updated);
});

// Allotment snapshots
router.post('/allotments/snapshots', auth, requireRole(Roles.admin), async (req, res) => {
  const { round_id, assignments, meta } = req.body;
  if (!Array.isArray(assignments)) return res.status(400).json({ error: 'assignments required' });
  const snap = await prisma.allotmentSnapshot.create({ data: { round_id: round_id || null, meta: meta || {} } });
  await prisma.allotmentSnapshotItem.createMany({ data: assignments.map(a => ({ snapshot_id: snap.id, student_id: a.student_id, block_id: a.block_id })) });
  res.status(201).json(snap);
});
router.get('/allotments/snapshots', auth, requireRole(Roles.admin), async (_req, res) => {
  const items = await prisma.allotmentSnapshot.findMany({ orderBy: { created_at: 'desc' } });
  res.json(items);
});
router.get('/allotments/snapshots/:id', auth, requireRole(Roles.admin), async (req, res) => {
  const snap = await prisma.allotmentSnapshot.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!snap) return res.status(404).json({ error: 'Not found' });
  res.json(snap);
});
router.get('/allotments/snapshots/:id/export.csv', auth, requireRole(Roles.admin), async (req, res) => {
  const snap = await prisma.allotmentSnapshot.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!snap) return res.status(404).json({ error: 'Not found' });
  const lines = ['student_id,block_id'];
  for (const it of snap.items) lines.push(`${it.student_id},${it.block_id}`);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="snapshot-${snap.id}.csv"`);
  res.send(lines.join('\n'));
});
router.get('/allotments/diff', auth, requireRole(Roles.admin), async (req, res) => {
  const { left, right } = req.query;
  const [a, b] = await Promise.all([
    prisma.allotmentSnapshot.findUnique({ where: { id: String(left) }, include: { items: true } }),
    prisma.allotmentSnapshot.findUnique({ where: { id: String(right) }, include: { items: true } })
  ]);
  if (!a || !b) return res.status(404).json({ error: 'Snapshots not found' });
  const mapA = new Map(a.items.map(i => [i.student_id, i.block_id]));
  const mapB = new Map(b.items.map(i => [i.student_id, i.block_id]));
  const changes = [];
  for (const [sid, blkA] of mapA.entries()) {
    const blkB = mapB.get(sid);
    if (blkB && blkB !== blkA) changes.push({ student_id: sid, from: blkA, to: blkB });
  }
  res.json({ changes });
});

// Round-level allotments export CSV
router.get('/allotments/export.csv', auth, requireRole(Roles.admin), async (req, res) => {
  const { round_id } = req.query;
  if (!round_id) return res.status(400).json({ error: 'round_id required' });
  const round = await prisma.admissionRound.findUnique({ where: { id: String(round_id) } });
  if (!round) return res.status(404).json({ error: 'Round not found' });
  const items = await prisma.allotment.findMany({
    where: { round_id: String(round_id) },
    include: { student: { include: { user: true } }, block: true, room: true },
    orderBy: { assigned_on: 'asc' }
  });
  const header = ['reg_no','name','department','year','student_id','block','room_no','assigned_on'];
  const lines = [header.join(',')];
  for (const it of items) {
    const u = it.student?.user || {};
    lines.push([
      JSON.stringify(u.reg_no||''),
      JSON.stringify(u.name||''),
      JSON.stringify(u.department||''),
      u.year||'',
      it.student_id,
      JSON.stringify(it.block?.name || it.block_id),
      JSON.stringify(it.room?.room_no || ''),
      it.assigned_on?.toISOString?.() || ''
    ].join(','));
  }
  const fname = `allotments-${round.academic_year}-${round.round_type}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${fname}"`);
  res.send(lines.join('\n'));
});

// Round-level summary PDF with simple design
router.get('/allotments/summary.pdf', auth, requireRole(Roles.admin), async (req, res) => {
  const { round_id } = req.query;
  if (!round_id) return res.status(400).json({ error: 'round_id required' });
  const round = await prisma.admissionRound.findUnique({ where: { id: String(round_id) } });
  if (!round) return res.status(404).json({ error: 'Round not found' });
  const items = await prisma.allotment.findMany({ where: { round_id: String(round_id) }, include: { student: { include: { user: true } }, block: true }, orderBy: { assigned_on: 'asc' } });
  const byBlock = new Map();
  items.forEach(it => {
    const key = it.block?.name || it.block_id;
    if (!byBlock.has(key)) byBlock.set(key, 0);
    byBlock.set(key, byBlock.get(key) + 1);
  });
  const total = items.length;

  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="summary-${round.academic_year}-${round.round_type}.pdf"`);
  doc.pipe(res);

  // Header
  doc.rect(36, 36, doc.page.width - 72, 40).fill('#0C62F2');
  doc.fill('#fff').fontSize(16).text('HostelConnect – Allotment Summary', 44, 46, { continued: false });
  doc.fill('#000');
  doc.moveDown(2);
  doc.fontSize(12).text(`Academic Year: ${round.academic_year}    Round: ${round.round_type}    Status: ${round.status}`);
  doc.text(`Generated: ${new Date().toLocaleString()}`);
  doc.moveDown();
  doc.fontSize(13).text(`Total Allotted: ${total}`, { continued: true }).text('');
  doc.moveDown(0.5);

  // Block counts table
  doc.fontSize(12).text('By Block');
  doc.moveDown(0.5);
  const startX = 40; let y = doc.y; const colWidths = [260, 80];
  doc.font('Helvetica-Bold');
  doc.text('Block', startX, y, { width: colWidths[0] });
  doc.text('Count', startX + colWidths[0], y, { width: colWidths[1] });
  doc.font('Helvetica');
  y += 18;
  for (const [blk, cnt] of byBlock.entries()) {
    doc.text(String(blk), startX, y, { width: colWidths[0] });
    doc.text(String(cnt), startX + colWidths[0], y, { width: colWidths[1] });
    y += 16;
    if (y > doc.page.height - 80) { doc.addPage(); y = 60; }
  }
  doc.moveDown();

  // Sample list section (first 30 entries)
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(12).text('Sample Allottees (first 30)');
  doc.font('Helvetica');
  y = doc.y + 6;
  const headerCols = ['Reg No', 'Name', 'Dept', 'Year', 'Block'];
  const widths = [90, 160, 120, 40, 120];
  let x = startX;
  doc.font('Helvetica-Bold'); headerCols.forEach((h,i)=>{ doc.text(h, x, y, { width: widths[i] }); x += widths[i]; });
  doc.font('Helvetica'); y += 16;
  items.slice(0,30).forEach(it => {
    const u = it.student?.user || {};
    const row = [u.reg_no||'', u.name||'', u.department||'', u.year||'', it.block?.name || it.block_id];
    x = startX;
    row.forEach((v,i)=>{ doc.text(String(v), x, y, { width: widths[i] }); x += widths[i]; });
    y += 16; if (y > doc.page.height - 60) { doc.addPage(); y = 60; }
  });

  doc.end();
});

// Admission Rounds CRUD
router.get('/rounds', auth, requireRole(Roles.admin), async (_req, res) => {
  const items = await prisma.admissionRound.findMany({ orderBy: { open_date: 'desc' } });
  res.json(items);
});
router.post('/rounds', auth, requireRole(Roles.admin), async (req, res) => {
  const { academic_year, round_type, open_date, close_date, status } = req.body;
  const created = await prisma.admissionRound.create({ data: { academic_year, round_type, open_date: new Date(open_date), close_date: close_date? new Date(close_date): null, status: status||'open' } });
  res.status(201).json(created);
});
router.put('/rounds/:id', auth, requireRole(Roles.admin), async (req, res) => {
  const { academic_year, round_type, open_date, close_date, status } = req.body;
  const updated = await prisma.admissionRound.update({ where: { id: req.params.id }, data: { academic_year, round_type, open_date: open_date? new Date(open_date): undefined, close_date: close_date===null? null : (close_date? new Date(close_date): undefined), status } });
  res.json(updated);
});
router.delete('/rounds/:id', auth, requireRole(Roles.admin), async (req, res) => {
  await prisma.admissionRound.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Analytics: occupancy, revenue, SLA
router.get('/analytics', auth, requireRole(Roles.admin), async (req, res) => {
  const { from, to } = req.query
  const range = {}
  if (from || to) {
    range.created_at = {}
    if (from) range.created_at.gte = new Date(String(from))
    if (to) range.created_at.lte = new Date(String(to))
  }
  // Occupancy by block
  const blocks = await prisma.hostelBlock.findMany()
  const roomsByBlock = await prisma.room.findMany()
  const studentsByBlockCounts = await Promise.all(blocks.map(async b => ({ id: b.id, count: await prisma.student.count({ where: { hostel_id: b.id } }) })))
  const occupancy = blocks.map(b => {
    const capacity = roomsByBlock.filter(r=>r.hostel_block_id===b.id).reduce((acc,r)=> acc + (r.capacity||0), 0)
    const occ = studentsByBlockCounts.find(x=>x.id===b.id)?.count || 0
    return { block_id: b.id, block_name: b.name, capacity, occupied: occ, occupancy_rate: capacity? occ/capacity : 0 }
  })
  // Revenue: sum of successful payments by fee_type per month
  const payments = await prisma.payment.findMany({ where: { status: 'success', ...(range.created_at? { created_at: range.created_at } : {}) } })
  const revenueByMonth = {}
  for (const p of payments) {
    const d = new Date(p.created_at)
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`
    revenueByMonth[key] = revenueByMonth[key] || {}
    revenueByMonth[key][p.fee_type] = (revenueByMonth[key][p.fee_type] || 0) + p.amount
  }
  // Complaint SLA: average resolution time (resolved_at - created_at) by type/priority
  const complaints = await prisma.complaint.findMany({ where: { status: 'closed', ...(range.created_at? { created_at: range.created_at } : {}) } })
  const sla = {}
  for (const c of complaints) {
    if (!c.resolved_at) continue
    const hours = (new Date(c.resolved_at) - new Date(c.created_at)) / 36e5
    const key = `${c.type}|${c.priority}`
    sla[key] = sla[key] || { count: 0, total: 0 }
    sla[key].count += 1
    sla[key].total += hours
  }
  const slaAgg = Object.entries(sla).map(([k,v]) => { const [type, priority] = k.split('|'); return { type, priority, avg_hours: v.total / v.count } })
  res.json({ occupancy, revenueByMonth, sla: slaAgg })
})

// Assets & Work Orders (Admin)
router.get('/assets', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (_req, res) => {
  const items = await prisma.asset.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});
router.post('/assets', auth, requireRole(Roles.admin), async (req, res) => {
  const created = await prisma.asset.create({ data: req.body });
  res.status(201).json(created);
});
router.put('/assets/:id', auth, requireRole(Roles.admin), async (req, res) => {
  const updated = await prisma.asset.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
});
router.get('/workorders', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (req, res) => {
  const { status, block_id } = req.query
  const where = {}
  if (status) where.status = String(status)
  if (block_id) where.block_id = String(block_id)
  const items = await prisma.workOrder.findMany({ where, orderBy: { created_at: 'desc' } });
  res.json(items);
});
router.post('/workorders', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (req, res) => {
  const data = req.body || {}
  if (!data.title) return res.status(400).json({ error: 'title required' })
  const created = await prisma.workOrder.create({ data });
  if (created.assigned_to) {
    try { await prisma.notification.create({ data: { user_id: String(created.assigned_to), title: 'New Work Order Assigned', body: `${created.title}` } }) } catch {}
  }
  res.status(201).json(created);
});
router.put('/workorders/:id', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (req, res) => {
  const before = await prisma.workOrder.findUnique({ where: { id: req.params.id } })
  if (!before) return res.status(404).json({ error: 'Not found' })
  const updated = await prisma.workOrder.update({ where: { id: req.params.id }, data: req.body });
  if ((!before.assigned_to && updated.assigned_to) || (before.assigned_to !== updated.assigned_to)) {
    try {
      await prisma.notification.create({ data: { user_id: String(updated.assigned_to), title: 'New Work Order Assigned', body: `${updated.title}` } })
    } catch {}
  }
  res.json(updated);
});
// Documents: Admission Letter and Defaulter Notice
router.post('/docs/admission-letter/:studentId', auth, requireRole(Roles.admin), async (req, res) => {
  const studentId = String(req.params.studentId)
  const st = await prisma.student.findUnique({ where: { user_id: studentId }, include: { user: true, hostel: true, room: true } })
  if (!st) return res.status(404).json({ error: 'Student not found' })
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks = []
  doc.on('data', c => chunks.push(c))
  doc.on('end', async ()=>{
    const pdf = Buffer.concat(chunks)
    const rec = await prisma.document.create({ data: { student_id: studentId, type: 'admission_letter', metadata: { hostel: st.hostel?.name||null, room: st.room?.room_no||null }, pdf } })
    res.json({ id: rec.id })
  })
  doc.fontSize(18).text('Hostel Admission Letter', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`)
  doc.moveDown()
  doc.text(`To,`)
  doc.text(`${st.user.name}`)
  if (st.user.department) doc.text(`${st.user.department}`)
  if (st.user.year) doc.text(`Year: ${st.user.year}`)
  doc.moveDown()
  doc.text(`Congratulations! You have been allotted a seat in the hostel.`)
  doc.text(`Block: ${st.hostel?.name || 'TBD'}`)
  doc.text(`Room: ${st.room?.room_no || 'TBD'}`)
  doc.moveDown()
  doc.text(`Please report to the hostel office with necessary documents within 7 days.`)
  doc.moveDown(2).text('Authorized Signatory', { align: 'right' })
  doc.end()
})
router.get('/docs/:id.pdf', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (req, res) => {
  const d = await prisma.document.findUnique({ where: { id: String(req.params.id) } })
  if (!d) return res.status(404).json({ error: 'Not found' })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="doc-${d.id}.pdf"`)
  res.send(Buffer.from(d.pdf))
})
router.post('/docs/defaulter-notice/:studentId', auth, requireRole(Roles.admin, Roles.rc, Roles.warden), async (req, res) => {
  const studentId = String(req.params.studentId)
  const st = await prisma.student.findUnique({ where: { user_id: studentId }, include: { user: true } })
  if (!st) return res.status(404).json({ error: 'Student not found' })
  const { amount_due = 0, due_date = null } = req.body || {}
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const chunks = []
  doc.on('data', c => chunks.push(c))
  doc.on('end', async ()=>{
    const pdf = Buffer.concat(chunks)
    const rec = await prisma.document.create({ data: { student_id: studentId, type: 'defaulter_notice', metadata: { amount_due, due_date }, pdf } })
    res.json({ id: rec.id })
  })
  doc.fontSize(18).text('Fee Defaulter Notice', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`)
  doc.moveDown()
  doc.text(`To,`)
  doc.text(`${st.user.name}`)
  doc.moveDown()
  doc.text(`Our records indicate an outstanding hostel fee balance of Rs. ${amount_due}.`)
  if (due_date) doc.text(`Please pay by ${new Date(due_date).toLocaleDateString()} to avoid penalties.`)
  doc.moveDown()
  doc.text(`If you have already paid, kindly ignore this notice.`)
  doc.moveDown(2).text('Hostel Office', { align: 'right' })
  doc.end()
})
// Finance routes
router.get('/finance/plans', auth, requireRole(Roles.admin), async (_req, res) => {
  const plans = await prisma.feePlan.findMany({ include: { items: true } });
  res.json(plans);
});
router.post('/finance/plans', auth, requireRole(Roles.admin), async (req, res) => {
  const { name, academic_year, description, items } = req.body;
  const plan = await prisma.feePlan.create({ data: { name, academic_year, description: description||null } });
  if (Array.isArray(items) && items.length) {
    await prisma.feeItem.createMany({ data: items.map(it => ({ plan_id: plan.id, name: String(it.name), amount: Number(it.amount)||0, due_date: it.due_date? new Date(it.due_date): null })) });
  }
  const out = await prisma.feePlan.findUnique({ where: { id: plan.id }, include: { items: true } });
  res.status(201).json(out);
});
router.post('/finance/assign', auth, requireRole(Roles.admin), async (req, res) => {
  const { plan_id, student_ids } = req.body;
  if (!plan_id || !Array.isArray(student_ids) || student_ids.length===0) return res.status(400).json({ error: 'plan_id and student_ids required' });
  const plan = await prisma.feePlan.findUnique({ where: { id: plan_id }, include: { items: true } });
  if (!plan) return res.status(404).json({ error: 'Plan not found' });
  const rows = [];
  for (const sid of student_ids) {
    if (!plan.items.length) rows.push({ student_id: sid, plan_id: plan.id, item_id: null, amount_due: 0 });
    for (const it of plan.items) rows.push({ student_id: sid, plan_id: plan.id, item_id: it.id, amount_due: it.amount });
  }
  if (rows.length) await prisma.studentFee.createMany({ data: rows });
  res.json({ ok: true, created: rows.length });
});
router.get('/finance/student/:id', auth, requireRole(Roles.admin), async (req, res) => {
  const sid = String(req.params.id);
  const fees = await prisma.studentFee.findMany({ where: { student_id: sid }, include: { plan: true } });
  const payments = await prisma.payment.findMany({ where: { student_id: sid } });
  res.json({ fees, payments });
});
router.post('/finance/reconcile', auth, requireRole(Roles.admin), async (req, res) => {
  const { payment_id, student_fee_id, amount } = req.body;
  if (!payment_id || !student_fee_id) return res.status(400).json({ error: 'payment_id and student_fee_id required' });
  const amt = Number(amount)||0;
  await prisma.reconciliation.create({ data: { payment_id, student_fee_id, amount: amt } });
  // update student fee
  const fee = await prisma.studentFee.findUnique({ where: { id: student_fee_id } });
  const newPaid = (fee?.amount_paid||0) + amt; const status = newPaid >= (fee?.amount_due||0) ? 'settled' : (newPaid>0 ? 'partial' : 'pending');
  await prisma.studentFee.update({ where: { id: student_fee_id }, data: { amount_paid: newPaid, status } });
  res.json({ ok: true });
});
router.patch('/users/:id/active', auth, requireRole(Roles.admin), async (req, res) => {
  const { active } = req.body || {};
  const updated = await prisma.user.update({ where: { id: req.params.id }, data: { active: Boolean(active) } });
  logAudit(req.user.sub, 'admin_toggle_active', { target: updated.id, active: updated.active })
  res.json({ id: updated.id, active: updated.active });
});

router.delete('/users', auth, requireRole(Roles.admin), async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'ids required' });
  const result = await prisma.user.deleteMany({ where: { id: { in: ids.map(String) } } });
  logAudit(req.user.sub, 'admin_delete_users', { count: result.count })
  res.json({ deleted: result.count });
});

// Warden fees endpoint
router.get('/warden-fees', auth, requireRole(Roles.warden), async (req, res) => {
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  if (!blockIds.length) return res.json([]);

  const fees = await prisma.studentFee.findMany({
    where: { student: { hostel_id: { in: blockIds } } },
    include: {
      student: {
        include: {
          user: { select: { name: true, reg_no: true } },
          hostel: { select: { name: true } }
        }
      },
      plan: { select: { name: true, amount: true } }
    },
    orderBy: { assigned_on: 'desc' }
  });

  res.json(fees);
});

// Admin payments endpoints
router.get('/payments', auth, requireRole(Roles.admin), async (req, res) => {
  const { status, fee_type, page = 1, limit = 10 } = req.query;
  const where = {};

  if (status) where.status = status;
  if (fee_type) where.fee_type = fee_type;

  const payments = await prisma.payment.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { name: true, reg_no: true, email: true } },
          hostel: { select: { name: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' },
    skip: (page - 1) * limit,
    take: parseInt(limit)
  });

  const total = await prisma.payment.count({ where });

  res.json({
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

router.get('/payments/summary', auth, requireRole(Roles.admin), async (req, res) => {
  const payments = await prisma.payment.findMany();

  const byStatus = payments.reduce((acc, payment) => {
    const status = payment.status || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const byType = payments.reduce((acc, payment) => {
    const type = payment.fee_type || 'other';
    acc[type] = (acc[type] || 0) + payment.amount;
    return acc;
  }, {});

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;

  res.json({
    byType: Object.entries(byType).map(([type, amount]) => ({ type, amount })),
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    totalAmount,
    totalPayments,
    completedPayments,
    completionRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0
  });
});

// Get all students with user information
router.get('/students', auth, requireRole(Roles.admin), async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            reg_no: true,
            department: true,
            year: true
          }
        },
        hostel: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        room: {
          select: {
            id: true,
            room_no: true,
            floor: true
          }
        }
      },
      orderBy: { user: { name: 'asc' } }
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
