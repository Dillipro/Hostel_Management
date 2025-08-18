const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const {
  Hostel, Block, Room, Mess, AccommodationPolicy,
  LeaveRequest, Complaint, AccessCard
} = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const { sendNotification } = require('../utils/notification');
const mongoose = require('mongoose');

const scheduledBroadcastSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target: { type: Object, default: {} },
  title: String,
  message: String,
  data: Object,
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  runAt: Date,
  status: { type: String, enum: ['scheduled', 'sent', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });
const ScheduledBroadcast = mongoose.model('ScheduledBroadcast', scheduledBroadcastSchema);

// CEG Hostel Data - Pre-populated based on actual hostels
const CEG_HOSTELS_DATA = {
  boys_hostels: [
    { name: 'AMBAL', floors: 3, rooms: 64, capacity: 192 },
    { name: 'ANICHAM', floors: 3, rooms: 64, capacity: 192 },
    { name: 'CHEMPARUTHI', floors: 3, rooms: 64, capacity: 192 },
    { name: 'KURINJI', floors: 3, rooms: 97, capacity: 291 },
    { name: 'MAHIZHAM', floors: 2, rooms: 120, capacity: 360 },
    { name: 'MANTHARAI', floors: 2, rooms: 108, capacity: 324 },
    { name: 'MARUTHAM', floors: 2, rooms: 120, capacity: 360 },
    { name: 'SAMANTHI', floors: 2, rooms: 42, capacity: 126 },
    { name: 'SAMPANKI', floors: 2, rooms: 108, capacity: 324 },
    { name: 'SENBAGAM', floors: 2, rooms: 59, capacity: 177 },
    { name: 'THAZHAM', floors: 1, rooms: 54, capacity: 162 },
    { name: 'THUMBAI', floors: 3, rooms: 108, capacity: 324 },
    { name: 'VAAGAI', floors: 3, rooms: 133, capacity: 399 }
  ],
  girls_hostels: [
    { name: 'MALLIGAI', floors: 3, rooms: 80, capacity: 240 },
    { name: 'MALLIGAI EXTN', floors: 2, rooms: 32, capacity: 96 },
    { name: 'MULLAI', floors: 3, rooms: 72, capacity: 216 },
    { name: 'PAARIJATHAM', floors: 3, rooms: 48, capacity: 144 },
    { name: 'PAARIJATHAM EXTN', floors: 3, rooms: 84, capacity: 252 },
    { name: 'ROJA', floors: 3, rooms: 153, capacity: 459 },
    { name: 'THAMARAI', floors: 3, rooms: 66, capacity: 198 }
  ]
};

// =====================
// SEED CEG HOSTEL DATA
// =====================

