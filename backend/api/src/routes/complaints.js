const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
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

// Create complaint
router.post('/', auth, async (req, res) => {
  const { type, priority, description, attachments, block_id, room_id } = req.body;
  const c = await prisma.complaint.create({ data: { student_id: req.user.sub, type, priority, description, attachments, block_id, room_id } });
  res.status(201).json(c);
});

// List complaints (filter)
router.get('/', auth, async (req, res) => {
  const { status, block_id } = req.query;
  const where = {};
  if (status) where.status = String(status);
  if (block_id) where.block_id = String(block_id);
  // Students see their own; RC/Warden/Admin see filtered
  if (![Roles.rc, Roles.warden, Roles.admin].includes(req.user.role)) {
    where.student_id = req.user.sub;
  }
  const items = await prisma.complaint.findMany({ where, orderBy: { created_at: 'desc' } });
  res.json(items);
});

// Assign complaint (RC/Warden)
router.post('/:id/assign', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const { assigned_to, status = 'assigned' } = req.body;
  const updated = await prisma.complaint.update({ where: { id: req.params.id }, data: { assigned_to, status } });
  res.json(updated);
});

// Reject complaint (RC/Warden)
router.post('/:id/reject', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const updated = await prisma.complaint.update({ where: { id: req.params.id }, data: { status: 'rejected', assigned_to: null } });
  res.json(updated);
});

// Update complaint status (RC/Warden/Admin)
router.post('/:id/status', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { status } = req.body;
  const data = { status: String(status) };
  if (status === 'completed' || status === 'resolved' || status === 'closed') data.resolved_at = new Date();
  const updated = await prisma.complaint.update({ where: { id: req.params.id }, data });
  res.json(updated);
});

// SLA timers
router.post('/:id/start', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const updated = await prisma.complaint.update({ where: { id: req.params.id }, data: { status: 'in-progress', started_at: new Date() } });
  res.json(updated);
});
router.post('/:id/stop', auth, requireRole(Roles.rc, Roles.warden), async (req, res) => {
  const updated = await prisma.complaint.update({ where: { id: req.params.id }, data: { stopped_at: new Date(), status: 'completed', resolved_at: new Date() } });
  res.json(updated);
});

// Generate PDF hard-copy letter (background)
router.post('/:id/generate-pdf', auth, async (req, res) => {
  if (enableQueues) {
    await pdfQueue.add('complaint-pdf', { complaintId: req.params.id });
    return res.json({ queued: true });
  }
  const c = await prisma.complaint.findUnique({ where: { id: req.params.id }, include: { student: { include: { user: true } } } });
  if (!c) return res.status(404).json({ error: 'Not found' });
  const PDFDocument = require('pdfkit');
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  doc.on('data', (d) => chunks.push(d));
  doc.on('end', async () => {
    const buf = Buffer.concat(chunks);
    await prisma.complaint.update({ where: { id: c.id }, data: { letter_pdf: buf } });
    res.json({ stored: true });
  });
  doc.fontSize(20).text('Complaint Letter');
  doc.moveDown();
  doc.fontSize(12).text(`Student: ${c.student?.user?.name || ''} (${c.student_id})`);
  doc.text(`Type: ${c.type}`);
  doc.text(`Priority: ${c.priority}`);
  doc.text(`Description: ${c.description}`);
  doc.text(`Created: ${c.created_at}`);
  doc.end();
});

// Stream stored complaint letter PDF
router.get('/:id/letter.pdf', auth, async (req, res) => {
  const c = await prisma.complaint.findUnique({ where: { id: req.params.id } });
  if (!c) return res.status(404).json({ error: 'Not found' });
  // Only owner or staff can view
  const { Roles } = require('../middleware/auth');
  const isStaff = [Roles.rc, Roles.warden, Roles.admin].includes(req.user.role);
  if (!isStaff && c.student_id !== req.user.sub) return res.status(403).json({ error: 'Forbidden' });
  if (!c.letter_pdf) return res.status(404).json({ error: 'PDF not ready' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="complaint-${c.id}.pdf"`);
  res.send(Buffer.from(c.letter_pdf));
});

module.exports = router;
