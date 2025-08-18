const express = require('express');
const router = express.Router();
const { 
  AccessCard, 
  Room, 
  Block, 
  Hostel, 
  LeaveRequest, 
  Complaint 
} = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');

// =====================
// QR CODE SCANNER APIS
// =====================

// Scan QR code at entry points
router.post('/scan', async (req, res) => {
  try {
  const { qrData, scannerLocation, scannerType = 'qr', deviceId } = req.body;
    
    if (!qrData || !scannerLocation) {
      return res.status(400).json({
        success: false,
        message: 'QR data and scanner location are required',
        action: 'deny',
        reason: 'Invalid request parameters'
      });
    }
    
    let qrPayload;
    try {
      qrPayload = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format',
        action: 'deny',
        reason: 'Malformed QR data'
      });
    }
    
    // Verify QR signature
    const expectedSignature = crypto.createHmac('sha256', process.env.QR_SIGNATURE_SECRET || 'default-secret')
      .update(`${qrPayload.cardId}-${qrPayload.regNo}`)
      .digest('hex');
    
    if (qrPayload.signature !== expectedSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid QR code signature',
        action: 'deny',
        reason: 'Tampered or fraudulent QR code'
      });
    }
    
    // Check expiry
    if (new Date() > new Date(qrPayload.validTill)) {
      return res.status(401).json({
        success: false,
        message: 'QR code has expired',
        action: 'deny',
        reason: 'Expired access card'
      });
    }
    
    // Get access card from database
    const accessCard = await AccessCard.findOne({ cardId: qrPayload.cardId })
      .populate('studentId', 'name regNo email phone hostelApplication accessControl')
      .lean();
    
    if (!accessCard || !accessCard.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Access card not found or inactive',
        action: 'deny',
        reason: 'Card deactivated or not found'
      });
    }
    
    // Check if card is locked due to failed attempts
    if (accessCard.securitySettings?.lockedTill && new Date() < new Date(accessCard.securitySettings.lockedTill)) {
      return res.status(423).json({
        success: false,
        message: 'Access card is temporarily locked',
        action: 'deny',
        reason: 'Too many failed attempts'
      });
    }
    
  // Determine access type based on scanner location
    let requiredScope = 'hostel_entry';
    if (scannerLocation.includes('mess')) {
      requiredScope = 'mess_entry';
    } else if (scannerLocation.includes('gym')) {
      requiredScope = 'gym_access';
    } else if (scannerLocation.includes('library')) {
      requiredScope = 'library_access';
    }
    
    // Check if student has required access scope
    const hasAccess = accessCard.accessScopes.find(scope => 
      scope.scope === requiredScope && 
      scope.isEnabled && 
      new Date() >= new Date(scope.validFrom) && 
      new Date() <= new Date(scope.validTill)
    );
    
    if (!hasAccess) {
      await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, false, 'Access scope not enabled');
      
      return res.status(403).json({
        success: false,
        message: 'Access denied for this location',
        action: 'deny',
        reason: `${requiredScope.replace('_', ' ')} not enabled`,
        studentInfo: {
          name: accessCard.studentId.name,
          regNo: accessCard.studentId.regNo
        }
      });
    }
    
    // Wrong-entry prevention using device location vs student's assigned block/mess
    let deviceMeta = null;
    if (deviceId) {
      const IoTDevice = require('../models/IoTDevice');
      deviceMeta = await IoTDevice.findOne({ deviceId }).lean();
    }
    // If hostel entry and device is tied to a different hostel/block than student's allocation, deny
    if (requiredScope === 'hostel_entry' && deviceMeta && (deviceMeta.location?.hostelId || deviceMeta.location?.blockId)) {
      const studentBlockId = accessCard.studentId?.hostelApplication?.blockId?.toString?.();
      const deviceBlockId = deviceMeta.location.blockId?.toString?.();
      if (deviceBlockId && studentBlockId && deviceBlockId !== studentBlockId) {
        await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, false, 'Wrong hostel/block entry');
        emitScanEvent({ success: false, action: 'deny', reason: 'Wrong hostel/block', accessCard, requiredScope, deviceMeta });
        return res.status(403).json({ success: false, message: 'Access denied: wrong block/hostel', action: 'deny', reason: 'Wrong hostel/block entry' });
      }
    }

    // Special checks for mess entry
    if (requiredScope === 'mess_entry') {
      if (!accessCard.paymentLinked?.messFeePaid) {
        await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, false, 'Mess fee not paid');
        
        return res.status(402).json({
          success: false,
          message: 'Mess fee payment required',
          action: 'deny',
          reason: 'Outstanding mess fee payment',
          studentInfo: {
            name: accessCard.studentId.name,
            regNo: accessCard.studentId.regNo
          }
        });
      }
      
      // Enforce mess assignment and device mess mapping
      if (deviceMeta?.location?.messId) {
        const assignedMessId = accessCard.studentId?.accessControl?.messId?.toString?.();
        if (assignedMessId && deviceMeta.location.messId.toString() !== assignedMessId) {
          await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, false, 'Wrong mess');
          emitScanEvent({ success: false, action: 'deny', reason: 'Wrong mess', accessCard, requiredScope, deviceMeta });
          return res.status(403).json({ success: false, message: 'Access denied: not your assigned mess', action: 'deny', reason: 'Wrong mess' });
        }
      }

      // Check if within mess operational hours from Mess model if available, else fall back to defaults
      const { Mess } = require('../models/HostelInfrastructure');
      let mealSlots = [
        { name: 'breakfast', start: '07:00', end: '10:00' },
        { name: 'lunch', start: '12:00', end: '15:00' },
        { name: 'dinner', start: '18:00', end: '22:00' }
      ];
      if (deviceMeta?.location?.messId) {
        const mess = await Mess.findById(deviceMeta.location.messId).lean();
        if (mess?.operationalHours) {
          const oh = mess.operationalHours;
          mealSlots = [
            { name: 'breakfast', start: oh.breakfast?.start || '07:00', end: oh.breakfast?.end || '10:00' },
            { name: 'lunch', start: oh.lunch?.start || '12:00', end: oh.lunch?.end || '15:00' },
            { name: 'dinner', start: oh.dinner?.start || '18:00', end: oh.dinner?.end || '22:00' }
          ];
        }
      }
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const nowStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const isWithinMealTime = mealSlots.some(slot => nowStr >= slot.start && nowStr <= slot.end);
      
      if (!isWithinMealTime) {
        await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, false, 'Outside mess operational hours');
        
        return res.status(403).json({
          success: false,
          message: 'Mess access outside operational hours',
          action: 'deny',
          reason: 'Not within meal time',
          studentInfo: {
            name: accessCard.studentId.name,
            regNo: accessCard.studentId.regNo
          },
          nextMealTime: getNextMealTime(
            mealSlots.map(s => ({ name: s.name, start: toMinutes(s.start), end: toMinutes(s.end) })),
            toMinutes(nowStr)
          )
        });
      }

      // Optional: special diet flag enforced via student specialCategories
      // Can be used by mess staff UI to route special meals
    }
    
    // Check for time-based restrictions
    if (hasAccess.restrictions?.timeSlots) {
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const isAllowedTime = hasAccess.restrictions.timeSlots.some(slot => {
        if (slot.daysOfWeek && !slot.daysOfWeek.includes(currentDay)) {
          return false;
        }
        
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        return currentTime >= startTime && currentTime <= endTime;
      });
      
      if (!isAllowedTime) {
        await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, false, 'Outside allowed time slots');
        
        return res.status(403).json({
          success: false,
          message: 'Access denied - outside allowed time',
          action: 'deny',
          reason: 'Time restriction applied',
          studentInfo: {
            name: accessCard.studentId.name,
            regNo: accessCard.studentId.regNo
          }
        });
      }
    }
    
    // Check usage limits (if configured)
    if (hasAccess.restrictions?.maxUsagePerDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todaysUsage = (accessCard.usageLog || []).filter(log => 
        new Date(log.timestamp) >= today && 
        new Date(log.timestamp) < tomorrow && 
        log.success && 
        log.action === 'entry' && 
        log.accessPoint?.includes(scannerLocation)
      ).length;
      
      if (todaysUsage >= hasAccess.restrictions.maxUsagePerDay) {
        await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, false, 'Daily usage limit exceeded');
        
        return res.status(429).json({
          success: false,
          message: 'Daily usage limit exceeded',
          action: 'deny',
          reason: `Maximum ${hasAccess.restrictions.maxUsagePerDay} entries per day`,
          studentInfo: {
            name: accessCard.studentId.name,
            regNo: accessCard.studentId.regNo
          }
        });
      }
    }
    
    // Check for active leave (only for hostel entry)
    if (requiredScope === 'hostel_entry') {
      const activeLeave = await LeaveRequest.findOne({
        studentId: accessCard.studentId._id,
        status: 'approved',
        fromDate: { $lte: new Date() },
        toDate: { $gte: new Date() }
      });
      
      if (activeLeave) {
        // This is a return from approved leave - log as legitimate entry
        await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, true, 'Return from approved leave');
        
        return res.json({
          success: true,
          message: 'Welcome back from leave',
          action: 'allow',
          reason: 'Return from approved leave',
          studentInfo: {
            name: accessCard.studentId.name,
            regNo: accessCard.studentId.regNo,
            year: accessCard.studentId.year,
            department: accessCard.studentId.department
          },
          leaveInfo: {
            leaveType: activeLeave.leaveType,
            fromDate: activeLeave.fromDate,
            toDate: activeLeave.toDate
          }
        });
      }
    }
    
    // All checks passed - grant access
  await logAccessAttempt(accessCard._id, scannerLocation, scannerType, deviceId, true, 'Access granted');
    
    // Reset failed attempts counter on successful scan
    if (accessCard.securitySettings?.currentFailedAttempts > 0) {
      await AccessCard.findByIdAndUpdate(accessCard._id, {
        'securitySettings.currentFailedAttempts': 0,
        'securitySettings.lockedTill': null
      });
    }
    
  const response = {
      success: true,
      message: 'Access granted',
      action: 'allow',
      reason: 'Valid access',
      studentInfo: {
        name: accessCard.studentId.name,
        regNo: accessCard.studentId.regNo,
        year: accessCard.studentId.year,
        department: accessCard.studentId.department,
        phone: accessCard.studentId.phone
      },
      accessInfo: {
        scope: requiredScope,
        validTill: hasAccess.validTill,
        cardExpiresAt: accessCard.expiryDate
      }
  };
  emitScanEvent({ success: true, action: 'allow', reason: 'Valid access', accessCard, requiredScope, deviceMeta });
  res.json(response);
    
  } catch (error) {
    console.error('QR Scan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Scanner system error',
      action: 'deny',
      reason: 'System error - contact admin'
    });
  }
});

