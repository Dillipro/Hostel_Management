const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { AccessCard, Block, Room, Hostel } = require('../models/HostelInfrastructure');
const rateLimit = require('express-rate-limit');
const moment = require('moment-timezone');

function isWithinGeofence({ lat, lng }, geofence) {
  if (!geofence?.center || !geofence?.radiusMeters) return true; // if not set, allow
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat - geofence.center.lat);
  const dLng = toRad(lng - geofence.center.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(geofence.center.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= geofence.radiusMeters;
}

async function isWithinTimeWindowTz(block, windows, scope) {
  if (!Array.isArray(windows) || windows.length === 0) return true; // if not set, allow
  const hostel = await Hostel.findById(block.hostelId).select('timezone').lean();
  const tz = hostel?.timezone || 'Asia/Kolkata';
  const now = moment().tz(tz);
  const day = now.day();
  const hh = now.format('HH');
  const mm = now.format('mm');
  const nowStr = `${hh}:${mm}`;
  return windows
    .filter(w => !scope || !w.scope || w.scope === scope)
    .some(w => (w.daysOfWeek?.length ? w.daysOfWeek.includes(day) : true) && (!w.startTime || !w.endTime || (nowStr >= w.startTime && nowStr <= w.endTime)));
}

// Manual attendance entry by warden/admin
router.post('/manual', authenticateToken, authorizeRoles(['warden', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { studentId, scope = 'hostel_entry', accessPoint = 'manual_entry', success = true, gps } = req.body;
    const card = await AccessCard.findOne({ studentId });
    if (!card) return res.status(404).json({ success: false, message: 'Access card not found' });
    // Optional: enforce time window if block attendance is enabled
    const Student = require('../models/Student');
    const s = await Student.findById(studentId).select('hostelApplication').populate({ path: 'hostelApplication.blockId' });
    const block = s?.hostelApplication?.blockId;
  const settings = block?.attendanceSettings;
    if (settings?.enabled) {
      // GPS required if geofence is configured
      if (!gps || typeof gps.lat !== 'number' || typeof gps.lng !== 'number') {
        return res.status(400).json({ success: false, message: 'GPS coordinates required' });
      }
      if (!isWithinGeofence({ lat: gps.lat, lng: gps.lng }, settings.geofence)) {
        return res.status(403).json({ success: false, message: 'Outside allowed geofence' });
      }
      // Adjust time to hostel timezone
  const allowed = await isWithinTimeWindowTz(block, settings.timeWindows, scope);
  if (!allowed) {
        return res.status(403).json({ success: false, message: 'Attendance window closed' });
      }
    }
    // Try to attach block/hostel info from student's allocation
    const loc = {};
    if (s?.hostelApplication?.blockId?.hostelId) {
      loc.hostelId = s.hostelApplication.blockId.hostelId.toString();
    }
    if (s?.hostelApplication?.blockId?._id) {
      loc.blockId = s.hostelApplication.blockId._id.toString();
    }
    await AccessCard.updateOne(
      { _id: card._id },
  { $push: { usageLog: { timestamp: new Date(), accessPoint, scannerType: 'manual', action: 'entry', success, location: loc, gps } } }
    );
    res.json({ success: true, message: 'Attendance recorded' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// IoT device ingestion (secured by pre-shared token header)
const ingestLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
router.post('/ingest', ingestLimiter, async (req, res) => {
  try {
    const token = req.headers['x-iot-token'];
    if (!token || token !== (process.env.IOT_INGEST_TOKEN || 'iot-dev-token')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  const { studentId, accessPoint, deviceId, success = true, gps, scope = 'hostel_entry' } = req.body;
    const card = await AccessCard.findOne({ studentId });
    if (!card) return res.status(404).json({ success: false, message: 'Access card not found' });
    // Enforce GPS geofence and time windows based on student's block settings
    const Student = require('../models/Student');
    const s = await Student.findById(studentId).select('hostelApplication').populate({ path: 'hostelApplication.blockId' });
    const block = s?.hostelApplication?.blockId;
  const settings = block?.attendanceSettings;
    if (settings?.enabled) {
      if (!gps || typeof gps.lat !== 'number' || typeof gps.lng !== 'number') {
        return res.status(400).json({ success: false, message: 'GPS coordinates required' });
      }
      if (!isWithinGeofence({ lat: gps.lat, lng: gps.lng }, settings.geofence)) {
        return res.status(403).json({ success: false, message: 'Outside allowed geofence' });
      }
  const allowed = await isWithinTimeWindowTz(block, settings.timeWindows, scope);
  if (!allowed) {
        return res.status(403).json({ success: false, message: 'Attendance window closed' });
      }
    }
    const loc = {};
    if (s?.hostelApplication?.blockId?.hostelId) {
      loc.hostelId = s.hostelApplication.blockId.hostelId.toString();
    }
    if (s?.hostelApplication?.blockId?._id) {
      loc.blockId = s.hostelApplication.blockId._id.toString();
    }
    // Wrong entry: check device location
    let deviceMeta = null;
    if (deviceId) {
      const IoTDevice = require('../models/IoTDevice');
      deviceMeta = await IoTDevice.findOne({ deviceId }).lean();
      if (scope === 'hostel_entry' && deviceMeta?.location?.blockId && String(deviceMeta.location.blockId) !== String(block?._id)) {
        return res.status(403).json({ success: false, message: 'Wrong block/hostel entry' });
      }
    }

    await AccessCard.updateOne(
      { _id: card._id },
      { $push: { usageLog: { timestamp: new Date(), accessPoint, scannerType: 'iot', action: 'entry', deviceId, success, location: loc, gps } } }
    );
    const io = global.__io; if (io) io.to(`block:${block?._id}`).emit('scan-event', { success: true, scope, student: { id: studentId }, device: deviceMeta, at: new Date() });
    res.json({ success: true, message: 'Ingested' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
