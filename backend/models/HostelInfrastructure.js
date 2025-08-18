const mongoose = require('mongoose');

// Hostel Infrastructure Schema
const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['boys', 'girls', 'mixed'],
    required: true
  },
  totalBlocks: {
    type: Number,
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  totalCapacity: {
    type: Number,
    required: true
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    landmark: String
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  amenities: [{
    type: String,
    enum: [
      'wifi', 'gym', 'library', 'medical_center', 'mess', 
      'laundry', 'common_room', 'study_hall', 'parking',
      'security', 'cctv', 'fire_safety', 'elevator',
      'water_cooler', 'generator', 'solar_power'
    ]
  }],
  policies: {
    curfewTime: String, // "22:00"
    visitorHours: {
      start: String,
      end: String
    },
    quietHours: {
      start: String,
      end: String
    },
    allowedItems: [String],
    restrictedItems: [String]
  },
  wardens: [{
    wardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  role: { type: String, enum: ['warden', 'executive_warden', 'deputy_warden'], default: 'warden' },
    isPrimary: Boolean,
    assignedDate: Date,
    contactNumber: String
  }],
  messBuildings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maintenanceSchedule: [{
    type: String,
    description: String,
    scheduledDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'scheduled'
    }
  }]
}, {
  timestamps: true
});

// Block Schema with detailed floor and room management
const blockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  type: {
    type: String,
    enum: ['residential', 'mess', 'admin', 'common'],
    default: 'residential'
  },
  totalFloors: {
    type: Number,
    required: true
  },
  floors: [{
    floorNumber: Number,
    floorName: String, // "Ground Floor", "First Floor"
    totalRooms: Number,
    roomNumberRange: {
      start: Number, // 101
      end: Number    // 140
    },
    roomCapacity: {
      type: Number,
      default: 3
    },
    amenities: [{
      type: String,
      enum: [
        'common_bathroom', 'study_room', 'tv_room',
        'kitchen', 'water_purifier', 'vending_machine'
      ]
    }],
    accessibility: {
      hasElevator: Boolean,
      hasRamp: Boolean,
      hasBrailleSignage: Boolean
    },
    specialDesignation: {
      type: String,
      enum: ['quiet_floor', 'senior_floor', 'international_students', 'reserved'],
      default: null
    }
  }],
  totalRooms: {
    type: Number,
    required: true
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  genderPolicy: {
    type: String,
    enum: ['male_only', 'female_only', 'mixed'],
    required: true
  },
  // Attendance settings per block
  attendanceSettings: {
    enabled: { type: Boolean, default: false },
    geofence: {
      center: {
        lat: { type: Number },
        lng: { type: Number }
      },
      radiusMeters: { type: Number, default: 100 }
    },
    timeWindows: [{
      label: String, // e.g., "Morning Attendance"
      daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sun
      startTime: String, // "HH:mm"
      endTime: String,   // "HH:mm"
      scope: { type: String, default: 'hostel_entry' }
    }]
  },
  yearRestriction: [{
    type: String,
    enum: ['first_year', 'second_year', 'third_year', 'final_year', 'pg', 'phd']
  }],
  departmentPreference: [String], // For same department clustering
  wardens: [{
    wardenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  role: { type: String, enum: ['warden', 'executive_warden', 'deputy_warden'], default: 'warden' },
    isPrimary: Boolean,
    floors: [Number] // Which floors this warden manages
  }],
  maintenanceStaff: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    specialization: String
  }],
  accessControl: {
    entryPoints: [{
      location: String,
      hasQRScanner: Boolean,
      hasRFIDReader: Boolean,
      hasBiometric: Boolean,
      operationalHours: {
        start: String,
        end: String
      }
    }],
    securityLevel: {
      type: String,
      enum: ['basic', 'medium', 'high'],
      default: 'medium'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Advanced Room Schema with IoT integration
const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  occupants: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    bedNumber: Number,
    occupiedFrom: Date,
    occupiedTill: Date,
    isActive: Boolean
  }],
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple', 'quad', 'suite'],
    required: true
  },
  usageType: { type: String, enum: ['residential', 'office', 'facility'], default: 'residential' },
  facilityType: { type: String },
  amenities: {
    hasAC: Boolean,
    hasAttachedBathroom: Boolean,
    hasBalcony: Boolean,
    hasStudyTable: Boolean,
    hasWardrobe: Boolean,
    hasWiFi: Boolean,
    hasHeater: Boolean,
    hasFridge: Boolean
  },
  accessibility: {
    isAccessible: Boolean,
    hasHandrails: Boolean,
    hasWideEntrance: Boolean,
    hasAccessibleBathroom: Boolean
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'reserved', 'blocked'],
    default: 'available'
  },
  reservedFor: {
    category: String, // 'scholarship', 'international', 'senior'
    reservedTill: Date
  },
  maintenanceLog: [{
    issueType: String,
    description: String,
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedDate: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['reported', 'assigned', 'in_progress', 'completed'],
      default: 'reported'
    },
    completedDate: Date,
    cost: Number,
    notes: String
  }],
  // IoT Integration
  iotDevices: [{
    deviceType: {
      type: String,
      enum: ['door_sensor', 'motion_sensor', 'temperature_sensor', 'energy_meter']
    },
    deviceId: String,
    isActive: Boolean,
    lastSeen: Date,
    batteryLevel: Number
  }],
  energyConsumption: [{
    date: Date,
    electricityUnits: Number,
    waterUnits: Number,
    cost: Number
  }],
  roomRating: {
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  tags: [String], // ['quiet', 'study_friendly', 'senior_preferred']
  rent: {
    baseRent: Number,
    utilityCharges: Number,
    totalRent: Number
  }
}, {
  timestamps: true
});

