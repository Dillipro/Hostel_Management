import React from 'react'
import { api } from '../../api'
import { Box, Select, MenuItem, Paper, Typography, Chip } from '@mui/material'

export default function RoomPlanner(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [rooms, setRooms] = React.useState([])
  const [students, setStudents] = React.useState([])
  React.useEffect(()=>{ (async()=>{ const b=await api.get('/api/admin/blocks'); setBlocks(b.data||[]); if(b.data&&b.data[0]) setBlockId(b.data[0].id) })() },[])
  const load = React.useCallback(async ()=>{
    if(!blockId) return
    const [r, s] = await Promise.all([
      api.get(`/api/admin/blocks/${blockId}/rooms`),
      api.get('/api/admin/students')
    ])
    setRooms(r.data||[])
    setStudents((s.data||[]).filter(x=> x.hostel_id===blockId))
  },[blockId])
  React.useEffect(()=>{ load() },[load])

  const onDrop = async (ev, roomId)=>{
    const student_id = ev.dataTransfer.getData('text/plain')
    if(!student_id) return
    await api.post('/api/admin/rooms/move', { student_id, room_id: roomId })
    load()
  }
  const onDragStart = (ev, student_id)=>{ ev.dataTransfer.setData('text/plain', student_id) }

  return (
    <Box>
      <Box sx={{ display:'flex', gap:2, alignItems:'center', mb:2 }}>
        <Select size="small" value={blockId} onChange={e=>setBlockId(e.target.value)} sx={{ minWidth: 260 }}>
          {blocks.map(b=> <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
        </Select>
        <Typography variant="body2">Drag a student chip into a room.</Typography>
      </Box>
      <Box sx={{ display:'flex', gap:2 }}>
        <Paper sx={{ p:2, width: 320 }}>
          <Typography variant="subtitle2">Students in {blocks.find(b=>b.id===blockId)?.name||''}</Typography>
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1, mt:1 }}>
            {students.map(s=> (
              <Chip key={s.user_id} label={(s.user?.name||s.user_id)} draggable onDragStart={(e)=>onDragStart(e, s.user_id)} />
            ))}
          </Box>
        </Paper>
        <Box sx={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:2, flex:1 }}>
          {rooms.map(r=> (
            <Paper key={r.id} sx={{ p:1 }} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e, r.id)}>
              <Typography sx={{ fontWeight:700 }}>{r.room_no} {r.floor!=null && <Typography component="span" sx={{ fontSize:12, ml:1, opacity:0.7 }}>Floor {r.floor}</Typography>}</Typography>
              <Typography variant="caption">Cap {r.capacity||0} • {r.availability||'available'}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
