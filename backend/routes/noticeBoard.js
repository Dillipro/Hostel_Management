const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { celebrate, Joi, Segments } = require('celebrate');

router.use(authenticateToken);

// Post a notice
router.post('/', authorizeRoles(['admin','super_admin','warden','mess_manager']), celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().required(),
    message: Joi.string().required(),
    audience: Joi.string().valid('all','students','wardens','block','hostel','mess').default('all'),
    blockId: Joi.string().optional(),
    hostelId: Joi.string().optional(),
    messId: Joi.string().optional(),
    expiresAt: Joi.date().optional(),
    pinned: Joi.boolean().optional()
  })
}), async (req, res) => {
  try {
    const n = await Notice.create({ ...req.body, postedBy: req.user._id });
    res.json({ success: true, data: n });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// List notices (active only)
router.get('/', authorizeRoles(['student','warden','admin','super_admin','mess_manager']), celebrate({
  [Segments.QUERY]: Joi.object({ audience: Joi.string(), blockId: Joi.string(), hostelId: Joi.string(), messId: Joi.string() })
}), async (req, res) => {
  try {
    const { audience, blockId, hostelId, messId } = req.query;
    const now = new Date();
    const q = { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] };
    if (audience) q.audience = audience;
    if (blockId) q.blockId = blockId;
    if (hostelId) q.hostelId = hostelId;
    if (messId) q.messId = messId;
    const list = await Notice.find(q).sort({ pinned: -1, createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
