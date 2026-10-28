const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Get feedback for warden's blocks
router.get('/warden-feedback', auth, requireRole(Roles.warden), async (req, res) => {
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  if (!blockIds.length) return res.json([]);

  const feedback = await prisma.feedback.findMany({
    where: {
      OR: [
        { student: { hostel_id: { in: blockIds } } },
        { block_id: { in: blockIds } }
      ]
    },
    include: {
      student: {
        include: {
          user: { select: { name: true, reg_no: true } },
          hostel: { select: { name: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  res.json(feedback);
});

// Get feedback analytics for warden's blocks
router.get('/warden-feedback-analytics', auth, requireRole(Roles.warden), async (req, res) => {
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  if (!blockIds.length) return res.json({ totalFeedback: 0, averageRating: 0, feedbackByType: {}, feedbackByBlock: {} });

  const feedback = await prisma.feedback.findMany({
    where: {
      OR: [
        { student: { hostel_id: { in: blockIds } } },
        { block_id: { in: blockIds } }
      ]
    }
  });

  const totalFeedback = feedback.length;
  const averageRating = totalFeedback > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback : 0;

  const feedbackByType = feedback.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {});

  const feedbackByBlock = feedback.reduce((acc, f) => {
    const blockName = wardenBlocks.find(b => b.id === f.block_id)?.name || 'General';
    acc[blockName] = (acc[blockName] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalFeedback,
    averageRating: Math.round(averageRating * 10) / 10,
    feedbackByType,
    feedbackByBlock
  });
});

// Create feedback (for students, but warden can view)
router.post('/', auth, requireRole(Roles.student), async (req, res) => {
  const { block_id, type, rating, comments } = req.body;

  const feedback = await prisma.feedback.create({
    data: {
      student_id: req.user.sub,
      block_id,
      type,
      rating: parseInt(rating),
      comments
    }
  });

  res.status(201).json(feedback);
});

// Get all feedback (admin only)
router.get('/', auth, requireRole(Roles.admin), async (req, res) => {
  const feedback = await prisma.feedback.findMany({
    include: {
      student: {
        include: {
          user: { select: { name: true, reg_no: true } },
          hostel: { select: { name: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  res.json(feedback);
});

module.exports = router;