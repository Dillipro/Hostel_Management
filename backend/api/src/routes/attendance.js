const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const crypto = require('crypto');
const prisma = new PrismaClient();
const router = express.Router();

router.post('/scan', auth, async (req, res) => {
  const { method = 'qr', location = 'mess', student_id } = req.body;
  const sid = student_id || req.user.sub;
  const log = await prisma.attendanceLog.create({ data: { student_id: sid, method, location } });
  res.json(log);
});

router.get('/report', auth, requireRole(Roles.rc, Roles.admin, Roles.warden), async (req, res) => {
  const { block, from, to } = req.query;
  const where = {};
  if (from || to) where.timestamp = { gte: from ? new Date(String(from)) : undefined, lte: to ? new Date(String(to)) : undefined };
  const items = await prisma.attendanceLog.findMany({ where, orderBy: { timestamp: 'desc' } });
  res.json(items);
});

// Defaulters summary in a block and date
router.get('/defaulters', auth, requireRole(Roles.rc, Roles.admin, Roles.warden), async (req, res) => {
  const { blockId, date } = req.query;
  if (!blockId || !date) return res.status(400).json({ error: 'blockId and date required' });
  const d = new Date(String(date));
  const from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
  const to = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59));
  const students = await prisma.student.findMany({ where: { hostel_id: String(blockId) }, select: { user_id: true, user: true } });
  const logs = await prisma.attendanceLog.findMany({ where: { student_id: { in: students.map(s=>s.user_id) }, timestamp: { gte: from, lte: to } } });
  const present = new Set(logs.map(l=>l.student_id));
  const defaulters = students.filter(s=>!present.has(s.user_id)).map(s=>({ id: s.user_id, name: s.user?.name, reg_no: s.user?.reg_no, dept: s.user?.department }));
  res.json({ count: defaulters.length, defaulters });
});

router.get('/export.csv', auth, requireRole(Roles.rc, Roles.admin, Roles.warden), async (req, res) => {
  const { blockId, date } = req.query;
  const r = await fetch(`http://localhost:${process.env.PORT||4000}/api/attendance/defaulters?blockId=${encodeURIComponent(blockId)}&date=${encodeURIComponent(date)}`);
  const data = await r.json();
  const header = 'RegNo,Name,Department\n';
  const body = (data.defaulters||[]).map(d=>`${d.reg_no||''},${d.name||''},${d.dept||''}`).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="defaulters.csv"');
  res.send(header+body);
});

// Student: list my logs
router.get('/me', auth, async (req, res) => {
  const items = await prisma.attendanceLog.findMany({ where: { student_id: req.user.sub }, orderBy: { timestamp: 'desc' } });
  res.json(items);
});

module.exports = router;

// Post-attach override route for RC/Warden/Admin
router.post('/override', auth, requireRole(Roles.rc, Roles.admin, Roles.warden), async (req, res) => {
  const { student_id, timestamp, method = 'manual', location = 'override' } = req.body;
  if (!student_id) return res.status(400).json({ error: 'student_id required' });
  const when = timestamp ? new Date(String(timestamp)) : new Date();
  const log = await prisma.attendanceLog.create({ data: { student_id, timestamp: when, method, location } });
  res.json(log);
});

// --- QR rotating token (HMAC time-step) ---
function computeTokenForStep(secret, step) {
  const msg = Buffer.allocUnsafe(8);
  msg.writeBigInt64BE(BigInt(step));
  const h = crypto.createHmac('sha256', secret).update(msg).digest();
  // dynamic truncate last 4 bytes, map to 6 digits
  const code = (h.readUInt32BE(h.length - 4) % 1000000).toString().padStart(6, '0');
  return code;
}

router.get('/qr-token', auth, requireRole(Roles.rc, Roles.admin, Roles.warden), async (req, res) => {
  const secret = process.env.ATTENDANCE_QR_SECRET || 'dev_qr_secret_change';
  const period = parseInt(process.env.ATTENDANCE_QR_PERIOD || '60', 10);
  const now = Math.floor(Date.now() / 1000);
  const step = Math.floor(now / period);
  const code = computeTokenForStep(secret, step);
  const expires_at = new Date((step + 1) * period * 1000);
  res.json({ code, period, step, expires_at });
});

router.post('/scan-token', auth, async (req, res) => {
  const { code, location = 'qr' } = req.body || {};
  if (!code || String(code).length !== 6) return res.status(400).json({ error: 'Invalid code' });
  const secret = process.env.ATTENDANCE_QR_SECRET || 'dev_qr_secret_change';
  const period = parseInt(process.env.ATTENDANCE_QR_PERIOD || '60', 10);
  const now = Math.floor(Date.now() / 1000);
  const step = Math.floor(now / period);
  const window = [step - 1, step, step + 1];
  const valid = window.some(s => computeTokenForStep(secret, s) === String(code));
  if (!valid) return res.status(400).json({ error: 'Invalid or expired code' });
  const log = await prisma.attendanceLog.create({ data: { student_id: req.user.sub, method: 'qr', location } });
  res.json(log);
});

// --- Bulk upload attendance from CSV ---
router.post('/bulk-upload', auth, requireRole(Roles.rc, Roles.admin, Roles.warden), async (req, res) => {
  const { csv } = req.body || {};
  if (!csv || typeof csv !== 'string') return res.status(400).json({ error: 'csv string required' });
  const lines = csv.split(/\r?\n/).filter(l => l.trim().length);
  let ok = 0; const errors = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',').map(s => s.trim());
    if (parts.length < 2) { errors.push({ line: i+1, error: 'Expected student_id,timestamp' }); continue; }
    const [student_id, ts, method = 'bulk', location = 'upload'] = parts;
    if (!student_id) { errors.push({ line: i+1, error: 'Missing student_id' }); continue; }
    const when = ts ? new Date(ts) : new Date();
    if (isNaN(when.getTime())) { errors.push({ line: i+1, error: 'Invalid timestamp' }); continue; }
    try {
      await prisma.attendanceLog.create({ data: { student_id, timestamp: when, method, location } });
      ok++;
    } catch (e) {
      errors.push({ line: i+1, error: e.message });
    }
  }
  res.json({ inserted: ok, errors });
});
