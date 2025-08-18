const mongoose = require('mongoose');
const User = require('./User');

// Warden-specific schema
const wardenSchema = new mongoose.Schema({
  // Professional Information
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String,
    required: true,
    enum: [
      'Chief Warden',
      'Deputy Chief Warden', 
      'Hostel Warden',
      'Assistant Warden',
      'Resident Counselor'
    ]
  },
  department: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },

  // Assigned Hostels/Blocks
  assignedHostels: [{
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel',
      required: true
    },
    blocks: [{
      blockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block'
      },
      isPrimary: {
        type: Boolean,
        default: false
      }
    }],
    assignedDate: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Residence Information (if living on campus)
  residenceInfo: {
    isResidentWarden: {
      type: Boolean,
      default: false
    },
    quartersNumber: String,
    quartersAddress: String
  },

  // Authority & Permissions
  authorities: {
    canApproveLeave: {
      type: Boolean,
      default: true
    },
    canAllocateRooms: {
      type: Boolean,
      default: false
    },
    canHandleComplaints: {
      type: Boolean,
      default: true
    },
    canBroadcastAnnouncements: {
      type: Boolean,
      default: true
    },
    canManageVisitors: {
      type: Boolean,
      default: true
    },
    maxLeaveApprovalsPerDay: {
      type: Number,
      default: 50
    }
  },

  // Working Schedule
  workingHours: {
    startTime: String, // "09:00"
    endTime: String,   // "18:00"
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    dutyHours: {
      isOnDuty24x7: {
        type: Boolean,
        default: false
      },
      emergencyContact: {
        type: Boolean,
        default: true
      }
    }
  }
});

// Admin-specific schema  
const adminSchema = new mongoose.Schema({
  // Professional Information
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String,
    required: true,
    enum: [
      'Chief Administrative Officer',
      'Deputy Registrar (Hostels)',
      'Assistant Registrar',
      'Hostel Administrator', 
      'Systems Administrator',
      'Academic Officer'
    ]
  },
  department: {
    type: String,
    required: true,
    default: 'Administration'
  },
  joiningDate: {
    type: Date,
    required: true
  },

  // System Access Level
  accessLevel: {
    type: String,
    required: true,
    enum: ['super_admin', 'admin', 'limited_admin'],
    default: 'admin'
  },

  // Managed Areas
  managedModules: [{
    moduleName: {
      type: String,
      enum: [
        'student_management',
        'room_allocation', 
        'fee_management',
        'complaints_management',
        'maintenance_management',
        'mess_management',
        'reports_analytics',
        'user_management',
        'system_configuration'
      ]
    },
    permissions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve']
    }]
  }],

  // Approval Authority
  approvalLimits: {
    maxFeeWaiver: Number,
    canApproveRefunds: Boolean,
    canModifyAllocations: Boolean,
    canCreateUsers: Boolean,
    canDeleteRecords: Boolean
  }
});

// Counselor-specific schema
const counselorSchema = new mongoose.Schema({
  // Professional Information  
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  qualification: {
    degree: String,
    specialization: String,
    experience: Number
  },
  
  // Assigned Areas
  assignedHostels: [{
    hostelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hostel'
    },
    studentCategories: [String] // ['UG', 'PG', 'PhD', 'International']
  }],

  // Counseling Schedule
  availableHours: [{
    day: String,
    startTime: String,
    endTime: String,
    maxAppointments: Number
  }],

  // Specializations
  counselingAreas: [{
    type: String,
    enum: [
      'academic_stress',
      'personal_issues', 
      'career_guidance',
      'mental_health',
      'adjustment_issues',
      'family_problems',
      'financial_counseling'
    ]
  }]
});

// Mess Manager schema
const messManagerSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Managed Mess Buildings
  assignedMess: [{
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mess'
    },
    role: {
      type: String,
      enum: ['manager', 'supervisor', 'assistant']
    }
  }],

  // Vendor Management Authority
  vendorAuthority: {
    canManageContracts: Boolean,
    canApproveMenuChanges: Boolean,
    canHandleComplaints: Boolean
  }
});

// Maintenance Staff schema
const maintenanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Specialization
  specialization: {
    type: String,
    enum: [
      'electrical',
      'plumbing', 
      'carpentry',
      'painting',
      'hvac',
      'general',
      'it_support',
      'housekeeping'
    ]
  },

  // Assigned Areas
  assignedBlocks: [{
    blockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block'
    },
    isPrimary: Boolean
  }],

  // Availability
  workShifts: [{
    day: String,
    startTime: String,
    endTime: String,
    isOnCall: Boolean
  }]
});

// Security Staff schema
const securitySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Security Clearance
  clearanceLevel: {
    type: String,
    enum: ['basic', 'intermediate', 'high'],
    default: 'basic'
  },

  // Assigned Posts
  assignedPosts: [{
    location: String,
    shift: {
      type: String,
      enum: ['morning', 'afternoon', 'night', 'rotating']
    },
    responsibilities: [String]
  }],

  // Equipment Access
  equipmentAccess: [{
    equipmentType: String,
    issueDate: Date,
    returnDate: Date
  }]
});

// Accounts Officer schema
const accountsSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Financial Authorities
  approvalLimits: {
    maxTransactionAmount: Number,
    canApproveRefunds: Boolean,
    canGenerateReports: Boolean,
    canModifyFeeStructure: Boolean
  },

  // Assigned Modules
  financialModules: [{
    type: String,
    enum: [
      'fee_collection',
      'refunds',
      'vendor_payments', 
      'scholarship_disbursement',
      'audit_reports',
      'budget_management'
    ]
  }]
});

// Medical Officer schema
const medicalOfficerSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Medical Qualification
  qualification: {
    degree: String,
    specialization: String,
    registrationNumber: String,
    experience: Number
  },

  // Available Hours
  clinicHours: [{
    day: String,
    startTime: String,
    endTime: String,
    emergencyContact: Boolean
  }],

  // Authorities
  medicalAuthorities: {
    canIssueCertificates: Boolean,
    canApproveLeaveOnMedicalGrounds: Boolean,
    canAccessMedicalRecords: Boolean
  }
});

// Create discriminator models
const Warden = User.discriminator('Warden', wardenSchema);
const Admin = User.discriminator('Admin', adminSchema);
const Counselor = User.discriminator('Counselor', counselorSchema);
const MessManager = User.discriminator('MessManager', messManagerSchema);
const MaintenanceStaff = User.discriminator('MaintenanceStaff', maintenanceSchema);
const SecurityStaff = User.discriminator('SecurityStaff', securitySchema);
const AccountsOfficer = User.discriminator('AccountsOfficer', accountsSchema);
const MedicalOfficer = User.discriminator('MedicalOfficer', medicalOfficerSchema);

module.exports = {
  Warden,
  Admin,
  Counselor,
  MessManager,
  MaintenanceStaff,
  SecurityStaff,
  AccountsOfficer,
  MedicalOfficer
};
