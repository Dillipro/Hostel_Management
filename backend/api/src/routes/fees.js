const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Placeholder implementation: store fee structures in a simple table if present; fallback to JSON in AuditLog
router.get('/', auth, requireRole(Roles.admin), async (req, res) => {
  const items = await prisma.auditLog.findMany({ where: { action: 'fee-structure' }, orderBy: { created_at: 'desc' } });
  res.json(items);
});
router.post('/', auth, requireRole(Roles.admin), async (req, res) => {
  const created = await prisma.auditLog.create({ data: { actor_id: req.user.sub, action: 'fee-structure', details: req.body } });
  res.status(201).json(created);
});

module.exports = router;