// Log access attempt
async function logAccessAttempt(accessCardId, scannerLocation, scannerType, deviceId, success, reason) {
  try {
    await AccessCard.findByIdAndUpdate(accessCardId, {
      $push: {
        usageLog: {
          timestamp: new Date(),
          accessPoint: scannerLocation,
          scannerType,
          action: 'entry',
          location: {
            gate: scannerLocation
          },
          deviceId,
          success,
          failureReason: success ? null : reason
        }
      }
    });
    
    // Update failed attempts counter for failed attempts
    if (!success) {
      await AccessCard.findByIdAndUpdate(accessCardId, {
        $inc: { 'securitySettings.currentFailedAttempts': 1 }
      });
      
      // Check if should be locked
      const card = await AccessCard.findById(accessCardId);
      const maxAttempts = card.securitySettings?.maxFailedAttempts || 5;
      const lockoutDuration = card.securitySettings?.lockoutDuration || 30; // minutes
      
      if (card.securitySettings?.currentFailedAttempts >= maxAttempts) {
        const lockTill = new Date(Date.now() + lockoutDuration * 60 * 1000);
        await AccessCard.findByIdAndUpdate(accessCardId, {
          'securitySettings.lockedTill': lockTill
        });
      }
    }
  } catch (error) {
    console.error('Error logging access attempt:', error);
  }
}

