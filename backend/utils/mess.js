// Simple moving average forecast for mess attendance
function forecastMealsFromAttendance(attendance, days = 7) {
  if (!Array.isArray(attendance)) return { breakfast: 0, lunch: 0, dinner: 0 };
  const normalize = d => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt.getTime(); };
  // Group entries by day
  const byDay = new Map();
  for (const r of attendance) {
    if (!r || !r.date || !r.mealType) continue;
    const dayKey = normalize(r.date);
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey).push(r);
  }
  // Take last N distinct days (most recent)
  const lastDays = Array.from(byDay.keys()).sort((a, b) => b - a).slice(0, parseInt(days, 10) || 7);
  const byMeal = { breakfast: [], lunch: [], dinner: [] };
  for (const day of lastDays) {
    const entries = byDay.get(day) || [];
    // For each meal type, take totalCount if present that day
    const meals = { breakfast: null, lunch: null, dinner: null };
    for (const e of entries) {
      const mt = e.mealType;
      if (meals.hasOwnProperty(mt)) meals[mt] = Number(e.totalCount || 0);
    }
    Object.keys(meals).forEach(mt => {
      if (meals[mt] != null) byMeal[mt].push(meals[mt]);
    });
  }
  const avg = arr => (arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0);
  return {
    breakfast: avg(byMeal.breakfast),
    lunch: avg(byMeal.lunch),
    dinner: avg(byMeal.dinner)
  };
}

module.exports = { forecastMealsFromAttendance };
