const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  meal: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  cookedCount: Number,
  servedCount: Number,
  wastedCount: Number
}, { timestamps: true });

metricsSchema.index({ messId: 1, date: 1, meal: 1 }, { unique: true });

module.exports = mongoose.model('MessMetrics', metricsSchema);
