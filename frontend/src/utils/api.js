import axios from 'axios'

// Attendance (RFID/QR) endpoints
export const AttendanceAPI = {
  scanEntry: (payload) => axios.post('/api/attendance/scan', payload), // {studentId, mode:'rfid'|'qr', gate:'hostel'|'mess'|'block-A'}
  getLogs: (params) => axios.get('/api/attendance/logs', { params }),
  getSummary: (params) => axios.get('/api/attendance/summary', { params }),
}

// Payments endpoints (Razorpay-backed)
export const PaymentsAPI = {
  // Create order for a fee type
  createOrder: (payload) => axios.post('/api/payments/create-order', payload), // { feeType: 'hostel_fee'|'mess_fee'|'security_deposit'|'fine', amount, currency?, mealPlanCode?, installmentCode? }
  // Verify payment after checkout success
  verifyPayment: (payload) => axios.post('/api/payments/verify-payment', payload), // { razorpay_order_id, razorpay_payment_id, razorpay_signature, feeType, amount }
  // Payment history for student (paginated, optional filters)
  history: (params) => axios.get('/api/payments/history', { params }),
  // Receipt JSON details
  receipt: (paymentId) => axios.get(`/api/payments/receipt/${paymentId}`),
  // Receipt PDF stream
  receiptPdf: (paymentId) => axios.get(`/api/payments/receipt/${paymentId}/pdf`, { responseType: 'blob' }),
  admin: {
    listAll: (params) => axios.get('/api/payments/admin/all-payments', { params }),
    analytics: (params) => axios.get('/api/payments/admin/analytics', { params }),
  }
}

// Student fees summary (dues + history) via student portal
export const StudentFeesAPI = {
  getSummary: () => axios.get('/api/student-portal/fees'),
}

// Student portal helpers
export const StudentPortalAPI = {
  basics: () => axios.get('/api/student-portal/basics'),
  idQr: () => axios.get('/api/student-portal/id/qr'),
}

// Reports endpoints
export const ReportsAPI = {
  messForecast: (params) => axios.get('/api/reports/mess/forecast', { params }),
  messForecastPdf: (params) => axios.get('/api/reports/mess/forecast/pdf', { params, responseType: 'blob' }),
  messAllocation: (params) => axios.get('/api/reports/mess-allocation', { params }),
  wardenAllocation: (params) => axios.get('/api/reports/warden-allocation', { params }),
  dashboardMessWaste: (params) => axios.get('/api/reports/dashboard/mess-waste', { params }),
}

// Student mess membership
export const StudentMessAPI = {
  join: (payload) => axios.post('/api/student-portal/mess/join', payload),
  leave: (payload) => axios.post('/api/student-portal/mess/leave', payload),
  get: () => axios.get('/api/student-portal/mess'),
}

// Allocation endpoints
export const AllocationAPI = {
  runAutoAllocate: (payload) => axios.post('/api/allocations/auto', payload),
  requestShift: (payload) => axios.post('/api/allocations/shift-request', payload),
  approveShift: (id, action) => axios.post(`/api/allocations/shift/${id}/${action}`),
  myAllocation: (studentId) => axios.get(`/api/allocations/student/${studentId}`),
}

// Warden controls
export const WardenAPI = {
  approveStudent: (studentId) => axios.post(`/api/warden/approve/${studentId}`),
  rejectStudent: (studentId) => axios.post(`/api/warden/reject/${studentId}`),
  leaveRequests: () => axios.get('/api/warden/leave-requests'),
  approveLeave: (id, action) => axios.post(`/api/warden/leave/${id}/${action}`),
  reports: (params) => axios.get('/api/warden/reports', { params }),
}

// Mess controls
export const MessAPI = {
  scan: (payload) => axios.post('/api/mess/scan', payload),
  counts: (params) => axios.get('/api/mess/counts', { params }),
  specialDiet: (payload) => axios.post('/api/mess/special-diet', payload),
}

// Admin setup
export const AdminAPI = {
  hostels: {
    // Lists and blocks come from hostel-management routes
    list: () => axios.get('/api/hostel-management/hostels'),
    // Create can use either admin or hostel-management; keep admin for RBAC clarity
    create: (payload) => axios.post('/api/admin/hostels', payload),
    blocks: (hostelId) => axios.get(`/api/hostel-management/hostels/${hostelId}/blocks`),
  },
  mess: {
  list: (params) => axios.get('/api/admin/mess', { params }),
  create: (payload) => axios.post('/api/admin/mess', payload),
  update: (id, payload) => axios.put(`/api/admin/mess/${id}`, payload),
  remove: (id) => axios.delete(`/api/admin/mess/${id}`),
  },
  rooms: {
    // List rooms via hostel-management with filters
    list: (params) => axios.get('/api/hostel-management/rooms', { params }),
    create: (payload) => axios.post('/api/admin/rooms', payload),
    update: (id, payload) => axios.put(`/api/admin/rooms/${id}`, payload),
    remove: (id) => axios.delete(`/api/admin/rooms/${id}`),
  },
  warden: {
    // Note: backend route is /api/admin/wardens/assign
    assign: (payload) => axios.post('/api/admin/wardens/assign', payload),
  },
  students: {
    // JSON array import (legacy/simple)
    importJson: (students, academicYear) => axios.post('/api/admin/students/import', { students, academicYear }),
    // CSV import (recommended)
    importCsv: (file, academicYear) => {
      const form = new FormData();
      form.append('file', file);
      if (academicYear) form.append('academicYear', academicYear);
      return axios.post('/api/admin/students/import/csv', form);
  },
  templateCsv: () => axios.get('/api/admin/students/import/template.csv', { responseType: 'blob' })
  },
  allocation: {
    autoAllocate: (payload) => axios.post('/api/hostel-management/allocation/auto-allocate', payload),
  },
  reports: {
  occupancy: (params) => axios.get('/api/hostel-management/reports/occupancy', { params }),
  vacancies: (params) => axios.get('/api/hostel-management/reports/vacancies', { params }),
  }
}
