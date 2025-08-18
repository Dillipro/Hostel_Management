const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// List notifications
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = 'false' } = req.query;
    const filter = { userId: req.user._id, ...(unreadOnly === 'true' ? { isRead: false } : {}) };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const items = await Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();
    const total = await Notification.countDocuments(filter);
    res.json({ success: true, data: { items, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total } } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Mark as read
router.post('/:id/read', async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true, readAt: new Date() }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
