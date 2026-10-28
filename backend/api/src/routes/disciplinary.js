const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, requireRole, Roles } = require('../middleware/auth');
const prisma = new PrismaClient();
const router = express.Router();

// Get disciplinary records for warden's blocks
router.get('/warden-disciplinary', auth, requireRole(Roles.warden), async (req, res) => {
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  if (!blockIds.length) return res.json([]);

  const records = await prisma.disciplinaryRecord.findMany({
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
      },
      warden: { select: { name: true } }
    },
    orderBy: { issued_on: 'desc' }
  });

  res.json(records);
});

// Create disciplinary record
router.post('/warden-disciplinary', auth, requireRole(Roles.warden), async (req, res) => {
  const { student_id, violation, severity, description, action } = req.body;

  // Verify student is in warden's blocks
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  const student = await prisma.student.findUnique({
    where: { user_id: student_id },
    include: { hostel: true }
  });

  if (!student || !blockIds.includes(student.hostel_id)) {
    return res.status(403).json({ error: 'Student not in your assigned blocks' });
  }

  const record = await prisma.disciplinaryRecord.create({
    data: {
      student_id,
      warden_id: req.user.sub,
      block_id: student.hostel_id,
      violation,
      severity,
      description,
      action
    },
    include: {
      student: {
        include: {
          user: { select: { name: true, reg_no: true } },
          hostel: { select: { name: true } }
        }
      },
      warden: { select: { name: true } }
    }
  });

  res.status(201).json(record);
});

// Update disciplinary record status
router.patch('/warden-disciplinary/:id', auth, requireRole(Roles.warden), async (req, res) => {
  const { id } = req.params;
  const { status, resolved_on } = req.body;

  // Verify record belongs to warden's blocks
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  const record = await prisma.disciplinaryRecord.findUnique({
    where: { id },
    include: { student: true }
  });

  if (!record || !blockIds.includes(record.student.hostel_id)) {
    return res.status(403).json({ error: 'Record not in your assigned blocks' });
  }

  const updated = await prisma.disciplinaryRecord.update({
    where: { id },
    data: {
      status,
      resolved_on: status === 'resolved' ? new Date() : null
    }
  });

  res.json(updated);
});

// Get disciplinary analytics for warden's blocks
router.get('/warden-disciplinary-analytics', auth, requireRole(Roles.warden), async (req, res) => {
  const wardenBlocks = await prisma.hostelBlock.findMany({ where: { warden_id: req.user.sub } });
  const blockIds = wardenBlocks.map(b => b.id);

  if (!blockIds.length) return res.json({ totalRecords: 0, activeRecords: 0, resolvedRecords: 0, bySeverity: {}, byViolation: {} });

  const records = await prisma.disciplinaryRecord.findMany({
    where: {
      OR: [
        { student: { hostel_id: { in: blockIds } } },
        { block_id: { in: blockIds } }
      ]
    }
  });

  const totalRecords = records.length;
  const activeRecords = records.filter(r => r.status === 'active').length;
  const resolvedRecords = records.filter(r => r.status === 'resolved').length;

  const bySeverity = records.reduce((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, {});

  const byViolation = records.reduce((acc, r) => {
    acc[r.violation] = (acc[r.violation] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalRecords,
    activeRecords,
    resolvedRecords,
    bySeverity,
    byViolation
  });
});

module.exports = router;