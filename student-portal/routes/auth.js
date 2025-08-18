const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Student = require('../models/Student');
const router = express.Router();

// OTP store (in production, use Redis)
const otpStore = new Map();

// Email transporter setup
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp, purpose = 'login') => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `CEG Hostel Management - OTP for ${purpose}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E86C1;">CEG Hostel Management System</h2>
        <h3>Your OTP for ${purpose}</h3>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <h1 style="color: #E74C3C; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for 10 minutes. Do not share this OTP with anyone.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          College of Engineering, Guindy - Anna University<br>
          Digital Hostel Management System
        </p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP for login/registration
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { registerNumber, email, purpose = 'login' } = req.body;

    // Validate register number format
    if (!registerNumber || !/^[0-9]{10}$/.test(registerNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid register number format'
      });
    }

    // For login, check if student exists
    if (purpose === 'login') {
      const student = await Student.findOne({ 
        $or: [{ registerNumber }, { email }] 
      });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found. Please register first.'
        });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpKey = `${registerNumber}_${purpose}`;
    
    // Store OTP (expires in 10 minutes)
    otpStore.set(otpKey, {
      otp,
      email,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    // Send OTP email
    await sendOTPEmail(email, otp, purpose);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mask email
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { registerNumber, otp, purpose = 'login' } = req.body;
    const otpKey = `${registerNumber}_${purpose}`;
    
    // Get OTP from store
    const storedOTP = otpStore.get(otpKey);
    
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    // Check if OTP expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(otpKey);
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    // Check attempts
    if (storedOTP.attempts >= 3) {
      otpStore.delete(otpKey);
      return res.status(400).json({
        success: false,
        message: 'Too many invalid attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      storedOTP.attempts++;
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP verified, find student
    const student = await Student.findOne({ registerNumber })
      .populate('hostelInfo.currentAllocation.hostelId', 'name type')
      .populate('hostelInfo.currentAllocation.blockId', 'name')
      .select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Generate JWT token
    const payload = {
      id: student._id,
      registerNumber: student.registerNumber,
      role: 'student'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Update last login
    await Student.findByIdAndUpdate(student._id, { 
      lastLogin: new Date(),
      isEmailVerified: true 
    });

    // Clear OTP
    otpStore.delete(otpKey);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        registerNumber: student.registerNumber,
        name: student.name,
        email: student.email,
        department: student.department,
        currentYear: student.currentYear,
        status: student.status,
        hostelInfo: student.hostelInfo,
        qrCode: student.qrCode,
        paymentStatus: student.paymentStatus
      }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new student
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      registerNumber,
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      department,
      batch,
      currentYear,
      currentSemester,
      permanentAddress,
      guardianName,
      guardianPhone,
      guardianRelation,
      password,
      otp
    } = req.body;

    // Verify OTP first
    const otpKey = `${registerNumber}_registration`;
    const storedOTP = otpStore.get(otpKey);
    
    if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ registerNumber }, { email }, { phone }]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student already registered with this register number, email, or phone'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    const student = new Student({
      registerNumber: registerNumber.toUpperCase(),
      name,
      email: email.toLowerCase(),
      phone,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      department,
      batch,
      currentYear,
      currentSemester,
      permanentAddress,
      guardianName,
      guardianPhone,
      guardianRelation,
      password: hashedPassword,
      isEmailVerified: true,
      status: 'Applied'
    });

    await student.save();

    // Generate JWT token
    const payload = {
      id: student._id,
      registerNumber: student.registerNumber,
      role: 'student'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Clear OTP
    otpStore.delete(otpKey);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      student: {
        id: student._id,
        registerNumber: student.registerNumber,
        name: student.name,
        email: student.email,
        department: student.department,
        currentYear: student.currentYear,
        status: student.status
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { registerNumber, email } = req.body;

    const student = await Student.findOne({
      $and: [{ registerNumber }, { email }]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with provided credentials'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Store reset token (in production, store in database)
    otpStore.set(`reset_${registerNumber}`, {
      token: resetToken,
      expiresAt: resetTokenExpiry
    });

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&reg=${registerNumber}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CEG Hostel Management - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E86C1;">CEG Hostel Management System</h2>
          <h3>Password Reset Request</h3>
          <p>You requested a password reset for your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #E74C3C; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            College of Engineering, Guindy - Anna University
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset link'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { registerNumber, token, newPassword } = req.body;

    // Verify reset token
    const storedToken = otpStore.get(`reset_${registerNumber}`);
    
    if (!storedToken || storedToken.token !== token || Date.now() > storedToken.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await Student.findOneAndUpdate(
      { registerNumber },
      { password: hashedPassword }
    );

    // Clear reset token
    otpStore.delete(`reset_${registerNumber}`);

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
});

module.exports = router;
