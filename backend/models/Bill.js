const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  type: { type: String, enum: ['hostel_rent', 'mess_bill', 'fine'], required: true },
  month: String, // YYYY-MM for mess/hostel monthly bills
  amount: { type: Number, required: true },
  dueDate: Date,
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'waived'], default: 'pending' },
  items: [{ description: String, amount: Number }],
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: Date,
  paymentRef: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

billSchema.index({ studentId: 1, type: 1, month: 1 });

module.exports = mongoose.model('Bill', billSchema);
