import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { StudentPortalAPI } from '../../../utils/api'
import { QrCodeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

const Wrap = styled.div`display:grid; gap:12px;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px; display:grid; gap:10px; max-width:360px;`

export default function StudentIdCard(){
  const [data,setData] = useState(null)
  useEffect(()=>{ (async()=>{ try{ const r = await StudentPortalAPI.idQr(); setData(r.data?.data) }catch(e){} })() },[])
  function download(){ if(!data?.qrPng) return; const a = document.createElement('a'); a.href=data.qrPng; a.download=`${data.regNo}-hostel-id.png`; a.click() }
  return (
    <Wrap>
      <h3 style={{margin:0,color:'#fff'}}>My ID with QR</h3>
      <p style={{color:'#94a3b8'}}>Show this at the gate or mess. You can also download it.</p>
      <Card>
        {data ? (
          <>
            <div style={{color:'#fff',fontWeight:900}}>{data.name}</div>
            <div style={{color:'#94a3b8',fontSize:12}}>{data.regNo}</div>
            <img src={data.qrPng} alt="Hostel QR" style={{width:256,height:256,background:'#fff',borderRadius:8}}/>
            <button onClick={download} style={{padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.06)', color:'#fff', display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer'}}>
              <ArrowDownTrayIcon width={18}/> Download
            </button>
          </>
        ) : (
          <div style={{color:'#94a3b8'}}>Loading...</div>
        )}
      </Card>
    </Wrap>
  )
}
