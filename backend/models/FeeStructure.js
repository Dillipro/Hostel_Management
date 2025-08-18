const mongoose = require('mongoose');

// Conditions to target fees/concessions to specific cohorts
const conditionSchema = new mongoose.Schema({
  department: [String], // e.g., CSE, EEE
  program: [String], // e.g., B.E, M.E, MCA
  category: [String], // e.g., GEN, OBC, SC, ST, PWD
  gender: [String], // e.g., Male, Female, Other
  yearOfStudyRange: { min: Number, max: Number },
  domicile: [String], // state or country codes if needed
  roomType: [String], // e.g., Single, Double, Triple
  occupancyType: [String], // e.g., Regular, DayScholar (future-proof)
  blockIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' }],
}, { _id: false });

// Individual fee items
const feeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, enum: ['hostel_fee', 'mess_fee', 'security_deposit', 'fine', 'other'], required: true },
  description: String,
  amount: { type: Number, required: true },
  periodicity: { type: String, enum: ['one_time', 'monthly', 'semester', 'yearly'], default: 'semester' },
  isActive: { type: Boolean, default: true },
  taxable: { type: Boolean, default: false },
  taxPercent: { type: Number, default: 0 }, // GST/VAT percent if applicable
  proratable: { type: Boolean, default: false },
  conditions: conditionSchema, // apply only if conditions match
  tags: [String],
  gatewayItemCode: String // optional mapping for payment gateway items
}, { _id: false });

// Concession/Scholarship rules
const concessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  type: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true },
  maxDiscount: { type: Number },
  autoApply: { type: Boolean, default: true },
  conditions: conditionSchema
}, { _id: false });

// Fine rules including late payment
const fineRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, enum: ['late_payment', 'manual_fine', 'other'], default: 'late_payment' },
  scope: { type: String, enum: ['installment', 'overall'], default: 'installment' },
  type: { type: String, enum: ['flat', 'per_day', 'percentage'], required: true },
  value: { type: Number, required: true },
  graceDays: { type: Number, default: 0 },
  perDayMax: { type: Number },
  maxTotal: { type: Number },
  applicableInstallments: [String] // names/codes of installments
}, { _id: false });

// Installment plan entries
const installmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  dueDate: { type: Date, required: true },
  itemsIncluded: [String], // list of item codes included in this installment
  amountOverride: Number // if provided, use this instead of summing items
}, { _id: false });

// Mess meal plan variants (optional)
const mealPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  periodicity: { type: String, enum: ['monthly', 'semester', 'yearly'], default: 'monthly' },
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { _id: false });

