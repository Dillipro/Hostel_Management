require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Role models
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

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ceg-hostel';

async function upsertUser(Model, data, { setPassword = false } = {}) {
  const existing = await User.findOne({ userId: data.userId });
  if (existing) {
    // Update minimal fields; avoid overwriting password unless forced
    existing.email = data.email || existing.email;
    existing.personalInfo = data.personalInfo || existing.personalInfo;
    existing.role = data.role || existing.role;
    existing.isVerified = true;
    if (setPassword && data.password) {
      existing.password = data.password; // pre-save hook will hash
    }
    await existing.save();
    return { doc: existing, created: false };
  }
  const doc = new Model({ ...data, isVerified: true });
  await doc.save();
  return { doc, created: true };
}

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', uri);

    const defaultUsers = [
      {
        model: Admin,
        data: {
          userId: 'superadmin',
          email: 'super@ceg.edu',
          password: 'Admin@123',
          role: 'super_admin',
          personalInfo: { firstName: 'Super', lastName: 'Admin', phoneNumber: '+911234567890' },
          employeeId: 'ADM1001',
          designation: 'Chief Administrative Officer',
          accessLevel: 'super_admin',
          joiningDate: new Date('2019-01-01')
        }
      },
      {
        model: Admin,
        data: {
          userId: 'admin',
          email: 'admin@ceg.edu',
          password: 'Admin@123',
          role: 'admin',
          personalInfo: { firstName: 'Admin', lastName: 'User', phoneNumber: '+919876543210' },
          employeeId: 'ADM1002',
          designation: 'Hostel Administrator',
          accessLevel: 'admin',
          joiningDate: new Date('2020-01-01')
        }
      },
      {
        model: Warden,
        data: {
          userId: 'warden1',
          email: 'warden@ceg.edu',
          password: 'Warden@123',
          role: 'warden',
          personalInfo: { firstName: 'Hostel', lastName: 'Warden', phoneNumber: '+919000000001' },
          employeeId: 'WRD2001',
          designation: 'Hostel Warden',
          department: 'Hostels',
          joiningDate: new Date('2020-06-01')
        }
      },
      {
        model: Counselor,
        data: {
          userId: 'counselor1',
          email: 'counselor@ceg.edu',
          password: 'Counsel@123',
          role: 'counselor',
          personalInfo: { firstName: 'Student', lastName: 'Counselor', phoneNumber: '+919000000002' },
          employeeId: 'CNS3001'
        }
      },
      {
        model: MessManager,
        data: {
          userId: 'mess1',
          email: 'mess@ceg.edu',
          password: 'Mess@123',
          role: 'mess_manager',
          personalInfo: { firstName: 'Mess', lastName: 'Manager', phoneNumber: '+919000000003' },
          employeeId: 'MES4001'
        }
      },
      {
        model: MaintenanceStaff,
        data: {
          userId: 'maint1',
          email: 'maintenance@ceg.edu',
          password: 'Maint@123',
          role: 'maintenance',
          personalInfo: { firstName: 'Maintenance', lastName: 'Staff', phoneNumber: '+919000000004' },
          employeeId: 'MNT5001',
          specialization: 'general'
        }
      },
      {
        model: SecurityStaff,
        data: {
          userId: 'security1',
          email: 'security@ceg.edu',
          password: 'Secure@123',
          role: 'security',
          personalInfo: { firstName: 'Security', lastName: 'Officer', phoneNumber: '+919000000005' },
          employeeId: 'SEC6001'
        }
      },
      {
        model: AccountsOfficer,
        data: {
          userId: 'accounts1',
          email: 'accounts@ceg.edu',
          password: 'Accounts@123',
          role: 'accounts',
          personalInfo: { firstName: 'Accounts', lastName: 'Officer', phoneNumber: '+919000000006' },
          employeeId: 'ACC7001'
        }
      },
      {
        model: MedicalOfficer,
        data: {
          userId: 'medical1',
          email: 'medical@ceg.edu',
          password: 'Medical@123',
          role: 'medical_officer',
          personalInfo: { firstName: 'Medical', lastName: 'Officer', phoneNumber: '+919000000007' },
          employeeId: 'MED8001'
        }
      },
      {
        model: Student,
        data: {
          userId: 'st1001',
          email: 'student@ceg.edu',
          password: 'Student@123',
          role: 'student',
          personalInfo: { firstName: 'Demo', lastName: 'Student', phoneNumber: '+919000000008' },
          academic: {
            registerNumber: '2023123456',
            department: 'Computer Science Engineering',
            program: 'UG',
            yearOfStudy: 3,
            semester: 5,
            cgpa: 8.5,
            admissionYear: 2023
          },
          applicationStatus: { admissionStatus: 'approved' }
        }
      }
    ];

    const results = [];
    for (const entry of defaultUsers) {
      const res = await upsertUser(entry.model, entry.data, { setPassword: true });
      results.push({ userId: entry.data.userId, role: entry.data.role, created: res.created });
    }

    console.table(results);
    console.log('Default users ready. Credentials (userId/email with the given passwords).');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
