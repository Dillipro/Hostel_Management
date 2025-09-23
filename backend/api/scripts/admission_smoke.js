// Admission flow smoke test: login -> submit -> generate PDF
const axios = require('axios').default;

const api = axios.create({ baseURL: 'http://localhost:4000', validateStatus: s => s < 500 });

async function main(){
  // 1) Captcha
  const cap = await api.get('/api/security/captcha');
  if (!cap.data?.id) throw new Error('captcha failed');
  console.log('Captcha:', { id: cap.data.id, hasText: !!cap.data.text });

  // 2) Login step1
  const email = 'student1@example.com';
  const password = 'stud1234';
  const r1 = await api.post('/api/auth/login', { email, password, captchaId: cap.data.id, captchaText: cap.data.text }).catch(e=>({ error: e.message }));
  console.log('Login step1 status/data:', r1?.status, r1?.data || r1);
  if (!r1 || !r1.data?.temp) {
    // Retry using server-side stored text may not be returned; request OTP directly
  }
  // 2a) Request OTP
  const otpReq = await api.post('/api/security/otp/request', { to: email });
  const code = otpReq.data?.demo_code;
  if (!code) throw new Error('otp not received');

  // 3) Verify OTP
  const temp = r1?.data?.temp;
  if (!temp) throw new Error('temp token missing');
  const r2 = await api.post('/api/auth/verify-otp', { temp, to: email, code });
  const access = r2.data?.access;
  if (!access) throw new Error('access token missing');
  api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

  // 4) Prepare a minimal admission payload matching zod schema
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

  const sub = await api.post('/api/admissions', payload);
  if (sub.status !== 201) { console.error(sub.data); throw new Error('submission failed'); }
  const app = sub.data;

  // 5) Verify via /me
  const meList = await api.get('/api/admissions/me');
  const found = Array.isArray(meList.data) && meList.data.find(x=>x.id === app.id);
  if (!found) throw new Error('application not listed');
  console.log('Smoke OK:', { appId: app.id, status: found.status });
}

main().catch(e=>{ console.error('Smoke test failed:', e.response?.data || e.message); process.exit(1) });
