const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Base User Schema with discriminator for different user types
const baseUserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: [
      'student', 
      'warden', 
      'admin', 
      'super_admin',
      'counselor',
      'mess_manager',
      'maintenance',
      'security',
      'accounts',
      'medical_officer'
    ]
  },
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },
  profilePicture: {
    url: String,
    publicId: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  otpDetails: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 }
  },
  refreshTokens: [String],
  permissions: [{
    module: String,
    actions: [String] // ['create', 'read', 'update', 'delete']
  }]
}, {
  timestamps: true,
  discriminatorKey: 'userType'
});

// Indexes
baseUserSchema.index({ userId: 1 });
baseUserSchema.index({ email: 1 });
baseUserSchema.index({ role: 1 });
baseUserSchema.index({ isActive: 1 });

// Virtual for full name
baseUserSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Hash password before saving
baseUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
baseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
baseUserSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otpDetails = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    attempts: 0
  };
  return otp;
};

// Verify OTP
baseUserSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otpDetails.code || this.otpDetails.expiresAt < new Date()) {
    return { success: false, message: 'OTP expired' };
  }
  
  if (this.otpDetails.attempts >= 3) {
    return { success: false, message: 'Too many OTP attempts' };
  }
  
  if (this.otpDetails.code === enteredOTP) {
    this.otpDetails = undefined;
    this.isVerified = true;
    return { success: true, message: 'OTP verified successfully' };
  } else {
    this.otpDetails.attempts += 1;
    return { success: false, message: 'Invalid OTP' };
  }
};

// Remove sensitive data from JSON output
baseUserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  delete userObject.otpDetails;
  return userObject;
};

const User = mongoose.model('User', baseUserSchema);

module.exports = User;
