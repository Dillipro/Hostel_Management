const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { type: String, enum: ['unauthorized_entry', 'emergency', 'system'], required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  message: { type: String, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess' },
  deviceId: String,
  metadata: mongoose.Schema.Types.Mixed,
  isResolved: { type: Boolean, default: false },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

alertSchema.index({ type: 1, isResolved: 1, createdAt: -1 });
alertSchema.index({ blockId: 1, isResolved: 1 });

module.exports = mongoose.model('Alert', alertSchema);
