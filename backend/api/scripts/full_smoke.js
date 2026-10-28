// Full E2E smoke: login (no OTP), student/me, complaint, payment mock, attendance, admission, admin fees
const axios = require('axios').default;
const api = axios.create({ baseURL: 'http://localhost:4000', validateStatus: s => s < 500 });

async function login(email, password){
  const cap = await api.get('/api/security/captcha');
  const r = await api.post('/api/auth/login', { email, password, captchaId: cap.data.id, captchaText: cap.data.text });
  if (!r.data?.access) throw new Error('login failed');
  api.defaults.headers.common['Authorization'] = `Bearer ${r.data.access}`;
  return r.data;
}

async function run(){
  // Student login
  const email = 'student1@example.com';
  await login(email, 'stud1234');

  // Students: profile, update
  const me = await api.get('/api/students/me');
  await api.put('/api/students/me', { name: me.data.name + ' Test', phone: '9000000099' });

  // Complaint lifecycle
  const comp = await api.post('/api/complaints', { type: 'Electrical', priority: 'Low', description: 'Bulb not working' });
  const compList = await api.get('/api/complaints');

  // Payments mock
  const pay = await api.post('/api/payments/initiate', { amount: 1000, fee_type: 'Hostel Fee' });
  const pays = await api.get('/api/payments');

  // Attendance
  const att = await api.post('/api/attendance/scan', { method: 'qr', location: 'gate' });

  // Admissions
  const y = new Date().getFullYear();
  const payload = {
    name: 'STUDENT ONE', department: 'CSE', year: 1, dob: '2006-01-01', reg_no: '123456',
    phone: '9000000003', email, blood_group: 'O+', medical_ailment: '', photo_url: 'http://example.com/p.jpg',
    parent_name: 'Parent One', parent_address: 'Some address', parent_phone: '9000000000',
    guardian_name: 'Guardian One', guardian_address: 'Same city', guardian_phone: '9000000000',
    agree: true, signature_url: 'http://example.com/sig.jpg', guardian_decl_url: 'http://example.com/dec.pdf',
    community: 'OC', gender: 'Male', father_name: 'Father', mother_name: 'Mother', distance_km: 10,
    address_proof_url: 'http://example.com/ap.pdf', category: 'Hosteller', admission_slip_url: 'http://example.com/as.pdf',
    medical_notes: 'None', lateral_entry: 'No', semester: 1, program_type: 'UG', degree: 'B.E', branch: 'CSE',
    academic_year: `${y}-${y+1}`
  };
  const adm = await api.post('/api/admissions', payload);
  const myAdms = await api.get('/api/admissions/me');
  await api.post(`/api/admissions/${adm.data.id}/pdf`, {});

  // Admin flows (login as admin)
  api.defaults.headers.common['Authorization'] = '';
  await login('admin@example.com', 'admin123');
  const blocks = await api.get('/api/admin/blocks');
  const summary = await api.get('/api/admin/payments/summary');
  const fee = await api.post('/api/fees', { name: 'Hostel Fee 2025', items: [{ label: 'Rent', amount: 1000 }] });
  const fees = await api.get('/api/fees');

  console.log('Full smoke OK:', {
    student: { id: me.data.id },
    complaints: compList.data.length,
    payments: pays.data.length,
    attendance: att.data.id,
    admissions: myAdms.data.length,
    admin: { blocks: blocks.data.length, summary: summary.data.byType?.length || 0, fees: fees.data.length }
  });
}

run().catch(e=>{ console.error('Full smoke failed:', e.response?.data || e.message); process.exit(1) });
