const mongoose = require('mongoose');
const User = require('./User');

// Student-specific schema
const studentSchema = new mongoose.Schema({
  // Basic contact (duplicated fields commonly used in routes)
  name: String,
  regNo: String,
  email: String,
  phone: String,
  department: String,
  year: Number,
  cgpaTopLevel: Number,
  // Academic Information
  academic: {
    registerNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    department: {
      type: String,
      required: true,
      enum: [
        'Computer Science Engineering',
        'Electronics & Communication Engineering', 
        'Electrical & Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Chemical Engineering',
        'Instrumentation Engineering',
        'Production Technology',
        'Information Technology',
        'Biotechnology',
        'Aerospace Engineering',
        'Naval Architecture',
        'Ocean Engineering',
        'Manufacturing Engineering'
      ]
    },
    program: {
      type: String,
      required: true,
      enum: ['UG', 'PG', 'PhD', 'M.Tech', 'M.E', 'MBA']
    },
    yearOfStudy: {
      type: Number,
      required: true,
      min: 1,
      max: 6
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10
    },
    admissionYear: {
      type: Number,
      required: true
    }
  },

  // Hostel Information
  hostelInfo: {
    currentAllocation: {
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
      roomNumber: String,
      allottedDate: Date,
      validTill: Date
    },
    allocationHistory: [{
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
      roomNumber: String,
      fromDate: Date,
      toDate: Date,
      reason: String
    }],
    preferences: {
      roommatePref1: String, // Register number
      roommatePref2: String,
      blockPreferences: [String],
      floorPreference: {
        min: Number,
        max: Number
      },
      specialRequirements: [{
        type: String,
        description: String
      }]
    }
  },

  // Application & Allocation used by routes
  hostelApplication: {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
    allocatedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  academicYear: { type: String },
    status: { type: String, enum: ['pending', 'allocated', 'rejected', 'waitlisted'], default: 'pending' },
    type: { type: String, enum: ['admission', 'readmission'], default: 'admission' },
    submittedAt: Date,
    allocatedAt: Date,
    fees: {
      hostelFee: Number,
      messFee: Number,
      securityDeposit: Number,
      hostelFeePaid: { type: Boolean, default: false },
      messFeePaid: { type: Boolean, default: false },
      securityDepositPaid: { type: Boolean, default: false },
      hostelFeeDueDate: Date,
      messFeeDueDate: Date,
      hostelFeeLastPaidDate: Date,
      messFeeLastPaidDate: Date
    }
  },

  // Access Control
  accessControl: {
    hostelQRCode: {
      qrId: String,
      qrData: String,
      isActive: Boolean,
      generatedAt: Date,
      lastScanned: Date
    },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess' },
    messAccess: {
      isEnabled: Boolean,
      planType: {
        type: String,
        enum: ['veg', 'non-veg', 'both', 'none'],
        default: 'veg'
      },
      validTill: Date
    },
    biometricId: String,
    rfidTag: String
  },

  // Financial Information
  financialInfo: {
    feesStructure: {
      hostelFee: Number,
      messFee: Number,
      cautionDeposit: Number,
      otherCharges: Number,
      totalFee: Number
    },
    paymentStatus: {
      hostelFeePaid: {
        type: Boolean,
        default: false
      },
      messFeePaid: {
        type: Boolean,
        default: false
      },
      cautionDepositPaid: {
        type: Boolean,
        default: false
      },
      lastPaymentDate: Date,
      nextDueDate: Date
    },
    scholarship: {
      hasScholarship: {
        type: Boolean,
        default: false
      },
      scholarshipType: String,
      scholarshipAmount: Number,
      priorityBoost: {
        type: Number,
        default: 0
      }
    }
  },

  // Parent/Guardian Information
  guardianInfo: {
    fatherName: String,
    motherName: String,
    guardianName: String,
    guardianRelation: String,
    guardianPhone: String,
    guardianEmail: String,
    parentAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      distanceFromCollegeKm: Number
    }
  },

  // Documents
  documents: [{
    type: {
      type: String,
      enum: [
        'admission_letter',
        'id_proof',
        'address_proof',
        'photo',
        'medical_certificate',
        'no_dues_certificate',
        'transfer_certificate',
        'income_certificate',
        'caste_certificate'
      ]
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    isVerified: {
      type: Boolean,
      default: false
    }
  }],

  // Application Status
  applicationStatus: {
    admissionStatus: {
      type: String,
      enum: ['applied', 'under_review', 'approved', 'rejected', 'waitlisted'],
      default: 'applied'
    },
    admissionCycle: String,
    appliedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Attendance & Activity
  attendanceLog: [{
    date: Date,
    entryTime: Date,
    exitTime: Date,
    gateScanned: String,
    attendanceType: {
      type: String,
      enum: ['present', 'absent', 'late', 'on_leave']
    }
  }],

  // Payment history used by payments routes
  paymentHistory: [{
    orderId: String,
    paymentId: String,
    feeType: String,
    amount: Number,
    status: String,
    paidAt: Date,
    method: String,
    gateway: String,
    transactionDetails: mongoose.Schema.Types.Mixed
  }],

  // Simple preferences used by student portal
  preferences: {
    blockChoice: [String],
    floorRange: [Number],
    roommateRegNos: [String]
  },

  // Special Categories
  specialCategories: {
    isPWD: {
      type: Boolean,
      default: false
    },
    isInternational: {
      type: Boolean,
      default: false
    },
    nationality: {
      type: String,
      default: 'Indian'
    },
    medicalConditions: [String],
    dietaryRequirements: [String]
  }
});

// Optional: change requests for room/mess
studentSchema.add({
  changeRequests: [{
    type: { type: String, enum: ['room', 'mess'] },
    requestedAt: Date,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    details: mongoose.Schema.Types.Mixed,
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
});

// Indexes for Student
studentSchema.index({ 'academic.registerNumber': 1 });
studentSchema.index({ 'academic.department': 1 });
studentSchema.index({ 'academic.yearOfStudy': 1 });
studentSchema.index({ 'hostelInfo.currentAllocation.blockId': 1 });
studentSchema.index({ 'accessControl.hostelQRCode.qrId': 1 });
studentSchema.index({ 'applicationStatus.admissionStatus': 1 });

// Virtual for room details
studentSchema.virtual('currentRoomDetails', {
  ref: 'Room',
  localField: 'hostelInfo.currentAllocation.roomId',
  foreignField: '_id',
  justOne: true
});

// Sync top-level mirrors from academic before save
studentSchema.pre('save', function(next) {
  try {
    this.name = this.name || `${this.personalInfo?.firstName || ''} ${this.personalInfo?.lastName || ''}`.trim();
    this.regNo = this.academic?.registerNumber || this.regNo;
    this.department = this.academic?.department || this.department;
    this.year = this.academic?.yearOfStudy || this.year;
    this.cgpaTopLevel = this.academic?.cgpa || this.cgpaTopLevel;
    next();
  } catch (e) { next(e); }
});

// Create Student model using discriminator
const Student = User.discriminator('Student', studentSchema);

module.exports = Student;
