const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  audience: { type: String, enum: ['all', 'students', 'wardens'], default: 'students' },
  questions: [{
    text: String,
    type: { type: String, enum: ['rating', 'text', 'mcq'], default: 'rating' },
    options: [String]
  }],
  isActive: { type: Boolean, default: true },
  closesAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const responseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ questionIndex: Number, answer: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

module.exports = {
  Survey: mongoose.model('Survey', surveySchema),
  SurveyResponse: mongoose.model('SurveyResponse', responseSchema)
};
