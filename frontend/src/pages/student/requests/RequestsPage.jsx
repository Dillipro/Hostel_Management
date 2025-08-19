import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { ArrowUpRightIcon, QueueListIcon } from '@heroicons/react/24/outline'
import { AllocationAPI } from '../../../utils/api'

const Wrap = styled.div` padding: 20px; display:grid; gap: 16px; `
const Card = styled(motion.div)` border:1px solid rgba(100,116,139,.35); border-radius: 16px; padding: 18px; background: rgba(15,23,42,.5); `
const Input = styled.input` padding: 10px 12px; border-radius: 10px; border:1px solid rgba(100,116,139,.35); background: rgba(2,6,23,.35); color:#fff; width:100%; `

export default function RequestsPage(){
  const [roomPref, setRoomPref] = useState('')
  const [reason, setReason] = useState('')

  const submitShift = async ()=>{
    try { await AllocationAPI.requestShift({ preference: roomPref, reason }); alert('Shift request submitted') } catch(e){}
  }

  return (
    <Wrap>
      <Card initial={{ opacity:0, y: 12 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ color:'#fff', fontWeight:900, margin:'0 0 12px' }}>Room Change Request</h2>
        <div style={{ display:'grid', gap: 10 }}>
          <Input placeholder="Preferred block/room type" value={roomPref} onChange={e=>setRoomPref(e.target.value)} />
          <Input placeholder="Reason" value={reason} onChange={e=>setReason(e.target.value)} />
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={submitShift} style={{ border:'none', borderRadius:10, padding:'10px 12px', color:'#0b1220', background:'linear-gradient(135deg, #22d3ee, #3b82f6)', fontWeight:800, width:'fit-content' }}>
            Submit <ArrowUpRightIcon style={{ width:18, height:18, marginLeft:6, display:'inline-block', verticalAlign:'middle' }} />
          </motion.button>
        </div>
      </Card>

      <Card initial={{ opacity:0, y: 12 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ color:'#fff', fontWeight:900, margin:'0 0 12px' }}>Leave Application</h2>
        <div style={{ color:'#94a3b8' }}>Integrated with gate QR scanning (approval required).</div>
      </Card>
    </Wrap>
  )
}
