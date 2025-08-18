const mongoose = require('mongoose');

// Hostel Schema
const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['Boys', 'Girls', 'Co-ed'],
    required: true
  },
  totalCapacity: {
    type: Number,
    required: true
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  blocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block'
  }],
  messBuildings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mess'
  }],
  warden: {
    name: String,
    phone: String,
    email: String
  },
  facilities: [String],
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  rules: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Block Schema
const blockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true
  },
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  floors: [{
    floorNumber: { type: Number, required: true },
    floorName: { type: String }, // Ground, First, Second, etc.
    roomNumberStart: { type: Number, required: true },
    roomNumberEnd: { type: Number, required: true },
    totalRooms: { type: Number, required: true },
    capacityPerRoom: { type: Number, default: 3 }
  }],
  totalFloors: {
    type: Number,
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  totalCapacity: {
    type: Number,
    required: true
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  genderRestriction: {
    type: String,
    enum: ['Male', 'Female', 'Co-ed'],
    required: true
  },
  yearRestriction: [Number], // [1, 2] means only for 1st and 2nd year
  amenities: {
    elevator: { type: Boolean, default: false },
    wifi: { type: Boolean, default: true },
    laundry: { type: Boolean, default: true },
    studyHall: { type: Boolean, default: false },
    commonRoom: { type: Boolean, default: false },
    accessible: { type: Boolean, default: false } // For differently-abled
  },
  policies: {
    quietFloors: [Number],
    restrictedItems: [String],
    curfewTime: String,
    visitorPolicy: String
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Closed'],
    default: 'Active'
  },
  maintenanceRooms: [String] // Room numbers under maintenance
}, {
  timestamps: true
});

// Room Schema
const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true
  },
  blockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: true
  },
  floorNumber: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 3
  },
  currentOccupancy: {
    type: Number,
    default: 0
  },
  occupants: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    bedNumber: Number,
    occupiedFrom: Date,
    occupiedTill: Date
  }],
  roomType: {
    type: String,
    enum: ['Single', 'Double', 'Triple', 'Quad'],
    default: 'Triple'
  },
  facilities: {
    attachedBathroom: { type: Boolean, default: true },
    balcony: { type: Boolean, default: false },
    airConditioned: { type: Boolean, default: false },
    fan: { type: Boolean, default: true },
    study_table: { type: Number, default: 3 },
    wardrobes: { type: Number, default: 3 },
    beds: { type: Number, default: 3 }
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance', 'Reserved', 'Blocked'],
    default: 'Available'
  },
  reservedFor: String, // Special reservation (scholarship, sports, etc.)
  tags: [String], // ['senior-only', 'quiet', 'accessible']
  maintenanceLog: [{
    issue: String,
    reportedBy: String,
    reportedDate: Date,
    status: { type: String, enum: ['Reported', 'In Progress', 'Completed'] },
    resolvedDate: Date,
    assignedTo: String
  }]
}, {
  timestamps: true
});

// Mess Schema
const messSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hostelIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  }],
  capacity: {
    breakfast: { type: Number, default: 500 },
    lunch: { type: Number, default: 500 },
    dinner: { type: Number, default: 500 }
  },
  timings: {
    breakfast: { start: String, end: String },
    lunch: { start: String, end: String },
    dinner: { start: String, end: String }
  },
  menu: {
    monday: { breakfast: [String], lunch: [String], dinner: [String] },
    tuesday: { breakfast: [String], lunch: [String], dinner: [String] },
    wednesday: { breakfast: [String], lunch: [String], dinner: [String] },
    thursday: { breakfast: [String], lunch: [String], dinner: [String] },
    friday: { breakfast: [String], lunch: [String], dinner: [String] },
    saturday: { breakfast: [String], lunch: [String], dinner: [String] },
    sunday: { breakfast: [String], lunch: [String], dinner: [String] }
  },
  pricing: {
    breakfast: Number,
    lunch: Number,
    dinner: Number,
    monthly: Number
  },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  accessRules: {
    requiresFeePaid: { type: Boolean, default: true },
    allowGuests: { type: Boolean, default: false },
    maxGuestsPerStudent: { type: Number, default: 2 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
hostelSchema.index({ code: 1 });
hostelSchema.index({ type: 1 });
blockSchema.index({ hostelId: 1, code: 1 });
roomSchema.index({ blockId: 1, roomNumber: 1 });
roomSchema.index({ status: 1 });
messSchema.index({ hostelIds: 1 });

module.exports = {
  Hostel: mongoose.model('Hostel', hostelSchema),
  Block: mongoose.model('Block', blockSchema),
  Room: mongoose.model('Room', roomSchema),
  Mess: mongoose.model('Mess', messSchema)
};
