const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  feeType: { type: String, enum: ['hostel_fee', 'mess_fee', 'security_deposit', 'fine', 'other'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  orderId: String,
  paymentId: String,
  status: { type: String, enum: ['created', 'success', 'failed', 'refunded'], default: 'created' },
  method: String,
  gateway: { type: String, enum: ['razorpay', 'stripe', 'upi', 'card', 'netbanking'], default: 'razorpay' },
  receiptUrl: String,
  notes: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

paymentSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
