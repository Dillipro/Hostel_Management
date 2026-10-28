import React from 'react'
import { api } from '../../api'
import { getRole } from '../../utils/auth'
import { Box, Paper, Typography, TextField, Button, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material'

export default function RCAssets(){
  const [items, setItems] = React.useState([])
  const [name, setName] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [status, setStatus] = React.useState('ok')
  const role = getRole()
  const load = async ()=>{ const r = await api.get('/api/admin/assets'); setItems(r.data||[]) }
  React.useEffect(()=>{ load() },[])
  const create = async ()=>{ await api.post('/api/admin/assets', { name, location, status }); setName(''); setLocation(''); setStatus('ok'); await load() }
  const update = async (id, data)=>{ await api.put(`/api/admin/assets/${id}`, data); await load() }
  return (
    <Box>
      {role === 'admin' && (
        <Paper sx={{ p:2, mb:2 }}>
          <Typography variant="subtitle1">New Asset</Typography>
          <Box sx={{ display:'flex', gap:1, mt:1 }}>
            <TextField size="small" label="Name" value={name} onChange={e=>setName(e.target.value)} />
            <TextField size="small" label="Location" value={location} onChange={e=>setLocation(e.target.value)} />
            <Select size="small" value={status} onChange={e=>setStatus(e.target.value)}>
              <MenuItem value="ok">OK</MenuItem>
              <MenuItem value="needs_repair">Needs Repair</MenuItem>
              <MenuItem value="retired">Retired</MenuItem>
            </Select>
            <Button variant="contained" onClick={create} disabled={!name}>Add</Button>
          </Box>
        </Paper>
      )}
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1">Assets</Typography>
        <Table size="small" sx={{ mt:1 }}>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Location</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {items.map(it=> (
              <TableRow key={it.id}>
                <TableCell>{it.name}</TableCell><TableCell>{it.location}</TableCell><TableCell>{it.status}</TableCell>
                <TableCell>
                  <Button size="small" onClick={()=>update(it.id, { status: 'needs_repair' })}>Mark Repair</Button>
                  <Button size="small" onClick={()=>update(it.id, { status: 'ok' })}>Mark OK</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
