import React, { useState } from 'react'
import styled from 'styled-components'
import { ReportsAPI } from '../../../utils/api'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

const Wrap = styled.div`display:grid; gap:12px;`

export default function ReportsPage(){
  const [range,setRange] = useState({ days: 7 })
  async function downloadForecast(){ try{ const r = await ReportsAPI.messForecastPdf({ days: range.days }); const url = URL.createObjectURL(r.data); const a = document.createElement('a'); a.href=url; a.download='mess-forecast.pdf'; a.click(); URL.revokeObjectURL(url) }catch(e){} }
  return (
    <Wrap>
      <h3 style={{margin:0,color:'#fff'}}>Reports & Analytics</h3>
      <p style={{color:'#94a3b8'}}>Download allocation lists, mess forecasts, warden allocation, and more.</p>
      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <input type="number" min={1} max={30} value={range.days} onChange={e=>setRange({days:Number(e.target.value)||7})} style={{width:90, background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,.2)', borderRadius:8, padding:'8px 10px'}} />
        <button onClick={downloadForecast} style={{padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,.2)', background:'rgba(255,255,255,.06)', color:'#fff', display:'inline-flex', alignItems:'center', gap:8, cursor:'pointer'}}>
          <DocumentArrowDownIcon width={18}/> Mess Forecast (PDF)
        </button>
      </div>
    </Wrap>
  )
}
