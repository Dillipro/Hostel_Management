const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
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

router.post('/initiate', auth, async (req, res) => {
  const { amount, fee_type } = req.body;
  const p = await prisma.payment.create({ data: { student_id: req.user.sub, amount: Number(amount), fee_type } });
  res.json({ payment_id: p.id, order: { id: 'mock_order_'+p.id } });
});

router.get('/', auth, async (req, res) => {
  const items = await prisma.payment.findMany({ where: { student_id: req.user.sub }, orderBy: { created_at: 'desc' } });
  res.json(items);
});

router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  const provider = process.env.PAYMENT_PROVIDER || 'razorpay';
  if (provider === 'razorpay') {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const crypto = require('crypto');
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (!signature || signature !== expectedSig) return res.status(400).json({ error: 'Invalid signature' });
    const body = req.body || {};
    const event = body.event || 'payment_event';
    const rpPayment = body.payload?.payment?.entity || {};
    const payment_id = body.payment_id || rpPayment?.notes?.payment_id || body.order_id || null;
    const txn_id = body.txn_id || rpPayment?.id || null;
    const status = body.status || rpPayment?.status || 'created';
    if (!payment_id) return res.status(400).json({ error: 'payment_id missing' });
    try {
      // Log event
      await prisma.paymentEvent.create({ data: { payment_id, provider: 'razorpay', type: event, payload: body } });
    } catch {}
    // Update payment with idempotency: don't regress from success
    const p = await prisma.payment.findUnique({ where: { id: payment_id } });
    if (!p) return res.status(404).json({ error: 'Payment not found' });
    const nextStatus = p.status === 'success' ? p.status : status;
    await prisma.payment.update({ where: { id: payment_id }, data: { status: nextStatus, txn_id: txn_id || p.txn_id, gateway_status: status, gateway_ref: txn_id, gateway_response: body } });
    if (nextStatus === 'success') await pdfQueue.add('receipt-pdf', { paymentId: payment_id });
    return res.json({ ok: true });
  }
  // PayU or other providers can be added similarly
  return res.json({ ok: true });
});

router.get('/:id/receipt', auth, async (req, res) => {
  const p = await prisma.payment.findUnique({ where: { id: req.params.id } });
  if (!p || p.student_id !== req.user.sub) return res.status(404).json({ error: 'Not found' });
  if (p.receipt_pdf) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${p.id}.pdf"`);
    return res.send(Buffer.from(p.receipt_pdf));
  }
  return res.json({ receipt_url: p.receipt_url || null });
});

module.exports = router;