router.post('/seed-ceg-hostels', async (req, res) => {
  try {
    // Clear existing data (optional - remove in production)
    // await Hostel.deleteMany({});
    // await Block.deleteMany({});
    // await Room.deleteMany({});
    
    const createdHostels = [];
    
    // Create Boys Hostels
    for (const hostelData of CEG_HOSTELS_DATA.boys_hostels) {
      const hostel = await createCEGHostel({
        ...hostelData,
        type: 'boys',
        location: {
          latitude: 13.0067,
          longitude: 80.2206,
          address: 'CEG Campus, Guindy, Chennai - 600025',
          landmark: 'Near Anna University'
        }
      });
      createdHostels.push(hostel);
    }
    
    // Create Girls Hostels
    for (const hostelData of CEG_HOSTELS_DATA.girls_hostels) {
      const hostel = await createCEGHostel({
        ...hostelData,
        type: 'girls',
        location: {
          latitude: 13.0067,
          longitude: 80.2206,
          address: 'CEG Campus, Guindy, Chennai - 600025',
          landmark: 'Near Anna University'
        }
      });
      createdHostels.push(hostel);
    }
    
    // Create default accommodation policies
    for (const hostel of createdHostels) {
      await createDefaultAccommodationPolicy(hostel._id, hostel.type);
    }
    
    res.json({
      success: true,
      message: 'CEG hostels seeded successfully',
      data: {
        totalHostels: createdHostels.length,
        boysHostels: CEG_HOSTELS_DATA.boys_hostels.length,
        girlsHostels: CEG_HOSTELS_DATA.girls_hostels.length,
        totalCapacity: createdHostels.reduce((sum, h) => sum + h.totalCapacity, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function to create CEG hostel with blocks and rooms
async function createCEGHostel(hostelData) {
  // Create hostel
  const hostel = new Hostel({
    name: hostelData.name,
    code: hostelData.name.replace(/\s+/g, '_').toUpperCase(),
    type: hostelData.type,
    totalBlocks: 1, // Each hostel is one block in CEG
    totalRooms: hostelData.rooms,
    totalCapacity: hostelData.capacity,
    location: hostelData.location,
    amenities: [
      'wifi', 'security', 'cctv', 'water_cooler', 'common_room',
      'study_hall', 'laundry', 'mess', 'medical_center'
    ],
    policies: {
      curfewTime: hostelData.type === 'girls' ? '21:30' : '23:00',
      visitorHours: {
        start: '09:00',
        end: hostelData.type === 'girls' ? '18:00' : '20:00'
      },
      quietHours: {
        start: '22:00',
        end: '06:00'
      },
      allowedItems: [
        'laptop', 'mobile_phone', 'books', 'clothes', 'personal_care'
      ],
      restrictedItems: [
        'alcohol', 'drugs', 'weapons', 'cooking_appliances', 'pets'
      ]
    },
    isActive: true
  });
  
  await hostel.save();
  
  // Create main block
  const block = new Block({
    name: `${hostelData.name} Main Block`,
    code: `${hostel.code}_MAIN`,
    hostelId: hostel._id,
    type: 'residential',
    totalFloors: hostelData.floors,
    totalRooms: hostelData.rooms,
    genderPolicy: hostelData.type === 'boys' ? 'male_only' : 'female_only',
    yearRestriction: ['first_year', 'second_year', 'third_year', 'final_year'],
    accessControl: {
      entryPoints: [{
        location: 'main_gate',
        hasQRScanner: true,
        hasRFIDReader: true,
        hasBiometric: false,
        operationalHours: {
          start: '05:00',
          end: '23:30'
        }
      }],
      securityLevel: 'medium'
    },
    isActive: true
  });
  
  // Generate floor configuration
  const roomsPerFloor = Math.ceil(hostelData.rooms / hostelData.floors);
  for (let floor = 0; floor < hostelData.floors; floor++) {
    const floorRoomsStart = floor * 100 + 1;
    const floorRoomsEnd = Math.min(floorRoomsStart + roomsPerFloor - 1, hostelData.rooms + (floor * 100));
    
    block.floors.push({
      floorNumber: floor,
      floorName: floor === 0 ? 'Ground Floor' : `${getOrdinal(floor)} Floor`,
      totalRooms: floorRoomsEnd - floorRoomsStart + 1,
      roomNumberRange: {
        start: floorRoomsStart,
        end: floorRoomsEnd
      },
      roomCapacity: 3, // Standard 3-person rooms
      amenities: ['common_bathroom', 'water_purifier'],
      accessibility: {
        hasElevator: hostelData.floors > 2,
        hasRamp: floor === 0,
        hasBrailleSignage: true
      }
    });
  }
  
  await block.save();
  
  // Generate rooms
  const rooms = [];
  for (const floor of block.floors) {
    for (let roomNum = floor.roomNumberRange.start; roomNum <= floor.roomNumberRange.end; roomNum++) {
      const room = new Room({
        roomNumber: roomNum.toString(),
        blockId: block._id,
        floorNumber: floor.floorNumber,
        capacity: 3,
        roomType: 'triple',
        amenities: {
          hasWiFi: true,
          hasStudyTable: true,
          hasWardrobe: true,
          hasAttachedBathroom: false, // Common bathrooms in CEG
          hasBalcony: Math.random() > 0.5, // Some rooms have balconies
          hasAC: false, // Most CEG rooms don't have AC
          hasFridge: false
        },
        accessibility: {
          isAccessible: floor.floorNumber === 0 && Math.random() > 0.9, // Few accessible rooms on ground floor
          hasHandrails: floor.floorNumber === 0,
          hasWideEntrance: false,
          hasAccessibleBathroom: false
        },
        status: 'available',
        rent: {
          baseRent: hostelData.type === 'girls' ? 4500 : 4000, // Girls hostels slightly more expensive
          utilityCharges: 500,
          totalRent: hostelData.type === 'girls' ? 5000 : 4500
        }
      });
      
      rooms.push(room);
    }
  }
  
  await Room.insertMany(rooms);
  
  // Update hostel with block reference
  hostel.totalBlocks = 1;
  await hostel.save();
  
  return hostel;
}

// Helper function to get ordinal numbers
function getOrdinal(n) {
  const ordinals = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth'];
  return ordinals[n] || `${n}th`;
}

// Helper function to create default accommodation policy
async function createDefaultAccommodationPolicy(hostelId, hostelType) {
  const policy = new AccommodationPolicy({
    hostelId,
    academicYear: '2025-26',
    allocationCycle: '2025-Admission',
    
    priorityOrder: [
      { factor: 'readmission', weight: 0.4, isActive: true },
      { factor: 'scholarship', weight: 0.2, isActive: true },
      { factor: 'distance_from_home', weight: 0.2, isActive: true },
      { factor: 'cgpa', weight: 0.1, isActive: true },
      { factor: 'special_needs', weight: 0.1, isActive: true }
    ],
    
    constraints: {
      genderStrictSeparation: true,
      yearWiseAllocation: false,
      departmentClustering: true,
      maxSeniorsPerRoom: 1,
      reservedRoomsForPWD: 2,
      reservedRoomsForInternational: 5,
      reservedRoomsForScholarship: 10
    },
    
    roomRules: {
      defaultCapacityPerRoom: 3,
      allowRoommatePref: true,
      maxRoommateRequests: 2,
      allowSingleOccupancy: {
        enabled: true,
        conditions: ['medical', 'special_needs'],
        additionalCharges: 2000
      },
      blockPreferences: {
        allowStudentChoice: true,
        maxPreferences: 3
      }
    },
    
    readmissionRules: {
      prioritizeOldRooms: true,
      allowRoomChange: true,
      changeRequestDeadline: new Date('2025-06-30'),
      gracePeriodForPayment: 15,
      minimumCGPARequired: 6.0
    },
    
    isActive: true
  });
  
  await policy.save();
  return policy;
}

// =====================
// AUTOMATED TASKS & JOBS
// =====================

// Schedule daily tasks
router.post('/schedule-tasks', async (req, res) => {
  try {
    // Daily tasks at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('Running daily automated tasks...');
      
      // 1. Send fee reminders
      await sendFeeReminders();
      
      // 2. Check expired access cards
      await checkExpiredAccessCards();
      
      // 3. Update leave request statuses
      await updateLeaveRequestStatuses();
      
      // 4. Generate daily reports
      await generateDailyReports();
      
      console.log('Daily tasks completed');
    });
    
    // Weekly tasks on Sunday at 3 AM
    cron.schedule('0 3 * * 0', async () => {
      console.log('Running weekly automated tasks...');
      
      // 1. Generate weekly accommodation reports
      await generateWeeklyReports();
      
      // 2. Clean up old complaint attachments
      await cleanupOldAttachments();
      
      // 3. Update room ratings based on feedback
      await updateRoomRatings();
      
      console.log('Weekly tasks completed');
    });
    
    res.json({
      success: true,
      message: 'Automated tasks scheduled successfully',
      scheduledTasks: [
        'Daily fee reminders (2 AM)',
        'Access card expiry checks (2 AM)',
        'Leave status updates (2 AM)',
        'Daily reports (2 AM)',
        'Weekly reports (Sunday 3 AM)',
        'Cleanup tasks (Sunday 3 AM)',
        'Room rating updates (Sunday 3 AM)'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Schedule a broadcast
router.post('/schedule-broadcast', async (req, res) => {
  try {
    const { target = { role: 'student' }, title, message, data, priority = 'normal', runAt } = req.body;
    if (!title || !message || !runAt) return res.status(400).json({ success: false, message: 'title, message, runAt required' });
    const sb = await ScheduledBroadcast.create({ creatorId: req.user?._id, target, title, message, data, priority, runAt: new Date(runAt) });
    res.status(201).json({ success: true, data: sb });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Cron to dispatch scheduled broadcasts every minute
cron.schedule('* * * * *', async () => {
  const due = await ScheduledBroadcast.find({ status: 'scheduled', runAt: { $lte: new Date() } });
  for (const job of due) {
    try {
      let userIds = [];
      if (job.target.role) {
        const User = require('../models/User');
        const users = await User.find({ role: job.target.role, isActive: true }).select('_id');
        userIds = users.map(u => u._id);
      }
      if (job.target.blockId) {
        const { Room } = require('../models/HostelInfrastructure');
        const rooms = await Room.find({ blockId: job.target.blockId }).select('occupants.studentId');
        const ids = rooms.flatMap(r => (r.occupants || []).map(o => o.studentId).filter(Boolean));
        userIds.push(...ids);
      }
      userIds = [...new Set(userIds.map(id => id.toString()))];
      await Promise.all(userIds.map(uid => sendNotification({ userId: uid, type: 'broadcast', title: job.title, message: job.message, data: job.data, priority: job.priority })));
      job.status = 'sent';
      await job.save();
    } catch (e) {
      console.error('Scheduled broadcast error:', e.message);
    }
  }
});

// Send fee payment reminders
async function sendFeeReminders() {
  try {
    const students = await Student.find({
      $or: [
        { 'hostelApplication.fees.hostelFeePaid': false },
        { 'hostelApplication.fees.messFeePaid': false }
      ]
    }).select('_id name regNo email phone hostelApplication.fees');
    
    for (const student of students) {
      const pendingFees = [];
      
      if (!student.hostelApplication?.fees?.hostelFeePaid) {
        pendingFees.push(`Hostel Fee: ₹${student.hostelApplication.fees.hostelFee || 4500}`);
      }
      
      if (!student.hostelApplication?.fees?.messFeePaid) {
        pendingFees.push(`Mess Fee: ₹${student.hostelApplication.fees.messFee || 3000}`);
      }
      
      if (pendingFees.length > 0) {
        await sendNotification({
          userId: student._id,
          type: 'fee_reminder',
          title: 'Fee Payment Reminder',
          message: `Dear ${student.name}, you have pending fees: ${pendingFees.join(', ')}. Please pay to avoid access restrictions.`,
          data: {
            pendingFees,
            totalAmount: (student.hostelApplication?.fees?.hostelFee || 0) + (student.hostelApplication?.fees?.messFee || 0)
          }
        });
      }
    }
    
    console.log(`Fee reminders sent to ${students.length} students`);
  } catch (error) {
    console.error('Error sending fee reminders:', error);
  }
}

// Check for expired access cards
async function checkExpiredAccessCards() {
  try {
    const expiredCards = await AccessCard.find({
      isActive: true,
      expiryDate: { $lte: new Date() }
    }).populate('studentId', 'name regNo email');
    
    for (const card of expiredCards) {
      // Deactivate expired card
      card.isActive = false;
      await card.save();
      
      // Send notification
      await sendNotification({
        userId: card.studentId._id,
        type: 'access_card_expired',
        title: 'Access Card Expired',
        message: `Your hostel access card has expired. Please contact the admin office to renew your card.`,
        data: {
          cardId: card.cardId,
          expiryDate: card.expiryDate
        }
      });
    }
    
    console.log(`${expiredCards.length} access cards deactivated due to expiry`);
  } catch (error) {
    console.error('Error checking expired access cards:', error);
  }
}

// Update leave request statuses
async function updateLeaveRequestStatuses() {
  try {
    // Mark overdue approved leaves as expired
    const overdueLeaves = await LeaveRequest.find({
      status: 'approved',
      toDate: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 1 day grace period
      'actualReturn.dateTime': { $exists: false }
    });
    
    for (const leave of overdueLeaves) {
      leave.status = 'expired';
      leave.extensions.push({
        reason: 'Auto-expired due to no return scan',
        requestedAt: new Date()
      });
      await leave.save();
      
      // Send notification
      await sendNotification({
        userId: leave.studentId,
        type: 'leave_expired',
        title: 'Leave Period Expired',
        message: 'Your approved leave period has expired. Please contact the warden if you have returned.',
        data: {
          leaveId: leave._id,
          toDate: leave.toDate
        }
      });
    }
    
    console.log(`${overdueLeaves.length} leave requests marked as expired`);
  } catch (error) {
    console.error('Error updating leave request statuses:', error);
  }
}

// Generate daily reports
async function generateDailyReports() {
  try {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    // Get daily statistics
    const dailyStats = {
      date: todayStart,
      occupancy: await Room.aggregate([
        {
          $group: {
            _id: null,
            totalRooms: { $sum: 1 },
            occupiedRooms: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
            totalCapacity: { $sum: '$capacity' },
            currentOccupancy: { $sum: '$currentOccupancy' }
          }
        }
      ]),
      complaints: {
        submitted: await Complaint.countDocuments({
          createdAt: { $gte: todayStart, $lte: todayEnd }
        }),
        resolved: await Complaint.countDocuments({
          'resolution.resolutionDate': { $gte: todayStart, $lte: todayEnd }
        })
      },
      leaveRequests: {
        submitted: await LeaveRequest.countDocuments({
          createdAt: { $gte: todayStart, $lte: todayEnd }
        }),
        approved: await LeaveRequest.countDocuments({
          'approvalWorkflow.actionDate': { $gte: todayStart, $lte: todayEnd },
          status: 'approved'
        })
      },
      accessLogs: await AccessCard.aggregate([
        { $unwind: '$usageLog' },
        {
          $match: {
            'usageLog.timestamp': { $gte: todayStart, $lte: todayEnd }
          }
        },
        {
          $group: {
            _id: '$usageLog.success',
            count: { $sum: 1 }
          }
        }
      ])
    };
    
    // Store daily report (you might want to create a DailyReport model)
    console.log('Daily report generated:', dailyStats);
    
  } catch (error) {
    console.error('Error generating daily reports:', error);
  }
}

// Generate weekly reports
async function generateWeeklyReports() {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    // Weekly accommodation analytics
    const weeklyStats = {
      period: { from: weekStart, to: new Date() },
      newAllocations: await Student.countDocuments({
        'hostelApplication.allocatedAt': { $gte: weekStart }
      }),
      completedComplaints: await Complaint.countDocuments({
        status: { $in: ['resolved', 'closed'] },
        'resolution.resolutionDate': { $gte: weekStart }
      }),
      averageResponseTime: await Complaint.aggregate([
        {
          $match: {
            status: { $in: ['resolved', 'closed'] },
            'resolution.resolutionDate': { $gte: weekStart }
          }
        },
        {
          $project: {
            responseTime: {
              $divide: [
                { $subtract: ['$resolution.resolutionDate', '$createdAt'] },
                1000 * 60 * 60 // Convert to hours
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' }
          }
        }
      ])
    };
    
    console.log('Weekly report generated:', weeklyStats);
  } catch (error) {
    console.error('Error generating weekly reports:', error);
  }
}

// Clean up old attachments
async function cleanupOldAttachments() {
  try {
    // Find complaints older than 1 year with attachments
    const oldComplaints = await Complaint.find({
      createdAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      status: { $in: ['resolved', 'closed'] },
      'attachments.0': { $exists: true }
    });
    
    // TODO: Implement file cleanup logic
    // This would involve deleting files from cloud storage (S3, etc.)
    
    console.log(`${oldComplaints.length} old complaint attachments marked for cleanup`);
  } catch (error) {
    console.error('Error cleaning up old attachments:', error);
  }
}

// Update room ratings based on feedback
async function updateRoomRatings() {
  try {
    const roomIds = await Room.distinct('_id');
    
    for (const roomId of roomIds) {
      // Get all complaints/feedback for this room
      const roomComplaints = await Complaint.find({
        'location.roomId': roomId,
        'resolution.satisfactionRating': { $exists: true }
      });
      
      if (roomComplaints.length > 0) {
        const avgRating = roomComplaints.reduce((sum, complaint) => 
          sum + complaint.resolution.satisfactionRating, 0
        ) / roomComplaints.length;
        
        await Room.findByIdAndUpdate(roomId, {
          'roomRating.averageRating': avgRating,
          'roomRating.totalReviews': roomComplaints.length
        });
      }
    }
    
    console.log(`Updated ratings for ${roomIds.length} rooms`);
  } catch (error) {
    console.error('Error updating room ratings:', error);
  }
}

// =====================
// UTILITY ENDPOINTS
// =====================

// Get system health status
router.get('/system-health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      database: {
        hostels: await Hostel.countDocuments(),
        blocks: await Block.countDocuments(),
        rooms: await Room.countDocuments(),
        students: await Student.countDocuments(),
        accessCards: await AccessCard.countDocuments(),
        complaints: await Complaint.countDocuments(),
        leaveRequests: await LeaveRequest.countDocuments()
      },
      occupancy: {
        totalRooms: await Room.countDocuments(),
        occupiedRooms: await Room.countDocuments({ status: 'occupied' }),
        availableRooms: await Room.countDocuments({ status: 'available' }),
        maintenanceRooms: await Room.countDocuments({ status: 'maintenance' })
      },
      activeIssues: {
        pendingComplaints: await Complaint.countDocuments({ status: { $in: ['submitted', 'acknowledged'] } }),
        pendingLeaves: await LeaveRequest.countDocuments({ status: 'pending' }),
        expiredCards: await AccessCard.countDocuments({ 
          isActive: true, 
          expiryDate: { $lte: new Date() } 
        })
      }
    };
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Export system data (Admin only)
router.get('/export-data', async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;
    
    let data;
    switch (type) {
      case 'hostels':
        data = await Hostel.find({}).populate('wardens.wardenId', 'name email');
        break;
      case 'students':
        data = await Student.find({}).select('-password -otp');
        break;
      case 'complaints':
        data = await Complaint.find({}).populate('complainantId', 'name regNo');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }
    
    if (format === 'csv') {
      // TODO: Implement CSV conversion
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}.csv`);
      res.send('CSV export not implemented yet');
    } else {
      res.json({
        success: true,
        data,
        exportedAt: new Date(),
        recordCount: data.length
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
