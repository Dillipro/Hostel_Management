const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const DisciplineRecord = require('../models/DisciplineRecord');

// Create a discipline record (warden/admin)
router.post('/', authenticateToken, authorizeRoles(['warden','admin','super_admin']), async (req, res) => {
  try {
    const doc = await DisciplineRecord.create({ ...req.body, issuedBy: req.user.id });
    const io = global.__io; if (io) io.to(`student:${doc.studentId}`).emit('discipline-event', { id: doc._id, category: doc.category, severity: doc.severity });
    res.status(201).json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// List discipline records (warden by block, admin all)
router.get('/', authenticateToken, authorizeRoles(['warden','admin','super_admin','student']), async (req, res) => {
  try {
    const { studentId, blockId, status } = req.query;
    const q = {};
    if (studentId) q.studentId = studentId;
    if (blockId) q['location.blockId'] = blockId;
    if (status) q.status = status;
    // Students can only view their own
    if (req.user.role === 'student') q.studentId = req.user.id;
    const list = await DisciplineRecord.find(q).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Update status/action (warden/admin)
router.put('/:id', authenticateToken, authorizeRoles(['warden','admin','super_admin']), async (req, res) => {
  try {
    const { action } = req.body; // { action: { action:'warning', points: 2, note: '' }, status: 'closed' }
    const update = {};
    if (req.body.status) update.status = req.body.status;
    if (action) update.$push = { actions: { ...action, by: req.user.id, actionAt: new Date() } };
    const doc = await DisciplineRecord.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
