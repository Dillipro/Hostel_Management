const express = require('express');
const router = express.Router();
const {
  LeaveRequest, Complaint, AccessCard, Room, Block, Hostel, Mess
} = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendNotification } = require('../utils/notification');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { authorizeRoles: authz } = require('../middleware/auth');

// =====================
// STUDENT DASHBOARD
// =====================

// Get student dashboard overview
router.get('/dashboard', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get student details with room allocation
    const student = await Student.findById(studentId)
      .populate({
        path: 'hostelApplication.allocatedRoom',
        populate: {
          path: 'blockId',
          populate: {
            path: 'hostelId'
          }
        }
      })
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get fee status
    const feeStatus = {
      hostelFee: {
        amount: student.hostelApplication?.fees?.hostelFee || 0,
        paid: student.hostelApplication?.fees?.hostelFeePaid || false,
        dueDate: student.hostelApplication?.fees?.hostelFeeDueDate
      },
      messFee: {
        amount: student.hostelApplication?.fees?.messFee || 0,
        paid: student.hostelApplication?.fees?.messFeePaid || false,
        dueDate: student.hostelApplication?.fees?.messFeeDueDate
      }
    };
    
    // Get active leave requests
    const activeLeaves = await LeaveRequest.find({
      studentId,
      status: { $in: ['pending', 'approved'] },
      toDate: { $gte: new Date() }
    }).sort({ fromDate: 1 }).limit(3);
    
    // Get recent complaints
    const recentComplaints = await Complaint.find({ complainantId: studentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('ticketId title status category createdAt');
    
    // Get access card info
    const accessCard = await AccessCard.findOne({ studentId })
      .select('cardId qrCode rfidTag accessScopes paymentLinked isActive')
      .lean();
    
    // Get recent announcements (last 7 days)
    const announcements = await getStudentAnnouncements(studentId);
    
    // Calculate attendance stats (last 30 days)
    const attendanceStats = await calculateAttendanceStats(studentId);
    
    res.json({
      success: true,
      data: {
        student: {
          name: student.name,
          regNo: student.regNo,
          year: student.year,
          department: student.department,
          email: student.email,
          phone: student.phone
        },
        accommodation: student.hostelApplication?.allocatedRoom ? {
          hostelName: student.hostelApplication.allocatedRoom.blockId.hostelId.name,
          blockName: student.hostelApplication.allocatedRoom.blockId.name,
          roomNumber: student.hostelApplication.allocatedRoom.roomNumber,
          floorNumber: student.hostelApplication.allocatedRoom.floorNumber,
          roommates: await getRoommates(student.hostelApplication.allocatedRoom._id, studentId)
        } : null,
        feeStatus,
        activeLeaves,
        recentComplaints,
        accessCard,
        announcements: announcements.slice(0, 5),
        attendanceStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Minimal rules & mess menu view
router.get('/basics', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const st = await Student.findById(req.user.id)
      .populate({ path: 'hostelApplication.allocatedRoom', populate: { path: 'blockId', populate: { path: 'hostelId' } } })
      .lean();
    const mess = st?.accessControl?.messId ? await Mess.findById(st.accessControl.messId).lean() : null;
    res.json({ success: true, data: {
      rules: st?.hostelApplication?.allocatedRoom?.blockId?.hostelId?.policies || {},
      messMenu: mess?.menuManagement?.currentWeekMenu || []
    } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Download Hostel ID with QR (returns PNG data URL)
router.get('/id/qr', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('accessControl name regNo');
    const qrData = student?.accessControl?.hostelQRCode?.qrData || `STU:${student.regNo}:${student._id}`;
    const png = await QRCode.toDataURL(qrData, { margin: 1, width: 256 });
    res.json({ success: true, data: { name: student.name, regNo: student.regNo, qrPng: png } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Helper function to get roommates
async function getRoommates(roomId, currentStudentId) {
  const room = await Room.findById(roomId)
    .populate({
      path: 'occupants.studentId',
      select: 'name regNo year department phone'
    })
    .lean();
  
  if (!room || !room.occupants) return [];
  
  return room.occupants
    .filter(occupant => 
      occupant.isActive && 
      occupant.studentId._id.toString() !== currentStudentId.toString()
    )
    .map(occupant => ({
      name: occupant.studentId.name,
      regNo: occupant.studentId.regNo,
      year: occupant.studentId.year,
      department: occupant.studentId.department,
      phone: occupant.studentId.phone,
      bedNumber: occupant.bedNumber
    }));
}

// Helper function to get student announcements
async function getStudentAnnouncements(studentId) {
  // This would typically come from a notifications/announcements collection
  // For now, returning mock data
  return [
    {
      id: 1,
      title: 'Hostel Maintenance Notice',
      message: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM',
      type: 'maintenance',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      title: 'Mess Menu Update',
      message: 'Special menu for festival celebration this weekend',
      type: 'general',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];
}

// Helper function to calculate attendance stats
async function calculateAttendanceStats(studentId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const accessCard = await AccessCard.findOne({ studentId })
    .select('usageLog')
    .lean();
  
  if (!accessCard || !accessCard.usageLog) {
    return {
      hostelEntry: 0,
      messEntry: 0,
      totalDays: 30
    };
  }
  
  const recentLogs = accessCard.usageLog.filter(log => 
    new Date(log.timestamp) >= thirtyDaysAgo && log.success
  );
  
  const hostelEntries = recentLogs.filter(log => 
    log.action === 'entry' && log.accessPoint?.includes('hostel')
  ).length;
  
  const messEntries = recentLogs.filter(log => 
    log.action === 'entry' && log.accessPoint?.includes('mess')
  ).length;
  
  return {
    hostelEntry: hostelEntries,
    messEntry: messEntries,
    totalDays: 30,
    averageMessVisitsPerDay: (messEntries / 30).toFixed(1)
  };
}

// =====================
// ROOM/MESS CHANGE REQUESTS
// =====================

// Student raises a room or mess change request
router.post('/change-requests', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { type, reason, targetBlockId, preferredRoomType, targetMessId } = req.body;
    if (!['room_change', 'mess_change'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid change request type' });
    }
    const student = await Student.findByIdAndUpdate(studentId, {
      $push: {
        changeRequests: {
          type,
          reason,
          status: 'pending',
          requestedAt: new Date(),
          details: { targetBlockId, preferredRoomType, targetMessId }
        }
      }
    }, { new: true });
    res.status(201).json({ success: true, data: student.changeRequests.slice(-1)[0] });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// List my change requests
router.get('/change-requests', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const st = await Student.findById(req.user.id).select('changeRequests');
    res.json({ success: true, data: st.changeRequests || [] });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// =====================
// LEAVE MANAGEMENT
// =====================

// Submit leave request
router.post('/leave-requests', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      leaveType,
      fromDate,
      toDate,
      reason,
      destination,
      emergencyContact,
      supportingDocuments = []
    } = req.body;
    
    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const now = new Date();
    
    if (from < now) {
      return res.status(400).json({
        success: false,
        message: 'Leave from date cannot be in the past'
      });
    }
    
    if (to < from) {
      return res.status(400).json({
        success: false,
        message: 'Leave to date must be after from date'
      });
    }
    
    // Check for overlapping leave requests
    const overlappingLeave = await LeaveRequest.findOne({
      studentId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { fromDate: { $lte: to }, toDate: { $gte: from } }
      ]
    });
    
    if (overlappingLeave) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave request for overlapping dates'
      });
    }
    
    // Get student's room for location info
    const student = await Student.findById(studentId)
      .populate('hostelApplication.allocatedRoom');
    
    const room = await Room.findById(student.hostelApplication.allocatedRoom)
      .populate('blockId');
    
    // Create leave request
    const leaveRequest = new LeaveRequest({
      studentId,
      leaveType,
      fromDate: from,
      toDate: to,
      reason,
      destination,
      emergencyContact,
      supportingDocuments,
      location: {
        hostelId: room.blockId.hostelId,
        blockId: room.blockId._id,
        roomId: room._id
      }
    });
    
    await leaveRequest.save();
    
    // Send notification to warden
    const wardens = await Block.findById(room.blockId._id)
      .select('wardens')
      .populate('wardens.wardenId', 'name email');
    
    for (const warden of wardens.wardens) {
      await sendNotification({
        userId: warden.wardenId._id,
        type: 'leave_request_pending',
        title: 'New Leave Request',
        message: `${student.name} (${student.regNo}) has submitted a leave request from ${from.toDateString()} to ${to.toDateString()}`,
        data: {
          requestId: leaveRequest._id,
          studentName: student.name,
          studentRegNo: student.regNo,
          leaveType,
          fromDate: from,
          toDate: to
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get student's leave requests
router.get('/leave-requests', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      status,
      leaveType,
      page = 1,
      limit = 10
    } = req.query;
    
    const filter = { studentId };
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leaveRequests = await LeaveRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalRequests = await LeaveRequest.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        leaveRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / parseInt(limit)),
          totalRequests,
          hasNextPage: skip + leaveRequests.length < totalRequests,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel leave request
router.delete('/leave-requests/:requestId', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const studentId = req.user.id;
    
    const leaveRequest = await LeaveRequest.findOne({
      _id: requestId,
      studentId,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or cannot be cancelled'
      });
    }
    
    leaveRequest.status = 'cancelled';
    await leaveRequest.save();
    
    res.json({
      success: true,
      message: 'Leave request cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// COMPLAINT MANAGEMENT
// =====================

// Submit complaint
router.post('/complaints', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      category,
      subCategory,
      priority = 'medium',
      title,
      description,
      specificLocation,
      attachments = []
    } = req.body;
    
    // Get student's room for location info
    const student = await Student.findById(studentId)
      .populate('hostelApplication.allocatedRoom');
    
    const room = await Room.findById(student.hostelApplication.allocatedRoom)
      .populate('blockId');
    
    // Generate unique ticket ID
    const ticketId = `CPL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Create complaint
    const complaint = new Complaint({
      complainantId: studentId,
      complainantType: 'student',
      ticketId,
      category,
      subCategory,
      priority,
      title,
      description,
      location: {
        hostelId: room.blockId.hostelId,
        blockId: room.blockId._id,
        roomId: room._id,
        specificLocation
      },
      attachments,
      status: 'submitted'
    });
    
    await complaint.save();
    
    // Send notification to warden
    const wardens = await Block.findById(room.blockId._id)
      .select('wardens')
      .populate('wardens.wardenId', 'name email');
    
    for (const warden of wardens.wardens) {
      await sendNotification({
        userId: warden.wardenId._id,
        type: 'complaint_submitted',
        title: 'New Complaint Submitted',
        message: `${student.name} has submitted a ${category} complaint: ${title}`,
        data: {
          complaintId: complaint._id,
          ticketId,
          category,
          priority,
          studentName: student.name,
          studentRegNo: student.regNo
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        ticketId,
        complaintId: complaint._id,
        status: complaint.status
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get student's complaints
router.get('/complaints', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      status,
      category,
      page = 1,
      limit = 10
    } = req.query;
    
    const filter = { complainantId: studentId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const complaints = await Complaint.find(filter)
      .populate('assignedTo.staffId', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalComplaints = await Complaint.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalComplaints / parseInt(limit)),
          totalComplaints,
          hasNextPage: skip + complaints.length < totalComplaints,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get complaint details
router.get('/complaints/:complaintId', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const { complaintId } = req.params;
    const studentId = req.user.id;
    
    const complaint = await Complaint.findOne({
      _id: complaintId,
      complainantId: studentId
    })
      .populate('assignedTo.staffId', 'name role phone email')
      .populate('workLog.actionBy', 'name role')
      .lean();
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rate complaint resolution
router.put('/complaints/:complaintId/rate', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { rating, feedback } = req.body;
    const studentId = req.user.id;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const complaint = await Complaint.findOne({
      _id: complaintId,
      complainantId: studentId,
      status: { $in: ['resolved', 'closed'] }
    });
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found or not yet resolved'
      });
    }
    
    complaint.resolution = {
      ...complaint.resolution,
      satisfactionRating: rating,
      feedback
    };
    
    await complaint.save();
    
    res.json({
      success: true,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// ACCESS CARD MANAGEMENT
// =====================

// Get access card details
router.get('/access-card', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    let accessCard = await AccessCard.findOne({ studentId })
      .populate('studentId', 'name regNo email phone')
      .lean();
    
    if (!accessCard) {
      // Generate new access card if doesn't exist
      accessCard = await generateAccessCard(studentId);
    }
    
    // Generate QR code image if not exists
    if (!accessCard.qrCode.imageUrl) {
      const qrCodeImage = await QRCode.toDataURL(accessCard.qrCode.data);
      await AccessCard.findByIdAndUpdate(accessCard._id, {
        'qrCode.imageUrl': qrCodeImage
      });
      accessCard.qrCode.imageUrl = qrCodeImage;
    }
    
    res.json({
      success: true,
      data: accessCard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get access logs
router.get('/access-logs', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      fromDate,
      toDate,
      accessPoint,
      page = 1,
      limit = 20
    } = req.query;
    
    const accessCard = await AccessCard.findOne({ studentId })
      .select('usageLog')
      .lean();
    
    if (!accessCard) {
      return res.json({
        success: true,
        data: { logs: [], pagination: {} }
      });
    }
    
    let logs = accessCard.usageLog || [];
    
    // Apply filters
    if (fromDate) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(fromDate));
    }
    if (toDate) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(toDate));
    }
    if (accessPoint) {
      logs = logs.filter(log => log.accessPoint?.includes(accessPoint));
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedLogs = logs.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(logs.length / parseInt(limit)),
          totalLogs: logs.length,
          hasNextPage: skip + paginatedLogs.length < logs.length,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// PAYMENT MANAGEMENT
// =====================

// Get fee status and payment history
router.get('/fees', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const student = await Student.findById(studentId)
      .select('hostelApplication.fees paymentHistory')
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    const fees = student.hostelApplication?.fees || {};
    const paymentHistory = student.paymentHistory || [];
    
    // Calculate outstanding amounts
    const outstandingAmount = 
      (fees.hostelFeePaid ? 0 : fees.hostelFee || 0) +
      (fees.messFeePaid ? 0 : fees.messFee || 0);
    
    res.json({
      success: true,
      data: {
        currentFees: {
          hostelFee: {
            amount: fees.hostelFee || 0,
            paid: fees.hostelFeePaid || false,
            dueDate: fees.hostelFeeDueDate,
            lastPaidDate: fees.hostelFeeLastPaidDate
          },
          messFee: {
            amount: fees.messFee || 0,
            paid: fees.messFeePaid || false,
            dueDate: fees.messFeeDueDate,
            lastPaidDate: fees.messFeeLastPaidDate
          },
          totalOutstanding: outstandingAmount
        },
        paymentHistory: paymentHistory.slice(0, 10) // Last 10 transactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ================
// MESS MANAGEMENT
// ================

// Join a mess (assign messId)
router.post('/mess/join', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { messId, planType = 'veg' } = req.body;
    const { Mess } = require('../models/HostelInfrastructure');
    const mess = await Mess.findById(messId).lean();
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });
    await Student.findByIdAndUpdate(studentId, { 'accessControl.messId': messId, 'accessControl.messAccess.isEnabled': true, 'accessControl.messAccess.planType': planType });
    res.json({ success: true, message: 'Mess joined' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Leave mess
router.post('/mess/leave', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    await Student.findByIdAndUpdate(studentId, { $unset: { 'accessControl.messId': 1 }, 'accessControl.messAccess.isEnabled': false });
    res.json({ success: true, message: 'Mess left' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Get my mess plan
router.get('/mess', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const st = await Student.findById(req.user.id).select('accessControl').populate('accessControl.messId','name code');
    res.json({ success: true, data: st.accessControl });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Initiate payment
router.post('/fees/pay', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { feeType, amount, paymentMethod } = req.body; // 'hostel_fee' or 'mess_fee'
    
    if (!['hostel_fee', 'mess_fee'].includes(feeType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee type'
      });
    }
    
    const student = await Student.findById(studentId)
      .select('name regNo email phone hostelApplication.fees');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Create payment order (integrate with Razorpay/Stripe)
    const paymentOrderId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Mock payment gateway response
    const paymentOrder = {
      orderId: paymentOrderId,
      amount: amount * 100, // Convert to paise for Razorpay
      currency: 'INR',
      receipt: `${feeType}_${student.regNo}_${Date.now()}`,
      notes: {
        studentId: student._id,
        regNo: student.regNo,
        feeType,
        amount
      }
    };
    
    // In real implementation, create order with payment gateway
    // const order = await razorpay.orders.create(paymentOrder);
    
    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: paymentOrderId,
        amount,
        currency: 'INR',
        // Include payment gateway specific data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Verify payment callback
router.post('/fees/verify', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const { orderId, paymentId, signature, feeType } = req.body;
    const studentId = req.user.id;
    
    // Verify payment signature (implement with actual payment gateway)
    // const isValidSignature = verifyPaymentSignature(orderId, paymentId, signature);
    
    // Mock verification - in real implementation, verify with payment gateway
    const isValidSignature = true;
    
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
    
    // Update fee status
    const updateField = feeType === 'hostel_fee' 
      ? { 'hostelApplication.fees.hostelFeePaid': true, 'hostelApplication.fees.hostelFeeLastPaidDate': new Date() }
      : { 'hostelApplication.fees.messFeePaid': true, 'hostelApplication.fees.messFeeLastPaidDate': new Date() };
    
    await Student.findByIdAndUpdate(studentId, {
      ...updateField,
      $push: {
        paymentHistory: {
          orderId,
          paymentId,
          feeType,
          amount: req.body.amount,
          status: 'success',
          paidAt: new Date(),
          method: req.body.method || 'online'
        }
      }
    });
    
    // Update access card permissions if mess fee paid
    if (feeType === 'mess_fee') {
      await AccessCard.findOneAndUpdate(
        { studentId },
        {
          'paymentLinked.messFeePaid': true,
          'paymentLinked.lastPaymentDate': new Date(),
          'accessScopes.$[elem].isEnabled': true
        },
        {
          arrayFilters: [{ 'elem.scope': 'mess_entry' }]
        }
      );
    }
    
    res.json({
      success: true,
      message: 'Payment verified and fee updated successfully',
      data: {
        orderId,
        paymentId,
        feeType,
        paidAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// MESS SERVICES
// =====================

// Get mess menu and info
router.get('/mess', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get student's hostel and mess info
    const student = await Student.findById(studentId)
      .populate({
        path: 'hostelApplication.allocatedRoom',
        populate: {
          path: 'blockId',
          populate: {
            path: 'hostelId',
            populate: {
              path: 'messBuildings'
            }
          }
        }
      });
    
    if (!student?.hostelApplication?.allocatedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room allocation not found'
      });
    }
    
    const messBuildings = student.hostelApplication.allocatedRoom.blockId.hostelId.messBuildings;
    
    if (!messBuildings || messBuildings.length === 0) {
      return res.json({
        success: true,
        data: { message: 'No mess assigned to your hostel' }
      });
    }
    
    // Get current week's menu
    const mess = messBuildings[0]; // Assuming primary mess
    const currentWeekMenu = mess.menuManagement?.currentWeekMenu || [];
    
    // Get today's menu
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todaysMenu = currentWeekMenu.find(menu => menu.day.toLowerCase() === today);
    
    res.json({
      success: true,
      data: {
        mess: {
          name: mess.name,
          operationalHours: mess.operationalHours,
          location: mess.location
        },
        todaysMenu: todaysMenu || null,
        weeklyMenu: currentWeekMenu,
        pricing: mess.pricing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Submit mess feedback
router.post('/mess/feedback', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      rating,
      category = 'general', // 'food_quality', 'service', 'cleanliness', 'variety', 'general'
      feedback,
      suggestions
    } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Create feedback as a complaint with mess category
    const feedbackComplaint = new Complaint({
      complainantId: studentId,
      complainantType: 'student',
      ticketId: `MESS-FB-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      category: 'mess_service',
      subCategory: category,
      priority: 'low',
      title: `Mess Feedback - ${category}`,
      description: `Rating: ${rating}/5\nFeedback: ${feedback}\nSuggestions: ${suggestions || 'None'}`,
      status: 'submitted'
    });
    
    await feedbackComplaint.save();
    
    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      data: {
        feedbackId: feedbackComplaint._id,
        ticketId: feedbackComplaint.ticketId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// PROFILE MANAGEMENT
// =====================

// Update student profile
router.put('/profile', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const allowedUpdates = ['phone', 'email', 'guardianInfo', 'emergencyContact', 'preferences'];
    const updates = {};
    
    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const student = await Student.findByIdAndUpdate(
      studentId,
      updates,
      { new: true, select: 'name regNo email phone guardianInfo emergencyContact preferences year department' }
    );
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function to generate access card (if not exists)
async function generateAccessCard(studentId) {
  const student = await Student.findById(studentId)
    .populate('hostelApplication.allocatedRoom');
  
  if (!student?.hostelApplication?.allocatedRoom) {
    throw new Error('Room allocation not found for student');
  }
  
  const room = await Room.findById(student.hostelApplication.allocatedRoom)
    .populate('blockId');
  
  const cardId = `AC-${student.regNo}-${Date.now()}`;
  
  const qrData = {
    cardId,
    studentId: student._id,
    regNo: student.regNo,
    hostelId: room.blockId.hostelId,
    blockId: room.blockId._id,
    roomId: room._id,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    signature: crypto.createHmac('sha256', process.env.QR_SIGNATURE_SECRET || 'default-secret')
      .update(`${cardId}-${student.regNo}`)
      .digest('hex')
  };
  
  const accessCard = new AccessCard({
    cardId,
    studentId,
    qrCode: {
      data: JSON.stringify(qrData),
      generatedAt: new Date(),
      expiresAt: qrData.validTill
    },
    accessScopes: [
      {
        scope: 'hostel_entry',
        isEnabled: true,
        validFrom: new Date(),
        validTill: qrData.validTill
      },
      {
        scope: 'mess_entry',
        isEnabled: student.hostelApplication?.fees?.messFeePaid || false,
        validFrom: new Date(),
        validTill: qrData.validTill
      }
    ],
    paymentLinked: {
      hostelFeePaid: student.hostelApplication?.fees?.hostelFeePaid || false,
      messFeePaid: student.hostelApplication?.fees?.messFeePaid || false
    },
    isActive: true,
    issueDate: new Date(),
    expiryDate: qrData.validTill
  });
  
  await accessCard.save();
  return accessCard;
}

module.exports = router;
