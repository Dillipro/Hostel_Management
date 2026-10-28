const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const items = await prisma.notification.findMany({ where: { user_id: req.user.sub }, orderBy: { created_at: 'desc' }, take: 50 });
  const unread = items.filter(n=>!n.read_at).length;
  res.json({ unread, items });
});

router.post('/:id/read', auth, async (req, res) => {
  const { id } = req.params;
  const it = await prisma.notification.update({ where: { id }, data: { read_at: new Date() } }).catch(()=>null);
  if (!it) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
