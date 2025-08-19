import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { QrCodeIcon } from '@heroicons/react/24/outline'
import { MessAPI } from '../../utils/api'

const Wrap = styled.div` padding: 20px; `
const Card = styled(motion.div)` border:1px solid rgba(100,116,139,.35); border-radius: 16px; padding: 18px; background: rgba(15,23,42,.5); `

export default function MessScanner(){
  const [count, setCount] = useState({ breakfast: 0, lunch: 0, dinner: 0 })
  const load = async ()=>{
    try{ const r = await MessAPI.counts(); setCount(r.data?.data || { breakfast:0, lunch:0, dinner:0 }) }catch(e){}
  }
  useEffect(()=>{ load() },[])

  return (
    <Wrap>
      <Card initial={{ opacity:0, y: 12 }} animate={{ opacity:1, y:0 }}>
        <h2 style={{ color:'#fff', fontWeight:900, margin:'0 0 12px' }}>Mess Scanner & Counts</h2>
        <div style={{ color:'#94a3b8', marginBottom: 12 }}>Prevents outsiders and enforces paid-only access.</div>
        <div style={{ display:'grid', gap:8 }}>
          <div style={{ color:'#cbd5e1' }}>Breakfast: {count.breakfast}</div>
          <div style={{ color:'#cbd5e1' }}>Lunch: {count.lunch}</div>
          <div style={{ color:'#cbd5e1' }}>Dinner: {count.dinner}</div>
        </div>
      </Card>
    </Wrap>
  )
}
