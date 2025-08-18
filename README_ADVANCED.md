# 🏨 CEG Digital Hostel Management System

A comprehensive, IoT-enabled digital hostel management system for College of Engineering Guindy (CEG), Anna University. This advanced system features QR/RFID-based access control, integrated payment gateways, automated room allocation, and real-time monitoring capabilities.

## 🌟 Advanced Features

### 🔐 IoT-Enabled Access Control
- **QR Code & RFID Integration**: Digital access cards with secure QR codes and RFID support
- **Real-time Access Monitoring**: Live tracking of entry/exit with signature verification
- **Multi-level Security**: Payment-linked access control for hostel and mess facilities
- **Visitor Management**: Temporary access passes with time-based restrictions
- **Access Analytics**: Detailed logs and analytics for security monitoring

### 💳 Integrated Payment System
- **Razorpay Integration**: Secure online payments for hostel and mess fees
- **Stripe Support**: International payment gateway support
- **Automated Receipt Generation**: PDF receipts with QR codes
- **Payment-linked Access**: Access cards automatically updated upon payment
- **Fee Reminders**: Automated notifications for pending payments

### 🏠 Advanced Room Allocation
- **AI-Powered Algorithm**: Priority-based allocation considering student preferences
- **Transparent Scoring System**: Clear criteria for room allocation decisions
- **Real-time Updates**: Live room availability and allocation status
- **Preference Management**: Student choice collection and processing
- **Conflict Resolution**: Automated handling of allocation conflicts

### 📊 Comprehensive Admin Dashboard
- **Real-time Analytics**: Live IoT device monitoring and system health
- **Revenue Tracking**: Detailed financial analytics and reporting
- **Occupancy Management**: Dynamic room and hostel utilization metrics
- **Complaint Management**: Advanced workflow for issue resolution
- **System Monitoring**: Health checks for IoT devices and payment gateways

### 🤖 Automation & Scheduling
- **Automated Tasks**: Daily fee reminders, access card updates, leave management
- **CEG Integration**: Pre-loaded with actual CEG hostel data (20 hostels)
- **Maintenance Scheduling**: Automated work order generation
- **Report Generation**: Scheduled analytics and compliance reports

## 🏗️ System Architecture

### Backend (Node.js + Express)
```
backend/
├── models/                 # Database Schemas
│   ├── HostelInfrastructure.js  # Hostels, Blocks, Rooms, IoT Devices
│   ├── Student.js              # Student profiles and preferences
│   ├── Staff.js                # Staff management
│   └── User.js                 # Authentication and roles
├── routes/                # API Endpoints
│   ├── accessControl.js       # IoT access control APIs
│   ├── automation.js          # Automated tasks and CEG data
│   ├── hostelManagement.js    # Admin hostel management
│   ├── payments.js            # Payment gateway integration
│   ├── studentPortal.js       # Student dashboard APIs
│   └── wardenManagement.js    # Warden operations
├── middleware/            # Security and authentication
└── server.js             # Main server with Socket.IO
```

### Frontend (React + Vite)
```
frontend/
├── components/
│   ├── student/           # Student portal components
│   │   ├── StudentDashboard.jsx    # Main dashboard
│   │   ├── PaymentPortal.jsx       # Payment interface
│   │   ├── AccessCardPortal.jsx    # QR code management
│   │   └── ComplaintPortal.jsx     # Issue reporting
│   ├── admin/             # Admin panel components
│   │   ├── AdminDashboard.jsx      # Admin overview
│   │   ├── IoTMonitor.jsx          # Device monitoring
│   │   └── RealtimeChart.jsx       # Analytics visualization
│   └── common/            # Shared components
├── stores/                # Zustand state management
└── layouts/              # Layout components
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB 6.0+
- Razorpay/Stripe accounts (for payments)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Hostel_Management
```

### 2. Backend Setup
```bash
cd backend
npm install

# Environment Configuration
cp .env.example .env
# Update .env with:
# - MongoDB connection string
# - JWT secrets
# - Razorpay/Stripe keys
# - Email configuration

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Environment Configuration
cp .env.example .env
# Update .env with:
# - API endpoint
# - Razorpay public key

# Start development server
npm run dev
```

### 4. Database Initialization
```bash
# Seed with CEG hostel data
curl -X POST http://localhost:5000/api/automation/seed-ceg-data
```

