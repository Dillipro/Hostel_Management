import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AdminAPI } from '../../../utils/api'

const Wrap = styled.div`display:grid; gap:16px;`
const Card = styled.div`background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px;`

export default function OccupancyDashboard(){
  const [data, setData] = useState([])
  const [vacancies, setVacancies] = useState([])

  useEffect(()=>{
    (async()=>{
      const [occ, vac] = await Promise.all([
        AdminAPI.reports.occupancy(),
        AdminAPI.reports.vacancies(),
      ])
      setData(occ.data?.data || [])
      setVacancies(vac.data?.data || [])
    })()
  },[])

  return (
    <Wrap>
      <Card>
        <h3 style={{marginTop:0,color:'#fff'}}>Occupancy Overview</h3>
        <p style={{color:'#94a3b8'}}>Total rooms: {data.length}</p>
      </Card>
      <Card>
        <h3 style={{marginTop:0,color:'#fff'}}>Vacancies</h3>
        <p style={{color:'#94a3b8'}}>Available rooms: {vacancies.length}</p>
      </Card>
    </Wrap>
  )
}
