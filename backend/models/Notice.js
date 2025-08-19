const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: { type: String, enum: ['all', 'students', 'wardens', 'block', 'hostel', 'mess'], default: 'all' },
  blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: Date,
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

noticeSchema.index({ audience: 1, createdAt: -1 });
noticeSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
