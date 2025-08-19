const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Student = require('../models/Student');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { celebrate, Joi, Segments } = require('celebrate');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { drawHeader, drawFooter } = require('../utils/pdf');

router.use(authenticateToken);

// Generate monthly mess bill for a student
router.post('/bills/generate', authorizeRoles(['admin','super_admin','accounts']), celebrate({
  [Segments.BODY]: Joi.object({
    studentId: Joi.string().required(),
    type: Joi.string().valid('hostel_rent','mess_bill','fine').required(),
    month: Joi.string().optional(),
    items: Joi.array().items(Joi.object({ description: Joi.string().required(), amount: Joi.number().min(0).required() })).default([])
  })
}), async (req, res) => {
  try {
    const { studentId, type, month, items = [] } = req.body;
    const amount = items.reduce((s, i) => s + (i.amount || 0), 0);
    const bill = await Bill.create({ studentId, type, month, items, amount, dueDate: new Date() });
    res.json({ success: true, data: bill });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// List bills
router.get('/bills', authorizeRoles(['admin','super_admin','accounts','student']), celebrate({
  [Segments.QUERY]: Joi.object({ studentId: Joi.string(), status: Joi.string(), type: Joi.string(), month: Joi.string() })
}), async (req, res) => {
  try {
    const { studentId, status, type, month } = req.query;
    const q = {};
    if (studentId) q.studentId = studentId;
    if (status) q.status = status;
    if (type) q.type = type;
    if (month) q.month = month;
    // Students can only see their own bills
    if (req.user.role === 'student') q.studentId = req.user._id;
    const bills = await Bill.find(q).sort({ createdAt: -1 });
    res.json({ success: true, data: bills });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mark bill paid
router.put('/bills/:id/pay', authorizeRoles(['admin','super_admin','accounts']), celebrate({
  [Segments.PARAMS]: Joi.object({ id: Joi.string().required() }),
  [Segments.BODY]: Joi.object({ paymentRef: Joi.string().required() })
}), async (req, res) => {
  try {
    const { paymentRef } = req.body;
    const bill = await Bill.findByIdAndUpdate(req.params.id, { status: 'paid', paidAt: new Date(), paymentRef }, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

// Financial reports (admin)
router.get('/reports/collections/csv', authorizeRoles(['admin','super_admin','accounts']), celebrate({
  [Segments.QUERY]: Joi.object({ from: Joi.date().required(), to: Joi.date().required() })
}), async (req, res) => {
  try {
    const { from, to } = req.query;
    const rows = await Bill.find({ status: 'paid', paidAt: { $gte: new Date(from), $lte: new Date(to) } }).lean();
    const header = 'StudentId,Type,Month,Amount,PaidAt,PaymentRef\n';
    const csv = header + rows.map(r => `${r.studentId},${r.type},${r.month||''},${r.amount},${r.paidAt?.toISOString?.()||''},${r.paymentRef||''}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=collections.csv');
    res.send(csv);
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/reports/collections/pdf', authorizeRoles(['admin','super_admin','accounts']), celebrate({
  [Segments.QUERY]: Joi.object({ from: Joi.date().required(), to: Joi.date().required() })
}), async (req, res) => {
  try {
    const { from, to } = req.query;
    const rows = await Bill.find({ status: 'paid', paidAt: { $gte: new Date(from), $lte: new Date(to) } }).lean();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=collections.pdf');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);
    drawHeader(doc, 'Financial Collections Report');
    const x = doc.page.margins.left; let y = doc.y + 5; const col = { type: x, month: x+120, amount: x+220, paid: x+300, ref: x+430 };
    doc.font('Helvetica-Bold').fontSize(11).text('Type', col.type, y).text('Month', col.month, y).text('Amount', col.amount, y).text('PaidAt', col.paid, y).text('Ref', col.ref, y);
    y = doc.y + 6; doc.moveTo(x, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke('#d0d7e2');
    doc.font('Helvetica').fontSize(10);
    rows.forEach(r => {
      const lineY = doc.y + 8;
      doc.text(r.type, col.type, lineY);
      doc.text(r.month || '-', col.month, lineY);
      doc.text((r.amount||0).toFixed(2), col.amount, lineY);
      doc.text(r.paidAt ? new Date(r.paidAt).toISOString() : '-', col.paid, lineY);
      doc.text(r.paymentRef || '-', col.ref, lineY);
      const nextY = doc.y + 6; doc.moveTo(x, nextY).lineTo(doc.page.width - doc.page.margins.right, nextY).strokeColor('#eef2f7').stroke();
    });
    doc.moveDown(1); drawFooter(doc); doc.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/reports/bills/excel', authorizeRoles(['admin','super_admin','accounts']), celebrate({
  [Segments.QUERY]: Joi.object({ month: Joi.string().required(), type: Joi.string().valid('hostel_rent','mess_bill','fine').optional() })
}), async (req, res) => {
  try {
    const { month, type } = req.query;
    const q = { month };
    if (type) q.type = type;
    const rows = await Bill.find(q).lean();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Bills');
    sheet.columns = [
      { header: 'StudentId', key: 'studentId', width: 28 },
      { header: 'Type', key: 'type', width: 16 },
      { header: 'Month', key: 'month', width: 12 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Status', key: 'status', width: 12 }
    ];
    rows.forEach(r => sheet.addRow({ ...r }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=bills.xlsx');
    await workbook.xlsx.write(res); res.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
