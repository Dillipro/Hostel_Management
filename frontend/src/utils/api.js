import axios from 'axios'

// Attendance (RFID/QR) endpoints
export const AttendanceAPI = {
  scanEntry: (payload) => axios.post('/api/attendance/scan', payload), // {studentId, mode:'rfid'|'qr', gate:'hostel'|'mess'|'block-A'}
  getLogs: (params) => axios.get('/api/attendance/logs', { params }),
  getSummary: (params) => axios.get('/api/attendance/summary', { params }),
}

// Payments endpoints
export const PaymentsAPI = {
  initPayment: (payload) => axios.post('/api/payments/init', payload), // {studentId, amount, reason}
  verifyPayment: (payload) => axios.post('/api/payments/verify', payload), // gateway callback verify
  dues: (studentId) => axios.get(`/api/payments/dues/${studentId}`),
  receipts: (studentId) => axios.get(`/api/payments/receipts/${studentId}`),
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
    list: () => axios.get('/api/admin/hostels'),
    create: (payload) => axios.post('/api/admin/hostels', payload),
    blocks: (hostelId) => axios.get(`/api/admin/hostels/${hostelId}/blocks`),
  },
  mess: {
    list: () => axios.get('/api/admin/mess'),
    create: (payload) => axios.post('/api/admin/mess', payload),
  },
  warden: {
    assign: (payload) => axios.post('/api/admin/warden/assign', payload),
  },
  students: {
    import: (file) => {
      const form = new FormData();
      form.append('file', file)
      return axios.post('/api/admin/students/import', form)
    }
  }
}
