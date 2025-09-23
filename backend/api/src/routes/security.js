const express = require('express');
const svgCaptcha = require('svg-captcha');
let IORedis;
const crypto = require('crypto');

const router = express.Router();
const cache = require('../utils/cache');

router.get('/captcha', async (req, res) => {
  const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true });
  const id = crypto.randomBytes(8).toString('hex');
  await cache.setex(`captcha:${id}`, 300, captcha.text.toLowerCase());
  const expose = process.env.EXPOSE_CAPTCHA_TEXT === 'true' || process.env.NODE_ENV !== 'production';
  res.type('json').send({ id, data: captcha.data, ...(expose ? { text: captcha.text } : {}) });
});

router.post('/otp/request', async (req, res) => {
  const { to } = req.body; // email or phone
  if (!to) return res.status(400).json({ error: 'Missing recipient' });
  const code = (Math.floor(100000 + Math.random() * 900000)).toString();
  await cache.setex(`otp:${to}`, 300, code);
  // For demo, return code; in prod, send via SMS/Email
  res.json({ sent: true, demo_code: code });
});

router.post('/otp/verify', async (req, res) => {
  const { to, code } = req.body;
  const saved = await cache.get(`otp:${to}`);
  if (!saved || saved !== String(code)) return res.status(400).json({ ok: false });
  await cache.del(`otp:${to}`);
  res.json({ ok: true });
});

module.exports = router;
