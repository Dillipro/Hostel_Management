const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { auth, requireRole, Roles } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
let Queue, IORedis;
const prisma = new PrismaClient();
const router = express.Router();

const enableQueues = process.env.ENABLE_REDIS === 'true' || process.env.ENABLE_QUEUES === 'true';
let pdfQueue = { add: async () => ({ queued: false, dev: true }) };
if (enableQueues) {
  try {
    Queue = require('bullmq').Queue;
    IORedis = require('ioredis');
    const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
    pdfQueue = new Queue('pdf', { connection });
  } catch {}
}

function renderAdmissionPdf(app) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fontSize(16).text('HostelConnect - Admission Application', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Student: ${app.student?.user?.name || ''} (${app.student_id})`);
    doc.text(`Register No: ${app.student?.user?.reg_no || ''}`);
    doc.text(`Department/Year: ${app.student?.user?.department || ''} / ${app.student?.user?.year || ''}`);
    doc.moveDown();
    doc.text('Submitted Data:');
    const data = app.data || {};
    Object.keys(data).forEach((k) => {
      const v = typeof data[k] === 'object' ? JSON.stringify(data[k]) : String(data[k]);
      doc.text(`- ${k}: ${v}`);
    });
    doc.end();
  });
}

const admissionSchema = z.object({
  name: z.string().min(1),
  department: z.string().min(1),
  year: z.coerce.number().int().min(1).max(8),
  dob: z.string().min(4),
  reg_no: z.string().min(3),
  phone: z.string().regex(/^\d{10}$/),
  email: z.string().email(),
  blood_group: z.enum(['A+','A-','B+','B-','AB+','AB-','O+','O-']),
  medical_ailment: z.string().optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  parent_name: z.string().min(1),
  parent_address: z.string().min(1),
  parent_phone: z.string().min(5),
  guardian_name: z.string().min(1),
  guardian_address: z.string().min(1),
  guardian_phone: z.string().min(5),
  agree: z.literal(true),
  signature_url: z.string().url().optional().nullable(),
  guardian_decl_url: z.string().url().optional().nullable(),
  community: z.enum(['OC','BC','MBC','SC','ST','Others']),
  gender: z.enum(['Male','Female','Other']),
  father_name: z.string().min(1),
  mother_name: z.string().min(1),
  distance_km: z.coerce.number().min(0).max(10000),
  address_proof_url: z.string().url().optional().nullable(),
  category: z.enum(['Day Scholar','Hosteller','Other']),
  admission_slip_url: z.string().url().optional().nullable(),
  medical_notes: z.string().optional().nullable(),
  lateral_entry: z.enum(['Yes','No']),
  semester: z.coerce.number().min(1).max(12),
  program_type: z.enum(['UG','PG']),
  degree: z.enum(['B.E','B.Tech','M.E','M.Tech','MBA','MCA']),
  branch: z.string().min(1),
  academic_year: z.string().min(4)
});

router.post('/', auth, async (req, res) => {
  const parsed = admissionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
  const app = await prisma.application.create({ data: { student_id: req.user.sub, type: 'admission', data: parsed.data, status: 'pending' } });
  res.status(201).json(app);
});

router.get('/me', auth, async (req, res) => {
  const items = await prisma.application.findMany({ where: { student_id: req.user.sub, type: 'admission' }, orderBy: { created_at: 'desc' } });
  res.json(items);
});

// Approval workflow updates (RC/Warden/Admin)
router.post('/:id/status', auth, requireRole(Roles.rc, Roles.warden, Roles.admin), async (req, res) => {
  const { status, remark } = req.body;
  const updated = await prisma.application.update({ where: { id: req.params.id }, data: { status: String(status), admin_remark: remark || null } });
  res.json(updated);
});

// Generate Admission PDF and store URL in application details
router.post('/:id/pdf', auth, async (req, res) => {
  if (enableQueues) {
    await pdfQueue.add('admission-pdf', { applicationId: req.params.id });
    return res.json({ queued: true });
  }
  const appItem = await prisma.application.findUnique({ where: { id: req.params.id }, include: { student: { include: { user: true } } } });
  if (!appItem) return res.status(404).json({ error: 'Not found' });
  const buf = await renderAdmissionPdf(appItem);
  const updated = await prisma.application.update({ where: { id: appItem.id }, data: { pdf: buf, data: { ...(appItem.data || {}), pdf_url: null } } });
  res.json({ stored: true, application: updated });
});

// Dynamic options for branches and academic years (admin-managed; stubbed for now)
router.get('/options/branches', auth, async (_req, res) => {
  // TODO: fetch from a settings table; returning stub list for now
  res.json(['Civil', 'Mechanical', 'EEE', 'ECE', 'CSE', 'IT', 'Industrial', 'GeoInformatics', 'Mining']);
});
router.get('/options/years', auth, async (_req, res) => {
  const y = new Date().getFullYear();
  res.json([`${y}-${y+1}`, `${y+1}-${y+2}`, `${y+2}-${y+3}`]);
});

module.exports = router;
