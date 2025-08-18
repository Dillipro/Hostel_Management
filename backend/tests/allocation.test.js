const { buildWeights, scoreStudent, pickLeastFilled, suitable } = require('../utils/allocation');

describe('allocation utils', () => {
  test('scoreStudent prefers higher cgpa and readmission continuity weight', () => {
    const weights = buildWeights({ priorityOrder: [
      { factor: 'cgpa', weight: 1, isActive: true },
      { factor: 'readmission', weight: 2, isActive: true }
    ]});
    const s1 = { academic: { cgpa: 8.0 }, hostelApplication: { type: 'admission' } };
    const s2 = { academic: { cgpa: 7.5 }, hostelApplication: { type: 'readmission' } };
    expect(scoreStudent(s2, weights)).toBeGreaterThan(scoreStudent(s1, weights));
  });

  test('pickLeastFilled returns room with lowest occupancy ratio', () => {
    const rooms = [
      { capacity: 3, currentOccupancy: 2, _id: 1 },
      { capacity: 4, currentOccupancy: 1, _id: 2 },
      { capacity: 2, currentOccupancy: 1, _id: 3 }
    ];
    const picked = pickLeastFilled(rooms);
    expect(picked._id).toBe(2);
  });

  test('suitable respects roomTypePreference and capacity', () => {
    const room = { capacity: 2, currentOccupancy: 1, usageType: 'residential', roomType: 'double', status: 'available' };
    const sOk = { roomTypePreference: 'double' };
    const sBad = { roomTypePreference: 'single' };
    expect(suitable(room, sOk)).toBe(true);
    expect(suitable(room, sBad)).toBe(false);
  });
});
