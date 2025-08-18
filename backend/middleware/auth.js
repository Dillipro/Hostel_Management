const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token not provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid access token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        status: 'error',
        message: 'Access token expired'
      });
    } else {
      logger.error('Authentication error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during authentication'
      });
    }
  }
};

/**
 * Authorize user roles
 * @param {Array} allowedRoles - Array of allowed roles
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Check specific permissions for modules
 * @param {string} module - Module name
 * @param {string} action - Action type (create, read, update, delete)
 */
const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Super admin has all permissions
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check user permissions
    const userPermissions = req.user.permissions || [];
    const modulePermission = userPermissions.find(p => p.module === module);

    if (!modulePermission || !modulePermission.actions.includes(action)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. You don't have ${action} permission for ${module}.`
      });
    }

    next();
  };
};

/**
 * Check if user owns the resource or has admin privileges
 */
const checkOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Admin and super_admin can access any resource
    if (['admin', 'super_admin'].includes(req.user.role)) {
      return next();
    }

    // For wardens, check if they manage the resource
    if (req.user.role === 'warden') {
      // This would need additional logic based on warden's assigned hostels/blocks
      // For now, allow wardens to access resources
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (resourceUserId && resourceUserId !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

/**
 * Check if student is in warden's assigned hostels/blocks
 */
const checkWardenJurisdiction = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'warden') {
      return next();
    }

    const studentId = req.params.studentId || req.body.studentId;
    if (!studentId) {
      return next();
    }

    const Student = require('../models/Student');
    const student = await Student.findById(studentId).populate('hostelInfo.currentAllocation.blockId');

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Check if warden manages the student's block
    const { Warden } = require('../models/Staff');
    const warden = await Warden.findById(req.user._id);
    
    const studentBlockId = student.hostelInfo.currentAllocation.blockId;
    const wardenManagesBlock = warden.assignedHostels.some(hostel => 
      hostel.blocks.some(block => 
        block.blockId.toString() === studentBlockId?.toString()
      )
    );

    if (!wardenManagesBlock) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Student is not in your assigned blocks.'
      });
    }

    next();

  } catch (error) {
    logger.error('Warden jurisdiction check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during jurisdiction check'
    });
  }
};

/**
 * Rate limiting for sensitive operations
 */
const rateLimitSensitive = (req, res, next) => {
  // This could be enhanced with Redis for better rate limiting
  // For now, it's a placeholder
  next();
};

/**
 * Log user actions for audit
 */
const auditLog = (action, resource) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action if response is successful
      if (res.statusCode < 400) {
        logger.info(`Audit: ${req.user?.userId || 'Anonymous'} performed ${action} on ${resource}`, {
          userId: req.user?._id,
          userRole: req.user?.role,
          action,
          resource,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Verify account verification status
 */
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Account verification required'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkPermission,
  checkOwnership,
  checkWardenJurisdiction,
  rateLimitSensitive,
  auditLog,
  requireVerification
};
