import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AdminAPI } from '../../../utils/api'
import { MagnifyingGlassIcon, PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

const Wrap = styled.div`display:grid; gap:16px;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px;`
const Row = styled.div`display:flex; gap:12px; align-items:center; flex-wrap:wrap;`
const Input = styled.input`padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.04); color:#fff;`
const Select = styled.select`padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.04); color:#fff;`
const Btn = styled.button`padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.2); background:${p=>p.primary?'rgba(59,130,246,.25)':'rgba(255,255,255,.06)'}; color:#fff; cursor:pointer; display:inline-flex; gap:8px; align-items:center;`
const Table = styled.table`width:100%; border-collapse:collapse; color:#e2e8f0;`
const Th = styled.th`text-align:left; padding:10px; border-bottom:1px solid rgba(255,255,255,.1); color:#94a3b8;`
const Td = styled.td`padding:10px; border-bottom:1px solid rgba(255,255,255,.06);`

export default function RoomsManagement(){
  const [q, setQ] = useState({ blockId:'', status:'', capacity:'', available:'', page:1, limit:20 })
  const [data, setData] = useState({ rooms:[], pagination:{} })
  const [creating, setCreating] = useState({ blockId:'', roomNumber:'', floorNumber:1, capacity:3, roomType:'triple' })
  const [editingId, setEditingId] = useState(null)

  async function load(){
    const r = await AdminAPI.rooms.list(q)
    setData(r.data?.data || { rooms:[], pagination:{} })
  }
  useEffect(()=>{ load() },[])

  async function search(){ await load() }

  async function create(){
    await AdminAPI.rooms.create(creating)
    setCreating({ blockId:'', roomNumber:'', floorNumber:1, capacity:3, roomType:'triple' })
    load()
  }

  async function save(room){ await AdminAPI.rooms.update(room._id, room); setEditingId(null); load() }
  async function remove(id){ await AdminAPI.rooms.remove(id); load() }

  return (
    <Wrap>
      <Card>
        <h3 style={{marginTop:0,color:'#fff'}}>Search Rooms</h3>
        <Row>
          <Input placeholder="Block ID" value={q.blockId} onChange={e=>setQ(s=>({...s,blockId:e.target.value}))} />
          <Select value={q.status} onChange={e=>setQ(s=>({...s,status:e.target.value}))}>
            <option value="">Status</option>
            <option value="available">available</option>
            <option value="occupied">occupied</option>
            <option value="maintenance">maintenance</option>
            <option value="reserved">reserved</option>
            <option value="blocked">blocked</option>
          </Select>
          <Input placeholder="Capacity" type="number" value={q.capacity} onChange={e=>setQ(s=>({...s,capacity:e.target.value}))} />
          <Select value={q.available} onChange={e=>setQ(s=>({...s,available:e.target.value}))}>
            <option value="">Available?</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </Select>
          <Btn onClick={search}><MagnifyingGlassIcon width={16}/>Search</Btn>
        </Row>
      </Card>

      <Card>
        <h3 style={{marginTop:0,color:'#fff'}}>Create Room</h3>
        <Row>
          <Input placeholder="Block ID" value={creating.blockId} onChange={e=>setCreating(s=>({...s,blockId:e.target.value}))} />
          <Input placeholder="Room Number" value={creating.roomNumber} onChange={e=>setCreating(s=>({...s,roomNumber:e.target.value}))} />
          <Input placeholder="Floor" type="number" value={creating.floorNumber} onChange={e=>setCreating(s=>({...s,floorNumber:Number(e.target.value)||1}))} />
          <Input placeholder="Capacity" type="number" value={creating.capacity} onChange={e=>setCreating(s=>({...s,capacity:Number(e.target.value)||1}))} />
          <Select value={creating.roomType} onChange={e=>setCreating(s=>({...s,roomType:e.target.value}))}>
            <option value="single">single</option>
            <option value="double">double</option>
            <option value="triple">triple</option>
            <option value="quad">quad</option>
          </Select>
          <Btn primary onClick={create}><PlusIcon width={16}/>Create</Btn>
        </Row>
      </Card>

      <Card>
        <h3 style={{marginTop:0,color:'#fff'}}>Rooms</h3>
        <Table>
          <thead>
            <tr>
              <Th>Room</Th><Th>Block</Th><Th>Floor</Th><Th>Cap</Th><Th>Occ</Th><Th>Type</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {(data.rooms||[]).map(r => (
              <tr key={r._id}>
                <Td>{editingId===r._id ? <Input value={r.roomNumber} onChange={e=>setData(d=>({ ...d, rooms: d.rooms.map(x=>x._id===r._id?{...x,roomNumber:e.target.value}:x) }))} /> : r.roomNumber}</Td>
                <Td>{r.blockId?.name || r.blockId}</Td>
                <Td>{editingId===r._id ? <Input type="number" value={r.floorNumber} onChange={e=>setData(d=>({ ...d, rooms: d.rooms.map(x=>x._id===r._id?{...x,floorNumber:Number(e.target.value)||1}:x) }))} /> : r.floorNumber}</Td>
                <Td>{editingId===r._id ? <Input type="number" value={r.capacity} onChange={e=>setData(d=>({ ...d, rooms: d.rooms.map(x=>x._id===r._id?{...x,capacity:Number(e.target.value)||1}:x) }))} /> : r.capacity}</Td>
                <Td>{r.currentOccupancy}</Td>
                <Td>{editingId===r._id ? (
                  <Select value={r.roomType} onChange={e=>setData(d=>({ ...d, rooms: d.rooms.map(x=>x._id===r._id?{...x,roomType:e.target.value}:x) }))}>
                    <option value="single">single</option>
                    <option value="double">double</option>
                    <option value="triple">triple</option>
                    <option value="quad">quad</option>
                  </Select>
                ) : r.roomType}</Td>
                <Td>{editingId===r._id ? (
                  <Select value={r.status} onChange={e=>setData(d=>({ ...d, rooms: d.rooms.map(x=>x._id===r._id?{...x,status:e.target.value}:x) }))}>
                    <option value="available">available</option>
                    <option value="occupied">occupied</option>
                    <option value="maintenance">maintenance</option>
                    <option value="reserved">reserved</option>
                    <option value="blocked">blocked</option>
                  </Select>
                ) : r.status}</Td>
                <Td>
                  {editingId===r._id ? (
                    <Row>
                      <Btn onClick={()=>save(data.rooms.find(x=>x._id===r._id))}>Save</Btn>
                      <Btn onClick={()=>setEditingId(null)}>Cancel</Btn>
                    </Row>
                  ) : (
                    <Row>
                      <Btn onClick={()=>setEditingId(r._id)}><PencilSquareIcon width={16}/>Edit</Btn>
                      <Btn onClick={()=>remove(r._id)}><TrashIcon width={16}/>Delete</Btn>
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
