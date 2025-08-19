import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { AdminAPI } from '../../../utils/api'
import { UserGroupIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const Wrap = styled.div`display:grid; gap:12px;`
const Row = styled.div`display:flex; gap:10px; align-items:center; flex-wrap:wrap;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:14px;`
const Label = styled.label`display:grid; gap:6px; color:#cbd5e1; font-size:14px;`
const Input = styled.input`background:transparent; border:1px solid rgba(255,255,255,.15); padding:10px 12px; border-radius:10px; color:#fff;`
const Select = styled.select`background:transparent; border:1px solid rgba(255,255,255,.15); padding:10px 12px; border-radius:10px; color:#fff;`

export default function WardenAssign(){
  const { hostelId } = useParams()
  const [form, setForm] = useState({ level:'hostel', wardenId:'', isPrimary:false })
  const [msg, setMsg] = useState('')

  async function assign(){
    setMsg('')
    try{ const r = await AdminAPI.warden.assign({ level: 'hostel', levelId: hostelId, wardenId: form.wardenId, isPrimary: form.isPrimary })
      setMsg('Assigned successfully')
    }catch(e){ setMsg('Assignment failed') }
  }

  return (
    <Wrap>
      <a href={`/admin/hostels/${hostelId}`} style={{color:'#9ca3af', display:'inline-flex', alignItems:'center', gap:6}}><ArrowLeftIcon width={16}/>Back</a>
      <Row>
        <UserGroupIcon width={24} height={24} color="#c7d2fe"/>
        <h3 style={{margin:0,color:'#fff'}}>Assign Warden</h3>
      </Row>
      <Card>
        <div style={{display:'grid', gap:12, maxWidth:520}}>
          <Label>
            Warden User ID
            <Input placeholder="enter user _id or staff id" value={form.wardenId} onChange={e=>setForm(f=>({...f, wardenId:e.target.value}))} />
          </Label>
          <Label>
            Primary Warden?
            <Select value={form.isPrimary ? 'yes' : 'no'} onChange={e=>setForm(f=>({...f, isPrimary: e.target.value==='yes'}))}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </Label>
          <div style={{display:'flex', gap:8}}>
            <button onClick={assign} style={{padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(99,102,241,.2)', color:'#fff', cursor:'pointer'}}>Assign</button>
          </div>
          {msg && <div style={{display:'flex',alignItems:'center',gap:8,color:'#86efac'}}><CheckCircleIcon width={18}/>{msg}</div>}
        </div>
      </Card>
    </Wrap>
  )
}
