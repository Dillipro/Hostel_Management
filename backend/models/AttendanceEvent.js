const mongoose = require('mongoose');

const attendanceEventSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: { type: String, enum: ['hostel_entry', 'hostel_exit', 'mess_entry'], required: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, enum: ['iot', 'manual'], default: 'iot' },
  deviceId: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

attendanceEventSchema.index({ studentId: 1, timestamp: -1 });

module.exports = mongoose.model('AttendanceEvent', attendanceEventSchema);
