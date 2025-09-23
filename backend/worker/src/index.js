require('dotenv').config();
const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', { maxRetriesPerRequest: null });
const pdfQueue = new Queue('pdf', { connection });
const notifyQueue = new Queue('notify', { connection });

// Store PDFs directly in Postgres blob columns

function renderSimplePdf(title, lines = []) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fontSize(20).text(title);
    doc.moveDown();
    doc.fontSize(12);
    lines.forEach((l) => doc.text(l));
    doc.end();
  });
}

new Worker('pdf', async (job) => {
  if (job.name === 'complaint-pdf') {
    const c = await prisma.complaint.findUnique({ where: { id: job.data.complaintId }, include: { student: { include: { user: true } } } });
    if (!c) return { error: 'not-found' };
    const buf = await renderSimplePdf('Complaint Letter', [
      `Student: ${c.student?.user?.name || ''} (${c.student_id})`,
      `Type: ${c.type}`,
      `Priority: ${c.priority}`,
      `Description: ${c.description}`,
      `Created: ${c.created_at}`,
    ]);
  await prisma.complaint.update({ where: { id: c.id }, data: { letter_pdf: buf } });
  return { stored: true };
  }
  if (job.name === 'receipt-pdf') {
    const p = await prisma.payment.findUnique({ where: { id: job.data.paymentId }, include: { student: { include: { user: true } } } });
    if (!p) return { error: 'not-found' };
    const buf = await renderSimplePdf('Fee Receipt', [
      `Student: ${p.student?.user?.name || ''} (${p.student_id})`,
      `Amount: ${p.amount}`,
      `Fee Type: ${p.fee_type}`,
      `Txn: ${p.txn_id || 'N/A'}`,
      `Date: ${p.created_at}`,
    ]);
  await prisma.payment.update({ where: { id: p.id }, data: { receipt_pdf: buf, receipt_url: null } });
  return { stored: true };
  }
  if (job.name === 'idcard-pdf') {
    const s = await prisma.student.findUnique({ where: { user_id: job.data.studentId }, include: { user: true, hostel: true, room: true } });
    if (!s) return { error: 'not-found' };
    const buf = await renderSimplePdf('Hostel ID Card', [
      `Name: ${s.user.name}`,
      `Reg No: ${s.user.reg_no || ''}`,
      `Dept/Year: ${s.user.department || ''} / ${s.user.year || ''}`,
      `Block: ${s.hostel?.name || ''}`,
      `Room: ${s.room?.room_no || ''}`,
    ]);
  await prisma.student.update({ where: { user_id: s.user_id }, data: { id_card_pdf: buf, id_card_qr: null } });
  return { stored: true };
  }
  if (job.name === 'admission-pdf') {
    const a = await prisma.application.findUnique({ where: { id: job.data.applicationId }, include: { student: { include: { user: true } } } });
    if (!a) return { error: 'not-found' };
    const lines = [
      `Student: ${a.student?.user?.name || ''} (${a.student_id})`,
      `Reg No: ${a.student?.user?.reg_no || ''}`,
      `Dept/Year: ${a.student?.user?.department || ''} / ${a.student?.user?.year || ''}`,
      `Status: ${a.status}`,
    ];
    const data = a.data || {};
    Object.keys(data).forEach((k) => {
      const v = typeof data[k] === 'object' ? JSON.stringify(data[k]) : String(data[k]);
      lines.push(`${k}: ${v}`);
    });
    const buf = await renderSimplePdf('Admission Application', lines);
  await prisma.application.update({ where: { id: a.id }, data: { pdf: buf, data: { ...(a.data || {}), pdf_url: null } } });
  return { stored: true };
  }
  return { ok: true };
}, { connection });

new Worker('notify', async (job) => {
  console.log('Notify job', job.name, job.data);
  return { ok: true };
}, { connection });

console.log('Worker running. Queues: pdf, notify');
