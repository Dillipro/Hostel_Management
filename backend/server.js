const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes - only the ones we created
const authRoutes = require('./routes/auth');
const hostelManagementRoutes = require('./routes/hostelManagement');
const wardenManagementRoutes = require('./routes/wardenManagement');
const studentPortalRoutes = require('./routes/studentPortal');
const accessControlRoutes = require('./routes/accessControl');
const paymentsRoutes = require('./routes/payments');
const automationRoutes = require('./routes/automation');
const messRoutes = require('./routes/mess');
const disciplineRoutes = require('./routes/discipline');

// Import middleware
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);

// Socket.IO setup for real-time notifications
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
  }
});

// Expose io globally for utils
global.__io = io;

// Security/config checks for secrets
(() => {
  const warn = (msg) => logger.warn(msg);
  const err = (msg) => logger.error(msg);
  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
  const QR_SECRET = process.env.QR_SIGNATURE_SECRET;
  const IOT_TOKEN = process.env.IOT_INGEST_TOKEN;
  if (!QR_SECRET || QR_SECRET === 'default-secret') {
    const msg = 'QR_SIGNATURE_SECRET is not set or uses a default value. Set a strong random secret in environment.';
    if (isProd) { err(msg); throw new Error(msg); } else { warn(msg); }
  }
  if (!IOT_TOKEN || IOT_TOKEN === 'iot-dev-token') {
    const msg = 'IOT_INGEST_TOKEN is not set or uses a default value. Set a strong random token in environment.';
    if (isProd) { err(msg); throw new Error(msg); } else { warn(msg); }
  }
})();

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch((err) => logger.error('MongoDB connection error:', err));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message) } }));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'CEG Hostel Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Advanced Features Routes - only the ones we created
app.use('/api/hostel-management', authenticateToken, hostelManagementRoutes);
app.use('/api/warden', authenticateToken, authorizeRoles(['warden']), wardenManagementRoutes);
app.use('/api/student-portal', authenticateToken, authorizeRoles(['student']), studentPortalRoutes);
app.use('/api/access-control', accessControlRoutes);
app.use('/api/payments', authenticateToken, paymentsRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/automation', authenticateToken, authorizeRoles(['admin', 'super_admin']), automationRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/attendance', require('./routes/attendance'));
// Lazy-load new routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', authenticateToken, require('./routes/reports'));
app.use('/api/discipline', disciplineRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`User ${socket.id} joined room: ${room}`);
  });
  // convenience: join multiple
  socket.on('join-rooms', (rooms) => {
    if (Array.isArray(rooms)) rooms.forEach(r => socket.join(r));
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 CEG Hostel Management Server running on port ${PORT}`);
  logger.info(`🏛️ Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, io };
