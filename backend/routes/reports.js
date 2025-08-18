const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { LeaveRequest, Complaint, AccessCard, Room } = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { drawHeader, drawFooter } = require('../utils/pdf');
const { Hostel, Block, Mess } = require('../models/HostelInfrastructure');

router.use(authenticateToken);

// Attendance report (monthly)
router.get('/attendance', authorizeRoles(['warden', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { month, year, studentId } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const card = await AccessCard.findOne({ studentId }).lean();
    const logs = (card?.usageLog || []).filter(l => new Date(l.timestamp) >= start && new Date(l.timestamp) < end && l.success);
    const byDay = {};
    logs.forEach(l => {
      const d = new Date(l.timestamp).toISOString().slice(0,10);
      byDay[d] = (byDay[d] || 0) + 1;
    });
    res.json({ success: true, data: { month, year, daysPresent: Object.keys(byDay).length, logs: byDay } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Fee collection report
router.get('/fees', authorizeRoles(['admin', 'super_admin', 'accounts']), async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const pipeline = [
      { $unwind: '$paymentHistory' },
      { $match: { 'paymentHistory.status': 'success', 'paymentHistory.paidAt': { $gte: start, $lte: end } } },
      { $group: { _id: '$paymentHistory.feeType', total: { $sum: '$paymentHistory.amount' }, count: { $sum: 1 } } }
    ];
    const data = await Student.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Complaint trends
router.get('/complaints', authorizeRoles(['warden', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const data = await Complaint.aggregate([
      { $match: { createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) } } },
      { $group: { _id: { category: '$category', status: '$status' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
// Mess per-meal forecast (admin)
router.get('/mess/forecast', authorizeRoles(['admin','super_admin']), async (req, res) => {
  try {
    const { messId, days = 7 } = req.query;
    const mess = await Mess.findById(messId).lean();
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });
  const { forecastMealsFromAttendance } = require('../utils/mess');
  const forecast = forecastMealsFromAttendance(mess.attendance || [], days);
    res.json({ success: true, data: { days: parseInt(days), forecast } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
// Fee structure preview for given hostel/year
router.get('/fees/structure-preview', authorizeRoles(['admin', 'super_admin', 'accounts']), async (req, res) => {
  try {
    const { hostelId, academicYear } = req.query;
    const fs = await FeeStructure.findOne({ hostelId, academicYear, isActive: true }).lean();
    if (!fs) return res.status(404).json({ success: false, message: 'No active fee structure' });
    const result = { hostelFee: 0, messFee: 0, securityDeposit: 0, items: fs.items };
    for (const item of fs.items || []) {
      if (!item.isActive) continue;
      if (item.code === 'hostel_fee') result.hostelFee += item.amount || 0;
      if (item.code === 'mess_fee') result.messFee += item.amount || 0;
      if (item.code === 'security_deposit') result.securityDeposit += item.amount || 0;
    }
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Personalized fee preview for a specific student (applies concessions/conditions)
router.get('/fees/structure-preview/personalized', authorizeRoles(['admin', 'super_admin', 'accounts', 'student']), async (req, res) => {
  try {
    const { hostelId, academicYear, studentId, mealPlanCode, installmentCode } = req.query;
    if (!hostelId || !academicYear || !studentId) return res.status(400).json({ success: false, message: 'Missing parameters' });
    const fs = await FeeStructure.getActive(hostelId, academicYear);
    if (!fs) return res.status(404).json({ success: false, message: 'No active fee structure' });
    const student = await Student.findById(studentId).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const total = fs.computeExpectedAmount({ student, mealPlanCode, installmentCode });
    const lateFee = installmentCode ? fs.computeLateFee({ installmentCode, asOfDate: new Date() }) : 0;
    res.json({ success: true, data: { total, lateFee, installmentCode: installmentCode || null, mealPlanCode: mealPlanCode || null } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
// CSV export for fee report
router.get('/fees/export/csv', authorizeRoles(['admin', 'super_admin', 'accounts']), async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const rows = await Student.aggregate([
      { $unwind: '$paymentHistory' },
      { $match: { 'paymentHistory.status': 'success', 'paymentHistory.paidAt': { $gte: start, $lte: end } } },
      { $project: { name: '$name', regNo: '$regNo', feeType: '$paymentHistory.feeType', amount: '$paymentHistory.amount', paidAt: '$paymentHistory.paidAt', method: '$paymentHistory.method' } },
      { $sort: { paidAt: -1 } }
    ]);
    const header = 'Name,RegNo,FeeType,Amount,PaidAt,Method\n';
    const csv = header + rows.map(r => `${escapeCsv(r.name)},${escapeCsv(r.regNo)},${escapeCsv(r.feeType)},${r.amount},${new Date(r.paidAt).toISOString()},${escapeCsv(r.method)}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=fees-report.csv');
    res.send(csv);
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

function escapeCsv(v) { if (v == null) return ''; const s = String(v); return /[,"]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }

// Excel export for fee report
router.get('/fees/export/excel', authorizeRoles(['admin', 'super_admin', 'accounts']), async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const rows = await Student.aggregate([
      { $unwind: '$paymentHistory' },
      { $match: { 'paymentHistory.status': 'success', 'paymentHistory.paidAt': { $gte: start, $lte: end } } },
      { $project: { name: '$name', regNo: '$regNo', feeType: '$paymentHistory.feeType', amount: '$paymentHistory.amount', paidAt: '$paymentHistory.paidAt', method: '$paymentHistory.method' } },
      { $sort: { paidAt: -1 } }
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Fees Report');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'RegNo', key: 'regNo', width: 20 },
      { header: 'FeeType', key: 'feeType', width: 20 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'PaidAt', key: 'paidAt', width: 25 },
      { header: 'Method', key: 'method', width: 15 }
    ];
    rows.forEach(r => sheet.addRow({ ...r, paidAt: new Date(r.paidAt).toISOString() }));
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=fees-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Hostel Admission Receipt (PDF, student-wise)
router.get('/admission-receipt/:studentId/pdf', authorizeRoles(['admin', 'super_admin', 'warden', 'student']), async (req, res) => {
  try {
    const sid = req.params.studentId === 'me' ? req.user._id : req.params.studentId;
    const student = await Student.findById(sid).populate({ path: 'hostelApplication.allocatedRoom', populate: { path: 'blockId', populate: { path: 'hostelId' } } }).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=admission-receipt-${student.regNo}.pdf`);
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);
  drawHeader(doc, 'Hostel Admission Receipt');
    doc.fontSize(12).text(`Name: ${student.name}`).text(`Reg No: ${student.regNo}`).text(`Department: ${student.department}`).moveDown();
    const room = student.hostelApplication?.allocatedRoom;
    if (room) {
      doc.text(`Hostel: ${room.blockId?.hostelId?.name}`).text(`Block: ${room.blockId?.name}`).text(`Room: ${room.roomNumber} (Floor ${room.floorNumber})`).moveDown();
    }
    doc.text(`Academic Year: ${student.hostelApplication?.academicYear || ''}`);
    doc.text(`Mess: ${student.accessControl?.messId || 'Not Assigned'}`);
  doc.moveDown();
  drawFooter(doc);
    doc.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Allocation list (block & floor-wise)
router.get('/allocation-list', authorizeRoles(['admin', 'super_admin', 'warden']), async (req, res) => {
  try {
    const { blockId } = req.query;
    const rooms = await Room.find(blockId ? { blockId } : {}).populate({ path: 'occupants.studentId', select: 'name regNo department year' }).populate('blockId', 'name').lean();
    const result = rooms.map(r => ({ roomNumber: r.roomNumber, floorNumber: r.floorNumber, blockName: r.blockId?.name, occupants: (r.occupants||[]).filter(o=>o.isActive).map(o=>({ name: o.studentId?.name, regNo: o.studentId?.regNo, bed: o.bedNumber })) }));
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mess allocation list
router.get('/mess-allocation', authorizeRoles(['admin', 'super_admin', 'warden']), async (req, res) => {
  try {
    const students = await Student.find({ 'accessControl.messId': { $exists: true, $ne: null } }).populate('accessControl.messId', 'name code').select('name regNo accessControl');
    const result = students.map(s => ({ name: s.name, regNo: s.regNo, mess: s.accessControl.messId?.name }));
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Warden allocation report
router.get('/warden-allocation', authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const blocks = await Block.find({}).select('name code wardens').populate('wardens.wardenId','name email');
    res.json({ success: true, data: blocks.map(b => ({ block: { name: b.name, code: b.code }, wardens: b.wardens.map(w => ({ name: w.wardenId?.name, role: w.role })) })) });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Fee defaulters report
router.get('/defaulters', authorizeRoles(['admin','super_admin','accounts','warden']), async (req, res) => {
  try {
    const { blockId, hostelId } = req.query;
    const q = {};
    if (blockId) q['hostelApplication.blockId'] = blockId;
    if (hostelId) q['hostelApplication.hostelId'] = hostelId;
    const students = await Student.find(q).select('name regNo hostelApplication').lean();
    const defaulters = students.filter(s => !(s.hostelApplication?.fees?.hostelFeePaid) || !(s.hostelApplication?.fees?.messFeePaid)).map(s => ({
      name: s.name,
      regNo: s.regNo,
      hostelFeeDue: s.hostelApplication?.fees?.hostelFeePaid ? 0 : (s.hostelApplication?.fees?.hostelFee || 0),
      messFeeDue: s.hostelApplication?.fees?.messFeePaid ? 0 : (s.hostelApplication?.fees?.messFee || 0)
    }));
    res.json({ success: true, data: defaulters });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Fee defaulters report (PDF)
router.get('/defaulters/pdf', authorizeRoles(['admin','super_admin','accounts','warden']), async (req, res) => {
  try {
    const { blockId, hostelId } = req.query;
    const q = {};
    if (blockId) q['hostelApplication.blockId'] = blockId;
    if (hostelId) q['hostelApplication.hostelId'] = hostelId;
    const [students, block, hostel] = await Promise.all([
      Student.find(q).select('name regNo hostelApplication').lean(),
      blockId ? Block.findById(blockId).select('name code').lean() : Promise.resolve(null),
      hostelId ? Hostel.findById(hostelId).select('name code').lean() : Promise.resolve(null)
    ]);
    const defaulters = (students || []).filter(s => !(s.hostelApplication?.fees?.hostelFeePaid) || !(s.hostelApplication?.fees?.messFeePaid)).map(s => ({
      name: s.name,
      regNo: s.regNo,
      hostelFeeDue: s.hostelApplication?.fees?.hostelFeePaid ? 0 : (s.hostelApplication?.fees?.hostelFee || 0),
      messFeeDue: s.hostelApplication?.fees?.messFeePaid ? 0 : (s.hostelApplication?.fees?.messFee || 0)
    }));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=fee-defaulters.pdf');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);
    drawHeader(doc, 'Fee Defaulters Report');

    // Filters
    if (hostel || block) {
      doc.fontSize(11).fillColor('#111');
      if (hostel) doc.text(`Hostel: ${hostel.name}${hostel.code ? ` (${hostel.code})` : ''}`);
      if (block) doc.text(`Block: ${block.name}${block.code ? ` (${block.code})` : ''}`);
      doc.moveDown(0.5);
    }

    // Table header
    const x = doc.page.margins.left;
    let y = doc.y + 5;
    const col = {
      sn: x,
      name: x + 40,
      reg: x + 260,
      hostelDue: x + 360,
      messDue: x + 460
    };
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0b3d91');
    doc.text('S.No', col.sn, y);
    doc.text('Name', col.name, y);
    doc.text('Reg No', col.reg, y);
    doc.text('Hostel Due', col.hostelDue, y);
    doc.text('Mess Due', col.messDue, y);
    y = doc.y + 6;
    doc.moveTo(x, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke('#d0d7e2');

    // Rows
    doc.font('Helvetica').fontSize(10).fillColor('#111');
    if (!defaulters.length) {
      doc.text('No defaulters found for the selected filter.', x, y + 10);
    } else {
      defaulters.forEach((d, i) => {
        const lineY = doc.y + 8;
        doc.text(String(i + 1), col.sn, lineY);
        doc.text(d.name || '-', col.name, lineY);
        doc.text(d.regNo || '-', col.reg, lineY);
        doc.text((d.hostelFeeDue || 0).toFixed(2), col.hostelDue, lineY);
        doc.text((d.messFeeDue || 0).toFixed(2), col.messDue, lineY);
        // draw row divider
        const nextY = doc.y + 6;
        doc.moveTo(x, nextY).lineTo(doc.page.width - doc.page.margins.right, nextY).strokeColor('#eef2f7').stroke();
      });
    }

    doc.moveDown(1.0);
    drawFooter(doc);
    doc.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mess per-meal forecast (PDF)
router.get('/mess/forecast/pdf', authorizeRoles(['admin','super_admin']), async (req, res) => {
  try {
    const { messId, days = 7 } = req.query;
    const mess = await Mess.findById(messId).select('name code attendance').lean();
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });
    const { forecastMealsFromAttendance } = require('../utils/mess');
    const forecast = forecastMealsFromAttendance(mess.attendance || [], days);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=mess-forecast-${mess.code || mess._id}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);
    drawHeader(doc, 'Mess Attendance Forecast');

    doc.fontSize(12).fillColor('#111');
    doc.text(`Mess: ${mess.name}${mess.code ? ` (${mess.code})` : ''}`);
    doc.text(`Window: Last ${parseInt(days)} distinct days`);
    doc.moveDown(0.5);

    // Table header
    const x = doc.page.margins.left;
    let y = doc.y + 5;
    const col = { meal: x, count: x + 300 };
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0b3d91');
    doc.text('Meal', col.meal, y);
    doc.text('Forecast Count', col.count, y);
    y = doc.y + 6;
    doc.moveTo(x, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke('#d0d7e2');

    // Rows
    doc.font('Helvetica').fontSize(10).fillColor('#111');
    const meals = Object.keys(forecast);
    if (!meals.length) {
      doc.text('No attendance data available to forecast.', x, y + 10);
    } else {
      meals.forEach((m) => {
        const lineY = doc.y + 8;
        doc.text(m, col.meal, lineY);
        doc.text(String(Math.round(forecast[m])), col.count, lineY);
        const nextY = doc.y + 6;
        doc.moveTo(x, nextY).lineTo(doc.page.width - doc.page.margins.right, nextY).strokeColor('#eef2f7').stroke();
      });
    }

    doc.moveDown(1.0);
    drawFooter(doc);
    doc.end();
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
