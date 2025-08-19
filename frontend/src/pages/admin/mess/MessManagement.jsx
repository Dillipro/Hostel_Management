import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AdminAPI } from '../../../utils/api'
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

const Wrap = styled.div`display:grid; gap:16px;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px;`
const Row = styled.div`display:flex; gap:12px; align-items:center; flex-wrap:wrap;`
const Input = styled.input`padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.04); color:#fff;`
const Btn = styled.button`padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.2); background:${p=>p.primary?'rgba(59,130,246,.25)':'rgba(255,255,255,.06)'}; color:#fff; cursor:pointer; display:inline-flex; gap:8px; align-items:center;`
const Table = styled.table`width:100%; border-collapse:collapse; color:#e2e8f0;`
const Th = styled.th`text-align:left; padding:10px; border-bottom:1px solid rgba(255,255,255,.1); color:#94a3b8;`
const Td = styled.td`padding:10px; border-bottom:1px solid rgba(255,255,255,.06);`

export default function MessManagement(){
  const [list, setList] = useState([])
  const [form, setForm] = useState({ name:'', code:'', capacity: 300, timings: '7-9,12-14,19-21' })
  const [editing, setEditing] = useState(null)

  async function load(){
    const r = await AdminAPI.mess.list()
    setList(r.data?.data || [])
  }
  useEffect(()=>{ load() },[])

  async function create(){
    const payload = { name: form.name, code: form.code, capacity: Number(form.capacity)||0, timings: String(form.timings) }
    await AdminAPI.mess.create(payload)
    setForm({ name:'', code:'', capacity: 300, timings: '7-9,12-14,19-21' })
    load()
  }
  async function update(m){
    const payload = { ...m }
    await AdminAPI.mess.update(m._id, payload)
    setEditing(null)
    load()
  }
  async function remove(id){
    await AdminAPI.mess.remove(id)
    load()
  }

  return (
    <Wrap>
      <Card>
        <h3 style={{marginTop:0,color:'#fff'}}>Create Mess</h3>
        <Row>
          <Input placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
          <Input placeholder="Code" value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value.toUpperCase()}))} />
          <Input placeholder="Capacity" type="number" value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))} />
          <Input placeholder="Timings" value={form.timings} onChange={e=>setForm(f=>({...f,timings:e.target.value}))} />
          <Btn primary onClick={create}><PlusIcon width={16}/>Create</Btn>
        </Row>
      </Card>

      <Card>
        <h3 style={{marginTop:0,color:'#fff'}}>All Mess</h3>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th><Th>Code</Th><Th>Capacity</Th><Th>Timings</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {list.map(m => (
              <tr key={m._id}>
                <Td>{editing===m._id ? <Input value={m.name} onChange={e=>setList(l=>l.map(x=>x._id===m._id?{...x,name:e.target.value}:x))} /> : m.name}</Td>
                <Td>{editing===m._id ? <Input value={m.code} onChange={e=>setList(l=>l.map(x=>x._id===m._id?{...x,code:e.target.value.toUpperCase()}:x))} /> : m.code}</Td>
                <Td>{editing===m._id ? <Input type="number" value={m.capacity||0} onChange={e=>setList(l=>l.map(x=>x._id===m._id?{...x,capacity:Number(e.target.value)||0}:x))} /> : (m.capacity||'-')}</Td>
                <Td>{editing===m._id ? <Input value={m.timings||''} onChange={e=>setList(l=>l.map(x=>x._id===m._id?{...x,timings:e.target.value}:x))} /> : (m.timings||'-')}</Td>
                <Td>
                  {editing===m._id ? (
                    <Row>
                      <Btn onClick={()=>update(list.find(x=>x._id===m._id))}>Save</Btn>
                      <Btn onClick={()=>setEditing(null)}>Cancel</Btn>
                    </Row>
                  ) : (
                    <Row>
                      <Btn onClick={()=>setEditing(m._id)}><PencilSquareIcon width={16}/>Edit</Btn>
                      <Btn onClick={()=>remove(m._id)}><TrashIcon width={16}/>Delete</Btn>
                    </Row>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Wrap>
  )
}
