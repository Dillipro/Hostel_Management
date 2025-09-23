import React from 'react'
import Page from '../../components/Page'
import { api } from '../../api'
import { 
  Box, Button, Typography, Tabs, Tab, TextField, Alert, Chip 
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import FormHeader from '../../components/FormHeader'

export default function StudentAdmission(){
  const [tab, setTab] = React.useState(0)
  const [step, setStep] = React.useState(0)
  const [branches, setBranches] = React.useState([])
  const [years, setYears] = React.useState([])
  const [submitting, setSubmitting] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [me, setMe] = React.useState(null)
  const [latestApp, setLatestApp] = React.useState(null)

  const [form, setForm] = React.useState({
    name: '', department: '', year: 1, dob: '', reg_no: '', phone: '', email: '', blood_group: 'O+', medical_ailment: '', photo_url: '',
    parent_name: '', parent_address: '', parent_phone: '', guardian_name: '', guardian_address: '', guardian_phone: '',
    agree: false, signature_url: '', guardian_decl_url: '',
    community: 'OC', gender: 'Male', father_name: '', mother_name: '', distance_km: 0, address_proof_url: '', category: 'Hosteller', admission_slip_url: '', medical_notes: '', lateral_entry: 'No',
    semester: 1, program_type: 'UG', degree: 'B.E', branch: '',
    academic_year: ''
  })

  const loadOptions = async () => {
    const [b, y, m] = await Promise.all([
      api.get('/api/admissions/options/branches'),
      api.get('/api/admissions/options/years'),
      api.get('/api/students/me')
    ])
    setBranches(b.data || [])
    setYears(y.data || [])
    setMe(m.data)
    
    // Pre-fill form with user profile data if available
    if (m.data?.user) {
      const user = m.data.user
      setForm(prevForm => ({
        ...prevForm,
        // Basic details from signup
        name: user.name || prevForm.name,
        reg_no: user.reg_no || prevForm.reg_no,
        phone: user.phone || prevForm.phone,
        email: user.email || prevForm.email,
        dob: user.dob ? user.dob.split('T')[0] : prevForm.dob, // Convert to YYYY-MM-DD
        
        // Personal details
        community: user.community || prevForm.community,
        gender: user.gender?.charAt(0).toUpperCase() + user.gender?.slice(1) || prevForm.gender,
        father_name: user.father_name || prevForm.father_name,
        mother_name: user.mother_name || prevForm.mother_name,
        distance_km: user.distance_from_home || prevForm.distance_km,
        address_proof_url: user.address_proof_url || prevForm.address_proof_url,
        category: user.category === 'general' ? 'Hosteller' : prevForm.category,
        admission_slip_url: user.admission_slip_url || prevForm.admission_slip_url,
        medical_notes: user.medical_info || prevForm.medical_notes,
        lateral_entry: user.lateral_entry?.charAt(0).toUpperCase() + user.lateral_entry?.slice(1) || prevForm.lateral_entry,
        
        // Academic details
        semester: user.semester || prevForm.semester,
        year: user.year || prevForm.year,
        program_type: user.program_type?.toUpperCase() || prevForm.program_type,
        degree: user.degree || prevForm.degree,
        branch: user.branch || prevForm.branch,
        department: user.branch || prevForm.department // Use branch as department
      }))
    }
    
    const apps = await api.get('/api/admissions/me')
    setLatestApp(apps.data?.[0] || null)
  }
  React.useEffect(()=>{ loadOptions() },[])

  const upload = async (file, opts={}) => {
    if (!file) return ''
    const { maxKB=300, accept=[] } = opts
    const sizeKB = Math.ceil(file.size/1024)
    const extOk = accept.length ? accept.some(a=>file.type.includes(a)) : true
    if (sizeKB > maxKB) { alert(`File too large: ${sizeKB}KB > ${maxKB}KB`); return '' }
    if (!extOk) { alert('Invalid file type'); return '' }
    const fd = new FormData(); fd.append('file', file)
    setUploading(true)
    try { const r = await api.post('/api/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); return r.data.url || '' } finally { setUploading(false) }
  }

  const validate = () => {
    const emailOk = /.+@.+\..+/.test(form.email)
    const phoneOk = /^\d{10}$/.test(form.phone)
    if (!form.name || !form.department || !form.reg_no) return 'Fill basic details'
    if (!emailOk) return 'Enter a valid email'
    if (!phoneOk) return 'Enter a valid 10-digit mobile number'
    if (!form.agree) return 'You must agree to the declaration'
    if (!form.academic_year) return 'Select academic year'
    if (!form.branch) return 'Select branch'
    return ''
  }

  const submit = async () => {
    const err = validate()
    if (err) { alert(err); return }
    setSubmitting(true)
    try {
      const r = await api.post('/api/admissions', form)
      setLatestApp(r.data)
      setTab(1)
    } catch(e){ alert(e?.response?.data?.error || 'Submit failed') } finally { setSubmitting(false) }
  }

  const loadStatus = async () => {
    const apps = await api.get('/api/admissions/me')
    setLatestApp(apps.data?.[0] || null)
  }
  const genPdf = async () => { if (!latestApp) return; await api.post(`/api/admissions/${latestApp.id}/pdf`); setTimeout(loadStatus, 1200) }

  return (
    <Page title="Admission">
      <Tabs value={tab} onChange={(_,v)=>setTab(v)}>
        <Tab label="Apply" /><Tab label="Status" onClick={loadStatus}/>
      </Tabs>
      {tab===0 && (
        <Box mt={2}>
          {me?.user && (
            <Alert 
              severity="info" 
              icon={<CheckCircle />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                <strong>Great news!</strong> Most of your information has been automatically filled from your registration profile. 
                Please review the pre-filled details and complete the remaining fields marked with <Chip size="small" label="Required" color="warning" />.
              </Typography>
            </Alert>
          )}

          {/* Professional Form Header */}
          <FormHeader title="HOSTEL ADMISSION APPLICATION" />

          <Typography variant="subtitle1">Step {step+1} of 6</Typography>
          {step===0 && (
            <>
              <TextField fullWidth margin="dense" label="Name (IN CAPITALS)" value={form.name} onChange={e=>setForm({...form, name:e.target.value.toUpperCase()})} />
              <Box display="flex" gap={2}>
                <TextField select fullWidth margin="dense" label="Department" SelectProps={{ native:true }} value={form.department} onChange={e=>setForm({...form, department:e.target.value})}>
                  <option value=""></option>
                  {branches.map(b=> <option key={b} value={b}>{b}</option>)}
                </TextField>
                <TextField type="number" margin="dense" label="Year" value={form.year} onChange={e=>setForm({...form, year:Number(e.target.value)})} />
              </Box>
              <Box display="flex" gap={2}>
                <TextField type="date" margin="dense" label="Date of Birth" InputLabelProps={{ shrink:true }} value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} />
                <TextField margin="dense" label="Register Number" value={form.reg_no} onChange={e=>setForm({...form, reg_no:e.target.value})} />
              </Box>
              <Box display="flex" gap={2}>
                <TextField margin="dense" label="Student Mobile" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
                <TextField margin="dense" label="Mail ID" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
              </Box>
              <Box display="flex" gap={2}>
                <TextField select margin="dense" label="Blood Group" SelectProps={{ native:true }} value={form.blood_group} onChange={e=>setForm({...form, blood_group:e.target.value})}>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg=> <option key={bg} value={bg}>{bg}</option>)}
                </TextField>
                <TextField fullWidth margin="dense" label="Medical Ailment (optional)" value={form.medical_ailment} onChange={e=>setForm({...form, medical_ailment:e.target.value})} />
              </Box>
              <Box mt={1} display="flex" gap={2} alignItems="center">
                <Button variant="outlined" component="label">Photo Upload<input hidden type="file" accept="image/jpeg,image/png" onChange={async e=>{ const f=e.target.files[0]; const url = await upload(f,{maxKB:200, accept:['image/']}); if(url) setForm({...form, photo_url:url}) }} /></Button>
                <Typography variant="body2">{form.photo_url ? 'Photo uploaded' : 'No photo uploaded'}</Typography>
              </Box>
            </>
          )}
          {step===1 && (
            <>
              <TextField fullWidth margin="dense" label="Name of the Parent" value={form.parent_name} onChange={e=>setForm({...form, parent_name:e.target.value})} />
              <TextField fullWidth margin="dense" multiline minRows={2} label="Permanent Residential Address" value={form.parent_address} onChange={e=>setForm({...form, parent_address:e.target.value})} />
              <Box display="flex" gap={2}>
                <TextField margin="dense" label="Parent’s Phone / Landline (Mandatory)" value={form.parent_phone} onChange={e=>setForm({...form, parent_phone:e.target.value})} />
              </Box>
              <TextField fullWidth margin="dense" label="Name of Local Guardian" value={form.guardian_name} onChange={e=>setForm({...form, guardian_name:e.target.value})} />
              <TextField fullWidth margin="dense" multiline minRows={2} label="Local Guardian’s Address" value={form.guardian_address} onChange={e=>setForm({...form, guardian_address:e.target.value})} />
              <TextField margin="dense" label="Local Guardian’s Phone / Landline (Mandatory)" value={form.guardian_phone} onChange={e=>setForm({...form, guardian_phone:e.target.value})} />
            </>
          )}
          {step===2 && (
            <>
              <Typography variant="body2" sx={{ whiteSpace:'pre-line' }}>
                {`“I have read and understood all the rules and regulations and I agree to abide by the same which will be in force from time to time at the hostel. I understand that in case of my misconduct, hostel management has all the right to take action on me and I agree to abide by that. I also understand that the hostel fee once paid will not be refundable or adjustable.”`}
              </Typography>
              <Box mt={1} display="flex" gap={2} alignItems="center">
                <label><input type="checkbox" checked={form.agree} onChange={e=>setForm({...form, agree:e.target.checked})} /> I Agree</label>
              </Box>
              <Box mt={2} display="flex" gap={2} alignItems="center">
                <Button variant="outlined" component="label">Signature Upload<input hidden type="file" accept="image/jpeg,image/png" onChange={async e=>{ const url = await upload(e.target.files[0],{maxKB:300, accept:['image/']}); if(url) setForm({...form, signature_url:url}) }} /></Button>
                <Typography variant="body2">{form.signature_url ? 'Signature uploaded' : 'No signature uploaded'}</Typography>
              </Box>
              <Box mt={2} display="flex" gap={2} alignItems="center">
                <Button variant="outlined" component="label">Parent/Guardian Declaration Upload<input hidden type="file" accept="application/pdf,image/jpeg,image/png" onChange={async e=>{ const url = await upload(e.target.files[0],{maxKB:200, accept:['application/','image/']}); if(url) setForm({...form, guardian_decl_url:url}) }} /></Button>
                <Typography variant="body2">{form.guardian_decl_url ? 'Declaration uploaded' : 'No declaration uploaded'}</Typography>
              </Box>
            </>
          )}
          {step===3 && (
            <>
              <Box display="flex" gap={2}>
                <TextField select margin="dense" label="Community" SelectProps={{ native:true }} value={form.community} onChange={e=>setForm({...form, community:e.target.value})}>
                  {['OC','BC','MBC','SC','ST','Others'].map(c=> <option key={c} value={c}>{c}</option>)}
                </TextField>
                <TextField select margin="dense" label="Gender" SelectProps={{ native:true }} value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}>
                  {['Male','Female','Other'].map(g=> <option key={g} value={g}>{g}</option>)}
                </TextField>
              </Box>
              <Box display="flex" gap={2}>
                <TextField margin="dense" label="Father’s Name" value={form.father_name} onChange={e=>setForm({...form, father_name:e.target.value})} />
                <TextField margin="dense" label="Mother’s Name" value={form.mother_name} onChange={e=>setForm({...form, mother_name:e.target.value})} />
              </Box>
              <Box display="flex" gap={2}>
                <TextField type="number" margin="dense" label="Distance from Home (KM)" value={form.distance_km} onChange={e=>setForm({...form, distance_km:Number(e.target.value)})} />
                <TextField select margin="dense" label="Category" SelectProps={{ native:true }} value={form.category} onChange={e=>setForm({...form, category:e.target.value})}>
                  {['Day Scholar','Hosteller','Other'].map(c=> <option key={c} value={c}>{c}</option>)}
                </TextField>
              </Box>
              <Box mt={2} display="flex" gap={2}>
                <Button variant="outlined" component="label">Address Proof Upload<input hidden type="file" accept="application/pdf" onChange={async e=>{ const url = await upload(e.target.files[0],{maxKB:100, accept:['application/pdf']}); if(url) setForm({...form, address_proof_url:url}) }} /></Button>
                <Typography variant="body2">{form.address_proof_url ? 'Address proof uploaded' : 'No address proof'}</Typography>
              </Box>
              <Box mt={2} display="flex" gap={2}>
                <Button variant="outlined" component="label">Admission Slip Upload<input hidden type="file" accept="application/pdf" onChange={async e=>{ const url = await upload(e.target.files[0],{maxKB:100, accept:['application/pdf']}); if(url) setForm({...form, admission_slip_url:url}) }} /></Button>
                <Typography variant="body2">{form.admission_slip_url ? 'Admission slip uploaded' : 'No admission slip'}</Typography>
              </Box>
              <TextField fullWidth margin="dense" multiline minRows={2} label="Medical Complaints / Allergies / Physically Challenged" value={form.medical_notes} onChange={e=>setForm({...form, medical_notes:e.target.value})} />
              <TextField select margin="dense" label="Lateral Entry" SelectProps={{ native:true }} value={form.lateral_entry} onChange={e=>setForm({...form, lateral_entry:e.target.value})}>
                {['Yes','No'].map(v=> <option key={v} value={v}>{v}</option>)}
              </TextField>
            </>
          )}
          {step===4 && (
            <>
              <Box display="flex" gap={2}>
                <TextField type="number" margin="dense" label="Semester" value={form.semester} onChange={e=>setForm({...form, semester:Number(e.target.value)})} />
                <TextField type="number" margin="dense" label="Year" value={form.year} onChange={e=>setForm({...form, year:Number(e.target.value)})} />
              </Box>
              <Box display="flex" gap={2}>
                <TextField select margin="dense" label="Program Type" SelectProps={{ native:true }} value={form.program_type} onChange={e=>setForm({...form, program_type:e.target.value})}>
                  {['UG','PG'].map(p=> <option key={p} value={p}>{p}</option>)}
                </TextField>
                <TextField select margin="dense" label="Degree" SelectProps={{ native:true }} value={form.degree} onChange={e=>setForm({...form, degree:e.target.value})}>
                  {['B.E','B.Tech','M.E','M.Tech','MBA','MCA'].map(d=> <option key={d} value={d}>{d}</option>)}
                </TextField>
                <TextField select fullWidth margin="dense" label="Branch" SelectProps={{ native:true }} value={form.branch} onChange={e=>setForm({...form, branch:e.target.value})}>
                  <option value=""></option>
                  {branches.map(b=> <option key={b} value={b}>{b}</option>)}
                </TextField>
              </Box>
            </>
          )}
          {step===5 && (
            <>
              <TextField select margin="dense" label="Academic Year" SelectProps={{ native:true }} value={form.academic_year} onChange={e=>setForm({...form, academic_year:e.target.value})}>
                <option value=""></option>
                {years.map(y=> <option key={y} value={y}>{y}</option>)}
              </TextField>
              <Typography variant="body2" sx={{ mt:2 }}>
                Note: Please ensure that all details entered are correct. Incomplete applications will not be processed. All uploaded documents must be in the specified format and size.
              </Typography>
            </>
          )}
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Button disabled={step===0} onClick={()=>setStep(step-1)}>Back</Button>
            <Box>
              {uploading && <Typography variant="body2" sx={{ mr:2, display:'inline-block' }}>Uploading...</Typography>}
              {step<5 ? (
                <Button variant="contained" onClick={()=>setStep(step+1)}>Next</Button>
              ) : (
                <Button variant="contained" disabled={submitting} onClick={submit}>{submitting?'Submitting...':'Submit'}</Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
      {tab===1 && (
        <Box mt={2}>
          {latestApp ? (
            <>
              <Typography>Status: {latestApp.status}</Typography>
              {latestApp.admin_remark && <Typography>Remark: {latestApp.admin_remark}</Typography>}
              <Box mt={1}>
                <Button variant="outlined" onClick={genPdf}>Generate Application PDF</Button>
                <Button sx={{ ml:1 }} component="a" href={`/api/applications/${latestApp.id}/pdf`} target="_blank">Download PDF</Button>
              </Box>
              <Box mt={2}>
                {me?.student?.id_card_qr && <Button component="a" href={me.student.id_card_qr} target="_blank">Hostel ID Card</Button>}
              </Box>
            </>
          ) : (
            <Typography>No admission application submitted yet.</Typography>
          )}
        </Box>
      )}
    </Page>
  )
}
