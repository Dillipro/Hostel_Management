import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { CalendarDaysIcon, QrCodeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { AttendanceAPI } from '../../utils/api'

const Wrap = styled.div` padding: 20px; `
const Card = styled(motion.div)` border:1px solid rgba(100,116,139,.35); border-radius: 16px; padding: 18px; background: rgba(15,23,42,.5); `

export default function AttendancePage(){
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try{ const res = await AttendanceAPI.getLogs({ scope: 'me' }); setLogs(res.data?.data || []) }catch(e){} finally{ setLoading(false) }
  }

  useEffect(()=>{ load() },[])

  return (
    <Wrap>
      <Card initial={{ opacity:0, y: 12 }} animate={{ opacity:1, y:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
          <h2 style={{ color:'#fff', fontWeight:900 }}>Attendance</h2>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={load} style={{ border:'1px solid rgba(100,116,139,.35)', borderRadius:10, padding:'8px 12px', color:'#cbd5e1', background:'transparent' }}>
            <ArrowPathIcon style={{ width:18, height:18, display:'inline-block', verticalAlign:'middle', marginRight: 6 }} /> Refresh
          </motion.button>
        </div>
        <div style={{ display:'grid', gap:10 }}>
          {loading && <div style={{ color:'#cbd5e1' }}>Loading...</div>}
          {!loading && logs.length === 0 && <div style={{ color:'#94a3b8' }}>No logs yet.</div>}
          {logs.map((l, i)=> (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:12, border:'1px solid rgba(100,116,139,.3)', background:'rgba(2,6,23,.35)' }}>
              <span style={{ color:'#38bdf8', fontWeight:700, fontSize:13 }}>{l.time || l.createdAt}</span>
              <span style={{ color:'#cbd5e1', fontWeight:700 }}>{l.gate || l.location}</span>
              <span style={{ color:'#cbd5e1' }}>{(l.mode || 'qr').toUpperCase()}</span>
            </div>
          ))}
        </div>
      </Card>
    </Wrap>
  )
}
