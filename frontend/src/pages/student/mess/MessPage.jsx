import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { StudentMessAPI, StudentPortalAPI } from '../../../utils/api'
import { HeartIcon } from '@heroicons/react/24/outline'
import { Spinner } from '../../../components/common/Spinner'

const Wrap = styled.div`display:grid; gap:16px;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px;`
const Row = styled.div`display:flex; gap:12px; align-items:center; flex-wrap:wrap;`
const Input = styled.input`padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.04); color:#fff;`
const Select = styled.select`padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.04); color:#fff;`
const Btn = styled.button`padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.2); background:${p=>p.variant==='primary'?'rgba(99,102,241,.25)':'rgba(255,255,255,.06)'}; color:#fff; cursor:pointer;`

export default function MessPage(){
  const [access, setAccess] = useState(null)
  const [basics, setBasics] = useState({ rules: {}, messMenu: [] })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ messId: '', planType: 'veg' })

  async function load(){
    setLoading(true); setErr('')
    try{
      const [m, b] = await Promise.all([StudentMessAPI.get(), StudentPortalAPI.basics()])
      setAccess(m.data?.data || {})
      setBasics(b.data?.data || { rules: {}, messMenu: [] })
    }catch(e){ setErr(e?.response?.data?.message || e.message || 'Failed to load') }
    finally{ setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  async function join(){
    setErr('')
    if(!form.messId) { setErr('Please enter a Mess ID to join.'); return }
    try{ await StudentMessAPI.join({ messId: form.messId, planType: form.planType }); await load() }
    catch(e){ setErr(e?.response?.data?.message || e.message) }
  }
  async function leave(){
    setErr('')
    try{ await StudentMessAPI.leave({}); await load() }
    catch(e){ setErr(e?.response?.data?.message || e.message) }
  }

  const enrolled = Boolean(access?.messId)
  const messName = access?.messId?.name || access?.messId?.code || 'Mess'
  const planType = access?.messAccess?.planType || 'veg'

  return (
    <Wrap>
      <Row>
        <HeartIcon width={22} height={22} color="#fda4af"/>
        <h3 style={{margin:0,color:'#fff'}}>My Mess</h3>
      </Row>

      {loading ? (
        <div style={{display:'flex',alignItems:'center',gap:10,color:'#94a3b8'}}>
          <Spinner size="sm"/> Loading mess info...
        </div>
      ) : (
        <>
          {err && (
            <Card style={{borderColor:'rgba(239,68,68,.35)', background:'rgba(239,68,68,.08)', color:'#fecaca'}}>{err}</Card>
          )}
          <Card>
            {enrolled ? (
              <>
                <div style={{color:'#fff',fontWeight:800, fontSize:16}}>Enrolled in: {messName}</div>
                <div style={{color:'#94a3b8', fontSize:13}}>Meal Plan: {planType}</div>
                <Row style={{marginTop:12}}>
                  <Btn onClick={leave}>Leave Mess</Btn>
                </Row>
              </>
            ) : (
              <>
                <div style={{color:'#94a3b8', marginBottom:8}}>You are not enrolled in any mess.</div>
                <Row>
                  <Input placeholder="Enter Mess ID" value={form.messId} onChange={e=>setForm(f=>({...f, messId:e.target.value}))} />
                  <Select value={form.planType} onChange={e=>setForm(f=>({...f, planType:e.target.value}))}>
                    <option value="veg">Veg</option>
                    <option value="nonveg">Non-Veg</option>
                    <option value="special">Special</option>
                  </Select>
                  <Btn variant="primary" onClick={join}>Join Mess</Btn>
                </Row>
                <p style={{color:'#64748b', fontSize:12, marginTop:8}}>Hint: Ask your warden or mess manager for the Mess ID.</p>
              </>
            )}
          </Card>

          <Card>
            <div style={{color:'#fff',fontWeight:700, marginBottom:8}}>This Week Menu</div>
            {Array.isArray(basics.messMenu) && basics.messMenu.length ? (
              <ul style={{margin:0,paddingLeft:18, color:'#cbd5e1'}}>
                {basics.messMenu.map((item,idx)=> (
                  <li key={idx}>{item.day ? `${item.day}: `: ''}{item.menu || (typeof item === 'string' ? item : '')}</li>
                ))}
              </ul>
            ) : (
              <div style={{color:'#94a3b8'}}>No menu available.</div>
            )}
          </Card>

          <Card>
            <div style={{color:'#fff',fontWeight:700, marginBottom:8}}>Rules & Guidelines</div>
            {basics.rules && Object.keys(basics.rules).length ? (
              <ul style={{margin:0,paddingLeft:18, color:'#cbd5e1'}}>
                {Object.entries(basics.rules).map(([k,v])=> (
                  <li key={k}><strong style={{color:'#e2e8f0'}}>{k}:</strong> {String(v)}</li>
                ))}
              </ul>
            ) : (
              <div style={{color:'#94a3b8'}}>No specific rules configured.</div>
            )}
          </Card>
        </>
      )}
    </Wrap>
  )
}
