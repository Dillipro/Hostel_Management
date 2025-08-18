const express = require('express');
const router = express.Router();
const {
  LeaveRequest, Complaint, AccessCard, Room, Block, Hostel
} = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendNotification } = require('../utils/notification');
const mongoose = require('mongoose');

// =====================
// WARDEN DASHBOARD APIS
// =====================

// Get warden dashboard overview
router.get('/dashboard', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    
    // Get hostels/blocks managed by this warden
    const managedBlocks = await Block.find({
      'wardens.wardenId': wardenId,
      isActive: true
    }).populate('hostelId');
    
    const blockIds = managedBlocks.map(block => block._id);
    const hostelIds = [...new Set(managedBlocks.map(block => block.hostelId._id))];
    
    // Get rooms under warden's management
    const totalRooms = await Room.countDocuments({ blockId: { $in: blockIds } });
    const occupiedRooms = await Room.countDocuments({ 
      blockId: { $in: blockIds }, 
      status: 'occupied' 
    });
    const availableRooms = await Room.countDocuments({ 
      blockId: { $in: blockIds }, 
      status: 'available' 
    });
    const maintenanceRooms = await Room.countDocuments({ 
      blockId: { $in: blockIds }, 
      status: 'maintenance' 
    });
    
    // Get students under warden's care
    const totalStudents = await Room.aggregate([
      { $match: { blockId: { $in: blockIds } } },
      { $unwind: '$occupants' },
      { $match: { 'occupants.isActive': true } },
      { $count: 'totalStudents' }
    ]);
    
    // Pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({
      status: 'pending',
      'location.blockId': { $in: blockIds }
    });
    
    // Pending complaints
    const pendingComplaints = await Complaint.countDocuments({
      status: { $in: ['submitted', 'acknowledged'] },
      'location.blockId': { $in: blockIds }
    });
    
    // Today's mess attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayMessAttendance = await AccessCard.countDocuments({
      'usageLog.timestamp': { $gte: today, $lt: tomorrow },
      'usageLog.action': 'entry',
      'usageLog.location.hostelId': { $in: hostelIds.map(id => id.toString()) }
    });
    
    // Recent security alerts
    const securityAlerts = await AccessCard.find({
      'usageLog.success': false,
      'usageLog.timestamp': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(5);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalRooms,
          occupiedRooms,
          availableRooms,
          maintenanceRooms,
          totalStudents: totalStudents[0]?.totalStudents || 0,
          occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : 0
        },
        pendingTasks: {
          pendingLeaves,
          pendingComplaints,
          todayMessAttendance
        },
        managedBlocks: managedBlocks.length,
        securityAlerts: securityAlerts.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

  // Daily attendance summary per block/floor
  router.get('/attendance/summary', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
    try {
      const wardenId = req.user.id;
      const blocks = await Block.find({ 'wardens.wardenId': wardenId }).select('_id name').lean();
      const blockIds = blocks.map(b => b._id);
      const students = await Student.find({ 'hostelApplication.blockId': { $in: blockIds } }).select('_id name regNo').lean();
      const ids = students.map(s => s._id);
      const cards = await AccessCard.find({ studentId: { $in: ids } }).select('studentId usageLog').lean();
      const today = new Date(); today.setHours(0,0,0,0);
      const summary = { present: 0, absent: 0 };
      cards.forEach(c => {
        const hasEntry = (c.usageLog || []).some(l => new Date(l.timestamp) >= today && l.success && l.action === 'entry');
        if (hasEntry) summary.present++; else summary.absent++;
      });
      res.json({ success: true, data: { blocks, summary } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  });
// =====================
// ATTENDANCE SETTINGS (WARDEN)
// =====================

// List attendance settings for blocks managed by the warden
router.get('/attendance-settings', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const blocks = await Block.find({ 'wardens.wardenId': wardenId, isActive: true })
      .select('name code hostelId attendanceSettings')
      .populate('hostelId', 'name code')
      .lean();
    res.json({ success: true, data: blocks.map(b => ({
      blockId: b._id,
      blockName: b.name,
      blockCode: b.code,
      hostel: { id: b.hostelId?._id, name: b.hostelId?.name, code: b.hostelId?.code },
      attendanceSettings: b.attendanceSettings || { enabled: false }
    })) });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update attendance settings for a specific managed block
router.put('/blocks/:blockId/attendance-settings', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const { blockId } = req.params;
    // Ensure warden manages this block
    const manages = await Block.exists({ _id: blockId, 'wardens.wardenId': wardenId });
    if (!manages) return res.status(403).json({ success: false, message: 'Not authorized for this block' });

    const { enabled, geofence, timeWindows } = req.body;
    const updated = await Block.findByIdAndUpdate(
      blockId,
      { $set: { 'attendanceSettings.enabled': enabled, 'attendanceSettings.geofence': geofence, 'attendanceSettings.timeWindows': timeWindows } },
      { new: true }
    ).select('attendanceSettings');
    if (!updated) return res.status(404).json({ success: false, message: 'Block not found' });
    res.json({ success: true, data: updated.attendanceSettings });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// =====================
// STUDENT ROSTER MANAGEMENT
// =====================

// Get all students under warden's care with detailed info
router.get('/students', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const {
      blockId,
      floorNumber,
      search,
      status = 'active',
      page = 1,
      limit = 20
    } = req.query;
    
    // Get blocks managed by this warden
    let managedBlocks = await Block.find({
      'wardens.wardenId': wardenId,
      isActive: true
    });
    
    // Filter by specific block if requested
    if (blockId) {
      managedBlocks = managedBlocks.filter(block => 
        block._id.toString() === blockId
      );
    }
    
    const blockIds = managedBlocks.map(block => block._id);
    
    // Build room filter
    const roomFilter = { blockId: { $in: blockIds } };
    if (floorNumber) roomFilter.floorNumber = parseInt(floorNumber);
    
    // Get rooms with occupants
    const rooms = await Room.find(roomFilter)
      .populate({
        path: 'occupants.studentId',
        match: status === 'active' ? { 'occupants.isActive': true } : {},
        select: 'name regNo email phone year department cgpa guardianInfo'
      })
      .populate('blockId', 'name code')
      .lean();
    
    // Flatten student data
    let students = [];
    rooms.forEach(room => {
      if (room.occupants && room.occupants.length > 0) {
        room.occupants.forEach(occupant => {
          if (occupant.studentId) {
            students.push({
              ...occupant.studentId,
              roomInfo: {
                roomNumber: room.roomNumber,
                floorNumber: room.floorNumber,
                blockName: room.blockId.name,
                blockCode: room.blockId.code,
                bedNumber: occupant.bedNumber,
                occupiedFrom: occupant.occupiedFrom
              }
            });
          }
        });
      }
    });
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      students = students.filter(student => 
        student.name.toLowerCase().includes(searchLower) ||
        student.regNo.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.roomInfo.roomNumber.includes(search)
      );
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedStudents = students.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        students: paginatedStudents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(students.length / parseInt(limit)),
          totalStudents: students.length,
          hasNextPage: endIndex < students.length,
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
// ROOM/MESS CHANGE APPROVALS
// =====================

// List pending change requests for blocks managed by the warden
router.get('/change-requests', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const blocks = await Block.find({ 'wardens.wardenId': wardenId }).select('_id');
    const blockIds = blocks.map(b => b._id);
    const students = await Student.find({ 'hostelApplication.blockId': { $in: blockIds }, changeRequests: { $exists: true, $ne: [] } })
      .select('name regNo hostelApplication changeRequests')
      .lean();
    const pending = [];
    students.forEach(s => (s.changeRequests || []).forEach(cr => { if (cr.status === 'pending') pending.push({ studentId: s._id, name: s.name, regNo: s.regNo, currentBlockId: s.hostelApplication?.blockId, request: cr }); }));
    res.json({ success: true, data: pending });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Approve or reject a change request
router.put('/change-requests/:studentId/:requestId', authenticateToken, authorizeRoles(['warden', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { action = 'approve' } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ success: false, message: 'Invalid action' });
    const student = await Student.findById(req.params.studentId).populate('hostelApplication.allocatedRoom');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const idx = (student.changeRequests || []).findIndex(r => String(r._id) === String(req.params.requestId));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Request not found' });
    const reqDoc = student.changeRequests[idx];

    if (action === 'reject') {
      student.changeRequests[idx].status = 'rejected';
      student.changeRequests[idx].reviewedAt = new Date();
      student.changeRequests[idx].reviewedBy = req.user._id;
      await student.save();
      return res.json({ success: true, message: 'Request rejected' });
    }

    // Approve flow
    if (reqDoc.type === 'mess_change') {
      const targetMessId = reqDoc.details?.targetMessId;
      if (!targetMessId) return res.status(400).json({ success: false, message: 'Target mess required' });
      student.accessControl.messId = targetMessId;
      student.changeRequests[idx].status = 'approved';
      student.changeRequests[idx].reviewedAt = new Date();
      student.changeRequests[idx].reviewedBy = req.user._id;
      await student.save();
      return res.json({ success: true, message: 'Mess change approved' });
    }

    // Room change
    const targetBlockId = reqDoc.details?.targetBlockId || student.hostelApplication?.blockId;
    const preferredRoomType = reqDoc.details?.preferredRoomType;
    const room = await Room.findOne({ blockId: targetBlockId, usageType: 'residential', status: { $in: ['available', 'reserved'] }, ...(preferredRoomType && { roomType: preferredRoomType }), $expr: { $lt: ['$currentOccupancy', '$capacity'] } }).sort({ currentOccupancy: 1 });
    if (!room) return res.status(409).json({ success: false, message: 'No suitable room available' });

    // Move student: free old room slot
    if (student.hostelApplication?.allocatedRoom) {
      await Room.findByIdAndUpdate(student.hostelApplication.allocatedRoom, { 
        $inc: { currentOccupancy: -1 },
        $set: { status: 'available' },
        $pull: { occupants: { studentId: student._id } }
      });
    }

    await Room.findByIdAndUpdate(room._id, { $inc: { currentOccupancy: 1 }, $push: { occupants: { studentId: student._id, bedNumber: 1, occupiedFrom: new Date(), isActive: true } }, status: 'occupied' });
    student.hostelApplication.allocatedRoom = room._id;
    student.hostelApplication.blockId = room.blockId;
    student.changeRequests[idx].status = 'approved';
    student.changeRequests[idx].reviewedAt = new Date();
    student.changeRequests[idx].reviewedBy = req.user._id;
    await student.save();
    res.json({ success: true, message: 'Room change approved' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Get detailed student profile with history
router.get('/students/:studentId', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const wardenId = req.user.id;
    
    // Verify warden has access to this student
    const student = await Student.findById(studentId)
      .populate('hostelApplication.allocatedRoom')
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Get student's room and verify warden access
    const room = await Room.findById(student.hostelApplication.allocatedRoom)
      .populate('blockId')
      .lean();
    
    const wardenHasAccess = await Block.findOne({
      _id: room.blockId._id,
      'wardens.wardenId': wardenId
    });
    
    if (!wardenHasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this student'
      });
    }
    
    // Get leave history
    const leaveHistory = await LeaveRequest.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get complaint history
    const complaintHistory = await Complaint.find({ complainantId: studentId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get access card info
    const accessCard = await AccessCard.findOne({ studentId })
      .select('cardId qrCode rfidTag accessScopes paymentLinked isActive')
      .lean();
    
    // Get recent access logs
    const recentAccessLogs = await AccessCard.findOne({ studentId })
      .select('usageLog')
      .lean();
    
    const accessLogs = recentAccessLogs?.usageLog
      ?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      ?.slice(0, 20) || [];
    
    res.json({
      success: true,
      data: {
        student,
        roomInfo: room,
        leaveHistory,
        complaintHistory,
        accessCard,
        recentAccessLogs: accessLogs
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
// LEAVE MANAGEMENT
// =====================

// Get pending leave requests for warden approval
router.get('/leave-requests', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const {
      status = 'pending',
      leaveType,
      fromDate,
      toDate,
      page = 1,
      limit = 20
    } = req.query;
    
    // Get blocks managed by this warden
    const managedBlocks = await Block.find({
      'wardens.wardenId': wardenId,
      isActive: true
    });
    
    const blockIds = managedBlocks.map(block => block._id);
    
    // Build filter
    const filter = {};
    if (status !== 'all') filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (fromDate) filter.fromDate = { $gte: new Date(fromDate) };
    if (toDate) filter.toDate = { $lte: new Date(toDate) };
    
    // Get leave requests for students in warden's blocks
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leaveRequests = await LeaveRequest.find(filter)
      .populate({
        path: 'studentId',
        select: 'name regNo email phone year department',
        populate: {
          path: 'hostelApplication.allocatedRoom',
          populate: {
            path: 'blockId',
            match: { _id: { $in: blockIds } },
            select: 'name code'
          }
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Filter out requests where student is not in warden's blocks
    const validLeaveRequests = leaveRequests.filter(request => 
      request.studentId?.hostelApplication?.allocatedRoom?.blockId
    );
    
    const totalRequests = await LeaveRequest.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        leaveRequests: validLeaveRequests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRequests / parseInt(limit)),
          totalRequests,
          hasNextPage: skip + validLeaveRequests.length < totalRequests,
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

// Approve or reject leave request
router.put('/leave-requests/:requestId/review', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, comments } = req.body; // action: 'approve' or 'reject'
    const wardenId = req.user.id;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "reject"'
      });
    }
    
    const leaveRequest = await LeaveRequest.findById(requestId)
      .populate('studentId', 'name regNo email phone');
    
    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }
    
    // Verify warden has permission to review this request
    const student = await Student.findById(leaveRequest.studentId._id)
      .populate('hostelApplication.allocatedRoom');
    
    const room = await Room.findById(student.hostelApplication.allocatedRoom)
      .populate('blockId');
    
    const wardenHasAccess = await Block.findOne({
      _id: room.blockId._id,
      'wardens.wardenId': wardenId
    });
    
    if (!wardenHasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to review this leave request'
      });
    }
    
    // Update leave request
    leaveRequest.status = action === 'approve' ? 'approved' : 'rejected';
    leaveRequest.approvalWorkflow.push({
      approverType: 'warden',
      approverId: wardenId,
      action,
      comments,
      actionDate: new Date()
    });
    
    await leaveRequest.save();
    
    // Send notification to student
    await sendNotification({
      userId: leaveRequest.studentId._id,
      type: 'leave_request_update',
      title: `Leave Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your leave request from ${leaveRequest.fromDate.toDateString()} to ${leaveRequest.toDate.toDateString()} has been ${action}d by the warden.`,
      data: {
        requestId: leaveRequest._id,
        status: leaveRequest.status,
        comments
      }
    });
    
    res.json({
      success: true,
      message: `Leave request ${action}d successfully`,
      data: leaveRequest
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

// Get complaints for warden's blocks
router.get('/complaints', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const {
      status = 'all',
      category,
      priority,
      page = 1,
      limit = 20
    } = req.query;
    
    // Get blocks managed by this warden
    const managedBlocks = await Block.find({
      'wardens.wardenId': wardenId,
      isActive: true
    });
    
    const blockIds = managedBlocks.map(block => block._id);
    
    // Build filter
    const filter = {
      'location.blockId': { $in: blockIds }
    };
    
    if (status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const complaints = await Complaint.find(filter)
      .populate('complainantId', 'name regNo email phone')
      .populate('location.blockId', 'name code')
      .populate('location.roomId', 'roomNumber')
      .populate('assignedTo.staffId', 'name role phone')
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

// Update complaint status and assign staff
router.put('/complaints/:complaintId', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, assignedTo, estimatedCompletion, comments } = req.body;
    const wardenId = req.user.id;
    
    const complaint = await Complaint.findById(complaintId);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }
    
    // Verify warden has access to this complaint
    const wardenHasAccess = await Block.findOne({
      _id: complaint.location.blockId,
      'wardens.wardenId': wardenId
    });
    
    if (!wardenHasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to update this complaint'
      });
    }
    
    // Update complaint
    if (status) complaint.status = status;
    
    if (assignedTo) {
      complaint.assignedTo.push({
        staffId: assignedTo,
        assignedAt: new Date(),
        estimatedCompletion: estimatedCompletion ? new Date(estimatedCompletion) : undefined
      });
    }
    
    // Add work log entry
    complaint.workLog.push({
      actionBy: wardenId,
      action: 'status_update',
      description: comments || `Status updated to ${status}`,
      timestamp: new Date()
    });
    
    await complaint.save();
    
    // Send notifications
    await sendNotification({
      userId: complaint.complainantId,
      type: 'complaint_update',
      title: 'Complaint Status Updated',
      message: `Your complaint #${complaint.ticketId} status has been updated to ${status}`,
      data: {
        complaintId: complaint._id,
        status,
        comments
      }
    });
    
    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// MESS OVERSIGHT
// =====================

// Get mess attendance and feedback for warden's hostels
router.get('/mess/overview', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    // Get hostels managed by this warden
    const managedBlocks = await Block.find({
      'wardens.wardenId': wardenId,
      isActive: true
    }).populate('hostelId');
    
    const hostelIds = [...new Set(managedBlocks.map(block => block.hostelId._id))];
    
    // Get mess attendance for the specified date
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const messAttendance = await AccessCard.aggregate([
      {
        $match: {
          'usageLog.timestamp': { $gte: startDate, $lt: endDate },
          'usageLog.action': 'entry',
          'usageLog.location.hostelId': { $in: hostelIds.map(id => id.toString()) }
        }
      },
      {
        $unwind: '$usageLog'
      },
      {
        $match: {
          'usageLog.timestamp': { $gte: startDate, $lt: endDate },
          'usageLog.action': 'entry'
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: '$usageLog.timestamp' },
            hostelId: '$usageLog.location.hostelId'
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Categorize by meal times
    const mealAttendance = {
      breakfast: 0, // 6-10 AM
      lunch: 0,     // 11-15 PM
      dinner: 0     // 18-22 PM
    };
    
    messAttendance.forEach(entry => {
      const hour = entry._id.hour;
      if (hour >= 6 && hour < 10) mealAttendance.breakfast += entry.count;
      else if (hour >= 11 && hour < 15) mealAttendance.lunch += entry.count;
      else if (hour >= 18 && hour < 22) mealAttendance.dinner += entry.count;
    });
    
    // Get recent feedback
    const recentFeedback = await Complaint.find({
      category: { $in: ['mess_food', 'mess_service'] },
      'location.blockId': { $in: managedBlocks.map(b => b._id) },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .populate('complainantId', 'name regNo')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    res.json({
      success: true,
      data: {
        date,
        attendance: mealAttendance,
        totalAttendance: Object.values(mealAttendance).reduce((a, b) => a + b, 0),
        recentFeedback
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
// ANNOUNCEMENTS
// =====================

// Create announcement for warden's blocks
router.post('/announcements', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'general', // 'general', 'urgent', 'maintenance', 'event'
      targetBlocks = [], // If empty, sends to all managed blocks
      scheduleFor = null // If null, sends immediately
    } = req.body;
    
    const wardenId = req.user.id;
    
    // Get blocks managed by this warden
    let managedBlocks = await Block.find({
      'wardens.wardenId': wardenId,
      isActive: true
    });
    
    // Filter target blocks if specified
    if (targetBlocks.length > 0) {
      managedBlocks = managedBlocks.filter(block =>
        targetBlocks.includes(block._id.toString())
      );
    }
    
    const blockIds = managedBlocks.map(block => block._id);
    
    // Get all students in these blocks
    const rooms = await Room.find({ blockId: { $in: blockIds } })
      .populate('occupants.studentId', '_id')
      .lean();
    
    const studentIds = [];
    rooms.forEach(room => {
      if (room.occupants) {
        room.occupants.forEach(occupant => {
          if (occupant.isActive && occupant.studentId) {
            studentIds.push(occupant.studentId._id);
          }
        });
      }
    });
    
    // Send notifications to all students
    const notificationPromises = studentIds.map(studentId =>
      sendNotification({
        userId: studentId,
        type: 'announcement',
        title,
        message,
        data: {
          announcementType: type,
          wardenId,
          blockIds,
          scheduledFor: scheduleFor
        }
      })
    );
    
    if (scheduleFor) {
      // Schedule for later (implement with job queue)
      // For now, just send immediately
      await Promise.all(notificationPromises);
    } else {
      // Send immediately
      await Promise.all(notificationPromises);
    }
    
    res.json({
      success: true,
      message: `Announcement sent to ${studentIds.length} students in ${managedBlocks.length} blocks`,
      data: {
        recipientCount: studentIds.length,
        blockCount: managedBlocks.length,
        type,
        scheduledFor: scheduleFor
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
// REPORTS & ANALYTICS
// =====================

// Generate warden reports
router.get('/reports', authenticateToken, authorizeRoles(['warden']), async (req, res) => {
  try {
    const wardenId = req.user.id;
    const {
      type = 'overview', // 'overview', 'attendance', 'complaints', 'leave'
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = req.query;
    
    // Get blocks managed by this warden
    const managedBlocks = await Block.find({
      'wardens.wardenId': wardenId,
      isActive: true
    }).populate('hostelId');
    
    const blockIds = managedBlocks.map(block => block._id);
    const hostelIds = [...new Set(managedBlocks.map(block => block.hostelId._id))];
    
    let reportData = {};
    
    switch (type) {
      case 'overview':
        // Get comprehensive overview
        const totalRooms = await Room.countDocuments({ blockId: { $in: blockIds } });
        const occupiedRooms = await Room.countDocuments({ 
          blockId: { $in: blockIds }, 
          status: 'occupied' 
        });
        
        const leaveStats = await LeaveRequest.aggregate([
          {
            $lookup: {
              from: 'students',
              localField: 'studentId',
              foreignField: '_id',
              as: 'student'
            }
          },
          {
            $lookup: {
              from: 'rooms',
              localField: 'student.hostelApplication.allocatedRoom',
              foreignField: '_id',
              as: 'room'
            }
          },
          {
            $match: {
              'room.blockId': { $in: blockIds },
              createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
        
        const complaintStats = await Complaint.aggregate([
          {
            $match: {
              'location.blockId': { $in: blockIds },
              createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }
          },
          {
            $group: {
              _id: { status: '$status', category: '$category' },
              count: { $sum: 1 }
            }
          }
        ]);
        
        reportData = {
          roomOccupancy: {
            totalRooms,
            occupiedRooms,
            occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : 0
          },
          leaveRequests: leaveStats,
          complaints: complaintStats,
          managedBlocks: managedBlocks.length
        };
        break;
        
      // Add more report types as needed
      default:
        reportData = { message: 'Report type not implemented yet' };
    }
    
    res.json({
      success: true,
      data: {
        reportType: type,
        dateRange: { startDate, endDate },
        ...reportData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
