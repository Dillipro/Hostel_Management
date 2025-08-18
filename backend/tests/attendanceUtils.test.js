const { describe, it, expect } = require('@jest/globals');

// Minimal copies of helpers to test logic deterministically
function isWithinGeofence(point, geofence) {
  if (!geofence?.center || !geofence?.radiusMeters) return true;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(point.lat - geofence.center.lat);
  const dLng = toRad(point.lng - geofence.center.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(geofence.center.lat)) * Math.cos(toRad(point.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= geofence.radiusMeters;
}

function isWithinTimeWindow(windows, date, scope) {
  if (!Array.isArray(windows) || windows.length === 0) return true;
  const day = date.getDay();
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const now = `${hh}:${mm}`;
  return windows
    .filter(w => !scope || !w.scope || w.scope === scope)
    .some(w => (w.daysOfWeek?.length ? w.daysOfWeek.includes(day) : true) && (!w.startTime || !w.endTime || (now >= w.startTime && now <= w.endTime)));
}

describe('geofence', () => {
  it('accepts inside radius', () => {
    const geo = { center: { lat: 13.0, lng: 80.0 }, radiusMeters: 200 };
    expect(isWithinGeofence({ lat: 13.0005, lng: 80.0005 }, geo)).toBe(true);
  });
  it('rejects outside radius', () => {
    const geo = { center: { lat: 13.0, lng: 80.0 }, radiusMeters: 50 };
    expect(isWithinGeofence({ lat: 13.001, lng: 80.001 }, geo)).toBe(false);
  });
});

describe('time window', () => {
  it('accepts within scope window', () => {
    const windows = [{ scope: 'hostel_entry', startTime: '07:00', endTime: '08:30', daysOfWeek: [1] }];
    const d = new Date('2024-01-01T07:30:00'); // Monday
    expect(isWithinTimeWindow(windows, d, 'hostel_entry')).toBe(true);
  });
  it('rejects out of scope window', () => {
    const windows = [{ scope: 'mess_entry', startTime: '12:00', endTime: '14:00', daysOfWeek: [1] }];
    const d = new Date('2024-01-01T07:30:00'); // Monday
    expect(isWithinTimeWindow(windows, d, 'hostel_entry')).toBe(false);
  });
});
