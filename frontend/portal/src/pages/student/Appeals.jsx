import React from 'react'
import Page from '../../components/Page'
import { api } from '../../api'
import { Box, Button, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'

export default function StudentAppeals(){
  const [items, setItems] = React.useState([])
  const [reason, setReason] = React.useState('')
  const load = async ()=>{ const r = await api.get('/api/appeals/me'); setItems(r.data||[]) }
  React.useEffect(()=>{ load() },[])
  const submit = async ()=>{
    if(!reason.trim()) return;
    await api.post('/api/appeals', { reason })
    setReason('')
    await load()
  }
  return (
    <Page title="Appeals">
      <Box sx={{ display:'flex', gap:1, mb:2 }}>
        <TextField fullWidth label="Reason" value={reason} onChange={e=>setReason(e.target.value)} />
        <Button variant="contained" onClick={submit}>Submit Appeal</Button>
      </Box>
      <Table size="small">
        <TableHead><TableRow>
          <TableCell>Created</TableCell><TableCell>Reason</TableCell><TableCell>Status</TableCell><TableCell>Decision</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {items.map(it => (
            <TableRow key={it.id}>
              <TableCell>{new Date(it.created_at).toLocaleString()}</TableCell>
              <TableCell>{it.reason}</TableCell>
              <TableCell>{it.status}</TableCell>
              <TableCell>{it.decision_note || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Page>
  )
}
