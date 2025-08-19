const express = require('express');
const request = require('supertest');

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, _res, next) => { req.user = { _id: 'u1', role: 'admin' }; next(); },
  authorizeRoles: () => (req, _res, next) => next()
}));

// Minimal model mocks
jest.mock('../models/Bill', () => ({
  create: jest.fn(async (d) => ({ _id: 'b1', ...d, status: 'pending' })),
  find: jest.fn(() => ({ sort: () => ({ lean: async () => [] }) })),
  findOne: jest.fn(async () => null),
  findByIdAndUpdate: jest.fn(async (_id, d) => ({ _id, ...d }))
}));

jest.mock('../models/Student', () => ({
  find: jest.fn(() => ({ select: () => ({ cursor: () => ({ [Symbol.asyncIterator]: async function* () {} }) }) }))
}));

jest.mock('../models/Notice', () => ({
  create: jest.fn(async (d) => ({ _id: 'n1', ...d })),
  find: jest.fn(() => ({ sort: () => [] }))
}));

jest.mock('../models/Survey', () => ({
  Survey: { create: jest.fn(async (d) => ({ _id: 's1', ...d })), find: jest.fn(() => ({ sort: () => [] })), findById: jest.fn(async () => ({ _id: 's1', questions: [{ type: 'rating' }] })) },
  SurveyResponse: { create: jest.fn(async (d) => ({ _id: 'sr1', ...d })), find: jest.fn(() => ({ lean: async () => [] })) }
}));

jest.mock('../models/Alert', () => ({
  find: jest.fn(() => ({ sort: () => ({ limit: () => [] }) })),
  findByIdAndUpdate: jest.fn(async (id, d) => ({ _id: id, ...d }))
}));

jest.mock('../models/MessMetrics', () => ({
  findOneAndUpdate: jest.fn(async () => ({ _id: 'mm1' })),
  find: jest.fn(() => ({ sort: () => [] }))
}));

jest.mock('../models/MealPlan', () => ({
  findOneAndUpdate: jest.fn(async (q, d) => ({ _id: 'mp1', ...q, ...d })),
  findOne: jest.fn(async () => ({ _id: 'mp1' }))
}));

const alerts = require('../routes/alerts');
const finance = require('../routes/finance');
const notices = require('../routes/noticeBoard');
const surveys = require('../routes/surveys');
const messManager = require('../routes/messManager');

function appWith(r, base) { const a = express(); a.use(express.json()); a.use(base, r); return a; }

describe('Phase 3 smoke tests', () => {
  test('finance generate bill validates and succeeds', async () => {
    const app = appWith(finance, '/api/finance');
    const res = await request(app).post('/api/finance/bills/generate').send({ studentId: 'stu1', type: 'mess_bill', month: '2025-07', items: [{ description: 'Meal', amount: 100 }] });
    expect(res.status).toBe(200);
  });

  test('alerts list works', async () => {
    const app = appWith(alerts, '/api/alerts');
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
  });

  test('notices post validates and succeeds', async () => {
    const app = appWith(notices, '/api/notices');
    const res = await request(app).post('/api/notices').send({ title: 'Test', message: 'Hello', audience: 'all' });
    expect(res.status).toBe(200);
  });

  test('surveys create/respond/analytics', async () => {
    const app = appWith(surveys, '/api/surveys');
    const c = await request(app).post('/api/surveys').send({ title: 'S', audience: 'students', questions: [{ text: 'Q1', type: 'rating' }] });
    expect(c.status).toBe(200);
    const r = await request(app).post('/api/surveys/s1/respond').send({ answers: [{ questionIndex: 0, answer: 5 }] });
    expect(r.status).toBe(200);
    const a = await request(app).get('/api/surveys/s1/analytics');
    expect(a.status).toBe(200);
  });

  test('mess manager metrics/plan', async () => {
    const app = appWith(messManager, '/api/mess-manager');
    const m = await request(app).post('/api/mess-manager/metrics').send({ messId: 'm1', date: '2025-08-01', meal: 'lunch', cookedCount: 100, servedCount: 95, wastedCount: 5 });
    expect(m.status).toBe(200);
    const mp = await request(app).post('/api/mess-manager/meal-plan').send({ messId: 'm1', weekStart: '2025-08-18', schedule: [{ day: 'Mon', meals: [{ type: 'lunch', items: ['Rice'] }] }] });
    expect(mp.status).toBe(200);
  });
});
