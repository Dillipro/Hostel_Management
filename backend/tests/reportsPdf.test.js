const express = require('express');
const request = require('supertest');

// Mock auth to bypass JWT/DB and set an admin user
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, _res, next) => { req.user = { _id: 'u1', role: 'admin' }; next(); },
  authorizeRoles: () => (req, _res, next) => next()
}));

// Prepare mocks for models used in reports
const mockStudents = [
  { name: 'Alice', regNo: 'REG001', hostelApplication: { fees: { hostelFeePaid: false, hostelFee: 1000, messFeePaid: true, messFee: 1500 } } },
  { name: 'Bob', regNo: 'REG002', hostelApplication: { fees: { hostelFeePaid: true, hostelFee: 1000, messFeePaid: false, messFee: 1500 } } },
];

// Chainable helpers to mimic Mongoose select().lean()
function chainResult(data) {
  return { select: () => chainResult(data), lean: async () => data };
}

jest.mock('../models/Student', () => ({
  find: jest.fn(() => ({
    select: () => ({
      lean: async () => mockStudents
    })
  }))
}));

jest.mock('../models/HostelInfrastructure', () => ({
  Hostel: { findById: jest.fn(() => ({ select: () => ({ lean: async () => ({ _id: 'h1', name: 'CEG Hostel', code: 'CEG' }) }) })) },
  Block: { findById: jest.fn(() => ({ select: () => ({ lean: async () => ({ _id: 'b1', name: 'Block A', code: 'A' }) }) })) },
  Mess: { findById: jest.fn(() => ({ select: () => ({ lean: async () => ({ _id: 'm1', name: 'Main Mess', code: 'MAIN', attendance: [
    { date: '2025-08-10', meal: 'breakfast', count: 120 },
    { date: '2025-08-10', meal: 'lunch', count: 200 },
    { date: '2025-08-11', meal: 'breakfast', count: 130 },
    { date: '2025-08-11', meal: 'lunch', count: 210 },
  ] }) }) })) }
}));

// Import the router after mocks
const reportsRouter = require('../routes/reports');

function makeApp() {
  const app = express();
  app.use('/api/reports', reportsRouter);
  // Error handler to surface errors in tests
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    res.status(500).json({ success: false, message: err.message });
  });
  return app;
}

describe('Reports PDF routes', () => {
  const app = makeApp();

  test('GET /api/reports/defaulters/pdf returns a PDF', async () => {
    const res = await request(app).get('/api/reports/defaulters/pdf');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });

  test('GET /api/reports/mess/forecast/pdf returns a PDF', async () => {
    const res = await request(app).get('/api/reports/mess/forecast/pdf').query({ messId: 'm1', days: 2 });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });
});
