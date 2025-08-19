const express = require('express');
const request = require('supertest');

jest.mock('../middleware/auth', () => ({
  authenticateToken: (req, _res, next) => { req.user = { _id: 'u1', role: 'admin' }; next(); },
  authorizeRoles: () => (req, _res, next) => next()
}));

jest.mock('../models/Bill', () => ({
  find: jest.fn(() => ({ lean: async () => ([{ studentId: 'stu1', type: 'mess_bill', month: '2025-07', amount: 500, paidAt: new Date('2025-07-15T00:00:00Z'), paymentRef: 'REF123', status: 'paid' }]) }))
}));

const finance = require('../routes/finance');

function appWith(r, base) { const a = express(); a.use(express.json()); a.use(base, r); return a; }

describe('Finance reports outputs', () => {
  const app = appWith(finance, '/api/finance');

  test('collections CSV', async () => {
    const res = await request(app).get('/api/finance/reports/collections/csv').query({ from: '2025-07-01', to: '2025-07-31' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Type,Month,Amount');
  });

  test('collections PDF', async () => {
    const res = await request(app).get('/api/finance/reports/collections/pdf').query({ from: '2025-07-01', to: '2025-07-31' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/pdf/);
  });

  test('bills Excel', async () => {
    const res = await request(app).get('/api/finance/reports/bills/excel').query({ month: '2025-07' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet/);
  });
});
