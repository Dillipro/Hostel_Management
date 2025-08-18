const mongoose = require('mongoose');

const disciplineRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  category: { type: String, enum: ['noise', 'curfew', 'cleanliness', 'misconduct', 'vandalism', 'other'], required: true },
  severity: { type: String, enum: ['minor', 'moderate', 'major', 'critical'], default: 'minor' },
  description: { type: String, required: true },
  incidentAt: { type: Date, default: Date.now },
  location: {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
  },
  status: { type: String, enum: ['open', 'under_review', 'closed'], default: 'open' },
  actions: [{
    action: { type: String, enum: ['warning', 'fine', 'suspension', 'counseling', 'other'] },
    points: { type: Number, default: 0 },
    note: String,
    actionAt: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attachments: [{ fileName: String, fileUrl: String }],
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

disciplineRecordSchema.index({ studentId: 1, createdAt: -1 });
disciplineRecordSchema.index({ 'location.blockId': 1, createdAt: -1 });

module.exports = mongoose.model('DisciplineRecord', disciplineRecordSchema);
