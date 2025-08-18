# CEG Digital Hostel Management System

## 🏛️ College of Engineering, Guindy - Anna University

**Team Members:**
- Dilli Babu R - 2023115086 (Database & Integration)
- Jothi Prakesh B - 2023115111 (Backend Development)  
- Manoj Kumar K - 2023115314 (Frontend Development)

## 🚀 Enhanced Smart Digital Hostel Ecosystem with Multi-Role Access

### 🎯 System Architecture
- **Backend**: Node.js + Express.js with MongoDB
- **Frontend**: React + Vite + Tailwind CSS
- **Authentication**: JWT with role-based access control
- **Real-time**: Socket.IO for notifications
- **Payments**: Razorpay/Stripe integration
- **File Storage**: Cloudinary integration

### 👥 User Types & Access Levels

#### 🎓 Students
- **Registration**: Register No. + OTP verification
- **Digital Hostel Admission**: Apply online with document uploads
- **Auto Room Allocation**: Priority-based allocation system
- **QR/RFID Access Control**: Digital ID cards for hostel/mess entry
- **Online Payments**: UPI/Cards for hostel & mess fees
- **Leave Management**: Digital leave requests with warden approval
- **Complaint System**: Track maintenance requests in real-time
- **Mess Integration**: Food feedback and meal tracking

#### 🛡️ Wardens
- **Student Management**: View assigned hostel students
- **Leave Approvals**: Digital workflow for leave requests  
- **Complaint Handling**: Assign and track maintenance issues
- **Visitor Management**: Generate temporary QR passes
- **Emergency Broadcasts**: Push notifications to students
- **Attendance Monitoring**: QR/RFID entry logs
- **Mess Oversight**: Food quality and attendance reports

#### �‍💼 Administrators
- **Complete System Control**: Manage all hostels and blocks
- **Room Allocation Engine**: Advanced algorithm with priorities
- **User Management**: Create/manage all user types
- **Payment Processing**: Fee collection and refund handling
- **Analytics Dashboard**: Comprehensive reporting system
- **QR Card Generation**: Bulk printing of student ID cards

#### 🧑‍⚕️ Counselors
- **Student Support**: Mental health and academic counseling
- **Appointment Scheduling**: Manage counseling sessions
- **Crisis Management**: Handle emergency student issues
- **Reporting**: Student wellness analytics

#### 🍽️ Mess Managers
- **Menu Management**: Plan daily/weekly menus
- **Feedback Analysis**: Process student food reviews
- **Vendor Coordination**: Manage food suppliers
- **Nutrition Tracking**: Monitor dietary requirements

#### 🔧 Maintenance Staff
- **Work Order System**: Receive and update repair requests
- **Inventory Management**: Track tools and materials
- **Schedule Management**: Plan maintenance activities
- **Issue Escalation**: Forward complex problems to admin

#### �️ Security Staff
- **Access Control**: Monitor QR/RFID entry logs
- **Incident Reporting**: Document security events
- **Visitor Tracking**: Manage guest entries
- **Emergency Response**: Handle security alerts

#### 💰 Accounts Officers
- **Fee Management**: Process payments and refunds
- **Financial Reports**: Generate revenue analytics
- **Audit Support**: Maintain financial records
- **Scholarship Processing**: Handle fee waivers

#### 🏥 Medical Officers
- **Health Records**: Maintain student medical data
- **Medical Certificates**: Issue health clearances
- **Emergency Care**: Handle medical situations
- **Health Reports**: Track campus health trends

## 📁 Project Structure

