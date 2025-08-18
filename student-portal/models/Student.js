const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Basic Information
  registerNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^[0-9]{10}$/, 'Register number must be 10 digits']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  
  // Academic Information
  department: {
    type: String,
    required: true,
    enum: [
      'Computer Science and Engineering',
      'Electronics and Communication Engineering', 
      'Electrical and Electronics Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Production Technology',
      'Instrumentation Engineering',
      'Aerospace Engineering',
      'Mining Engineering',
      'Textile Technology',
      'Leather Technology',
      'Manufacturing Engineering',
      'Industrial Engineering'
    ]
  },
  batch: {
    type: String,
    required: true,
    match: [/^[0-9]{4}-[0-9]{4}$/, 'Batch format: YYYY-YYYY']
  },
  currentYear: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  currentSemester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },

  // Address Information
  permanentAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  distanceFromHome: {
    type: Number, // in kilometers
    min: 0
  },

  // Guardian Information
  guardianName: {
    type: String,
    required: true
  },
  guardianPhone: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Guardian phone must be 10 digits']
  },
  guardianRelation: {
    type: String,
    required: true,
    enum: ['Father', 'Mother', 'Guardian', 'Other']
  },

  // Hostel Information
  hostelInfo: {
    currentAllocation: {
      hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
      blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
      roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
      roomNumber: String,
      floorNumber: Number,
      bedNumber: Number,
      allocationDate: Date,
      expiryDate: Date
    },
    allocationHistory: [{
      hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
      blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
      roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
      roomNumber: String,
      allocatedDate: Date,
      vacatedDate: Date,
      reason: String
    }]
  },

  // Application Preferences
  preferences: {
    preferredBlocks: [String], // Block names
    roommatePreferences: [String], // Register numbers
    floorPreference: { type: String, enum: ['Ground', 'First', 'Second', 'Third', 'Any'] },
    specialRequirements: String
  },

  // Special Categories
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'Other'],
    default: 'General'
  },
  scholarshipDetails: {
    hasScholarship: { type: Boolean, default: false },
    scholarshipType: String,
    scholarshipAmount: Number
  },
  specialNeeds: {
    isAccessibilityRequired: { type: Boolean, default: false },
    medicalConditions: String,
    dietaryRestrictions: String
  },

  // Authentication
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  // QR & Access
  qrCode: {
    qrId: String,
    qrData: String,
    generatedAt: Date,
    isActive: { type: Boolean, default: false },
    accessScopes: {
      hostelEntry: { type: Boolean, default: false },
      messAccess: { type: Boolean, default: false }
    }
  },

  // Payment Information
  paymentStatus: {
    hostelFees: {
      isPaid: { type: Boolean, default: false },
      amount: Number,
      paidDate: Date,
      transactionId: String,
      receiptUrl: String
    },
    messFees: {
      isPaid: { type: Boolean, default: false },
      amount: Number,
      paidDate: Date,
      transactionId: String,
      receiptUrl: String
    },
    cautionDeposit: {
      isPaid: { type: Boolean, default: false },
      amount: Number,
      paidDate: Date,
      transactionId: String,
      receiptUrl: String
    }
  },

  // Status & Activity
  status: {
    type: String,
    enum: ['Applied', 'Approved', 'Allocated', 'CheckedIn', 'Active', 'Suspended', 'Graduated'],
    default: 'Applied'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profilePicture: String,

  // Documents
  documents: {
    profilePhoto: String,
    idProof: String,
    addressProof: String,
    medicalCertificate: String,
    parentConsentLetter: String,
    feeReceipts: [String]
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentSchema.index({ registerNumber: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ phone: 1 });
studentSchema.index({ department: 1, currentYear: 1 });
studentSchema.index({ 'hostelInfo.currentAllocation.blockId': 1 });
studentSchema.index({ status: 1 });

// Virtual for full name
studentSchema.virtual('displayName').get(function() {
  return this.name;
});

// Virtual for current room info
studentSchema.virtual('currentRoom').get(function() {
  if (this.hostelInfo.currentAllocation.roomNumber) {
    return `${this.hostelInfo.currentAllocation.roomNumber}`;
  }
  return 'Not Allocated';
});

// Pre-save middleware
studentSchema.pre('save', function(next) {
  // Convert register number to uppercase
  if (this.registerNumber) {
    this.registerNumber = this.registerNumber.toUpperCase();
  }
  next();
});

// Methods
studentSchema.methods.getAcademicInfo = function() {
  return {
    registerNumber: this.registerNumber,
    department: this.department,
    batch: this.batch,
    currentYear: this.currentYear,
    currentSemester: this.currentSemester,
    cgpa: this.cgpa
  };
};

studentSchema.methods.getHostelInfo = function() {
  return {
    currentAllocation: this.hostelInfo.currentAllocation,
    qrCode: this.qrCode,
    paymentStatus: this.paymentStatus
  };
};

module.exports = mongoose.model('Student', studentSchema);
