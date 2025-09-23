import React from 'react'
import { api } from '../../api'
import { Box, Paper, Typography, TextField, Button, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, Chip } from '@mui/material'
import { getRole } from '../../utils/auth'

export default function RCWorkOrders(){
  const [items, setItems] = React.useState([])
  const [title, setTitle] = React.useState('')
  const [priority, setPriority] = React.useState('normal')
  const [description, setDescription] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [blockFilter, setBlockFilter] = React.useState('')
  const [view, setView] = React.useState(0) // 0=list, 1=kanban, 2=calendar
  const [users, setUsers] = React.useState([])
  const [techs, setTechs] = React.useState([])
  const role = getRole()
  const load = async ()=>{ const r = await api.get('/api/admin/workorders', { params: { status: statusFilter||undefined, block_id: blockFilter||undefined } }); setItems(r.data||[]) }
  React.useEffect(()=>{ load() },[])
  React.useEffect(()=>{ (async()=>{ try{ const u = await api.get('/api/admin/users'); setUsers(u.data||[]) }catch{} try{ const t = await api.get('/api/admin/technicians'); setTechs(t.data||[]) }catch{} })() },[])
  React.useEffect(()=>{ load() },[statusFilter, blockFilter])
  const create = async ()=>{ await api.post('/api/admin/workorders', { title, priority, description }); setTitle(''); setDescription(''); setPriority('normal'); await load() }
  const update = async (id, data)=>{ await api.put(`/api/admin/workorders/${id}`, data); await load() }
  return (
    <Box>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle1">New Work Order</Typography>
        <Box sx={{ display:'flex', gap:1, mt:1 }}>
          <TextField size="small" label="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <Select size="small" value={priority} onChange={e=>setPriority(e.target.value)}>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
          <TextField size="small" label="Description" value={description} onChange={e=>setDescription(e.target.value)} sx={{ flex:1 }} />
          <Button variant="contained" onClick={create} disabled={!title}>Create</Button>
        </Box>
      </Paper>
      <Paper sx={{ p:2 }}>
        <Typography variant="subtitle1">Work Orders</Typography>
        <Tabs value={view} onChange={(_,v)=>setView(v)} sx={{ mb:1 }}>
          <Tab label="List" />
          <Tab label="Kanban" />
          <Tab label="Calendar" />
        </Tabs>
        <Box sx={{ display:'flex', gap:1, mt:1 }}>
          <Select size="small" displayEmpty value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <MenuItem value=""><em>All Status</em></MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="done">Done</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
          <TextField size="small" placeholder="Block ID" value={blockFilter} onChange={e=>setBlockFilter(e.target.value)} />
          <Button onClick={load}>Refresh</Button>
        </Box>
        {view===0 && (
        <Table size="small" sx={{ mt:1 }}>
          <TableHead><TableRow><TableCell>Title</TableCell><TableCell>Priority</TableCell><TableCell>Status</TableCell><TableCell>Assigned To</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {items.map(it=> (
              <TableRow key={it.id}>
                <TableCell>{it.title}</TableCell><TableCell>{it.priority}</TableCell><TableCell>{it.status}</TableCell>
                <TableCell>
                  <Select size="small" displayEmpty value={it.assigned_to||''} onChange={e=>update(it.id, { assigned_to: e.target.value||null, status: e.target.value? 'assigned': (it.status==='assigned'?'open':it.status) })} sx={{ minWidth: 180 }}>
                    <MenuItem value=""><em>Unassigned</em></MenuItem>
                    {users.map(u=> <MenuItem key={u.id} value={u.id}>{u.name} <Chip size="small" label={u.role} sx={{ ml:1 }} /></MenuItem>)}
                    {techs.map(t=> <MenuItem key={t.id} value={t.id}>{t.name} <Chip size="small" label="tech" sx={{ ml:1 }} /></MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={()=>update(it.id, { status: 'in_progress' })}>Start</Button>
                  <Button size="small" onClick={()=>update(it.id, { status: 'done' })}>Done</Button>
                  <Button size="small" color="error" onClick={()=>update(it.id, { status: 'cancelled' })}>Cancel</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
        {view===1 && (
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:2, mt:1 }}>
            {['open','assigned','in_progress','done'].map(col => (
              <Paper key={col} sx={{ p:1 }}>
                <Typography variant="subtitle2" sx={{ textTransform:'capitalize' }}>{col.replace('_',' ')}</Typography>
                {items.filter(i=>i.status===col).map(i => (
                  <Paper key={i.id} sx={{ p:1, my:1 }}>
                    <Typography>{i.title}</Typography>
                    <Typography variant="caption">{i.priority}</Typography>
                    <Box sx={{ display:'flex', gap:1, mt:1 }}>
                      <Button size="small" onClick={()=>update(i.id, { status: col==='open'?'assigned':'in_progress' })}>Next</Button>
                      <Button size="small" onClick={()=>update(i.id, { status: 'done' })}>Done</Button>
                    </Box>
                  </Paper>
                ))}
              </Paper>
            ))}
          </Box>
        )}
        {view===2 && (
          <Box sx={{ mt:1 }}>
            {items.map(i => (
              <Paper key={i.id} sx={{ p:1, my:1 }}>
                <Typography>{i.title}</Typography>
                <Typography variant="caption">Due: {i.due_at? new Date(i.due_at).toLocaleString() : '—'}</Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  )
}
