const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendNotification } = require('../utils/notification');
const FeeStructure = require('../models/FeeStructure');

// Derive fees per-code (hostel/mess/security) using FeeStructure with student-conditional logic
async function deriveFees({ hostelId, academicYear, student }) {
  if (!hostelId || !academicYear) return null;
  const fs = await FeeStructure.getActive(hostelId, academicYear);
  if (!fs) return null;

  // Normalize student profile for condition checks
  const profile = student ? {
    department: student.academic?.department || student.department,
    program: student.academic?.program || student.program,
    category: student.personalInfo?.category || student.category,
    gender: student.personalInfo?.gender || student.gender,
    yearOfStudy: student.academic?.year || student.yearOfStudy,
    domicile: student.personalInfo?.state || student.domicile,
    roomType: student.hostelApplication?.roomType,
    occupancyType: student.hostelApplication?.occupancyType,
    blockId: student.hostelApplication?.allocatedRoom?.blockId || student.preferences?.blockChoice?.[0]
  } : {};

  const fees = { hostelFee: 0, messFee: 0, securityDeposit: 0 };
  for (const item of (fs.items || [])) {
    if (!item.isActive) continue;
    // match conditions if any
    const cond = item.conditions || {};
    const matchesList = (field, values) => { if (!values || values.length === 0) return true; if (!field) return false; if (Array.isArray(field)) return field.some(v => values.includes(v)); return values.includes(field); };
    const matchesRange = (value, range) => { if (!range || (range.min == null && range.max == null)) return true; if (value == null) return false; if (range.min != null && value < range.min) return false; if (range.max != null && value > range.max) return false; return true; };
    const ok = (
      matchesList(profile.department, cond?.department) &&
      matchesList(profile.program, cond?.program) &&
      matchesList(profile.category, cond?.category) &&
      matchesList(profile.gender, cond?.gender) &&
      matchesRange(profile.yearOfStudy, cond?.yearOfStudyRange) &&
      matchesList(profile.domicile, cond?.domicile) &&
      matchesList(profile.roomType, cond?.roomType) &&
      matchesList(profile.occupancyType, cond?.occupancyType) &&
      matchesList(profile.blockId, cond?.blockIds)
    );
    if (!ok) continue;

    if (item.code === 'hostel_fee') fees.hostelFee += Number(item.amount) || 0;
    if (item.code === 'mess_fee') fees.messFee += Number(item.amount) || 0;
    if (item.code === 'security_deposit') fees.securityDeposit += Number(item.amount) || 0;
  }
  return fees;
}

// Student apply for hostel admission or readmission
router.post('/apply', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { type = 'admission', preferences = {}, documents = [] } = req.body;

    const update = {
      hostelApplication: {
        ...(req.body.hostelApplication || {}),
        type,
        submittedAt: new Date(),
        status: 'pending',
        fees: req.body.fees || undefined
      },
      preferences,
    };

    if (documents.length) {
      update.$push = { documents: { $each: documents } };
    }

    // Auto-fill fees from FeeStructure if not provided
    if (!update.hostelApplication.fees && update.hostelApplication.hostelId && req.body.academicYear) {
      const student = await Student.findById(studentId).lean();
      const fees = await deriveFees({ hostelId: update.hostelApplication.hostelId, academicYear: req.body.academicYear, student });
      if (fees) update.hostelApplication.fees = fees;
    }

    const student = await Student.findByIdAndUpdate(studentId, update, { new: true });
    res.status(201).json({ success: true, message: 'Application submitted', data: student.hostelApplication });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Get my application
router.get('/my', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('hostelApplication preferences documents');
    res.json({ success: true, data: student });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Admin/Warden approve or reject application
router.put('/:studentId/review', authenticateToken, authorizeRoles(['admin', 'super_admin', 'warden']), async (req, res) => {
  try {
    const { action = 'approve', remarks } = req.body;
    if (!['approve', 'reject', 'waitlist'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });

    const statusMap = { approve: 'approved', reject: 'rejected', waitlist: 'waitlisted' };
    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      { 'applicationStatus.admissionStatus': statusMap[action], 'applicationStatus.reviewedAt': new Date(), 'applicationStatus.reviewedBy': req.user._id },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await sendNotification({ userId: student._id, type: 'admission_update', title: 'Admission Application Update', message: `Your application has been ${statusMap[action]}.`, data: { remarks } });
    res.json({ success: true, message: `Application ${statusMap[action]}`, data: student.applicationStatus });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Student request room allocation/change
router.post('/request-room', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const { blockChoice = [], floorRange = [], roommateRegNos = [] } = req.body;
    const student = await Student.findByIdAndUpdate(req.user.id, {
      'hostelApplication.status': 'pending',
      preferences: { blockChoice, floorRange, roommateRegNos }
    }, { new: true });
    res.json({ success: true, message: 'Room request submitted', data: student.preferences });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

module.exports = router;

// Compute due fees for a student
router.get('/fees/due', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('hostelApplication');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const fees = student.hostelApplication?.fees || {};
    const due = {
      hostel_fee_due: fees.hostelFee && !fees.hostelFeePaid ? fees.hostelFee : 0,
      mess_fee_due: fees.messFee && !fees.messFeePaid ? fees.messFee : 0,
      security_deposit_due: fees.securityDeposit && !fees.securityDepositPaid ? fees.securityDeposit : 0
    };
    res.json({ success: true, data: { fees, due } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
