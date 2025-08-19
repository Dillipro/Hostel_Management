import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'
import { AdminAPI } from '../../../utils/api'
import { BuildingOffice2Icon, ArrowLeftIcon } from '@heroicons/react/24/outline'

const Wrap = styled.div`display:grid; gap:12px;`
const Title = styled.h3`margin:0; color:#fff;`
const Grid = styled.div`display:grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap:12px;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:14px; padding:14px;`

export default function BlocksView(){
  const { hostelId } = useParams()
  const [blocks, setBlocks] = useState([])
  useEffect(()=>{ (async()=>{ try{ const r = await AdminAPI.hostels.blocks(hostelId); setBlocks(r.data?.data || []) }catch(e){} })() },[hostelId])
  return (
    <Wrap>
      <a href="/admin/hostels" style={{color:'#9ca3af', display:'inline-flex', alignItems:'center', gap:6}}><ArrowLeftIcon width={16}/>Back</a>
      <Title>Blocks</Title>
      <Grid>
        {blocks.map(b => (
          <Card key={b._id}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:36,height:36,borderRadius:10,display:'grid',placeItems:'center',background:'rgba(99,102,241,.15)',border:'1px solid rgba(99,102,241,.3)'}}>
                <BuildingOffice2Icon width={20} height={20} color="#c7d2fe"/>
              </div>
              <div>
                <div style={{color:'#fff',fontWeight:800}}>{b.name} <span style={{color:'#94a3b8'}}>({b.code})</span></div>
                <div style={{color:'#94a3b8',fontSize:12}}>Rooms {b.roomStats?.totalRooms} • Occupancy {b.roomStats?.occupancyRate}%</div>
              </div>
            </div>
          </Card>
        ))}
      </Grid>
    </Wrap>
  )
}
