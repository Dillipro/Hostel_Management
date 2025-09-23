const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const where = req.user.role === 'admin' ? {} : { is_published: true };
  const items = await prisma.circular.findMany({ where, orderBy: { publish_at: 'desc' } });
  res.json(items);
});

router.post('/', auth, requireRole(Roles.admin, Roles.warden, Roles.staff), async (req, res) => {
  const created = await prisma.circular.create({ data: { ...req.body, author_id: req.user.sub } });
  res.status(201).json(created);
});

router.patch('/:id/publish', auth, requireRole(Roles.admin, Roles.warden, Roles.staff), async (req, res) => {
  const updated = await prisma.circular.update({ where: { id: req.params.id }, data: { is_published: true, publish_at: new Date() } });
  res.json(updated);
});

module.exports = router;
