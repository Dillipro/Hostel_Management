const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { celebrate, Joi, Segments } = require('celebrate');
const PDFDocument = require('pdfkit');
const { drawHeader, drawFooter } = require('../utils/pdf');

router.use(authenticateToken);

// List alerts with optional filters
router.get('/', authorizeRoles(['warden','admin','super_admin','security']), celebrate({
  [Segments.QUERY]: Joi.object({ isResolved: Joi.string(), blockId: Joi.string(), hostelId: Joi.string(), type: Joi.string(), limit: Joi.number().min(1).max(200).default(50) })
}), async (req, res) => {
  try {
    const { isResolved, blockId, hostelId, type, limit = 50 } = req.query;
    const q = {};
    if (isResolved != null) q.isResolved = isResolved === 'true';
    if (blockId) q.blockId = blockId;
    if (hostelId) q.hostelId = hostelId;
    if (type) q.type = type;
    const alerts = await Alert.find(q).sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json({ success: true, data: alerts });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Resolve alert
router.put('/:id/resolve', authorizeRoles(['warden','admin','super_admin','security']), celebrate({ [Segments.PARAMS]: Joi.object({ id: Joi.string().required() }) }), async (req, res) => {
  try {
    const a = await Alert.findByIdAndUpdate(req.params.id, { isResolved: true, resolvedAt: new Date(), resolvedBy: req.user._id }, { new: true });
    if (!a) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: a });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

// Exports
router.get('/export/csv', authorizeRoles(['warden','admin','super_admin','security']), celebrate({
  [Segments.QUERY]: Joi.object({ isResolved: Joi.string(), blockId: Joi.string(), hostelId: Joi.string(), type: Joi.string(), limit: Joi.number().min(1).max(500).default(200) })
}), async (req, res) => {
  try {
    const { isResolved, blockId, hostelId, type, limit } = req.query;
    const q = {};
    if (isResolved != null) q.isResolved = isResolved === 'true';
    if (blockId) q.blockId = blockId;
    if (hostelId) q.hostelId = hostelId;
    if (type) q.type = type;
    const alerts = await Alert.find(q).sort({ createdAt: -1 }).limit(parseInt(limit)).lean();
    const header = 'Type,Severity,Message,StudentId,BlockId,HostelId,MessId,DeviceId,Resolved,CreatedAt\n';
    const csv = header + alerts.map(a => [a.type,a.severity,JSON.stringify(a.message||''),a.studentId||'',a.blockId||'',a.hostelId||'',a.messId||'',a.deviceId||'',a.isResolved?'yes':'no',new Date(a.createdAt).toISOString()].join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=alerts.csv');
    res.send(csv);
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/export/pdf', authorizeRoles(['warden','admin','super_admin','security']), celebrate({
  [Segments.QUERY]: Joi.object({ isResolved: Joi.string(), blockId: Joi.string(), hostelId: Joi.string(), type: Joi.string(), limit: Joi.number().min(1).max(500).default(200) })
}), async (req, res) => {
  try {
    const { isResolved, blockId, hostelId, type, limit } = req.query;
    const q = {};
    if (isResolved != null) q.isResolved = isResolved === 'true';
    if (blockId) q.blockId = blockId;
    if (hostelId) q.hostelId = hostelId;
    if (type) q.type = type;
    const alerts = await Alert.find(q).sort({ createdAt: -1 }).limit(parseInt(limit)).lean();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=alerts.pdf');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);
    drawHeader(doc, 'Security Alerts Report');
    const x = doc.page.margins.left; let y = doc.y + 5; const col = { type: x, severity: x+120, msg: x+200, time: x+420, resolved: x+500 };
    doc.font('Helvetica-Bold').fontSize(11).text('Type', col.type, y).text('Severity', col.severity, y).text('Message', col.msg, y).text('CreatedAt', col.time, y).text('Resolved', col.resolved, y);
    y = doc.y + 6; doc.moveTo(x, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke('#d0d7e2');
    doc.font('Helvetica').fontSize(10);
    alerts.forEach(a => {
      const lineY = doc.y + 8;
      doc.text(a.type, col.type, lineY);
      doc.text(a.severity, col.severity, lineY);
      doc.text((a.message||'').toString().substring(0, 40), col.msg, lineY, { width: 200 });
      doc.text(new Date(a.createdAt).toISOString(), col.time, lineY);
      doc.text(a.isResolved ? 'Yes' : 'No', col.resolved, lineY);
      const nextY = doc.y + 6; doc.moveTo(x, nextY).lineTo(doc.page.width - doc.page.margins.right, nextY).strokeColor('#eef2f7').stroke();
    });
    doc.moveDown(1); drawFooter(doc); doc.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
