const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const prisma = new PrismaClient();
const router = express.Router();

// Basic RC profile and assignments
router.get('/me', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  const assignments = await prisma.rCAssignment.findMany({ where: { rc_id: req.user.sub, OR: [{ end_date: null }, { end_date: { gt: new Date() } }] } });
  const blocks = await prisma.hostelBlock.findMany({ where: { OR: [{ rc_id: req.user.sub }, { id: { in: assignments.map(a => a.block_id) } }] } });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, blocks });
});

// Overview stats for dashboard (aggregated)
router.get('/overview', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));

    const assignments = await prisma.rCAssignment.findMany({ where: { rc_id: req.user.sub, OR: [{ end_date: null }, { end_date: { gt: new Date() } }] } });
    const blockIds = assignments.map(a => a.block_id);
    const ownBlocks = await prisma.hostelBlock.findMany({ where: { OR: [{ rc_id: req.user.sub }, { id: { in: blockIds } }] } });
    const ownBlockIds = ownBlocks.map(b => b.id);

    // All students in my blocks
    const students = await prisma.student.findMany({ where: { hostel_id: { in: ownBlockIds } }, select: { user_id: true, hostel_id: true } });
    const studentIds = students.map(s => s.user_id);

    // Room capacity per block
    const rooms = await prisma.room.findMany({ where: { hostel_block_id: { in: ownBlockIds } }, select: { hostel_block_id: true, capacity: true } });
    const capByBlock = ownBlocks.reduce((acc, b) => { acc[b.id] = b.capacity || 0; return acc; }, {});
    for (const r of rooms) capByBlock[r.hostel_block_id] = (capByBlock[r.hostel_block_id] || 0) + (r.capacity || 0);

    // Counts per block
    const occByBlock = students.reduce((acc, s) => { acc[s.hostel_id] = (acc[s.hostel_id] || 0) + 1; return acc; }, {});

    // Students boys/girls by block type
    const boysBlocks = new Set(ownBlocks.filter(b => (b.type || '').toLowerCase() === 'boys').map(b => b.id));
    const girlsBlocks = new Set(ownBlocks.filter(b => (b.type || '').toLowerCase() === 'girls').map(b => b.id));
    let boys = 0, girls = 0;
    for (const s of students) {
      if (boysBlocks.has(s.hostel_id)) boys++; else if (girlsBlocks.has(s.hostel_id)) girls++;
    }

    // Fees summary for these students
    let fees = { pending: 0, partial: 0, settled: 0 };
    if (studentIds.length) {
      const feeGroups = await prisma.studentFee.groupBy({ by: ['status'], where: { student_id: { in: studentIds } }, _count: { _all: true } });
      for (const g of feeGroups) fees[g.status] = g._count._all;
    }

    // Complaints pending vs resolved
    let complaints = { pending: 0, resolved: 0 };
    if (ownBlockIds.length) {
      const compGroups = await prisma.complaint.groupBy({ by: ['status'], where: { block_id: { in: ownBlockIds } }, _count: { _all: true } });
      for (const g of compGroups) {
        if ((g.status || '').toLowerCase() === 'resolved') complaints.resolved += g._count._all; else complaints.pending += g._count._all;
      }
    }

    // Attendance today per block
    let attendanceByBlock = {};
    if (studentIds.length) {
      const logs = await prisma.attendanceLog.findMany({ where: { student_id: { in: studentIds }, timestamp: { gte: start, lte: end } }, select: { student_id: true } });
      const presentSet = new Set(logs.map(l => l.student_id));
      // map student_id -> block_id
      const sidToBlock = students.reduce((acc, s) => { acc[s.user_id] = s.hostel_id; return acc; }, {});
      for (const sid of presentSet) {
        const bid = sidToBlock[sid];
        if (!bid) continue;
        attendanceByBlock[bid] = (attendanceByBlock[bid] || 0) + 1;
      }
    }

    const blocks = ownBlocks.map(b => {
      const capacity = capByBlock[b.id] || 0;
      const occupancy = occByBlock[b.id] || 0;
      const present = attendanceByBlock[b.id] || 0;
      const attendancePct = capacity > 0 ? Math.round(((present / (occupancy || capacity)) * 100)) : 0;
      return { id: b.id, name: b.name, type: b.type, capacity, occupancy, attendancePct };
    });

    const totalCapacity = Object.values(capByBlock).reduce((a, b) => a + b, 0) || 0;
    const totalOccupancy = Object.values(occByBlock).reduce((a, b) => a + b, 0) || 0;
    const occupancyRate = totalCapacity ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

    res.json({
      totals: { students: { total: totalOccupancy, boys, girls }, occupancyRate },
      fees,
      complaints,
      blocks
    });
  } catch (e) {
    console.error('overview error', e);
    res.status(500).json({ error: 'Failed to load overview' });
  }
});

// Blocks stats for RC/Warden
router.get('/blocks', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  let ownBlocks = [];

  if (req.user.role === Roles.warden) {
    // Warden oversees blocks directly via warden_id
    ownBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  } else {
    // RC oversees blocks via assignments
    const assignments = await prisma.rCAssignment.findMany({ where: { rc_id: req.user.sub, OR: [{ end_date: null }, { end_date: { gt: new Date() } }] } });
    const blockIds = assignments.map(a => a.block_id);
    ownBlocks = await prisma.hostelBlock.findMany({ where: { OR: [{ rc_id: req.user.sub }, { id: { in: blockIds } }] } });
  }

  // occupancy counts
  const blocksWithCounts = await Promise.all(ownBlocks.map(async (b) => {
    const count = await prisma.student.count({ where: { hostel_id: b.id } });
    const rooms = await prisma.room.findMany({ where: { hostel_block_id: b.id } });
    const capacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0) || b.capacity || 0;
    return { ...b, occupancy: count, capacity };
  }));
  res.json(blocksWithCounts);
});