// Get next meal time helper
function getNextMealTime(mealSlots, currentTime) {
  for (const slot of mealSlots) {
    if (currentTime < slot.start) {
      const startHour = Math.floor(slot.start / 60);
      const startMinute = slot.start % 60;
      return {
        meal: slot.name,
        time: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
      };
    }
  }
  
  // If past all meal times, return tomorrow's breakfast
  return {
    meal: 'breakfast',
    time: '07:00',
    day: 'tomorrow'
  };
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function emitScanEvent({ success, action, reason, accessCard, requiredScope, deviceMeta }) {
  try {
    const io = global.__io;
    if (!io) return;
    const payload = {
      success,
      action,
      reason,
      scope: requiredScope,
      student: { id: accessCard.studentId?._id || accessCard.studentId, name: accessCard.studentId?.name, regNo: accessCard.studentId?.regNo },
      device: deviceMeta ? { id: deviceMeta.deviceId, type: deviceMeta.type, location: deviceMeta.location } : undefined,
      at: new Date()
    };
    // Emit to wardens room and student room
    const blockId = accessCard?.studentId?.hostelApplication?.blockId;
    if (blockId) io.to(`block:${blockId}`).emit('scan-event', payload);
    if (accessCard.studentId?._id) io.to(`student:${accessCard.studentId._id}`).emit('scan-event', payload);
  } catch (e) { /* ignore */ }
}

// =====================
// VISITOR MANAGEMENT
// =====================

// Generate temporary visitor QR pass
router.post('/visitor/generate', authenticateToken, async (req, res) => {
  try {
    const {
      visitorName,
      visitorPhone,
      visitorIdType,
      visitorIdNumber,
      visitPurpose,
      hostStudentRegNo,
      validFrom,
      validTill,
      allowedAreas = ['common_room']
    } = req.body;
    
    // Verify the requesting user has permission (warden/admin)
    if (!['warden', 'admin', 'super_admin', 'security'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only authorized staff can generate visitor passes.'
      });
    }
    
    // Find host student
    const hostStudent = await Student.findOne({ regNo: hostStudentRegNo })
      .populate('hostelApplication.allocatedRoom')
      .lean();
    
    if (!hostStudent) {
      return res.status(404).json({
        success: false,
        message: 'Host student not found'
      });
    }
    
    // Generate visitor pass ID
    const visitorPassId = `VIS-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    // Create QR data for visitor
    const visitorQRData = {
      passId: visitorPassId,
      type: 'visitor',
      visitorName,
      visitorPhone,
      hostStudentId: hostStudent._id,
      hostStudentRegNo,
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      allowedAreas,
      signature: crypto.createHmac('sha256', process.env.QR_SIGNATURE_SECRET || 'default-secret')
        .update(`${visitorPassId}-visitor-${visitorPhone}`)
        .digest('hex')
    };
    
    res.json({
      success: true,
      message: 'Visitor pass generated successfully',
      data: {
        passId: visitorPassId,
        qrData: JSON.stringify(visitorQRData),
        visitorInfo: {
          name: visitorName,
          phone: visitorPhone,
          idType: visitorIdType,
          idNumber: visitorIdNumber
        },
        hostInfo: {
          name: hostStudent.name,
          regNo: hostStudent.regNo,
          roomNumber: hostStudent.hostelApplication?.allocatedRoom?.roomNumber
        },
        validity: {
          from: validFrom,
          till: validTill
        },
        allowedAreas
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Scan visitor QR code
router.post('/visitor/scan', async (req, res) => {
  try {
    const { qrData, scannerLocation, deviceId } = req.body;
    
    let qrPayload;
    try {
      qrPayload = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visitor pass format',
        action: 'deny'
      });
    }
    
    // Verify it's a visitor pass
    if (qrPayload.type !== 'visitor') {
      return res.status(400).json({
        success: false,
        message: 'Not a valid visitor pass',
        action: 'deny'
      });
    }
    
    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', process.env.QR_SIGNATURE_SECRET || 'default-secret')
      .update(`${qrPayload.passId}-visitor-${qrPayload.visitorPhone}`)
      .digest('hex');
    
    if (qrPayload.signature !== expectedSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid visitor pass signature',
        action: 'deny'
      });
    }
    
    // Check validity period
    const now = new Date();
    if (now < new Date(qrPayload.validFrom) || now > new Date(qrPayload.validTill)) {
      return res.status(401).json({
        success: false,
        message: 'Visitor pass has expired or not yet valid',
        action: 'deny'
      });
    }
    
    // Check allowed areas
    const scannerArea = scannerLocation.toLowerCase();
    const hasAreaAccess = qrPayload.allowedAreas.some(area => 
      scannerArea.includes(area.toLowerCase())
    );
    
    if (!hasAreaAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied for this area',
        action: 'deny',
        allowedAreas: qrPayload.allowedAreas
      });
    }
    
    res.json({
      success: true,
      message: 'Visitor access granted',
      action: 'allow',
      visitorInfo: {
        name: qrPayload.visitorName,
        phone: qrPayload.visitorPhone,
        passId: qrPayload.passId
      },
      hostInfo: {
        regNo: qrPayload.hostStudentRegNo
      },
      validity: {
        till: qrPayload.validTill
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Visitor scanner system error',
      action: 'deny'
    });
  }
});

// =====================
// ACCESS ANALYTICS
// =====================

// Get real-time access statistics
router.get('/analytics/realtime', authenticateToken, async (req, res) => {
  try {
    const { scannerLocation, timeRange = '1h' } = req.query;
    
    // Calculate time range
    const now = new Date();
    let fromTime;
    switch (timeRange) {
      case '1h':
        fromTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        fromTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        fromTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        fromTime = new Date(now.getTime() - 60 * 60 * 1000);
    }
    
    // Build aggregation pipeline
    const pipeline = [
      {
        $unwind: '$usageLog'
      },
      {
        $match: {
          'usageLog.timestamp': { $gte: fromTime },
          ...(scannerLocation && { 'usageLog.accessPoint': { $regex: scannerLocation, $options: 'i' } })
        }
      },
      {
        $group: {
          _id: {
            success: '$usageLog.success',
            accessPoint: '$usageLog.accessPoint',
            hour: { $hour: '$usageLog.timestamp' }
          },
          count: { $sum: 1 }
        }
      }
    ];
    
    const analytics = await AccessCard.aggregate(pipeline);
    
    // Process data for frontend
    const processedData = {
      totalScans: analytics.reduce((sum, item) => sum + item.count, 0),
      successfulScans: analytics
        .filter(item => item._id.success)
        .reduce((sum, item) => sum + item.count, 0),
      failedScans: analytics
        .filter(item => !item._id.success)
        .reduce((sum, item) => sum + item.count, 0),
      scansByHour: {},
      scansByLocation: {}
    };
    
    // Group by hour and location
    analytics.forEach(item => {
      const hour = item._id.hour;
      const location = item._id.accessPoint;
      
      if (!processedData.scansByHour[hour]) {
        processedData.scansByHour[hour] = { successful: 0, failed: 0 };
      }
      
      if (!processedData.scansByLocation[location]) {
        processedData.scansByLocation[location] = { successful: 0, failed: 0 };
      }
      
      if (item._id.success) {
        processedData.scansByHour[hour].successful += item.count;
        processedData.scansByLocation[location].successful += item.count;
      } else {
        processedData.scansByHour[hour].failed += item.count;
        processedData.scansByLocation[location].failed += item.count;
      }
    });
    
    res.json({
      success: true,
      data: {
        timeRange,
        fromTime,
        analytics: processedData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get security alerts (failed access attempts)
router.get('/security/alerts', authenticateToken, async (req, res) => {
  try {
    const { hours = 24, severity = 'all' } = req.query;
    
    const fromTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const pipeline = [
      {
        $unwind: '$usageLog'
      },
      {
        $match: {
          'usageLog.timestamp': { $gte: fromTime },
          'usageLog.success': false
        }
      },
      {
        $lookup: {
          from: 'students',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $group: {
          _id: {
            studentId: '$studentId',
            failureReason: '$usageLog.failureReason'
          },
          count: { $sum: 1 },
          lastAttempt: { $max: '$usageLog.timestamp' },
          locations: { $addToSet: '$usageLog.accessPoint' },
          student: { $first: '$student' }
        }
      },
      {
        $sort: { count: -1, lastAttempt: -1 }
      }
    ];
    
    const alerts = await AccessCard.aggregate(pipeline);
    
    // Categorize alerts by severity
    const categorizedAlerts = alerts.map(alert => {
      let alertSeverity = 'low';
      if (alert.count >= 10) alertSeverity = 'critical';
      else if (alert.count >= 5) alertSeverity = 'high';
      else if (alert.count >= 3) alertSeverity = 'medium';
      
      return {
        ...alert,
        severity: alertSeverity
      };
    });
    
    // Filter by severity if specified
    const filteredAlerts = severity === 'all' 
      ? categorizedAlerts 
      : categorizedAlerts.filter(alert => alert.severity === severity);
    
    res.json({
      success: true,
      data: {
        timeRange: `${hours} hours`,
        totalAlerts: filteredAlerts.length,
        alerts: filteredAlerts.slice(0, 50) // Limit to 50 most recent
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
