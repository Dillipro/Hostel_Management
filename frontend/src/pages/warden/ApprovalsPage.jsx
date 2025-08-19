import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { WardenAPI } from '../../utils/api'

const Wrap = styled.div` padding: 20px; `
const Card = styled(motion.div)` border:1px solid rgba(100,116,139,.35); border-radius: 16px; padding: 18px; background: rgba(15,23,42,.5); `

export default function ApprovalsPage(){
  const [pending, setPending] = useState([])
  const load = async () => {
    try{ const res = await fetch('/api/warden/pending-students'); const j= await res.json(); setPending(j?.data || []) }catch(e){}
  }
  useEffect(()=>{ load() },[])

  const act = async (id, ok)=>{
    try{ ok? await WardenAPI.approveStudent(id) : await WardenAPI.rejectStudent(id); await load() }catch(e){}
  }

  return (
    <Wrap>
      <Card initial={{ opacity:0, y: 12 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ color:'#fff', fontWeight:900, margin:'0 0 12px' }}>Student Approvals</h2>
        <div style={{ display:'grid', gap: 10 }}>
          {pending.length===0 && <div style={{ color:'#94a3b8' }}>No pending requests.</div>}
          {pending.map(s=> (
            <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:12, border:'1px solid rgba(100,116,139,.3)', background:'rgba(2,6,23,.35)' }}>
              <div style={{ color:'#cbd5e1', fontWeight:700 }}>{s.name} <span style={{ color:'#94a3b8', fontWeight:600 }}>• {s.department}</span></div>
              <div style={{ display:'flex', gap:8 }}>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }} onClick={()=>act(s.id,true)} style={{ border:'none', borderRadius:10, padding:'8px 12px', color:'#0b1220', background:'linear-gradient(135deg, #10b981, #059669)', fontWeight:800 }}>
                  <CheckCircleIcon style={{ width:18, height:18, marginRight:6, verticalAlign:'middle' }} /> Approve
                </motion.button>
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }} onClick={()=>act(s.id,false)} style={{ border:'1px solid rgba(239,68,68,.4)', borderRadius:10, padding:'8px 12px', color:'#fecaca', background:'rgba(127,29,29,.2)', fontWeight:800 }}>
                  <XCircleIcon style={{ width:18, height:18, marginRight:6, verticalAlign:'middle' }} /> Reject
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Wrap>
  )
}