// Roster for a block (students assigned)
router.get('/blocks/:blockId/occupancy', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const blockId = req.params.blockId;
  const students = await prisma.student.findMany({ where: { hostel_id: blockId }, include: { user: true, room: true } });
  res.json(students);
});

// Students across my blocks with optional filters
router.get('/students', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { blockId, department, year, status } = req.query || {};
  let ownBlockIds = [];

  if (req.user.role === Roles.warden) {
    // Warden oversees blocks directly via warden_id
    const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
    ownBlockIds = wardenBlocks.map(b => b.id);
  } else {
    // RC oversees blocks via assignments
    const assignments = await prisma.rCAssignment.findMany({ where: { rc_id: req.user.sub, OR: [{ end_date: null }, { end_date: { gt: new Date() } }] } });
    const blockIds = assignments.map(a => a.block_id);
    const ownBlocks = await prisma.hostelBlock.findMany({ where: { OR: [{ rc_id: req.user.sub }, { id: { in: blockIds } }] } });
    ownBlockIds = ownBlocks.map(b => b.id);
  }

  const where = { hostel_id: { in: ownBlockIds } };
  if (blockId) where.hostel_id = String(blockId);
  if (status) where.status = String(status);
  const include = { user: true, room: true, hostel: true };
  let students = await prisma.student.findMany({ where, include });
  if (department) students = students.filter(s => (s.user?.department || '').toLowerCase() === String(department).toLowerCase());
  if (year) students = students.filter(s => (s.user?.year || 0) === Number(year));
  res.json(students);
});

// Check-in/out and room move (within block)
router.patch('/blocks/:blockId/checkin', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const { studentId } = req.body;
  const updated = await prisma.student.update({ where: { user_id: studentId }, data: { status: 'checked-in', hostel_id: req.params.blockId } });
  res.json(updated);
});
router.patch('/blocks/:blockId/checkout', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const { studentId } = req.body;
  const updated = await prisma.student.update({ where: { user_id: studentId }, data: { status: 'checked-out' } });
  res.json(updated);
});
router.patch('/blocks/:blockId/room-move', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const { studentId, roomId, bedNo } = req.body;
  const updated = await prisma.student.update({ where: { user_id: studentId }, data: { room_id: roomId } });
  // TODO: enforce capacity and bedNo if modeled
  res.json(updated);
});

// Rooms of a block with simple occupancy counts
router.get('/blocks/:blockId/rooms', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const blockId = req.params.blockId;
  const rooms = await prisma.room.findMany({ where: { hostel_block_id: blockId } });
  const students = await prisma.student.findMany({ where: { hostel_id: blockId } });
  const occByRoom = students.reduce((acc, s) => { if (s.room_id) acc[s.room_id] = (acc[s.room_id] || 0) + 1; return acc; }, {});
  const result = rooms.map(r => ({ ...r, occupied: occByRoom[r.id] || 0, vacancy: Math.max(0, (r.capacity || 0) - (occByRoom[r.id] || 0)) }));
  res.json(result);
});

// Attendance views
router.get('/blocks/:blockId/attendance', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { date } = req.query;
  let from, to;
  if (date) {
    const d = new Date(String(date));
    from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
    to = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
  }
  const students = await prisma.student.findMany({ where: { hostel_id: req.params.blockId } });
  const logs = await prisma.attendanceLog.findMany({ where: { student_id: { in: students.map(s => s.user_id) }, ...(from && to ? { timestamp: { gte: from, lte: to } } : {}) }, orderBy: { timestamp: 'desc' } });
  res.json(logs);
});

// Applications in block (for RC review)
router.get('/blocks/:blockId/applications', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const students = await prisma.student.findMany({ where: { hostel_id: req.params.blockId } });
  const apps = await prisma.application.findMany({ where: { student_id: { in: students.map(s => s.user_id) } }, orderBy: { created_at: 'desc' } });
  res.json(apps);
});

// Complaints by block (reuse complaints route for actions)
router.get('/blocks/:blockId/complaints', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const items = await prisma.complaint.findMany({ where: { block_id: req.params.blockId }, orderBy: { created_at: 'desc' } });
  res.json(items);
});

// Reports (simple aggregations)
router.get('/blocks/:blockId/reports/occupancy', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const students = await prisma.student.count({ where: { hostel_id: req.params.blockId } });
  const rooms = await prisma.room.findMany({ where: { hostel_block_id: req.params.blockId } });
  const capacity = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  res.json({ students, capacity });
});

module.exports = router;
// Self profile for RC/Warden/Admin
router.get('/profile/me', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.user.sub } })
  res.json(u)
})
router.put('/profile/me', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  try {
    const { name, phone, dob, avatar_url } = req.body || {}
    const data = {}
    if (name !== undefined) data.name = String(name)
    if (phone !== undefined) {
      const p = String(phone).replace(/\D/g,'')
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
  logAudit(req.user.sub, 'profile_update', { scope: 'rc' })
    res.json(updated)
  } catch (e) {
    res.status(400).json({ error: 'Update failed' })
  }
})
