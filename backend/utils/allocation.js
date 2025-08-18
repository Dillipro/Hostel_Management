const _ = require('lodash');

function buildWeights(policy) {
  return _.fromPairs((policy?.priorityOrder || []).filter(p => p.isActive).map(p => [p.factor, p.weight]));
}

function scoreStudent(student, weights) {
  let sc = 0;
  sc += (weights.cgpa || 0) * (student.academic?.cgpa || student.cgpaTopLevel || 0);
  sc += (weights.year_of_study || 0) * (student.academic?.yearOfStudy || student.year || 0);
  sc += (weights.economically_weaker || 0) * (student.specialCategories?.ews ? 1 : 0);
  sc += (weights.scholarship || 0) * (student.financialInfo?.scholarship?.hasScholarship ? 1 : 0);
  sc += (weights.readmission || 0) * (student.hostelApplication?.type === 'readmission' ? 1 : 0);
  if (student.priorityRank) sc += (weights.priority_rank || 0) * (1000 - student.priorityRank);
  return sc;
}

function pickLeastFilled(rooms) {
  return _.minBy(rooms, r => (r.currentOccupancy || 0) / Math.max(1, r.capacity));
}

function suitable(room, s) {
  if (room.status === 'maintenance' || room.usageType !== 'residential') return false;
  if ((room.currentOccupancy || 0) >= room.capacity) return false;
  if (s.roomTypePreference && room.roomType !== s.roomTypePreference) return false;
  return true;
}

module.exports = { buildWeights, scoreStudent, pickLeastFilled, suitable };
