const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess', required: true },
  weekStart: { type: String, required: true }, // YYYY-MM-DD (Monday)
  schedule: [{
    day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], required: true },
    meals: [{
      type: { type: String, enum: ['breakfast','lunch','dinner'], required: true },
      items: [String]
    }]
  }]
}, { timestamps: true });

mealPlanSchema.index({ messId: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('MealPlan', mealPlanSchema);