// Advanced Mess Schema with complete management
const messSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  location: {
    buildingName: String,
    floor: Number,
    latitude: Number,
    longitude: Number
  },
  capacity: {
    breakfast: Number,
    lunch: Number,
    dinner: Number,
    totalSeats: Number
  },
  operationalHours: {
    breakfast: {
      start: String,
      end: String
    },
    lunch: {
      start: String,
      end: String
    },
    dinner: {
      start: String,
      end: String
    }
  },
  menuManagement: {
    currentWeekMenu: [{
      day: String,
      meals: {
        breakfast: [String],
        lunch: [String],
        dinner: [String]
      },
      specialItems: [String],
      nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
      }
    }],
    dietaryOptions: {
      vegetarian: Boolean,
      nonVegetarian: Boolean,
      vegan: Boolean,
      jain: Boolean,
      glutenFree: Boolean
    }
  },
  pricing: {
    monthlyPlan: {
      vegetarian: Number,
      nonVegetarian: Number,
      mixed: Number
    },
    dailyRates: {
      breakfast: Number,
      lunch: Number,
      dinner: Number
    },
    specialMealCharges: Number
  },
  vendor: {
    name: String,
    contactPerson: String,
    phoneNumber: String,
    email: String,
    contractStartDate: Date,
    contractEndDate: Date,
    rating: Number
  },
  linkedDepartments: [String],
  staff: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'cook', 'server', 'cleaner', 'supervisor']
    },
    shift: String
  }],
  accessControl: {
    requiresQRScan: Boolean,
    requiresFeePaid: Boolean,
    allowsGuests: Boolean,
    guestCharges: Number,
    scannerLocations: [String]
  },
  feedback: {
    averageRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    totalReviews: Number,
    monthlyStats: [{
      month: String,
      year: Number,
      avgRating: Number,
      totalReviews: Number,
      categories: {
        foodQuality: Number,
        service: Number,
        cleanliness: Number,
        variety: Number
      }
    }]
  },
  attendance: [{
    date: Date,
    mealType: String,
    totalCount: Number,
    studentBreakdown: [{
      hostelId: String,
      count: Number
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Accommodation Policies Schema for advanced room allocation
const accommodationPolicySchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  academicYear: String,
  allocationCycle: String, // "2025-Admission", "2025-Readmission"
  
  // Priority Configuration
  priorityOrder: [{
    factor: {
      type: String,
      enum: [
        'readmission', 'scholarship', 'distance_from_home', 
        'cgpa', 'year_of_study', 'department', 'special_needs',
        'sports_quota', 'cultural_quota', 'economically_weaker'
      ]
    },
    weight: {
      type: Number,
      min: 0,
      max: 1
    },
    isActive: Boolean
  }],
  
  // Hard Constraints
  constraints: {
    genderStrictSeparation: Boolean,
    yearWiseAllocation: Boolean,
    departmentClustering: Boolean,
    maxSeniorsPerRoom: Number,
    reservedRoomsForPWD: Number,
    reservedRoomsForInternational: Number,
    reservedRoomsForScholarship: Number
  },
  
  // Room Allocation Rules
  roomRules: {
    defaultCapacityPerRoom: Number,
    allowRoommatePref: Boolean,
    maxRoommateRequests: Number,
    allowSingleOccupancy: {
      enabled: Boolean,
      conditions: [String], // ['medical', 'senior', 'special_needs']
      additionalCharges: Number
    },
    blockPreferences: {
      allowStudentChoice: Boolean,
      maxPreferences: Number
    }
  },
  
  // Re-admission Policies
  readmissionRules: {
    prioritizeOldRooms: Boolean,
    allowRoomChange: Boolean,
    changeRequestDeadline: Date,
    gracePeriodForPayment: Number, // days
    minimumCGPARequired: Number
  },
  
  // Blackout Periods
  blackoutWindows: [{
    startDate: Date,
    endDate: Date,
    reason: String,
    allowedOperations: [String] // ['emergency_allocation', 'maintenance_moves']
  }],
  
  // Custom Rules
  customRules: [{
    ruleId: String,
    ruleName: String,
    condition: String, // JSON string of conditions
    action: String,    // JSON string of actions
    isActive: Boolean
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Advanced Leave Management Schema
const leaveRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  leaveType: {
    type: String,
    enum: [
      'home_visit', 'medical', 'academic', 'personal', 
      'emergency', 'vacation', 'internship', 'other'
    ],
    required: true
  },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  destination: {
    address: String,
    city: String,
    state: String,
    contactNumber: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  supportingDocuments: [{
    documentType: String,
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired'],
    default: 'pending'
  },
  approvalWorkflow: [{
    approverType: String, // 'warden', 'admin', 'medical_officer'
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String, // 'approved', 'rejected', 'forwarded'
    comments: String,
    actionDate: Date
  }],
  actualDeparture: {
    dateTime: Date,
    gateExitLog: {
      scannedBy: String,
      deviceId: String
    }
  },
  actualReturn: {
    dateTime: Date,
    gateEntryLog: {
      scannedBy: String,
      deviceId: String
    },
    lateReturn: {
      isLate: Boolean,
      minutesLate: Number,
      fineAmount: Number
    }
  },
  extensions: [{
    requestedTill: Date,
    reason: String,
    requestedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: String
  }],
  isRecurring: Boolean,
  recurringPattern: {
    frequency: String, // 'weekly', 'monthly'
    daysOfWeek: [Number], // For weekly: [1, 3, 5] (Mon, Wed, Fri)
    endDate: Date
  }
}, {
  timestamps: true
});

// Comprehensive Complaint Management Schema
const complaintSchema = new mongoose.Schema({
  complainantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complainantType: {
    type: String,
    enum: ['student', 'warden', 'staff', 'visitor'],
    required: true
  },
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    enum: [
      'electrical', 'plumbing', 'carpentry', 'cleaning', 'internet',
      'security', 'mess_food', 'mess_service', 'room_maintenance',
      'common_area', 'harassment', 'noise', 'theft', 'other'
    ],
    required: true
  },
  subCategory: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  location: {
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel'
    },
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block'
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    specificLocation: String
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: [
      'submitted', 'acknowledged', 'assigned', 'in_progress', 
      'resolved', 'closed', 'reopened', 'cancelled'
    ],
    default: 'submitted'
  },
  assignedTo: [{
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    assignedAt: Date,
    estimatedCompletion: Date
  }],
  workLog: [{
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: String,
    description: String,
    timeSpent: Number, // in minutes
    materialsUsed: [String],
    cost: Number,
    timestamp: Date,
    photos: [String]
  }],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionDate: Date,
    resolutionDescription: String,
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  escalation: {
    escalatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalationLevel: Number,
    escalationDate: Date,
    escalationReason: String
  },
  slaMetrics: {
    responseTime: Number, // hours
    resolutionTime: Number, // hours
    targetResponseTime: Number,
    targetResolutionTime: Number,
    slaBreached: Boolean
  }
}, {
  timestamps: true
});

// Advanced Access Control & QR Management Schema
const accessCardSchema = new mongoose.Schema({
  cardId: {
    type: String,
    unique: true,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  qrCode: {
    data: String,
    imageUrl: String,
    generatedAt: Date,
    expiresAt: Date
  },
  rfidTag: {
    tagId: String,
    isActive: Boolean,
    lastSeen: Date
  },
  biometricData: {
    fingerprintHash: String,
    faceIdHash: String,
    enrolledAt: Date
  },
  accessScopes: [{
    scope: {
      type: String,
      enum: [
        'hostel_entry', 'hostel_exit', 'mess_entry', 'library_access',
        'gym_access', 'common_room', 'study_hall', 'laundry'
      ]
    },
    isEnabled: Boolean,
    validFrom: Date,
    validTill: Date,
    restrictions: {
      timeSlots: [{
        startTime: String,
        endTime: String,
        daysOfWeek: [Number]
      }],
      maxUsagePerDay: Number
    }
  }],
  paymentLinked: {
    hostelFeePaid: Boolean,
    messFeePaid: Boolean,
    lastPaymentDate: Date,
    nextDueDate: Date
  },
  usageLog: [{
    timestamp: Date,
    accessPoint: String,
    scannerType: String, // 'qr', 'rfid', 'biometric'
    action: String, // 'entry', 'exit', 'denied'
    location: {
      hostelId: String,
      blockId: String,
      gate: String
    },
    deviceId: String,
    success: Boolean,
    failureReason: String
  }],
  securitySettings: {
    maxFailedAttempts: Number,
    lockoutDuration: Number, // minutes
    currentFailedAttempts: Number,
    lockedTill: Date,
    requiresPinVerification: Boolean,
    pinHash: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  issueDate: Date,
  expiryDate: Date,
  printedBatches: [{
    batchId: String,
    printedAt: Date,
    printedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true
});

// Create indexes for performance
hostelSchema.index({ code: 1 });
hostelSchema.index({ type: 1 });
hostelSchema.index({ isActive: 1 });

blockSchema.index({ hostelId: 1 });
blockSchema.index({ code: 1 });
blockSchema.index({ genderPolicy: 1 });

roomSchema.index({ blockId: 1 });
roomSchema.index({ roomNumber: 1, blockId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ 'occupants.studentId': 1 });

messSchema.index({ hostelId: 1 });
messSchema.index({ code: 1 });
messSchema.index({ isActive: 1 });

accommodationPolicySchema.index({ hostelId: 1, academicYear: 1 });

leaveRequestSchema.index({ studentId: 1 });
leaveRequestSchema.index({ status: 1 });
leaveRequestSchema.index({ fromDate: 1, toDate: 1 });

complaintSchema.index({ complainantId: 1 });
complaintSchema.index({ ticketId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });

accessCardSchema.index({ cardId: 1 });
accessCardSchema.index({ studentId: 1 });
accessCardSchema.index({ 'qrCode.data': 1 });
accessCardSchema.index({ 'rfidTag.tagId': 1 });
accessCardSchema.index({ isActive: 1 });

// Export models
module.exports = {
  Hostel: mongoose.model('Hostel', hostelSchema),
  Block: mongoose.model('Block', blockSchema),
  Room: mongoose.model('Room', roomSchema),
  Mess: mongoose.model('Mess', messSchema),
  AccommodationPolicy: mongoose.model('AccommodationPolicy', accommodationPolicySchema),
  LeaveRequest: mongoose.model('LeaveRequest', leaveRequestSchema),
  Complaint: mongoose.model('Complaint', complaintSchema),
  AccessCard: mongoose.model('AccessCard', accessCardSchema)
};
