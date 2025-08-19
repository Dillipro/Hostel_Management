import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { AdminAPI } from '../../../utils/api'
import { 
  BuildingOfficeIcon, MagnifyingGlassIcon, PlusIcon, ArrowPathIcon, UserGroupIcon, InboxArrowDownIcon, ClipboardDocumentListIcon, PlayCircleIcon, DocumentArrowDownIcon
} from '@heroicons/react/24/outline'

const Page = styled.div`
  display: grid;
  gap: 16px;
`
const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
`
const Title = styled.h2`
  margin: 0; font-size: 22px; font-weight: 800; color: #fff;
`
const Actions = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap;
  button { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); color:#fff; cursor:pointer }
  button:hover { background:rgba(255,255,255,.1) }
`
const Toolbar = styled.div`
  display:flex; gap:12px; align-items:center; background:rgba(255,255,255,.06); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,.1)
  input { flex:1; background:transparent; border:none; color:#fff; outline:none }
`
const Grid = styled.div`
  display:grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap:12px;
`
const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.03));
  border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px; color:#e5e7eb;
`
const Badge = styled.span`
  padding:4px 8px; border-radius:999px; background:rgba(99,102,241,.15); color:#c7d2fe; font-size:12px; font-weight:700;
`
const Small = styled.div`
  font-size:12px; color:#94a3b8
`

export default function HostelsManagement(){
  const [loading, setLoading] = useState(false)
  const [hostels, setHostels] = useState([])
  const [q, setQ] = useState('')

  async function load(){
    setLoading(true)
    try{ const r = await AdminAPI.hostels.list(); setHostels(r.data?.data || []) }catch(e){}
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const filtered = useMemo(()=> hostels.filter(h => !q || h.name?.toLowerCase().includes(q.toLowerCase()) || h.code?.toLowerCase().includes(q.toLowerCase())), [hostels,q])

  async function onAutoAllocate(hostel){
    try{
      const r = await AdminAPI.allocation.autoAllocate({ hostelId: hostel._id, allocationBatch:'admission', dryRun: true })
      alert(`Dry run: processed ${r.data?.data?.processed || 0}, allocated ${r.data?.data?.allocated || 0}, waitlist ${r.data?.data?.waitlisted || 0}`)
    }catch(e){ alert('Auto-allocation failed') }
  }
  async function onCommitAllocate(hostel){
    if(!confirm('Proceed to commit allocation?')) return
    try{
      const r = await AdminAPI.allocation.autoAllocate({ hostelId: hostel._id, allocationBatch:'admission', dryRun: false })
      alert(`Committed: allocated ${r.data?.data?.allocated || 0}`)
    }catch(e){ alert('Commit failed') }
  }

  async function onImportCsv(){
    const el = document.createElement('input'); el.type='file'; el.accept='.csv'; el.onchange = async () => {
      const file = el.files?.[0]; if(!file) return
      try{ await AdminAPI.students.importCsv(file); alert('Import started/finished'); load() }catch(e){ alert('Import failed') }
    }; el.click()
  }
  async function onDownloadTemplate(){
    try{
      const r = await AdminAPI.students.templateCsv();
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a'); a.href = url; a.download = 'student-import-template.csv'; a.click(); URL.revokeObjectURL(url);
    }catch(e){ alert('Download failed') }
  }

  return (
    <Page>
      <Header>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <BuildingOfficeIcon width={26} height={26} color="#93c5fd" />
          <Title>Hostels & Blocks</Title>
          {loading && <ArrowPathIcon className="spin" width={18} height={18} />}
        </div>
        <Actions>
          <button onClick={load}><ArrowPathIcon width={18} height={18}/>Refresh</button>
          <button onClick={onImportCsv}><InboxArrowDownIcon width={18} height={18}/>Import CSV</button>
          <button onClick={onDownloadTemplate}><DocumentArrowDownIcon width={18} height={18}/>Template</button>
        </Actions>
      </Header>

      <Toolbar>
        <MagnifyingGlassIcon width={18} height={18} color="#9ca3af"/>
        <input placeholder="Search hostels by name or code" value={q} onChange={e=>setQ(e.target.value)} />
      </Toolbar>

      <Grid>
        {filtered.map(h => (
          <Card key={h._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:40,height:40,borderRadius:12,display:'grid',placeItems:'center',background:'rgba(59,130,246,.15)',border:'1px solid rgba(59,130,246,.3)'}}>
                  <BuildingOfficeIcon width={22} height={22} color="#93c5fd"/>
                </div>
                <div>
                  <div style={{fontWeight:900,color:'#fff'}}>{h.name} <Small>({h.code})</Small></div>
                  <Small>{h.blocks} blocks • {h.totalRooms} rooms • Occupancy {h.occupancyRate}%</Small>
                </div>
              </div>
              <Badge>{h.gender || 'Mixed'}</Badge>
            </div>

            <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
              <button onClick={()=>onAutoAllocate(h)}><PlayCircleIcon width={18} height={18}/>Auto-Allocate (dry run)</button>
              <button onClick={()=>onCommitAllocate(h)}><PlayCircleIcon width={18} height={18}/>Commit Allocation</button>
              <a href={`/admin/hostels/${h._id}`} style={{textDecoration:'none'}}>
                <button><ClipboardDocumentListIcon width={18} height={18}/>View Blocks</button>
              </a>
              <a href={`/admin/hostels/${h._id}/wardens`} style={{textDecoration:'none'}}>
                <button><UserGroupIcon width={18} height={18}/>Assign Wardens</button>
              </a>
            </div>
          </Card>
        ))}
      </Grid>
    </Page>
  )
}
