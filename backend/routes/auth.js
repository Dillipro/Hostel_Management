const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { 
  Warden, 
  Admin, 
  Counselor, 
  MessManager, 
  MaintenanceStaff, 
  SecurityStaff, 
  AccountsOfficer, 
  MedicalOfficer 
} = require('../models/Staff');
const { sendOTP, sendEmail } = require('../utils/notification');
const logger = require('../utils/logger');

const router = express.Router();

// User Model mapping for different roles
const getUserModel = (role) => {
  const modelMap = {
    'student': Student,
    'warden': Warden,
    'admin': Admin,
    'super_admin': Admin,
    'counselor': Counselor,
    'mess_manager': MessManager,
    'maintenance': MaintenanceStaff,
    'security': SecurityStaff,
    'accounts': AccountsOfficer,
    'medical_officer': MedicalOfficer
  };
  return modelMap[role] || User;
};

// Generate JWT tokens
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  
  return { accessToken, refreshToken };
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (role-based)
 * @access  Public (with role verification)
 */
router.post('/register', [
  body('userId').trim().isLength({ min: 3 }).withMessage('User ID must be at least 3 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn([
    'student', 'warden', 'admin', 'super_admin', 
    'counselor', 'mess_manager', 'maintenance', 
    'security', 'accounts', 'medical_officer'
  ]).withMessage('Invalid role specified'),
  body('personalInfo.firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('personalInfo.lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('personalInfo.phoneNumber').isMobilePhone().withMessage('Valid phone number is required')
], async (req, res) => {
  try {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      userId, 
      email, 
      password, 
      role, 
      personalInfo,
      academic,
      employeeId,
      registerNumber
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { userId: userId },
        { email: email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists with this ID or email'
      });
    }

    // For students, check register number uniqueness
    if (role === 'student' && registerNumber) {
      const existingStudent = await Student.findOne({
        'academic.registerNumber': registerNumber
      });
      
      if (existingStudent) {
        return res.status(409).json({
          status: 'error',
          message: 'Student with this register number already exists'
        });
      }
    }

    // Get appropriate model based on role
    const UserModel = getUserModel(role);
    
    // Prepare user data
    const userData = {
      userId,
      email,
      password,
      role,
      personalInfo,
      userType: role === 'student' ? 'Student' : 
               role === 'warden' ? 'Warden' :
               role === 'admin' || role === 'super_admin' ? 'Admin' :
               role === 'counselor' ? 'Counselor' :
               role === 'mess_manager' ? 'MessManager' :
               role === 'maintenance' ? 'MaintenanceStaff' :
               role === 'security' ? 'SecurityStaff' :
               role === 'accounts' ? 'AccountsOfficer' :
               role === 'medical_officer' ? 'MedicalOfficer' : 'User'
    };

    // Add role-specific data
    if (role === 'student' && academic) {
      userData.academic = academic;
    }
    
    if (employeeId && role !== 'student') {
      userData.employeeId = employeeId;
    }

    // Create user
    const newUser = new UserModel(userData);
    
    // Generate OTP for verification
    const otp = newUser.generateOTP();
    await newUser.save();

    // Send OTP via email/SMS
    try {
      await sendOTP(personalInfo.phoneNumber, otp, 'registration');
      await sendEmail(
        email,
        'CEG Hostel - Account Verification',
        `Your OTP for account verification is: ${otp}. Valid for 10 minutes.`
      );
    } catch (notificationError) {
      logger.error('Failed to send OTP:', notificationError);
      // Continue with registration even if OTP fails
    }

    logger.info(`New ${role} registered: ${userId}`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your account with OTP sent to your email/phone.',
      data: {
        userId: newUser.userId,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during registration'
    });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for account activation
 * @access  Public
 */
router.post('/verify-otp', [
  body('userId').trim().isLength({ min: 3 }).withMessage('User ID is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, otp } = req.body;

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const verificationResult = user.verifyOTP(otp);
    
    if (!verificationResult.success) {
      await user.save(); // Save attempt count
      return res.status(400).json({
        status: 'error',
        message: verificationResult.message
      });
    }

    await user.save();

    // Generate tokens for verified user
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    logger.info(`User verified and logged in: ${userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Account verified successfully',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during verification'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user with multiple login options
 * @access  Public
 */
router.post('/login', [
  body('identifier').trim().isLength({ min: 3 }).withMessage('User ID, email, or register number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier, password, rememberMe } = req.body;

    // Find user by userId, email, or register number (for students)
    let user = await User.findOne({
      $or: [
        { userId: identifier },
        { email: identifier }
      ]
    });

    // If not found and identifier could be a register number, search in students
    if (!user && identifier.match(/^\d{10}$/)) {
      user = await Student.findOne({
        'academic.registerNumber': identifier
      });
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = user.generateOTP();
      await user.save();

      // Send OTP
      try {
        await sendOTP(user.personalInfo.phoneNumber, otp, 'login');
      } catch (error) {
        logger.error('Failed to send OTP:', error);
      }

      return res.status(403).json({
        status: 'error',
        message: 'Account not verified. New OTP sent to your registered phone/email.',
        requiresVerification: true
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    // Save refresh token
    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${user.userId} (${user.role})`);

    // Set token expiry based on rememberMe
    const tokenOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
    };

    res.cookie('refreshToken', refreshToken, tokenOptions);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login'
    });
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body || req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);
    
    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(403).json({
      status: 'error',
      message: 'Invalid or expired refresh token'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body || req.cookies;
    
    if (refreshToken) {
      // Find user and remove refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        await user.save();
      }
    }

    res.clearCookie('refreshToken');
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during logout'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset OTP
 * @access  Public
 */
router.post('/forgot-password', [
  body('identifier').trim().isLength({ min: 3 }).withMessage('User ID or email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier } = req.body;

    // Find user by userId or email
    const user = await User.findOne({
      $or: [
        { userId: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        status: 'success',
        message: 'If the account exists, password reset instructions have been sent.'
      });
    }

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    try {
      await sendOTP(user.personalInfo.phoneNumber, otp, 'password_reset');
      await sendEmail(
        user.email,
        'CEG Hostel - Password Reset',
        `Your OTP for password reset is: ${otp}. Valid for 10 minutes.`
      );
    } catch (error) {
      logger.error('Failed to send password reset OTP:', error);
    }

    logger.info(`Password reset OTP sent to: ${user.userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions have been sent to your registered email and phone.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
router.post('/reset-password', [
  body('identifier').trim().isLength({ min: 3 }).withMessage('User ID or email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({
      $or: [
        { userId: identifier },
        { email: identifier }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Verify OTP
    const verificationResult = user.verifyOTP(otp);
    
    if (!verificationResult.success) {
      await user.save(); // Save attempt count
      return res.status(400).json({
        status: 'error',
        message: verificationResult.message
      });
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    logger.info(`Password reset successful for: ${user.userId}`);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. Please login with your new password.'
    });

  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during password reset'
    });
  }
});

/**
 * @route   GET /api/auth/user-types
 * @desc    Get available user types for registration
 * @access  Public
 */
router.get('/user-types', (req, res) => {
  const userTypes = [
    { value: 'student', label: 'Student', description: 'Hostel resident student' },
    { value: 'warden', label: 'Warden', description: 'Hostel warden or resident counselor' },
    { value: 'admin', label: 'Administrator', description: 'Hostel administration staff' },
    { value: 'counselor', label: 'Counselor', description: 'Student counselor' },
    { value: 'mess_manager', label: 'Mess Manager', description: 'Mess facility manager' },
    { value: 'maintenance', label: 'Maintenance Staff', description: 'Maintenance and repair staff' },
    { value: 'security', label: 'Security Staff', description: 'Security personnel' },
    { value: 'accounts', label: 'Accounts Officer', description: 'Financial accounts officer' },
    { value: 'medical_officer', label: 'Medical Officer', description: 'Medical staff' }
  ];

  res.status(200).json({
    status: 'success',
    data: userTypes
  });
});

module.exports = router;
