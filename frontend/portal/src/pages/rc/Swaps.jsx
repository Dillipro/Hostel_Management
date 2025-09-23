import React from 'react'
import { api } from '../../api'
import { Box, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material'

export default function RCSwaps(){
  const [rows, setRows] = React.useState([])
  const load = async ()=>{ const r = await api.get('/api/rc-extras/swaps'); setRows(r.data||[]) }
  React.useEffect(()=>{ load() },[])
  const decide = async (id, decision)=>{ await api.patch(`/api/rc-extras/swaps/${id}/decision`, { decision }); load() }
  return (
    <Box>
      <Table size="small">
        <TableHead><TableRow>
          <TableCell>Requester</TableCell><TableCell>Target</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.id}>
              <TableCell>{r.requester_student_id}</TableCell>
              <TableCell>{r.target_student_id}</TableCell>
              <TableCell>{r.status}</TableCell>
              <TableCell>
                {r.status==='pending' && <>
                  <Button size="small" onClick={()=>decide(r.id,'approve')}>Approve</Button>
                  <Button size="small" color="error" onClick={()=>decide(r.id,'reject')}>Reject</Button>
                </>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
