const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Student: file an appeal for a round or generic
router.post('/', auth, async (req, res) => {
  const { round_id, reason } = req.body || {};
  if (!reason) return res.status(400).json({ error: 'reason required' });
  const created = await prisma.appeal.create({ data: { student_id: req.user.sub, round_id: round_id || null, reason } });
  res.status(201).json(created);
});

// Student: my appeals
router.get('/me', auth, async (req, res) => {
  const items = await prisma.appeal.findMany({ where: { student_id: req.user.sub }, orderBy: { created_at: 'desc' } });
  res.json(items);
});

// RC/Admin: list appeals (optionally by status)
router.get('/', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { status } = req.query;
  const where = status ? { status: String(status) } : {};
  const items = await prisma.appeal.findMany({ where, orderBy: { created_at: 'desc' } });
  res.json(items);
});

// RC/Admin: decide an appeal
router.post('/:id/decision', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { decision, note } = req.body || {}; // approved | rejected
  if (!['approved','rejected'].includes(decision)) return res.status(400).json({ error: 'decision required' });
  const updated = await prisma.appeal.update({ where: { id: req.params.id }, data: { status: decision, decision_by: req.user.sub, decision_at: new Date(), decision_note: note || null } });
  res.json(updated);
});

module.exports = router;
