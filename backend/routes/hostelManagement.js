const express = require('express');
const router = express.Router();
const {
  Hostel, Block, Room, Mess, AccommodationPolicy,
  LeaveRequest, Complaint, AccessCard
} = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// =====================
// HOSTEL MANAGEMENT APIS
// =====================

// Get all hostels with detailed stats
router.get('/hostels', authenticateToken, async (req, res) => {
  try {
    const hostels = await Hostel.find({ isActive: true })
      .populate('wardens.wardenId', 'name email phone')
      .populate('messBuildings')
      .lean();

    // Add occupancy stats
    const hostelStats = await Promise.all(
      hostels.map(async (hostel) => {
        const blocks = await Block.find({ hostelId: hostel._id, isActive: true });
        const totalRooms = await Room.countDocuments({ 
          blockId: { $in: blocks.map(b => b._id) } 
        });
        const occupiedRooms = await Room.countDocuments({ 
          blockId: { $in: blocks.map(b => b._id) },
          status: 'occupied'
        });
        
        return {
          ...hostel,
          blocks: blocks.length,
          totalRooms,
          occupiedRooms,
          occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms * 100).toFixed(1) : 0
        };
      })
    );

    res.json({
      success: true,
      data: hostelStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create new hostel with blocks and rooms
router.post('/hostels', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const hostelData = req.body;
    
    // Create hostel
    const hostel = new Hostel(hostelData);
    await hostel.save();
    
    res.status(201).json({
      success: true,
      data: hostel,
      message: 'Hostel created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// BLOCK MANAGEMENT APIS
// =====================

// Get blocks for a hostel with room details
router.get('/hostels/:hostelId/blocks', authenticateToken, async (req, res) => {
  try {
    const { hostelId } = req.params;
    
    const blocks = await Block.find({ hostelId, isActive: true })
      .populate('wardens.wardenId', 'name email phone')
      .lean();
    
    // Add room statistics for each block
    const blocksWithStats = await Promise.all(
      blocks.map(async (block) => {
        const rooms = await Room.find({ blockId: block._id });
        const totalRooms = rooms.length;
        const availableRooms = rooms.filter(r => r.status === 'available').length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
        
        const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
        const currentOccupancy = rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);
        
        return {
          ...block,
          roomStats: {
            totalRooms,
            availableRooms,
            occupiedRooms,
            maintenanceRooms,
            totalCapacity,
            currentOccupancy,
            occupancyRate: totalCapacity > 0 ? (currentOccupancy / totalCapacity * 100).toFixed(1) : 0
          }
        };
      })
    );
    
    res.json({
      success: true,
      data: blocksWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create block and auto-generate rooms
router.post('/hostels/:hostelId/blocks', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const { hostelId } = req.params;
    const blockData = { ...req.body, hostelId };
    
    // Create block
    const block = new Block(blockData);
    await block.save();
    
    // Auto-generate rooms based on floor configuration
    const rooms = [];
    for (const floor of block.floors) {
      for (let roomNum = floor.roomNumberRange.start; roomNum <= floor.roomNumberRange.end; roomNum++) {
        const room = new Room({
          roomNumber: roomNum.toString(),
          blockId: block._id,
          floorNumber: floor.floorNumber,
          capacity: floor.roomCapacity || 3,
          roomType: floor.roomCapacity === 1 ? 'single' : floor.roomCapacity === 2 ? 'double' : 'triple',
          amenities: {
            hasWiFi: true,
            hasStudyTable: true,
            hasWardrobe: true,
            hasAttachedBathroom: blockData.hasAttachedBathrooms || false,
            hasAC: blockData.hasAC || false
          }
        });
        rooms.push(room);
      }
    }
    
    await Room.insertMany(rooms);
    
    res.status(201).json({
      success: true,
      data: { block, roomsGenerated: rooms.length },
      message: `Block created successfully with ${rooms.length} rooms`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// ROOM MANAGEMENT APIS
// =====================

// Get rooms with filters and pagination
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const {
      blockId,
      floorNumber,
      status,
      capacity,
      available,
      page = 1,
      limit = 20,
      sortBy = 'roomNumber'
    } = req.query;
    
    // Build filter
    const filter = {};
    if (blockId) filter.blockId = blockId;
    if (floorNumber) filter.floorNumber = parseInt(floorNumber);
    if (status) filter.status = status;
    if (capacity) filter.capacity = parseInt(capacity);
    if (available === 'true') {
      filter.status = 'available';
      filter.$expr = { $lt: ['$currentOccupancy', '$capacity'] };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rooms = await Room.find(filter)
      .populate('blockId', 'name code hostelId')
      .populate('occupants.studentId', 'name regNo email phone')
      .sort({ [sortBy]: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalRooms = await Room.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRooms / parseInt(limit)),
          totalRooms,
          hasNextPage: skip + rooms.length < totalRooms,
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
// ADVANCED ROOM ALLOCATION SYSTEM
// =====================

// Automatic room allocation with priority-based algorithm
router.post('/allocation/auto-allocate', authenticateToken, authorizeRoles(['admin', 'super_admin']), async (req, res) => {
  try {
    const {
      hostelId,
      cycleId,
      allocationBatch, // 'admission', 'readmission'
      dryRun = true
    } = req.body;
    
    // Get accommodation policy
    const policy = await AccommodationPolicy.findOne({ 
      hostelId, 
      isActive: true 
    });
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'No accommodation policy found for this hostel'
      });
    }
    
    // Get pending applications
    const applications = await Student.find({
      'hostelApplication.hostelId': hostelId,
      'hostelApplication.status': 'pending',
      'hostelApplication.type': allocationBatch
    }).sort({ 'hostelApplication.submittedAt': 1 });
    
    // Get available rooms
    const availableRooms = await Room.find({
      status: 'available',
      $expr: { $lt: ['$currentOccupancy', '$capacity'] }
    }).populate('blockId');
    
    // Run allocation algorithm
    const allocationResults = await runAllocationAlgorithm(
      applications,
      availableRooms,
      policy,
      dryRun
    );
    
    if (!dryRun) {
      // Commit allocations to database
      await commitAllocations(allocationResults.allocations);
    }
    
    res.json({
      success: true,
      data: {
        processed: applications.length,
        allocated: allocationResults.allocations.length,
        waitlisted: allocationResults.waitlist.length,
        conflicts: allocationResults.conflicts,
        dryRun
      },
      allocations: allocationResults.allocations,
      waitlist: allocationResults.waitlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Advanced allocation algorithm
async function runAllocationAlgorithm(applications, availableRooms, policy, dryRun = true) {
  const allocations = [];
  const waitlist = [];
  const conflicts = [];
  
  // Calculate priority scores for each application
  const scoredApplications = applications.map(app => ({
    ...app.toObject(),
    priorityScore: calculatePriorityScore(app, policy)
  }));
  
  // Sort by priority score (descending)
  scoredApplications.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Room allocation tracking
  const roomOccupancy = new Map();
  availableRooms.forEach(room => {
    roomOccupancy.set(room._id.toString(), {
      ...room.toObject(),
      allocatedSpots: room.currentOccupancy
    });
  });
  
  for (const application of scoredApplications) {
    const eligibleRooms = findEligibleRooms(
      application,
      Array.from(roomOccupancy.values()),
      policy
    );
    
    if (eligibleRooms.length === 0) {
      waitlist.push({
        studentId: application._id,
        reason: 'No eligible rooms available',
        priorityScore: application.priorityScore
      });
      continue;
    }
    
    // Score rooms for this student
    const roomScores = eligibleRooms.map(room => ({
      room,
      score: calculateRoomScore(application, room, policy)
    }));
    
    // Sort by score (descending)
    roomScores.sort((a, b) => b.score - a.score);
    
    // Allocate to best room
    const bestRoom = roomScores[0].room;
    const roomKey = bestRoom._id.toString();
    
    if (roomOccupancy.get(roomKey).allocatedSpots < bestRoom.capacity) {
      allocations.push({
        studentId: application._id,
        roomId: bestRoom._id,
        blockId: bestRoom.blockId._id,
        bedNumber: roomOccupancy.get(roomKey).allocatedSpots + 1,
        priorityScore: application.priorityScore,
        roomScore: roomScores[0].score,
        allocationReason: 'Auto-allocated based on priority and preferences'
      });
      
      // Update room occupancy
      const updatedRoom = roomOccupancy.get(roomKey);
      updatedRoom.allocatedSpots += 1;
      roomOccupancy.set(roomKey, updatedRoom);
    } else {
      waitlist.push({
        studentId: application._id,
        reason: 'Best room became full during allocation',
        priorityScore: application.priorityScore
      });
    }
  }
  
  return { allocations, waitlist, conflicts };
}

// Calculate priority score based on policy
function calculatePriorityScore(application, policy) {
  let score = 0;
  
  for (const priority of policy.priorityOrder) {
    if (!priority.isActive) continue;
    
    let factorScore = 0;
    
    switch (priority.factor) {
      case 'readmission':
        factorScore = application.hostelApplication.type === 'readmission' ? 1 : 0;
        break;
      case 'scholarship':
        factorScore = application.scholarship ? 0.8 : 0;
        break;
      case 'distance_from_home':
        factorScore = Math.min(application.distanceFromHomeKm / 1000, 1); // Normalize to 0-1
        break;
      case 'cgpa':
        factorScore = Math.min(application.cgpa / 10, 1); // Normalize to 0-1
        break;
      case 'special_needs':
        factorScore = application.specialNeeds?.accessibleRoom ? 1 : 0;
        break;
      default:
        factorScore = 0;
    }
    
    score += factorScore * priority.weight;
  }
  
  return score;
}

// Find eligible rooms based on constraints
function findEligibleRooms(application, rooms, policy) {
  return rooms.filter(room => {
    // Gender policy check
    if (policy.constraints.genderStrictSeparation) {
      if (room.blockId.genderPolicy === 'male_only' && application.gender !== 'male') return false;
      if (room.blockId.genderPolicy === 'female_only' && application.gender !== 'female') return false;
    }
    
    // Accessibility check
    if (application.specialNeeds?.accessibleRoom && !room.accessibility?.isAccessible) {
      return false;
    }
    
    // Room availability check
    if (room.allocatedSpots >= room.capacity) return false;
    
    // Room status check
    if (room.status !== 'available') return false;
    
    return true;
  });
}

// Calculate room score for a student
function calculateRoomScore(application, room, policy) {
  let score = 0;
  
  // Block preference matching
  if (application.preferences?.blockChoice?.includes(room.blockId.code)) {
    score += 0.3;
  }
  
  // Floor preference matching
  if (application.preferences?.floorRange) {
    const [minFloor, maxFloor] = application.preferences.floorRange;
    if (room.floorNumber >= minFloor && room.floorNumber <= maxFloor) {
      score += 0.2;
    }
  }
  
  // Roommate preference (if any current occupants are in preference list)
  if (application.preferences?.roommateRegNos?.length > 0) {
    const currentOccupants = room.occupants || [];
    const hasPreferredRoommate = currentOccupants.some(occupant => 
      application.preferences.roommateRegNos.includes(occupant.studentId.regNo)
    );
    if (hasPreferredRoommate) score += 0.4;
  }
  
  // Room amenities score
  if (room.amenities?.hasAC) score += 0.1;
  if (room.amenities?.hasAttachedBathroom) score += 0.1;
  if (room.amenities?.hasBalcony) score += 0.05;
  
  return score;
}

// Commit allocations to database
async function commitAllocations(allocations) {
  for (const allocation of allocations) {
    // Update room occupancy
    await Room.findByIdAndUpdate(allocation.roomId, {
      $push: {
        occupants: {
          studentId: allocation.studentId,
          bedNumber: allocation.bedNumber,
          occupiedFrom: new Date(),
          isActive: true
        }
      },
      $inc: { currentOccupancy: 1 },
      status: 'occupied'
    });
    
    // Update student application status
    await Student.findByIdAndUpdate(allocation.studentId, {
      'hostelApplication.status': 'allocated',
      'hostelApplication.allocatedRoom': allocation.roomId,
      'hostelApplication.allocatedAt': new Date()
    });
    
    // Generate access card
    await generateAccessCard(allocation.studentId, allocation.roomId);
  }
}

// =====================
// ACCESS CARD MANAGEMENT
// =====================

// Generate QR/RFID access card
async function generateAccessCard(studentId, roomId) {
  const student = await Student.findById(studentId);
  const room = await Room.findById(roomId).populate('blockId');
  
  const cardId = `AC-${student.regNo}-${Date.now()}`;
  
  const qrData = {
    cardId,
    studentId: student._id,
    regNo: student.regNo,
    hostelId: room.blockId.hostelId,
    blockId: room.blockId._id,
    roomId: room._id,
    validFrom: new Date(),
    validTill: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    signature: generateSecureSignature(cardId, student.regNo)
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
        isEnabled: false, // Will be enabled after mess fee payment
        validFrom: new Date(),
        validTill: qrData.validTill
      }
    ],
    isActive: true,
    issueDate: new Date(),
    expiryDate: qrData.validTill
  });
  
  await accessCard.save();
  return accessCard;
}

// Generate secure signature for QR codes
function generateSecureSignature(cardId, regNo) {
  const crypto = require('crypto');
  const secret = process.env.QR_SIGNATURE_SECRET || 'default-secret-key';
  return crypto.createHmac('sha256', secret)
    .update(`${cardId}-${regNo}`)
    .digest('hex');
}

module.exports = router;
