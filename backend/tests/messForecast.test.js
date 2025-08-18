const { forecastMealsFromAttendance } = require('../utils/mess');

describe('forecastMealsFromAttendance', () => {
  test('computes averages per meal', () => {
    const attendance = [
      { date: '2025-08-18', mealType: 'breakfast', totalCount: 100 },
      { date: '2025-08-18', mealType: 'lunch', totalCount: 150 },
      { date: '2025-08-18', mealType: 'dinner', totalCount: 120 },
      { date: '2025-08-17', mealType: 'breakfast', totalCount: 110 },
      { date: '2025-08-17', mealType: 'lunch', totalCount: 140 },
      { date: '2025-08-17', mealType: 'dinner', totalCount: 130 }
    ];
    const res = forecastMealsFromAttendance(attendance, 2);
    expect(res).toEqual({ breakfast: 105, lunch: 145, dinner: 125 });
  });

  test('handles empty safely', () => {
    expect(forecastMealsFromAttendance([], 7)).toEqual({ breakfast: 0, lunch: 0, dinner: 0 });
  });
});
