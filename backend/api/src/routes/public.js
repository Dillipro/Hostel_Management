const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const router = express.Router();

router.get('/circulars', async (_req, res) => {
  const items = await prisma.circular.findMany({ where: { is_published: true }, orderBy: { publish_at: 'desc' } });
  res.json(items);
});

module.exports = router;
