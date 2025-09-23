const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// RC Notices CRUD
router.get('/blocks/:blockId/notices', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const items = await prisma.rCNotice.findMany({ where: { block_id: req.params.blockId }, orderBy: { publish_at: 'desc' } });
  res.json(items);
});
router.post('/blocks/:blockId/notices', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const { title, body, attachments, publish_at, expires_at, pinned=false, dept_targets=[], year_targets=[] } = req.body;
  const created = await prisma.rCNotice.create({ data: { block_id: req.params.blockId, title, body, attachments: attachments||null, publish_at: publish_at? new Date(publish_at): null, expires_at: expires_at? new Date(expires_at): null, created_by: req.user.sub, pinned: !!pinned, dept_targets, year_targets } });
  res.status(201).json(created);
});
router.delete('/notices/:id', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  await prisma.rCNotice.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Student view of RC notices for their block
router.get('/student/notices', auth, async (req, res) => {
  const me = await prisma.student.findUnique({ where: { user_id: req.user.sub }, include: { user: true } });
  if (!me?.hostel_id) return res.json([]);
  const now = new Date();
  const items = await prisma.rCNotice.findMany({
    where: {
      block_id: me.hostel_id,
      AND: [
        { OR: [{ publish_at: null }, { publish_at: { lte: now } }] },
        { OR: [{ expires_at: null }, { expires_at: { gte: now } }] },
        { OR: [
          { dept_targets: { isEmpty: true } },
          { dept_targets: { has: me.user?.department || '' } }
        ] },
        { OR: [
          { year_targets: { isEmpty: true } },
          { year_targets: { has: me.user?.year || 0 } }
        ] }
      ]
    },
    orderBy: [{ pinned: 'desc' }, { publish_at: 'desc' }]
  });
  res.json(items);
});

router.post('/student/notices/:id/read', auth, async (req, res) => {
  const noticeId = req.params.id;
  try {
    await prisma.noticeRead.create({ data: { notice_id: noticeId, user_id: req.user.sub } });
  } catch {}
  res.json({ ok: true });
});

// Swap requests
router.post('/swaps', auth, async (req, res) => {
  const { target_student_id } = req.body;
  if (!target_student_id) return res.status(400).json({ error: 'target_student_id required' });
  const created = await prisma.swapRequest.create({ data: { requester_student_id: req.user.sub, target_student_id } });
  res.status(201).json(created);
});
router.get('/swaps', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (_req, res) => {
  const items = await prisma.swapRequest.findMany({ orderBy: { created_at: 'desc' } });
  res.json(items);
});
router.patch('/swaps/:id/decision', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { decision } = req.body; // approve|reject
  const status = decision === 'approve' ? 'approved' : 'rejected';
  const updated = await prisma.swapRequest.update({ where: { id: req.params.id }, data: { status } });
  // Apply swap if approved
  if (status === 'approved') {
    const sr = updated;
    const a = await prisma.student.findUnique({ where: { user_id: sr.requester_student_id } });
    const b = await prisma.student.findUnique({ where: { user_id: sr.target_student_id } });
    await prisma.$transaction([
      prisma.student.update({ where: { user_id: sr.requester_student_id }, data: { hostel_id: b?.hostel_id || null, room_id: b?.room_id || null } }),
      prisma.student.update({ where: { user_id: sr.target_student_id }, data: { hostel_id: a?.hostel_id || null, room_id: a?.room_id || null } })
    ]);
  }
  res.json(updated);
});

module.exports = router;