const feeStructureSchema = new mongoose.Schema({
  hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  academicYear: { type: String, required: true },

  // Core
  items: [feeItemSchema],

  // Concessions/waivers (per-structure)
  concessions: [concessionSchema],

  // Global fine rules (late fees, etc.)
  fineRules: [fineRuleSchema],

  // Optional installment plan
  installments: [installmentSchema],

  // Optional mess plans
  mealPlans: [mealPlanSchema],

  // Legacy/simple fines to keep backward compatibility with existing routes
  fines: [{ name: String, code: String, amount: Number }],

  effectiveFrom: Date,
  effectiveTo: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Indexes
feeStructureSchema.index({ hostelId: 1, academicYear: 1, isActive: 1 });
// Ensure only one active structure per hostel+year (partial unique)
feeStructureSchema.index(
  { hostelId: 1, academicYear: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// Virtuals
feeStructureSchema.virtual('totalDefaultAmount').get(function () {
  if (!this.items) return 0;
  return this.items
    .filter(i => i.isActive)
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
});

// Helpers
function matchesList(field, values) {
  if (!values || values.length === 0) return true;
  if (!field) return false;
  if (Array.isArray(field)) return field.some(v => values.includes(v));
  return values.includes(field);
}

function matchesRange(value, range) {
  if (!range || (range.min == null && range.max == null)) return true;
  if (value == null) return false;
  if (range.min != null && value < range.min) return false;
  if (range.max != null && value > range.max) return false;
  return true;
}

function matchesConditions(student = {}, cond = {}) {
  if (!cond) return true;
  const profile = student || {};
  const ok = (
    matchesList(profile.department, cond.department) &&
    matchesList(profile.program, cond.program) &&
    matchesList(profile.category, cond.category) &&
    matchesList(profile.gender, cond.gender) &&
    matchesRange(profile.yearOfStudy, cond.yearOfStudyRange) &&
    matchesList(profile.domicile, cond.domicile) &&
    matchesList(profile.roomType, cond.roomType) &&
    matchesList(profile.occupancyType, cond.occupancyType) &&
    matchesList(profile.blockId, cond.blockIds)
  );
  return ok;
}

// Get active structure for given date
feeStructureSchema.statics.getActive = async function (hostelId, academicYear, onDate = new Date()) {
  const q = { hostelId, academicYear, isActive: true };
  const fs = await this.findOne(q).lean();
  if (!fs) return null;
  const { effectiveFrom, effectiveTo } = fs;
  if (effectiveFrom && onDate < new Date(effectiveFrom)) return null;
  if (effectiveTo && onDate > new Date(effectiveTo)) return null;
  return fs;
};

// Compute amount for a student (base items + optional mealPlan), without gateway fees
feeStructureSchema.methods.computeExpectedAmount = function ({ student, mealPlanCode, installmentCode } = {}) {
  // Base items eligible for the student
  const eligibleItems = (this.items || []).filter(i => i.isActive && matchesConditions(student, i.conditions));

  // If installment specified, limit to items included
  let itemsToSum = eligibleItems;
  if (installmentCode) {
    const inst = (this.installments || []).find(x => (x.code || x.name) === installmentCode);
    if (inst) {
      if (inst.amountOverride != null) return Number(inst.amountOverride) || 0;
      const codes = new Set(inst.itemsIncluded || []);
      itemsToSum = eligibleItems.filter(i => codes.has(i.code));
    }
  }

  let total = itemsToSum.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  // Add meal plan if provided
  if (mealPlanCode) {
    const mp = (this.mealPlans || []).find(m => (m.code || m.name) === mealPlanCode && m.isActive);
    if (mp) total += Number(mp.price) || 0;
  }

  // Apply auto concessions
  for (const c of (this.concessions || [])) {
    if (c.autoApply && matchesConditions(student, c.conditions)) {
      if (c.type === 'percentage') {
        const discount = total * (Number(c.value) / 100);
        total -= Math.min(discount, c.maxDiscount != null ? Number(c.maxDiscount) : discount);
      } else if (c.type === 'flat') {
        const discount = Number(c.value) || 0;
        total -= (c.maxDiscount != null ? Math.min(discount, Number(c.maxDiscount)) : discount);
      }
    }
  }

  return Math.max(0, Math.round(total));
};

// Compute late fee for an installment as of a date
feeStructureSchema.methods.computeLateFee = function ({ installmentCode, asOfDate = new Date() }) {
  const inst = (this.installments || []).find(x => (x.code || x.name) === installmentCode);
  if (!inst || !inst.dueDate) return 0;
  const due = new Date(inst.dueDate);
  let daysLate = Math.floor((asOfDate - due) / (1000 * 60 * 60 * 24));
  if (isNaN(daysLate) || daysLate <= 0) return 0;

  let totalFine = 0;
  for (const rule of (this.fineRules || [])) {
    if (rule.scope !== 'installment') continue;
    if (rule.applicableInstallments && rule.applicableInstallments.length > 0) {
      const key = installmentCode;
      if (!rule.applicableInstallments.includes(key)) continue;
    }
    const effectiveLate = Math.max(0, daysLate - (rule.graceDays || 0));
    if (effectiveLate <= 0) continue;
    if (rule.type === 'flat') {
      totalFine += Number(rule.value) || 0;
    } else if (rule.type === 'per_day') {
      const perDay = Number(rule.value) || 0;
      const amount = perDay * effectiveLate;
      const cappedPerDay = (rule.perDayMax != null) ? Math.min(amount, Number(rule.perDayMax)) : amount;
      totalFine += cappedPerDay;
    } else if (rule.type === 'percentage') {
      // Percentage of the installment base; compute base quickly
      const base = this.computeExpectedAmount({ installmentCode });
      totalFine += (base * (Number(rule.value) / 100));
    }
  }
  // Apply overall cap if any
  const overallCaps = (this.fineRules || []).filter(r => r.scope === 'overall' && (!r.applicableInstallments || r.applicableInstallments.length === 0));
  for (const cap of overallCaps) {
    if (cap.maxTotal != null) totalFine = Math.min(totalFine, Number(cap.maxTotal));
  }
  return Math.max(0, Math.round(totalFine));
};

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
