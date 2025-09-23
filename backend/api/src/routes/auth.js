const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();
const cache = require('../utils/cache');
const { auth } = require('../middleware/auth');
const { isStrongPassword } = require('../utils/validators');
const { logAudit } = require('../utils/audit');
const { saveBuffer } = require('../utils/storage');

// Configure multer for file uploads (100KB limit for documents)
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 100 * 1024 }, // 100KB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

router.post('/login', async (req, res) => {
  const { email, password, captchaId, captchaText } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (!captchaId || !captchaText) return res.status(400).json({ error: 'Captcha required' });
  const expected = await cache.get(`captcha:${captchaId}`);
  if (!expected || expected !== String(captchaText).toLowerCase()) return res.status(400).json({ error: 'Captcha invalid' });
  // Support login via email or registration number
  let user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
  if (!user) {
    user = await prisma.user.findFirst({ where: { reg_no: email } });
  }
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.active === false) return res.status(403).json({ error: 'Account is deactivated' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const disableOtp = process.env.DISABLE_OTP === 'true' || process.env.NODE_ENV !== 'production';
  if (disableOtp) {
    const access = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change', { expiresIn: '24h' });
    const refresh = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change', { expiresIn: '7d' });
    return res.json({ access, refresh });
  }
  // Step 1 OK -> issue temporary token to verify OTP
  const temp = jwt.sign({ sub: user.id, stage: 'otp' }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change', { expiresIn: '10m' });
  res.json({ next: 'otp', temp });
});

router.post('/verify-otp', async (req, res) => {
  const { temp, to, code } = req.body;
  if (!temp || !to || !code) return res.status(400).json({ error: 'Missing fields' });
  try {
    const p = jwt.verify(temp, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change');
    if (p.stage !== 'otp') return res.status(400).json({ error: 'Invalid stage' });
  const saved = await cache.get(`otp:${to}`);
    if (!saved || saved !== String(code)) return res.status(400).json({ error: 'Invalid OTP' });
  await cache.del(`otp:${to}`);
    const user = await prisma.user.findUnique({ where: { id: p.sub } });
    const access = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change', { expiresIn: '24h' });
    const refresh = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change', { expiresIn: '7d' });
    return res.json({ access, refresh });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid temp token' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refresh } = req.body;
  if (!refresh) return res.status(400).json({ error: 'Missing refresh token' });
  try {
    const r = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change');
    const user = await prisma.user.findUnique({ where: { id: r.sub } });
    if (!user) return res.status(401).json({ error: 'Invalid user' });
    const access = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change', { expiresIn: '30m' });
    return res.json({ access });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Registration: create a student user with complete profile and auto-login
router.post('/register', upload.fields([
  { name: 'address_proof', maxCount: 1 },
  { name: 'admission_slip', maxCount: 1 }
]), async (req, res) => {
  console.log('Registration request body keys:', Object.keys(req.body));
  console.log('Registration files keys:', Object.keys(req.files || {}));
  
  const { 
    // Basic fields
    name, email, phone, reg_no, password, captchaId, captchaText,
    // Personal details
    dob, community, gender, father_name, mother_name, distance_from_home, 
    category, medical_info, lateral_entry,
    // Academic details
    semester, year, program_type, degree, branch
  } = req.body;
  
  // Basic validation
  if (!name || !email || !phone || !reg_no || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: 'Weak password (min 8, letter+number)' });
  }
  if (!captchaId || !captchaText) {
    return res.status(400).json({ error: 'Captcha required' });
  }
  
  // Validate captcha
  const expected = await cache.get(`captcha:${captchaId}`);
  console.log('Captcha debug:', { captchaId, captchaText, expected, key: `captcha:${captchaId}` });
  if (!expected || expected !== String(captchaText).toLowerCase()) {
    console.log('Captcha validation failed');
    return res.status(400).json({ error: 'Captcha invalid' });
  }
  
  try {
    // Check for existing users
    const existsEmail = await prisma.user.findUnique({ where: { email } });
    if (existsEmail) return res.status(409).json({ error: 'Email already registered' });
    
    const existsReg = await prisma.user.findFirst({ where: { reg_no } });
    if (existsReg) return res.status(409).json({ error: 'Register number already used' });
    
    const hash = await bcrypt.hash(password, 10);
    
    // Create user with complete profile
    const userData = {
      name,
      email,
      phone,
      reg_no,
      role: 'student',
      password_hash: hash,
      // Personal details
      dob: dob ? new Date(dob) : null,
      // community, // Temporarily commented out due to Prisma client sync issue
      gender,
      father_name,
      mother_name,
      distance_from_home: distance_from_home ? parseInt(distance_from_home) : null,
      category,
      medical_info,
      lateral_entry,
      // Academic details
      semester: semester ? parseInt(semester) : null,
      year: year ? parseInt(year) : null,
      program_type,
      degree,
      branch
    };
    
    // First create the user to get the user ID
    const user = await prisma.user.create({ data: userData });
    
    // Handle file uploads using the storage utility
    let updateData = {};
    if (req.files) {
      if (req.files.address_proof && req.files.address_proof[0]) {
        const file = req.files.address_proof[0];
        const url = await saveBuffer(user.id, file.buffer, file.mimetype, `address_proof_${file.originalname}`);
        updateData.address_proof_url = url;
      }
      if (req.files.admission_slip && req.files.admission_slip[0]) {
        const file = req.files.admission_slip[0];
        const url = await saveBuffer(user.id, file.buffer, file.mimetype, `admission_slip_${file.originalname}`);
        updateData.admission_slip_url = url;
      }
      
      // Update user with file URLs if any files were uploaded
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });
      }
    }
    
    await prisma.student.create({ data: { user_id: user.id, status: 'pending' } });
    
    logAudit(user.id, 'register', { email: user.email, complete_profile: true });
    
    const access = jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change', { expiresIn: '30m' });
    const refresh = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change', { expiresIn: '7d' });
    
    return res.json({ access, refresh, message: 'Registration successful with complete profile' });
  } catch (e) {
    console.error('Registration error:', e);
    console.error('Error message:', e.message);
    console.error('Error stack:', e.stack);
    return res.status(500).json({ error: 'Registration failed', details: e.message });
  }
});

module.exports = router;

// Forgot password: request OTP using email or reg_no
router.post('/forgot/request', async (req, res) => {
  const { identifier, captchaId, captchaText } = req.body; // email or reg_no
  if (!identifier) return res.status(400).json({ error: 'Missing identifier' });
  if (!captchaId || !captchaText) return res.status(400).json({ error: 'Captcha required' });
  const expected = await cache.get(`captcha:${captchaId}`);
  if (!expected || expected !== String(captchaText).toLowerCase()) return res.status(400).json({ error: 'Captcha invalid' });
  const user = (await prisma.user.findUnique({ where: { email: identifier } }).catch(() => null)) ||
               (await prisma.user.findFirst({ where: { reg_no: identifier } }));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  await cache.setex(`otp:${user.email}`, 300, code);
  // In production, send via email/SMS; here return demo code
  res.json({ sent: true, to: user.email, demo_code: code });
});

// Forgot password: reset with OTP
router.post('/forgot/reset', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ error: 'Missing fields' });
  if (!isStrongPassword(newPassword)) return res.status(400).json({ error: 'Weak password (min 8, letter+number)' });
  const saved = await cache.get(`otp:${email}`);
  if (!saved || saved !== String(code)) return res.status(400).json({ error: 'Invalid OTP' });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password_hash: hash } });
  await cache.del(`otp:${email}`);
  logAudit(user.id, 'password_reset', { via: 'forgot' })
  res.json({ ok: true });
});

// Change password for logged-in user
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
  if (!isStrongPassword(newPassword)) return res.status(400).json({ error: 'Weak password (min 8, letter+number)' });
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(String(currentPassword), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
    const hash = await bcrypt.hash(String(newPassword), 10);
    await prisma.user.update({ where: { id: user.id }, data: { password_hash: hash } });
    logAudit(user.id, 'password_change', {})
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Change password failed' });
  }
});
