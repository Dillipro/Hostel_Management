const mongoose = require('mongoose');

const specialDietRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  date: { type: Date, required: true },
  dietType: { type: String, enum: ['vegan', 'jain', 'gluten_free', 'high_protein', 'medical'] },
  notes: String,
  status: { type: String, enum: ['requested', 'approved', 'prepared', 'served', 'rejected'], default: 'requested' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamps: { preparedAt: Date, servedAt: Date }
}, { timestamps: true });

specialDietRequestSchema.index({ messId: 1, date: 1, mealType: 1 });
specialDietRequestSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model('SpecialDietRequest', specialDietRequestSchema);
