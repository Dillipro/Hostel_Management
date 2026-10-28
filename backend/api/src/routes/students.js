const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const PDFDocument = require('pdfkit');
let Queue, IORedis;
const prisma = new PrismaClient();
const router = express.Router();
let pdfQueue = { add: async () => ({ queued: false, dev: true }) };
const enableQueues = process.env.ENABLE_REDIS === 'true' || process.env.ENABLE_QUEUES === 'true';
if (enableQueues) {
  try {
    Queue = require('bullmq').Queue;
    IORedis = require('ioredis');
    const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
    pdfQueue = new Queue('pdf', { connection });
  } catch {}
}

router.get('/me', auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub }, include: { student: true } });
  res.json(user);
});

router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, dob, department, year, reg_no, avatar_url } = req.body || {}
    const data = {}
    if (name !== undefined) data.name = String(name)
    if (phone !== undefined) {
      const phoneNorm = String(phone).replace(/\D/g, '')
      if (phoneNorm.length < 7 || phoneNorm.length > 15) return res.status(400).json({ error: 'invalid phone' })
      data.phone = phoneNorm
    }
    if (dob !== undefined) {
      const d = new Date(String(dob))
      if (isNaN(d.getTime())) return res.status(400).json({ error: 'invalid dob' })
      data.dob = d
    }
    if (department !== undefined) data.department = String(department)
    if (year !== undefined) {
      const y = Number(year)
      if (!Number.isInteger(y) || y < 1 || y > 10) return res.status(400).json({ error: 'invalid year' })
      data.year = y
    }
    if (reg_no !== undefined) data.reg_no = String(reg_no)
    if (avatar_url !== undefined) data.avatar_url = String(avatar_url)
  const updated = await prisma.user.update({ where: { id: req.user.sub }, data })
  logAudit(req.user.sub, 'profile_update', { scope: 'student' })
    res.json(updated)
  } catch (e) {
    res.status(400).json({ error: 'Update failed' })
  }
});

module.exports = router;

// ID card generation enqueue
router.post('/:id/idcard', auth, async (req, res) => {
  if (req.user.sub !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  if (enableQueues) {
    await pdfQueue.add('idcard-pdf', { studentId: req.params.id });
    return res.json({ queued: true });
  }
  const id = req.params.id;
  const s = await prisma.student.findUnique({ where: { user_id: id }, include: { user: true, hostel: true, room: true } });
  if (!s) return res.status(404).json({ error: 'Not found' });
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  doc.on('data', (d) => chunks.push(d));
  doc.on('end', async () => {
    const buf = Buffer.concat(chunks);
    await prisma.student.update({ where: { user_id: id }, data: { id_card_pdf: buf, id_card_qr: null } });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="idcard-${id}.pdf"`);
    res.send(buf);
  });
  doc.fontSize(20).text('Hostel ID Card');
  doc.moveDown();
  doc.fontSize(12);
  doc.text(`Name: ${s.user.name}`);
  doc.text(`Reg No: ${s.user.reg_no || ''}`);
  doc.text(`Dept/Year: ${s.user.department || ''} / ${s.user.year || ''}`);
  doc.text(`Block: ${s.hostel?.name || ''}`);
  doc.text(`Room: ${s.room?.room_no || ''}`);
  doc.end();
});

// Stream ID card PDF
router.get('/:id/idcard.pdf', auth, async (req, res) => {
  const id = req.params.id;
  if (req.user.sub !== id) return res.status(403).json({ error: 'Forbidden' });
  const st = await prisma.student.findUnique({ where: { user_id: id } });
  if (!st || !st.id_card_pdf) return res.status(404).json({ error: 'Not found' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="idcard-${id}.pdf"`);
  res.send(Buffer.from(st.id_card_pdf));
});
