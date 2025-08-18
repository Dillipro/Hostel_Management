const nodemailer = require('nodemailer');
const logger = require('./logger');
const Notification = require('../models/Notification');

// Create email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send email notification
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email text content
 * @param {string} html - Email HTML content
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"CEG Hostel Management" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text
    };
    
    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP via SMS (using Twilio or other SMS service)
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} otp - OTP code
 * @param {string} type - Type of OTP (registration, login, password_reset)
 */
const sendOTP = async (phoneNumber, otp, type = 'verification') => {
  try {
    // For now, we'll just log the OTP
    // In production, integrate with Twilio, AWS SNS, or other SMS service
    logger.info(`OTP ${otp} for ${phoneNumber} (${type})`);
    
    const message = `Your CEG Hostel ${type} OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    // TODO: Implement actual SMS sending
    // Example with Twilio:
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    logger.error(`Failed to send OTP to ${phoneNumber}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notification (using Socket.IO or Firebase)
 * @param {string} userId - Target user ID
 * @param {object} notification - Notification object
 */
const sendPushNotification = async (userId, notification) => {
  try {
    // This would integrate with Socket.IO for real-time notifications
    // and/or Firebase Cloud Messaging for mobile push notifications
    
    logger.info(`Push notification sent to user ${userId}:`, notification);
    
    return { success: true };
  } catch (error) {
    logger.error(`Failed to send push notification to ${userId}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Persist and dispatch a notification
 */
const sendNotification = async ({ userId, type, title, message, data, priority = 'normal' }) => {
  try {
    const rec = new Notification({ userId, type, title, message, data, priority });
    await rec.save();

    // Emit via Socket.IO if server set is accessible through global
    const io = global.__io;
    if (io) {
      io.to(userId.toString()).emit('notification', rec.toObject());
    }
    return { success: true, id: rec._id };
  } catch (error) {
    logger.error('Failed to send notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email to new users
 * @param {object} user - User object
 * @param {string} userType - Type of user (student, warden, etc.)
 */
const sendWelcomeEmail = async (user, userType) => {
  const subject = `Welcome to CEG Hostel Management System`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .footer { background: #374151; color: #d1d5db; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 6px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ Welcome to CEG Hostel Connect</h1>
          <p>College of Engineering, Guindy - Anna University</p>
        </div>
        
        <div class="content">
          <h2>Hello ${user.personalInfo.firstName}!</h2>
          
          <p>Welcome to the CEG Digital Hostel Management System. Your account has been successfully created as a <strong>${userType}</strong>.</p>
          
          <div class="highlight">
            <h3>📋 Your Account Details:</h3>
            <ul>
              <li><strong>User ID:</strong> ${user.userId}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Role:</strong> ${userType}</li>
            </ul>
          </div>
          
          <h3>🚀 What's Next?</h3>
          <ul>
            <li>Complete your profile information</li>
            <li>Upload required documents</li>
            <li>${userType === 'student' ? 'Apply for hostel admission' : 'Access your dashboard'}</li>
            <li>Explore the features available to you</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Access Your Dashboard</a>
          </div>
          
          <h3>🛟 Need Help?</h3>
          <p>If you have any questions or need assistance, please contact:</p>
          <ul>
            <li><strong>Email:</strong> echquery@yahoo.com</li>
            <li><strong>Phone:</strong> 044-22352257</li>
            <li><strong>Address:</strong> Engineering College Hostels, 12 Sardar Patel Road, Guindy, Chennai - 600025</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 CEG Hostel Management System. All rights reserved.</p>
          <p>Developed by Team-6: Dilli Babu R, Jothi Prakesh B, Manoj Kumar K</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(user.email, subject, '', html);
};

/**
 * Send leave approval notification
 * @param {object} student - Student object
 * @param {object} leaveRequest - Leave request object
 * @param {string} status - Approval status (approved/rejected)
 * @param {string} comments - Warden comments
 */
const sendLeaveApprovalNotification = async (student, leaveRequest, status, comments = '') => {
  const subject = `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)} - CEG Hostel`;
  
  const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
  const statusIcon = status === 'approved' ? '✅' : '❌';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusColor}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; }
        .status { background: ${statusColor}20; color: ${statusColor}; padding: 15px; border-radius: 6px; text-align: center; margin: 15px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${statusIcon} Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
        </div>
        
        <div class="content">
          <p>Dear ${student.personalInfo.firstName},</p>
          
          <div class="status">
            Your leave request has been ${status}
          </div>
          
          <h3>📋 Request Details:</h3>
          <ul>
            <li><strong>From:</strong> ${new Date(leaveRequest.fromDate).toDateString()}</li>
            <li><strong>To:</strong> ${new Date(leaveRequest.toDate).toDateString()}</li>
            <li><strong>Reason:</strong> ${leaveRequest.reason}</li>
            <li><strong>Status:</strong> ${status.toUpperCase()}</li>
          </ul>
          
          ${comments ? `<h3>💬 Warden Comments:</h3><p><em>"${comments}"</em></p>` : ''}
          
          <p>Please ensure you follow all hostel guidelines during your leave period.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(student.email, subject, '', html);
};

module.exports = {
  sendEmail,
  sendOTP,
  sendPushNotification,
  sendNotification,
  sendWelcomeEmail,
  sendLeaveApprovalNotification
};
