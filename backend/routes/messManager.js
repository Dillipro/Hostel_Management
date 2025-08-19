const express = require('express');
const router = express.Router();
const MessMetrics = require('../models/MessMetrics');
const MealPlan = require('../models/MealPlan');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { celebrate, Joi, Segments } = require('celebrate');

router.use(authenticateToken);

// Record daily metrics
router.post('/metrics', authorizeRoles(['mess_manager','admin','super_admin']), celebrate({
  [Segments.BODY]: Joi.object({ messId: Joi.string().required(), date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), meal: Joi.string().valid('breakfast','lunch','dinner').required(), cookedCount: Joi.number().min(0).default(0), servedCount: Joi.number().min(0).default(0), wastedCount: Joi.number().min(0).default(0) })
}), async (req, res) => {
  try {
    const { messId, date, meal, cookedCount = 0, servedCount = 0, wastedCount = 0 } = req.body;
    const doc = await MessMetrics.findOneAndUpdate({ messId, date, meal }, { cookedCount, servedCount, wastedCount }, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Get metrics range
router.get('/metrics', authorizeRoles(['mess_manager','admin','super_admin','warden']), celebrate({
  [Segments.QUERY]: Joi.object({ messId: Joi.string().required(), from: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(), to: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional() })
}), async (req, res) => {
  try {
    const { messId, from, to } = req.query;
    const q = { messId };
    if (from && to) q.date = { $gte: from, $lte: to };
    const list = await MessMetrics.find(q).sort({ date: 1, meal: 1 });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Manage weekly meal plan
router.post('/meal-plan', authorizeRoles(['mess_manager','admin','super_admin']), celebrate({
  [Segments.BODY]: Joi.object({
    messId: Joi.string().required(),
    weekStart: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    schedule: Joi.array().items(Joi.object({ day: Joi.string().valid('Mon','Tue','Wed','Thu','Fri','Sat','Sun').required(), meals: Joi.array().items(Joi.object({ type: Joi.string().valid('breakfast','lunch','dinner').required(), items: Joi.array().items(Joi.string()).default([]) })).default([]) })).default([])
  })
}), async (req, res) => {
  try {
    const mp = await MealPlan.findOneAndUpdate({ messId: req.body.messId, weekStart: req.body.weekStart }, req.body, { upsert: true, new: true, setDefaultsOnInsert: true });
    res.json({ success: true, data: mp });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/meal-plan', authorizeRoles(['student','mess_manager','admin','super_admin']), celebrate({
  [Segments.QUERY]: Joi.object({ messId: Joi.string().required(), weekStart: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required() })
}), async (req, res) => {
  try {
    const { messId, weekStart } = req.query;
    const mp = await MealPlan.findOne({ messId, weekStart }).lean();
    res.json({ success: true, data: mp });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
