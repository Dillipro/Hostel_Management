const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Mess } = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const SpecialDietRequest = require('../models/SpecialDietRequest');

// Mess entry via RFID/QR: expects accessControl.scan already did checks; this endpoint can be used by mess app to log meal served
router.post('/entry', async (req, res) => {
  try {
    const { studentId, messId, mealType } = req.body;
    if (!studentId || !messId || !['breakfast','lunch','dinner'].includes(mealType)) return res.status(400).json({ success: false, message: 'Missing params' });
    const [student, mess] = await Promise.all([
      Student.findById(studentId).select('name regNo accessControl hostelApplication'),
      Mess.findById(messId).lean()
    ]);
    if (!student || !mess) return res.status(404).json({ success: false, message: 'Not found' });
    if (String(student.accessControl?.messId) !== String(messId)) return res.status(403).json({ success: false, message: 'Not assigned to this mess' });
    if (!student.hostelApplication?.fees?.messFeePaid) return res.status(402).json({ success: false, message: 'Mess fee not paid' });

  // Increment today count
    const today = new Date(); today.setHours(0,0,0,0);
    const existing = (mess.attendance || []).find(a => new Date(a.date).getTime() === today.getTime() && a.mealType === mealType);
    if (existing) {
      await Mess.updateOne({ _id: messId, 'attendance.date': today, 'attendance.mealType': mealType }, { $inc: { 'attendance.$.totalCount': 1 } });
    } else {
      await Mess.updateOne({ _id: messId }, { $push: { attendance: { date: today, mealType, totalCount: 1 } } });
    }

    // Track serving per student for billing analytics
    try {
      const MessServing = require('../models/MessServing');
      await MessServing.updateOne({ studentId, date: today, mealType }, { $setOnInsert: { studentId, messId, date: today, mealType } }, { upsert: true });
    } catch (_) {}

    // Emit to mess room
    const io = global.__io; if (io) io.to(`mess:${messId}`).emit('mess-entry', { student: { id: student._id, name: student.name, regNo: student.regNo }, mealType, at: new Date() });
    res.json({ success: true, message: 'Entry recorded' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Create special diet request (student)
router.post('/special-diet', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { mealType, date, dietType, notes } = req.body;
    const student = await Student.findById(studentId).select('accessControl');
    if (!student?.accessControl?.messId) return res.status(400).json({ success: false, message: 'No mess assigned' });
    const doc = await SpecialDietRequest.create({ studentId, messId: student.accessControl.messId, mealType, date, dietType, notes, createdBy: studentId });
    const io = global.__io; if (io) io.to(`mess:${student.accessControl.messId}`).emit('special-diet', { id: doc._id, mealType, dietType });
    res.status(201).json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mess staff view: list special diet requests for a date/meal
router.get('/special-diet', authenticateToken, authorizeRoles(['warden','admin','super_admin']), async (req, res) => {
  try {
    const { messId, date, mealType } = req.query;
    const q = { messId };
    if (date) { const d = new Date(date); d.setHours(0,0,0,0); q.date = d; }
    if (mealType) q.mealType = mealType;
    const items = await SpecialDietRequest.find(q).populate('studentId','name regNo').lean();
    res.json({ success: true, data: items });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
// Get today's mess attendance counts
router.get('/attendance/today', authenticateToken, authorizeRoles(['warden','admin','super_admin']), async (req, res) => {
  try {
    const { messId } = req.query;
    const mess = await Mess.findById(messId).lean();
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });
    const today = new Date(); today.setHours(0,0,0,0);
    const items = (mess.attendance || []).filter(a => new Date(a.date).getTime() === today.getTime());
    const out = { breakfast: 0, lunch: 0, dinner: 0 };
    items.forEach(i => { out[i.mealType] = (out[i.mealType] || 0) + (i.totalCount || 0); });
    res.json({ success: true, data: out });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Get attendance counts between dates
router.get('/attendance', authenticateToken, authorizeRoles(['warden','admin','super_admin']), async (req, res) => {
  try {
    const { messId, from, to } = req.query;
    const mess = await Mess.findById(messId).lean();
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });
    const start = new Date(from); const end = new Date(to);
    const items = (mess.attendance || []).filter(a => new Date(a.date) >= start && new Date(a.date) <= end);
    res.json({ success: true, data: items });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
