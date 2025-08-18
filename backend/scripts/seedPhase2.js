require('dotenv').config();
const mongoose = require('mongoose');
const { Hostel, Block, Room, Mess } = require('../models/HostelInfrastructure');
const IoTDevice = require('../models/IoTDevice');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ceg-hostel';
  await mongoose.connect(uri);
  console.log('Connected');

  // Minimal mess + devices for demo
  let mess = await Mess.findOne({ code: 'MAIN-MESS' });
  if (!mess) mess = await Mess.create({
    name: 'Main Mess', code: 'MAIN-MESS', hostelId: null,
    capacity: { breakfast: 500, lunch: 500, dinner: 500 },
    operationalHours: { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '12:00', end: '15:00' }, dinner: { start: '18:00', end: '22:00' } }
  });

  await IoTDevice.updateOne({ deviceId: 'GATE-QR-01' }, { $set: { type: 'qr_scanner', location: { area: 'main_gate' } } }, { upsert: true });
  await IoTDevice.updateOne({ deviceId: 'MESS-QR-01' }, { $set: { type: 'mess_scanner', location: { messId: mess._id, area: 'mess_entry' } } }, { upsert: true });

  console.log('Seeded Phase 2 demo devices and mess:', mess.code);
  await mongoose.disconnect();
})();
