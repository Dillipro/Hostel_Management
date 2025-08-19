const express = require('express');
const router = express.Router();
const { Survey, SurveyResponse } = require('../models/Survey');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { celebrate, Joi, Segments } = require('celebrate');

router.use(authenticateToken);

// Create survey
router.post('/', authorizeRoles(['admin','super_admin','warden']), celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().required(),
    audience: Joi.string().valid('all','students','wardens').default('students'),
    questions: Joi.array().items(Joi.object({ text: Joi.string().required(), type: Joi.string().valid('rating','text','mcq').default('rating'), options: Joi.array().items(Joi.string()) })).min(1).required(),
    closesAt: Joi.date().optional()
  })
}), async (req, res) => {
  try {
    const s = await Survey.create({ ...req.body, createdBy: req.user._id });
    res.json({ success: true, data: s });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// List active surveys
router.get('/', authorizeRoles(['student','warden','admin','super_admin']), async (req, res) => {
  try {
    const now = new Date();
    const list = await Survey.find({ isActive: true, $or: [{ closesAt: null }, { closesAt: { $gt: now } }] }).sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Submit response
router.post('/:id/respond', authorizeRoles(['student','warden']), celebrate({
  [Segments.PARAMS]: Joi.object({ id: Joi.string().required() }),
  [Segments.BODY]: Joi.object({ answers: Joi.array().items(Joi.object({ questionIndex: Joi.number().min(0).required(), answer: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.array(), Joi.object()) })).default([]) })
}), async (req, res) => {
  try {
    const r = await SurveyResponse.create({ surveyId: req.params.id, userId: req.user._id, answers: req.body.answers || [] });
    res.json({ success: true, data: r });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Basic analytics
router.get('/:id/analytics', authorizeRoles(['admin','super_admin','warden']), celebrate({ [Segments.PARAMS]: Joi.object({ id: Joi.string().required() }) }), async (req, res) => {
  try {
    const responses = await SurveyResponse.find({ surveyId: req.params.id }).lean();
    const total = responses.length;
    const perQuestion = {};
    responses.forEach(r => {
      (r.answers || []).forEach(a => {
        const q = perQuestion[a.questionIndex] || { count: 0, ratingSum: 0, ratingAvg: null, ratingHist: {}, mcqCounts: {} };
        q.count += 1;
        if (typeof a.answer === 'number') {
          q.ratingSum += a.answer;
          const k = String(a.answer);
          q.ratingHist[k] = (q.ratingHist[k] || 0) + 1;
        } else if (Array.isArray(a.answer)) {
          a.answer.forEach(opt => { q.mcqCounts[opt] = (q.mcqCounts[opt] || 0) + 1; });
        } else if (typeof a.answer === 'string') {
          // treat as single MCQ value if matches an option set in schema (best-effort aggregate)
          q.mcqCounts[a.answer] = (q.mcqCounts[a.answer] || 0) + 1;
        }
        perQuestion[a.questionIndex] = q;
      });
    });
    Object.values(perQuestion).forEach(q => {
      if (q.count > 0 && q.ratingSum > 0) q.ratingAvg = q.ratingSum / q.count;
      delete q.ratingSum;
    });
    res.json({ success: true, data: { totalResponses: total, perQuestion } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
