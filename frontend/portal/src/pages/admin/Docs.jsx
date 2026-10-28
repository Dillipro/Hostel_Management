import React from 'react'
import { api } from '../../api'
import { Box, Paper, Typography, TextField, Button } from '@mui/material'

export default function AdminDocs(){
  const [studentId, setStudentId] = React.useState('')
  const [docId, setDocId] = React.useState('')
  const genAdmission = async ()=>{ const r = await api.post(`/api/admin/docs/admission-letter/${studentId}`); setDocId(r.data.id) }
  const genDefaulter = async ()=>{ const r = await api.post(`/api/admin/docs/defaulter-notice/${studentId}`, { amount_due: 5000 }); setDocId(r.data.id) }
  return (
    <Box>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="h6">Generate Documents</Typography>
        <Box sx={{ display:'flex', gap:1, mt:1 }}>
          <TextField size="small" label="Student ID" value={studentId} onChange={e=>setStudentId(e.target.value)} />
          <Button variant="contained" onClick={genAdmission} disabled={!studentId}>Admission Letter</Button>
          <Button variant="outlined" onClick={genDefaulter} disabled={!studentId}>Defaulter Notice</Button>
        </Box>
      </Paper>
      {docId && (
        <Paper sx={{ p:2 }}>
          <Typography variant="subtitle1">Latest Document</Typography>
          <a href={`/api/admin/docs/${docId}.pdf`} target="_blank" rel="noreferrer">Open PDF</a>
        </Paper>
      )}
    </Box>
  )
}