```
CEG_Hostel_Management/
├── backend/                          # Node.js + Express API
│   ├── models/                       # MongoDB Models
│   │   ├── User.js                   # Base user model
│   │   ├── Student.js                # Student-specific model
│   │   ├── Staff.js                  # All staff role models
│   │   ├── Hostel.js                 # Hostel infrastructure
│   │   ├── Block.js                  # Block management
│   │   └── Room.js                   # Room allocation
│   ├── routes/                       # API Routes
│   │   ├── auth.js                   # Authentication routes
│   │   ├── student.js                # Student-specific routes
│   │   ├── warden.js                 # Warden routes
│   │   ├── admin.js                  # Admin routes
│   │   ├── payment.js                # Payment gateway
│   │   └── notification.js           # Push notifications
│   ├── middleware/                   # Custom middleware
│   │   ├── auth.js                   # JWT & role-based auth
│   │   └── errorHandler.js           # Error handling
│   ├── utils/                        # Utility functions
│   │   ├── logger.js                 # Winston logger
│   │   ├── notification.js           # Email/SMS services
│   │   └── qrGenerator.js            # QR code generation
│   ├── server.js                     # Main server file
│   └── package.json                  # Dependencies
│
├── frontend/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   │   ├── common/               # Common components
│   │   │   ├── auth/                 # Authentication forms
│   │   │   └── dashboard/            # Role-specific dashboards
│   │   ├── pages/                    # Page components
│   │   │   ├── auth/                 # Login, Register, OTP
│   │   │   ├── student/              # Student portal
│   │   │   ├── warden/               # Warden dashboard
│   │   │   ├── admin/                # Admin panel
│   │   │   └── staff/                # Staff portals
│   │   ├── layouts/                  # Layout components
│   │   │   ├── PublicLayout.jsx      # Public pages layout
│   │   │   └── DashboardLayout.jsx   # Authenticated layout
│   │   ├── stores/                   # State management
│   │   │   └── useAuthStore.js       # Authentication store
│   │   ├── utils/                    # Frontend utilities
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # React entry point
│   ├── index.html                    # HTML template
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── vite.config.js                # Vite configuration
│   └── package.json                  # Dependencies
│
├── student-portal/                   # Legacy portal (to be merged)
└── README.md                         # Project documentation
```

## 🔐 Authentication & Authorization

### Multi-Level Login System
- **User ID/Email/Register Number** login options
- **OTP Verification** for account activation
- **Role-based Access Control** (RBAC)
- **JWT Tokens** with refresh mechanism
- **Password Reset** with OTP verification

### Security Features
- **Encrypted Passwords** (bcrypt)
- **Rate Limiting** for API endpoints  
- **CORS Protection** for frontend
- **Input Validation** and sanitization
- **Audit Logging** for all user actions

## 🏢 CEG Hostel Blocks (Real Data Integration)

#### Boys' Hostels (13 blocks)
- AMBAL (3 floors, 64 rooms), ANICHAM (3 floors, 64 rooms)
- CHEMPARUTHI (3 floors, 64 rooms), KURINJI (3 floors, 97 rooms)
- MAHIZHAM (2 floors, 120 rooms), MANTHARAI (2 floors, 108 rooms)
- MARUTHAM (2 floors, 120 rooms), SAMANTHI (2 floors, 42 rooms)
- SAMPANKI (2 floors, 108 rooms), SENBAGAM (2 floors, 59 rooms)
- THAZHAM (1 floor, 54 rooms), THUMBAI (3 floors, 108 rooms)
- VAAGAI (3 floors, 133 rooms)

#### Girls' Hostels (7 blocks)
- MALLIGAI (3 floors, 80 rooms), MALLIGAI EXTN (2 floors, 32 rooms)
- MULLAI (3 floors, 72 rooms), PAARIJATHAM (3 floors, 48 rooms)
- PAARIJATHAM EXTN (3 floors, 84 rooms), ROJA (3 floors, 153 rooms)
- THAMARAI (3 floors, 66 rooms)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (v5+)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ceg_hostel_management

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Logging**: Winston
- **Validation**: express-validator

### Frontend  
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint
- **API Testing**: Postman/Thunder Client

## 📱 Features in Detail

### IoT Integration
- **QR/RFID Access Cards** for hostel and mess entry
- **Attendance Tracking** via digital scans
- **Unauthorized Access Alerts** in real-time
- **Digital Visitor Passes** with time restrictions

### Payment System
- **Multiple Payment Methods** (UPI, Cards, Net Banking)
- **Automatic Fee Calculation** based on room type
- **Refund Processing** for early departures
- **Payment History** and receipts

### Smart Allocation Algorithm
- **Priority Factors**: Re-admission, Scholarship, Distance, CGPA
- **Constraint Handling**: Gender, Accessibility, Year-wise policies
- **Roommate Preferences** and group allocations
- **Automatic Re-balancing** during readmission cycles

### Communication System
- **Real-time Notifications** via Socket.IO
- **Email Alerts** for important updates
- **SMS Integration** for OTP and urgent alerts
- **Announcement System** by wardens and admin

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For any queries or support, please contact:
- **Email**: echquery@yahoo.com
- **Phone**: 044-22352257
- **Address**: Engineering College Hostels, 12 Sardar Patel Road, Anna University, Guindy, Chennai - 600025

---

