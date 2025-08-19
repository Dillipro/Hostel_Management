const express = require('express');
const request = require('supertest');

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, _res, next) => { req.user = { _id: 'admin1', role: 'admin' }; next(); },
  authorizeRoles: () => (req, _res, next) => next()
}));

// Mock SurveyResponse.find().lean() to return synthetic answers
jest.mock('../models/Survey', () => ({
  Survey: { findById: jest.fn(async () => ({ _id: 's1' })) },
  SurveyResponse: {
    find: jest.fn(() => ({
      lean: async () => ([
        { surveyId: 's1', userId: 'u1', answers: [
          { questionIndex: 0, answer: 4 },
          { questionIndex: 1, answer: ['Veg', 'LessSpice'] }
        ] },
        { surveyId: 's1', userId: 'u2', answers: [
          { questionIndex: 0, answer: 5 },
          { questionIndex: 1, answer: 'Veg' }
        ] }
      ])
    }))
  }
}));

const surveys = require('../routes/surveys');

function appWith(r, base) { const a = express(); a.use(express.json()); a.use(base, r); return a; }

describe('Survey analytics', () => {
  test('returns rating histograms and MCQ distributions', async () => {
    const app = appWith(surveys, '/api/surveys');
    const res = await request(app).get('/api/surveys/s1/analytics');
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.totalResponses).toBe(2);
    const q0 = data.perQuestion[0];
    expect(q0.count).toBe(2);
    expect(q0.ratingAvg).toBeCloseTo(4.5, 5);
    expect(q0.ratingHist['4']).toBe(1);
    expect(q0.ratingHist['5']).toBe(1);
    expect(q0.mcqCounts).toEqual({});

    const q1 = data.perQuestion[1];
    expect(q1.count).toBe(2);
    expect(q1.mcqCounts['Veg']).toBe(2);
    expect(q1.mcqCounts['LessSpice']).toBe(1);
    expect(q1.ratingHist).toEqual({});
    expect(q1.ratingAvg).toBeNull();
  });
});
