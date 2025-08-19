import React, { useState } from 'react'
import styled from 'styled-components'
import { PlayCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { AdminAPI } from '../../../utils/api'

const Wrap = styled.div`display:grid; gap:12px;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px;`
const Row = styled.div`display:flex; gap:12px; align-items:center; flex-wrap:wrap;`
const Input = styled.input`padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,.15); background:rgba(255,255,255,.04); color:#fff;`

export default function AllocationsPage(){
  const [hostelId, setHostelId] = useState('')
  const [dryRun, setDryRun] = useState(true)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  async function runAlloc(commit=false){
    setLoading(true)
    try{
      const r = await AdminAPI.allocation.autoAllocate({ hostelId, allocationBatch: 'admission', dryRun: !commit })
      setResults(r.data)
    } finally { setLoading(false) }
  }

  function exportCsv(){
    if(!results?.allocations?.length) return
    const rows = [['studentId','roomId','blockId','bedNumber','priorityScore','roomScore']]
    for(const a of results.allocations){ rows.push([a.studentId, a.roomId, a.blockId, a.bedNumber, a.priorityScore, a.roomScore]) }
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv],{type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'allocations.csv'; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <Wrap>
      <h3 style={{margin:0,color:'#fff'}}>Room Allocation</h3>
      <Card>
        <Row>
          <Input placeholder="Hostel ID" value={hostelId} onChange={e=>setHostelId(e.target.value)} />
          <button disabled={loading || !hostelId} onClick={()=>runAlloc(false)} style={{padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(99,102,241,.2)', color:'#fff'}}><PlayCircleIcon width={18}/>Dry Run</button>
          <button disabled={loading || !hostelId} onClick={()=>runAlloc(true)} style={{padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(34,197,94,.2)', color:'#fff'}}><PlayCircleIcon width={18}/>Commit</button>
          <button disabled={!results?.allocations?.length} onClick={exportCsv} style={{padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.06)', color:'#fff'}}><DocumentArrowDownIcon width={18}/>Export</button>
        </Row>
      </Card>
      {results && (
        <Card>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:12}}>
            <Stat label="Processed" value={results?.data?.processed} />
            <Stat label="Allocated" value={results?.data?.allocated} />
            <Stat label="Waitlisted" value={results?.data?.waitlisted} />
            <Stat label="Dry Run" value={String(results?.data?.dryRun)} />
          </div>
        </Card>
      )}
    </Wrap>
  )
}

const StatWrap = styled.div`padding:12px; border:1px solid rgba(255,255,255,.1); border-radius:12px;`
function Stat({ label, value }){
  return (
    <StatWrap>
      <div style={{color:'#94a3b8', fontSize:12}}>{label}</div>
      <div style={{color:'#fff', fontWeight:800, fontSize:18}}>{value ?? '-'}</div>
    </StatWrap>
  )
}
