const express = require('express');
const router = express.Router();
const { authorizeRoles, authenticateToken } = require('../middleware/auth');
const { Hostel, Block, Room, Mess, AccommodationPolicy } = require('../models/HostelInfrastructure');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const _ = require('lodash');
const FeeStructure = require('../models/FeeStructure');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { sendNotification } = require('../utils/notification');
const IoTDevice = require('../models/IoTDevice');
const hostelManagementRouter = require('./hostelManagement');

// Ensure admin roles
router.use(authenticateToken, authorizeRoles(['admin', 'super_admin']));

// Hostels CRUD (basic)
router.post('/hostels', async (req, res) => {
  try { const hostel = await new Hostel(req.body).save(); res.status(201).json({ success: true, data: hostel }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/hostels/:id', async (req, res) => {
  try { const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' }); res.json({ success: true, data: hostel }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Block CRUD
router.post('/blocks', async (req, res) => {
  try { const block = await new Block(req.body).save(); res.status(201).json({ success: true, data: block }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/blocks/:id', async (req, res) => {
  try { const block = await Block.findByIdAndUpdate(req.params.id, req.body, { new: true }); if (!block) return res.status(404).json({ success: false, message: 'Block not found' }); res.json({ success: true, data: block }); }
  catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Room setup CRUD
router.post('/rooms', async (req, res) => {
  try {
    const room = await new Room(req.body).save();
    res.status(201).json({ success: true, data: room });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

router.put('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Configure attendance settings for a block (admin or warden via admin route)
router.put('/blocks/:blockId/attendance-settings', async (req, res) => {
  try {
    const { blockId } = req.params;
    const { enabled, geofence, timeWindows } = req.body;
    const updated = await Block.findByIdAndUpdate(
      blockId,
      { $set: { 'attendanceSettings.enabled': enabled, 'attendanceSettings.geofence': geofence, 'attendanceSettings.timeWindows': timeWindows } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Block not found' });
  // Audit
  await AuditLog.create({ actorId: req.user._id, actorRole: req.user.role, action: 'update', resource: 'BlockAttendanceSettings', resourceId: blockId, ip: req.ip, userAgent: req.headers['user-agent'], metadata: { enabled, geofence, timeWindows } });
  res.json({ success: true, data: updated.attendanceSettings });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.get('/blocks/:blockId/attendance-settings', async (req, res) => {
  try {
    const { blockId } = req.params;
    const block = await Block.findById(blockId).select('attendanceSettings');
    if (!block) return res.status(404).json({ success: false, message: 'Block not found' });
    res.json({ success: true, data: block.attendanceSettings || { enabled: false } });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// List blocks attendance settings
router.get('/blocks/attendance-settings', async (req, res) => {
  try {
    const { hostelId, enabled } = req.query;
    const q = { ...(hostelId && { hostelId }) };
    const blocks = await Block.find(q).select('name code hostelId attendanceSettings').populate('hostelId','name code').lean();
    const items = blocks
      .map(b => ({
        blockId: b._id,
        blockName: b.name,
        blockCode: b.code,
        hostel: { id: b.hostelId?._id, name: b.hostelId?.name, code: b.hostelId?.code },
        attendanceSettings: b.attendanceSettings || { enabled: false }
      }))
      .filter(x => enabled == null ? true : String(x.attendanceSettings.enabled) === String(enabled));
    res.json({ success: true, data: items });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Broadcast notifications (immediate) to all users of a role or to students in a block
router.post('/broadcast', async (req, res) => {
  try {
    const { target = { role: 'student' }, title, message, data, priority = 'normal' } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'title and message required' });

    let userIds = [];
    if (target.role) {
      const User = require('../models/User');
      const users = await User.find({ role: target.role, isActive: true }).select('_id');
      userIds = users.map(u => u._id);
    }
    if (target.blockId) {
      const { Room } = require('../models/HostelInfrastructure');
      const rooms = await Room.find({ blockId: target.blockId }).select('occupants.studentId');
      const ids = rooms.flatMap(r => (r.occupants || []).map(o => o.studentId).filter(Boolean));
      userIds.push(...ids);
    }
    userIds = [...new Set(userIds.map(id => id.toString()))];

    const results = [];
    for (const uid of userIds) {
      results.push(sendNotification({ userId: uid, type: 'broadcast', title, message, data, priority }));
    }
    await Promise.all(results);
    // Audit
    await AuditLog.create({ actorId: req.user._id, actorRole: req.user.role, action: 'broadcast', resource: 'Notification', ip: req.ip, userAgent: req.headers['user-agent'], metadata: { target, title } });
    res.json({ success: true, message: `Broadcast sent to ${userIds.length} users` });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: 'Room deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Mess setup
router.post('/mess', async (req, res) => {
  try {
    const mess = await new Mess(req.body).save();
    res.status(201).json({ success: true, data: mess });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// List messes (optional filters)
router.get('/mess', async (req, res) => {
  try {
    const { hostelId, isActive } = req.query;
    const q = { ...(hostelId && { hostelId }), ...(isActive != null && { isActive: isActive === 'true' }) };
    const list = await Mess.find(q).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Get one mess
router.get('/mess/:id', async (req, res) => {
  try {
    const mess = await Mess.findById(req.params.id).lean();
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });
    res.json({ success: true, data: mess });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.put('/mess/:id', async (req, res) => {
  try {
    const mess = await Mess.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: mess });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Delete mess
router.delete('/mess/:id', async (req, res) => {
  try {
    const mess = await Mess.findByIdAndDelete(req.params.id);
    if (!mess) return res.status(404).json({ success: false, message: 'Mess not found' });
    res.json({ success: true, message: 'Mess deleted' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Reports endpoints are defined explicitly later in this file.

// Warden assignment
router.post('/wardens/assign', async (req, res) => {
  try {
    const { level = 'hostel', levelId, wardenId, role = 'warden', floors = [], isPrimary = false } = req.body;
    if (level === 'hostel') {
      const updated = await Hostel.findByIdAndUpdate(levelId, { $push: { wardens: { wardenId, role, isPrimary, assignedDate: new Date() } } }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Hostel not found' });
      return res.json({ success: true, data: updated.wardens });
    } else {
      const updated = await Block.findByIdAndUpdate(levelId, { $push: { wardens: { wardenId, role, floors } } }, { new: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Block not found' });
      return res.json({ success: true, data: updated.wardens });
    }
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Student data import (CSV-like JSON array)
// JSON array import (legacy/simple)
router.post('/students/import', async (req, res) => {
  try {
    const { students = [], academicYear = '2025-26' } = req.body;
    const Student = require('../models/Student');
    const results = [];
    for (const s of students) {
      const doc = {
        role: 'student',
        name: s.name,
        email: s.email,
        phone: s.phone,
        academic: { registerNumber: String(s.rollNo).toUpperCase(), department: s.department, program: s.program || 'UG', yearOfStudy: s.year, semester: s.semester || 1, admissionYear: Number(academicYear.split('-')[0]) },
        applicationStatus: { admissionStatus: s.isReadmission ? 'approved' : 'applied', admissionCycle: academicYear, appliedAt: new Date() },
        hostelApplication: { academicYear, status: 'pending' },
        preferences: { blockChoice: s.hostelPreference ? [s.hostelPreference] : [] },
        specialCategories: { },
      };
      const up = await Student.findOneAndUpdate({ 'academic.registerNumber': doc.academic.registerNumber }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
      results.push(up);
    }
    res.status(201).json({ success: true, count: results.length });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// CSV upload import: multipart/form-data with file field 'file'
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/students/import/csv', upload.single('file'), async (req, res) => {
  try {
    const academicYear = req.body.academicYear || '2025-26';
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required (field: file)' });
    const csv = req.file.buffer.toString('utf8');
  const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
    const requiredCols = ['Roll No', 'Name', 'Department', 'Year', 'Category', 'Priority Rank', 'Hostel Preference', 'Admission Type'];
    const header = Object.keys(rows[0] || {});
    for (const col of requiredCols) if (!header.includes(col)) return res.status(400).json({ success: false, message: `Missing column: ${col}` });

    const Student = require('../models/Student');
    const results = [];
    for (const r of rows) {
      const rollNo = String(r['Roll No']).trim().toUpperCase();
      const priority = Number(r['Priority Rank']) || 0;
      const isReadmission = /readmission/i.test(String(r['Admission Type']));
      // Normalize department/category/roomType
      const dept = normalizeDepartment(r['Department']);
      const category = normalizeCategory(r['Category']);
      const roomType = normalizeRoomType(r['Room Type']);
      const doc = {
        role: 'student',
        name: r['Name'],
        email: r['Email'] || undefined,
        phone: r['Phone'] || undefined,
        department: dept,
        year: Number(r['Year']) || undefined,
        academic: { registerNumber: rollNo, department: dept, program: r['Program'] || 'UG', yearOfStudy: Number(r['Year']) || 1, semester: 1, admissionYear: Number(academicYear.split('-')[0]) },
        applicationStatus: { admissionStatus: isReadmission ? 'approved' : 'applied', admissionCycle: academicYear, appliedAt: new Date() },
        hostelApplication: { academicYear, status: 'pending', type: isReadmission ? 'readmission' : 'admission' },
        preferences: { blockChoice: r['Hostel Preference'] ? [r['Hostel Preference']] : [] },
        specialCategories: { category },
        cgpaTopLevel: Number(r['CGPA'] || 0),
        priorityRank: priority,
        roomTypePreference: roomType
      };
      const up = await Student.findOneAndUpdate({ 'academic.registerNumber': doc.academic.registerNumber }, doc, { upsert: true, new: true, setDefaultsOnInsert: true });
      results.push(up);
    }
    res.status(201).json({ success: true, count: results.length });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Provide a CSV template for student import
router.get('/students/import/template.csv', async (req, res) => {
  const header = [
    'Roll No', 'Name', 'Email', 'Phone', 'Department', 'Program', 'Year', 'Category', 'Priority Rank', 'Hostel Preference', 'Room Type', 'Admission Type', 'CGPA'
  ].join(',') + '\n';
  const example = [
    '2023123456,Ananya R,ananya@example.com,9876543210,Computer Science Engineering,UG,1,GEN,12,Gents Hostel A,double,Admission,8.7',
    '2023123457,Prakash M,prakash@example.com,9876543211,Mechanical Engineering,UG,2,OBC,22,Gents Hostel B,triple,Readmission,7.9'
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=student-import-template.csv');
  res.send(header + example + '\n');
});

// Normalizers
function normalizeDepartment(dep) {
  if (!dep) return dep;
  const map = {
    'cse': 'Computer Science Engineering',
    'computer science': 'Computer Science Engineering',
    'ece': 'Electronics & Communication Engineering',
    'eee': 'Electrical & Electronics Engineering',
    'mech': 'Mechanical Engineering',
    'mechanical': 'Mechanical Engineering'
  };
  const key = String(dep).trim().toLowerCase();
  return map[key] || dep;
}
function normalizeCategory(cat) {
  if (!cat) return cat;
  const key = String(cat).trim().toUpperCase();
  const allowed = ['GEN', 'OBC', 'SC', 'ST', 'EWS', 'PWD'];
  return allowed.includes(key) ? key : key;
}
function normalizeRoomType(rt) {
  const key = String(rt || '').trim().toLowerCase();
  const allowed = ['single','double','triple','quad'];
  return allowed.includes(key) ? key : undefined;
}

// Smart allocation engine (simplified heuristic)
// Advanced smart allocation
router.post('/allocate/rooms', async (req, res) => {
  try {
    const { academicYear = '2025-26', policyId } = req.body;
    const Student = require('../models/Student');

    const policy = policyId ? await AccommodationPolicy.findById(policyId).lean() : await AccommodationPolicy.findOne({ academicYear, isActive: true }).lean();
    const candidates = await Student.find({ 'hostelApplication.academicYear': academicYear, 'hostelApplication.status': 'pending' }).lean();
    const rooms = await Room.find({ status: { $in: ['available', 'reserved'] }, usageType: 'residential' }).lean();

    // Score function: merit/category/year/priorityRank + scholarship/boost + readmission continuity
    const weights = _.fromPairs((policy?.priorityOrder || []).filter(p => p.isActive).map(p => [p.factor, p.weight]));
    function scoreStudent(s) {
      let sc = 0;
      sc += (weights.cgpa || 0) * (s.academic?.cgpa || s.cgpaTopLevel || 0);
      sc += (weights.year_of_study || 0) * (s.academic?.yearOfStudy || s.year || 0);
      sc += (weights.economically_weaker || 0) * (s.specialCategories?.ews ? 1 : 0);
      sc += (weights.scholarship || 0) * (s.financialInfo?.scholarship?.hasScholarship ? 1 : 0);
      sc += (weights.readmission || 0) * (s.hostelApplication?.type === 'readmission' ? 1 : 0);
      // Priority rank: smaller rank is better
      if (s.priorityRank) sc += (weights.priority_rank || 0) * (1000 - s.priorityRank);
      return sc;
    }

    // Grouping options
    const groupByDept = policy?.constraints?.departmentClustering;
    const groupByYear = policy?.constraints?.yearWiseAllocation;

    // Helper to check room suitability
    function suitable(room, s) {
      if (room.status === 'maintenance' || room.usageType !== 'residential') return false;
      if ((room.currentOccupancy || 0) >= room.capacity) return false;
      if (s.roomTypePreference && room.roomType !== s.roomTypePreference) return false;
      return true;
    }

    // Attempt to prefer same room/block for readmissions
    const roomById = _.keyBy(rooms, '_id');
    const allocations = [];
    const taken = new Set();

    // Pre-pass for readmissions continuity
    for (const s of candidates.filter(c => c.hostelApplication?.type === 'readmission')) {
      const prevRoomId = s.hostelInfo?.currentAllocation?.roomId || s.hostelInfo?.allocationHistory?.slice(-1)[0]?.roomId;
      const prevBlockId = s.hostelInfo?.currentAllocation?.blockId || s.hostelInfo?.allocationHistory?.slice(-1)[0]?.blockId;
      if (prevRoomId && roomById[prevRoomId] && suitable(roomById[prevRoomId], s) && !taken.has(String(prevRoomId))) {
        allocations.push({ studentId: s._id, roomId: prevRoomId });
        taken.add(String(prevRoomId));
        roomById[prevRoomId].currentOccupancy = (roomById[prevRoomId].currentOccupancy || 0) + 1;
      } else {
        // Try any room in previous block
        const options = rooms.filter(r => String(r.blockId) === String(prevBlockId) && suitable(r, s) && !taken.has(String(r._id)));
        if (options.length) {
          const r = _.minBy(options, r => r.currentOccupancy / Math.max(1, r.capacity));
          allocations.push({ studentId: s._id, roomId: r._id });
          taken.add(String(r._id));
          r.currentOccupancy = (r.currentOccupancy || 0) + 1;
        }
      }
    }

    // Remaining candidates sorted by score
    const remaining = candidates.filter(s => !allocations.find(a => String(a.studentId) === String(s._id)));
    remaining.sort((a, b) => scoreStudent(b) - scoreStudent(a));

    // Load-balancing: pick least-filled suitable room, optionally within group
    for (const s of remaining) {
      let options = rooms.filter(r => suitable(r, s) && !taken.has(String(r._id)));
      if (groupByDept) {
        // prefer rooms within blocks that already have same department residents (soft bias)
        const withDept = options.filter(r => (r.tags || []).includes(`dept:${s.academic?.department || s.department}`));
        if (withDept.length) options = withDept;
      }
      if (groupByYear) {
        const withYear = options.filter(r => (r.tags || []).includes(`year:${s.academic?.yearOfStudy || s.year}`));
        if (withYear.length) options = withYear;
      }
      if (!options.length) continue;
      const pick = _.minBy(options, r => r.currentOccupancy / Math.max(1, r.capacity));
      allocations.push({ studentId: s._id, roomId: pick._id });
      taken.add(String(pick._id));
      pick.currentOccupancy = (pick.currentOccupancy || 0) + 1;
      pick.status = pick.currentOccupancy >= pick.capacity ? 'occupied' : pick.status;
    }

    // Apply allocations
    const updates = [];
    for (const a of allocations) {
      updates.push(
        Student.findByIdAndUpdate(a.studentId, { 'hostelApplication.allocatedRoom': a.roomId, 'hostelApplication.status': 'allocated', 'hostelApplication.allocatedAt': new Date() })
      );
      updates.push(
        Room.findByIdAndUpdate(a.roomId, { $inc: { currentOccupancy: 1 }, $push: { occupants: { studentId: a.studentId, bedNumber: 1, occupiedFrom: new Date(), isActive: true } }, status: 'occupied' })
      );
    }
    await Promise.all(updates);
    res.json({ success: true, allocated: allocations.length });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Allocation reports
router.get('/reports/occupancy', async (req, res) => {
  try {
    const rooms = await Room.find({}).select('blockId roomNumber capacity currentOccupancy');
    res.json({ success: true, data: rooms });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/reports/vacancies', async (req, res) => {
  try {
    const rooms = await Room.find({ status: { $in: ['available', 'reserved'] } }).select('blockId roomNumber capacity currentOccupancy');
    res.json({ success: true, data: rooms });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Fee setup structure (policy)
router.post('/accommodation-policy', async (req, res) => {
  try {
    const policy = await new AccommodationPolicy(req.body).save();
    res.status(201).json({ success: true, data: policy });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// IoT Device setup
router.post('/iot/devices', async (req, res) => {
  try {
    const device = await new IoTDevice(req.body).save();
    res.status(201).json({ success: true, data: device });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

router.get('/iot/devices', async (req, res) => {
  try {
    const list = await IoTDevice.find({}).lean();
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;

// ==== Fee Structure Management ====
// Create fee structure
router.post('/fees/structures', async (req, res) => {
  try {
    const fs = await new FeeStructure(req.body).save();
    res.status(201).json({ success: true, data: fs });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// List fee structures (optional filters: hostelId, academicYear, isActive)
router.get('/fees/structures', async (req, res) => {
  try {
    const { hostelId, academicYear, isActive } = req.query;
    const q = { ...(hostelId && { hostelId }), ...(academicYear && { academicYear }), ...(isActive != null && { isActive: isActive === 'true' }) };
    const list = await FeeStructure.find(q).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Get one fee structure
router.get('/fees/structures/:id', async (req, res) => {
  try {
    const fs = await FeeStructure.findById(req.params.id).lean();
    if (!fs) return res.status(404).json({ success: false, message: 'FeeStructure not found' });
    res.json({ success: true, data: fs });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Update fee structure
router.put('/fees/structures/:id', async (req, res) => {
  try {
    const fs = await FeeStructure.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fs) return res.status(404).json({ success: false, message: 'FeeStructure not found' });
    res.json({ success: true, data: fs });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});

// Delete fee structure
router.delete('/fees/structures/:id', async (req, res) => {
  try {
    const fs = await FeeStructure.findByIdAndDelete(req.params.id);
    if (!fs) return res.status(404).json({ success: false, message: 'FeeStructure not found' });
    res.json({ success: true, message: 'FeeStructure deleted' });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
});