## 🎯 Key Functionalities

### For Students
- **Digital Dashboard**: Comprehensive overview of accommodation, payments, and activities
- **QR Access Cards**: Secure digital keys for hostel and mess access
- **Online Payments**: Seamless fee payment with instant access updates
- **Complaint System**: Multi-category issue reporting with real-time tracking
- **Leave Management**: Digital leave applications with approval workflows

### For Wardens
- **Student Oversight**: Complete roster management and monitoring
- **Leave Approvals**: Streamlined approval process with notifications
- **Complaint Handling**: Priority-based complaint resolution
- **Mess Management**: Attendance tracking and feedback analysis
- **Announcements**: Broadcast system for important updates

### For Administrators
- **System Control**: Complete control over hostel operations and settings
- **IoT Management**: Real-time monitoring of all access control devices
- **Analytics Dashboard**: Comprehensive insights into system usage and performance
- **Automated Allocation**: One-click room allocation with transparent algorithms
- **Financial Overview**: Detailed revenue tracking and payment analytics

## 🔧 Advanced Configuration

### IoT Device Integration
```javascript
// Access control device configuration
const deviceConfig = {
  deviceId: 'CEG_GATE_001',
  location: 'Main Gate - Tharamani Hostel',
  type: 'hostel_entry',
  qrScanner: true,
  rfidReader: true,
  networkConfig: {
    wifi: 'CEG_IOT',
    endpoint: 'wss://api.ceg-hostel.com/iot'
  }
};
```

### Payment Gateway Setup
```javascript
// Razorpay configuration
const razorpayOptions = {
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET
};
```

### Automated Tasks Configuration
```javascript
// Cron job schedules
const schedules = {
  feeReminders: '0 9 * * *',      // Daily at 9 AM
  accessCardExpiry: '0 0 * * 0',  // Weekly on Sunday
  maintenanceChecks: '0 2 * * *',  // Daily at 2 AM
  reportGeneration: '0 6 1 * *'   // Monthly on 1st at 6 AM
};
```

## 📊 System Monitoring

### Real-time Metrics
- **Device Status**: Online/offline status of all IoT devices
- **Access Attempts**: Real-time monitoring of entry/exit activities  
- **Payment Tracking**: Live payment processing and success rates
- **System Health**: Database performance, API response times, error rates

### Analytics & Reporting
- **Occupancy Analytics**: Room utilization and demographic insights
- **Financial Reports**: Revenue analysis, payment patterns, outstanding dues
- **Security Logs**: Access control events, security incidents, visitor tracking
- **Operational Metrics**: Complaint resolution times, maintenance schedules

## 🛡️ Security Features

- **Multi-factor Authentication**: Role-based access with JWT tokens
- **Digital Signatures**: Cryptographic verification for QR codes
- **Payment Security**: PCI DSS compliant payment processing
- **Data Encryption**: End-to-end encryption for sensitive data
- **Audit Trails**: Comprehensive logging of all system activities

## 🌐 API Documentation

### Student Portal APIs
```
GET    /api/student-portal/dashboard      # Student dashboard data
POST   /api/student-portal/complaints     # File new complaint
GET    /api/student-portal/access-card    # Access card details
POST   /api/student-portal/access-card/regenerate  # Regenerate QR code
```

### Admin Management APIs
```
POST   /api/hostel-management/run-allocation  # Execute room allocation
GET    /api/hostel-management/dashboard       # Admin dashboard data
GET    /api/hostel-management/analytics       # System analytics
```

### IoT Access Control APIs
```
POST   /api/access-control/scan             # Process QR/RFID scan
GET    /api/access-control/logs            # Access logs
POST   /api/access-control/visitor-pass    # Generate visitor pass
```

## 👥 Development Team

**Team-6 - Final Year Project**
- **Dilli Babu R** (2023115086) - Full Stack Development & IoT Integration
- **Jothi Prakesh B** (2023115111) - Backend Development & Payment Systems  
- **Manoj Kumar K** (2023115314) - Frontend Development & UI/UX Design

**Academic Institution:** College of Engineering Guindy, Anna University

## 📄 License

This project is developed as part of the Final Year Project for the Department of Computer Science Engineering, CEG, Anna University. All rights reserved.

---

**🎓 Academic Project | 🏛️ College of Engineering Guindy | 🌟 Advanced Digital Solutions**
