const mongoose = require('mongoose');

const iotDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['rfid_scanner', 'qr_scanner', 'gate_controller', 'mess_scanner', 'sensor'], required: true },
  location: {
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Block' },
  messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mess' },
    area: String
  },
  linkedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  metadata: mongoose.Schema.Types.Mixed,
  isActive: { type: Boolean, default: true },
  lastSeen: Date,
}, { timestamps: true });

iotDeviceSchema.index({ deviceId: 1 });

module.exports = mongoose.model('IoTDevice', iotDeviceSchema);
