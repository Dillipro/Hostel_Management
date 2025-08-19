const mongoose = require('mongoose');

const servingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  date: { type: Date, required: true },
  mealType: { type: String, enum: ['breakfast','lunch','dinner'], required: true }
}, { timestamps: true });

servingSchema.index({ studentId: 1, date: 1, mealType: 1 }, { unique: true });
servingSchema.index({ messId: 1, date: 1 });

module.exports = mongoose.model('MessServing', servingSchema);
