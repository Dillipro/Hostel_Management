const cron = require('node-cron');
const Bill = require('../models/Bill');
const Student = require('../models/Student');
const MessServing = require('../models/MessServing');
const logger = require('../utils/logger');

function prevMonthLabel(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function generateMonthlyBills(runDate = new Date()) {
  const month = prevMonthLabel(runDate);
  const defaultHostel = parseFloat(process.env.DEFAULT_HOSTEL_MONTHLY_RENT || '0');
  const defaultMess = parseFloat(process.env.DEFAULT_MESS_MONTHLY_BILL || '0');
    const perMealRate = parseFloat(process.env.MESS_PER_MEAL_RATE || '0');
  const limit = parseInt(process.env.BILLING_BATCH_LIMIT || '500');
  logger.info(`[BillingCron] Generating monthly bills for ${month}`);
  let processed = 0;
  const cursor = Student.find({ 'hostelApplication.status': 'allocated' })
    .select('_id hostelApplication accessControl')
    .cursor();
  for await (const s of cursor) {
    try {
      if (defaultHostel > 0) {
        const exists = await Bill.findOne({ studentId: s._id, type: 'hostel_rent', month });
        if (!exists) {
          await Bill.create({ studentId: s._id, type: 'hostel_rent', month, amount: defaultHostel, items: [{ description: `Hostel Rent ${month}`, amount: defaultHostel }] });
        }
      }
      if (s.accessControl?.messId) {
        const exists2 = await Bill.findOne({ studentId: s._id, type: 'mess_bill', month });
        if (!exists2) {
          let amount = defaultMess;
          let items = [{ description: `Mess Bill ${month}`, amount: defaultMess }];
          if (perMealRate > 0) {
            // Count meals served in the target month
            const start = new Date(`${month}-01T00:00:00.000Z`);
            const end = new Date(start); end.setMonth(end.getMonth() + 1);
            const served = await MessServing.countDocuments({ studentId: s._id, date: { $gte: start, $lt: end } });
            amount = served * perMealRate;
            items = [{ description: `Mess ${month} - ${served} meals @ ${perMealRate}`, amount }];
            // Optional: cap to defaultMess max if env MESS_MONTHLY_CAP=true
            if ((process.env.MESS_MONTHLY_CAP || 'false').toLowerCase() === 'true' && defaultMess > 0 && amount > defaultMess) {
              amount = defaultMess;
              items.push({ description: `Capped to monthly max ${defaultMess}`, amount: 0 });
            }
          }
          await Bill.create({ studentId: s._id, type: 'mess_bill', month, amount, items });
        }
      }
      processed++;
      if (processed >= limit) break;
    } catch (e) {
      logger.error('[BillingCron] Error for student', s._id, e.message);
    }
  }
  logger.info(`[BillingCron] Completed for ${month}. Processed: ${processed}`);
}

// Run at 02:15 on the 1st day of each month
cron.schedule('0 15 2 1 * *', async () => {
  try { await generateMonthlyBills(); } catch (e) { /* already logged */ }
});

module.exports = { generateMonthlyBills };
