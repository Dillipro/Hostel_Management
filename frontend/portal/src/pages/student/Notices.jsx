import React from 'react'
import { api } from '../../api'
import { Box, Paper, Typography } from '@mui/material'

export default function StudentNotices(){
  const [rows, setRows] = React.useState([])
  React.useEffect(()=>{ api.get('/api/rc-extras/student/notices').then(r=>setRows(r.data||[])) },[])
  return (
    <Box>
      {rows.map(n => (
        <Paper key={n.id} sx={{ p:2, mb:2, cursor:'pointer' }} onClick={()=> api.post(`/api/rc-extras/student/notices/${n.id}/read`).catch(()=>{})}>
          <Typography variant="h6">{n.title}</Typography>
          <Typography variant="body2" sx={{ whiteSpace:'pre-wrap' }}>{n.body}</Typography>
          {n.publish_at && <Typography variant="caption">Published: {new Date(n.publish_at).toLocaleString()}</Typography>}
        </Paper>
      ))}
      {!rows.length && <Typography>No notices</Typography>}
    </Box>
  )
}
