import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { PaymentsAPI } from '../../../utils/api'
import { CurrencyRupeeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const Wrap = styled.div`display:grid; gap:12px;`
const Table = styled.table`width:100%; border-collapse: collapse; color:#e5e7eb;`
const Th = styled.th`text-align:left; padding:10px; border-bottom:1px solid rgba(255,255,255,.1);`
const Td = styled.td`padding:10px; border-bottom:1px solid rgba(255,255,255,.06); font-size:14px; color:#cbd5e1;`

export default function PaymentsAdmin(){
  const [rows,setRows] = useState([])
  const [loading,setLoading] = useState(false)
  async function load(){
    setLoading(true)
    try{ const r = await PaymentsAPI.admin.listAll({ limit:50 }); setRows(r.data?.data || []) }catch(e){}
    setLoading(false)
  }
  useEffect(()=>{ load() },[])
  return (
    <Wrap>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <CurrencyRupeeIcon width={22} height={22} color="#c7d2fe"/>
        <h3 style={{margin:0,color:'#fff'}}>Payment Management</h3>
        {loading && <ArrowPathIcon className="spin" width={16} height={16}/>} 
      </div>
      <div style={{overflow:auto}}>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Student</Th>
              <Th>Type</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p._id}>
                <Td>{p._id.slice(-6)}</Td>
                <Td>{p.student?.name || p.studentName}</Td>
                <Td>{p.feeType}</Td>
                <Td>₹{p.amount}</Td>
                <Td>{p.status}</Td>
                <Td>{new Date(p.createdAt || p.date).toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Wrap>
  )
}
