const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const blocks = await prisma.hostelBlock.findMany();
  res.json(blocks);
});

router.get('/:id/rooms', auth, async (req, res) => {
  const rooms = await prisma.room.findMany({ where: { hostel_block_id: req.params.id } });
  res.json(rooms);
});

router.post('/', auth, requireRole(Roles.admin), async (req, res) => {
  const created = await prisma.hostelBlock.create({ data: req.body });
  res.status(201).json(created);
});

module.exports = router;