**Developed with ❤️ by Team-6 for College of Engineering, Guindy - Anna University**
- MAHIZHAM (2 floors, 120 rooms), MANTHARAI (2 floors, 108 rooms)
- MARUTHAM (2 floors, 120 rooms), SAMANTHI (2 floors, 42 rooms)
- SAMPANKI (2 floors, 108 rooms), SENBAGAM (2 floors, 59 rooms)
- THAZHAM (1 floor, 54 rooms), THUMBAI (3 floors, 108 rooms)
- VAAGAI (3 floors, 133 rooms)

#### Girls' Hostels (9 blocks)
- MALLIGAI (3 floors, 80 rooms), MALLIGAI EXTN (2 floors, 32 rooms)
- MULLAI (3 floors, 72 rooms), PAARIJATHAM (3 floors, 48 rooms)
- PAARIJATHAM EXTN (3 floors, 84 rooms), ROJA (3 floors, 153 rooms)
- THAMARAI (3 floors, 66 rooms)

## 🛠️ Tech Stack
- **Frontend:** React.js + Tailwind CSS + Material UI
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JWT + OTP (Email/SMS)
- **Payments:** Razorpay + UPI Integration
- **IoT:** QR Code + RFID Scanner Integration
- **Maps:** Google Maps API (Hostel Navigation)
- **Notifications:** Firebase Cloud Messaging + Email/SMS Alerts
- **Cloud Storage:** AWS S3 / Cloudinary
- **PDF Generation:** PDFKit + QR Libraries

## 📱 IoT & Smart Features
- **QR/RFID Attendance System** (Daily hostel entry/exit logs)
- **Smart Mess Access Control** (Auto fee verification)
- **Digital ID Card Generation** (Printable with QR codes)
- **Unauthorized Access Alerts** (Real-time security monitoring)
- **Automated Room Layout Generation** (Post-admission)

## 💳 Payment Integration
- **Hostel Fee Payment** (Semester/Annual)
- **Mess Bill Management** (Monthly auto-billing)
- **Caution Deposit Handling**
- **Auto Receipt Generation** (PDF + Email)
- **Payment Status Sync** (QR access activation)

## 🔒 Security & Privacy
- **Role-based Access Control** (Student/Warden/Admin)
- **Two-Factor Authentication** (OTP verification)
- **Data Encryption** (MongoDB + Transit)
- **HMAC Signed QR Codes** (Anti-forgery)
- **Comprehensive Audit Logs**

## 🎯 Problem Statement Solved
✅ **Digital Leave Forms** → Eliminates manual paperwork
✅ **Student-Warden Communication** → Real-time messaging & notifications
✅ **Complaint Tracking** → Ticket-based system with status updates
✅ **Centralized Feedback** → Review & rating system
✅ **Hostel Navigation** → Interactive maps with room locations

## 🌍 Social Impact
- **Paperless Operations** → Eco-friendly digital transformation
- **Transparency** → Real-time status tracking for all processes
- **Accessibility** → Digital infrastructure for educational hostels
- **Efficiency** → Automated workflows reduce manual effort
- **Student Experience** → User-friendly interface & mobile support

## 📊 System Architecture
```
Frontend (React.js) → Backend API (Node.js + Express) → MongoDB Database
                 ↘ QR/RFID Scanner API ↙
                 ↘ Payment Gateway (Razorpay/UPI) ↙
                 ↘ Google Maps API ↙
                 ↘ Firebase Notifications ↙
                 ↘ Email/SMS Services ↙
```

## 🚀 Advanced Features
- **AI-powered Room Allocation** (Priority optimization)
- **Predictive Analytics** (Mess usage, complaint patterns)
- **Automated Re-admission Processing** (Semester transitions)
- **Mobile Progressive Web App** (Offline capability)
- **Real-time Dashboard** (Live statistics & monitoring)

## 📱 Future Enhancements
- **AI Chatbot** for student queries
- **Biometric Authentication** (Fingerprint/Face recognition)
- **IoT Sensor Integration** (Occupancy detection)
- **Blockchain** for tamper-proof records
- **Multi-language Support** (Tamil, Hindi, English)

## 👥 Team Responsibilities
- **Frontend Development** (React.js, UI/UX) → **K. Manoj Kumar**
- **Backend APIs** (Node.js, Authentication, Payments) → **B. Jothi Prakesh**  
- **Database & Integration** (MongoDB, IoT, Maps, QR) → **R. Dilli Babu**

---

**🎓 Developed for College of Engineering, Guindy - Anna University**  
**Social Oriented Project (Team-6) - Digital Innovation in Hostel Management**
