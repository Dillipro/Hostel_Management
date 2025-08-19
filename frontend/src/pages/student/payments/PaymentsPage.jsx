import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { CreditCardIcon, ArrowPathIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { PaymentsAPI, StudentFeesAPI } from '../../../utils/api'
import { useAuthStore } from '../../../stores/useAuthStore'

const Wrap = styled.div` padding: 20px; `
const Card = styled(motion.div)` border:1px solid rgba(100,116,139,.35); border-radius: 16px; padding: 18px; background: rgba(15,23,42,.5); `

export default function PaymentsPage(){
  const { user } = useAuthStore()
  const [fees, setFees] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [paying, setPaying] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try{
      const [feesRes, histRes] = await Promise.all([
        StudentFeesAPI.getSummary(),
        PaymentsAPI.history({ limit: 10 })
      ])
      setFees(feesRes.data?.data || null)
      setHistory(histRes.data?.data?.payments || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ refresh() },[])

  const dues = useMemo(()=>{
    if (!fees) return []
    const f = fees.currentFees || {}
    const out = []
    if (!f.hostelFee?.paid && (f.hostelFee?.amount || 0) > 0) out.push({ key: 'hostel_fee', type: 'Hostel Fee', amount: f.hostelFee.amount })
    if (!f.messFee?.paid && (f.messFee?.amount || 0) > 0) out.push({ key: 'mess_fee', type: 'Mess Fee', amount: f.messFee.amount })
    return out
  }, [fees])

  const openRazorpay = ({ order, studentInfo, feeType, amount }) => new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      // lazy-load checkout script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => openRazorpay({ order, studentInfo, feeType, amount }).then(resolve).catch(reject)
      script.onerror = () => reject(new Error('Failed to load Razorpay'))
      document.body.appendChild(script)
      return
    }
    const options = {
      key: order.razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'CEG Hostel Management',
      description: `${feeType.replace('_',' ').toUpperCase()} Payment`,
      order_id: order.orderId,
      prefill: {
        name: studentInfo?.name,
        email: studentInfo?.email,
        contact: studentInfo?.phone,
      },
      theme: { color: '#3b82f6' },
      handler: async function (response) {
        resolve(response)
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled'))
      }
    }
    const rz = new window.Razorpay(options)
    rz.open()
  })

  const onPay = async (feeType, amount) => {
    setPaying(true)
    try{
      // 1) create order
      const { data } = await PaymentsAPI.createOrder({ feeType, amount })
      if (!data?.success) throw new Error(data?.message || 'Failed to create order')
      const order = data.data
      // 2) open checkout
      const res = await openRazorpay({ order, studentInfo: order.studentInfo, feeType, amount })
      // 3) verify
      const verify = await PaymentsAPI.verifyPayment({
        razorpay_order_id: res.razorpay_order_id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature,
        feeType,
        amount,
      })
      if (!verify.data?.success) throw new Error(verify.data?.message || 'Verification failed')
      await refresh()
      // Optional: open receipt PDF
      try{
        const paymentId = verify.data?.data?.paymentId || res.razorpay_payment_id
        const blobRes = await PaymentsAPI.receiptPdf(paymentId)
        const blob = new Blob([blobRes.data], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        setTimeout(()=>URL.revokeObjectURL(url), 10000)
      }catch{ /* ignore */ }
    }catch(err){
      // You can show a toast here if desired
      console.error(err)
    }finally{
      setPaying(false)
    }
  }

  return (
    <Wrap>
      <Card initial={{ opacity:0, y: 12 }} animate={{ opacity:1, y:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
          <h2 style={{ color:'#fff', fontWeight:900 }}>Payments</h2>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={refresh} disabled={loading} style={{ border:'1px solid rgba(100,116,139,.35)', borderRadius:10, padding:'8px 12px', color:'#cbd5e1', background:'transparent', opacity: loading? .6: 1 }}>
            <ArrowPathIcon style={{ width:18, height:18, display:'inline-block', verticalAlign:'middle', marginRight: 6 }} /> Refresh
          </motion.button>
        </div>
        <div style={{ display:'grid', gap: 16 }}>
          <section>
            <h3 style={{ color:'#cbd5e1', margin:'0 0 8px' }}>Pending Dues</h3>
            <div style={{ display:'grid', gap:10 }}>
              {dues.length === 0 && <div style={{ color:'#94a3b8' }}>No pending dues.</div>}
              {dues.map((d,i)=> (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:12, border:'1px solid rgba(100,116,139,.3)', background:'rgba(2,6,23,.35)' }}>
                  <span style={{ color:'#cbd5e1', fontWeight:700 }}>{d.type}</span>
                  <span style={{ color:'#86efac', fontWeight:900 }}>₹ {d.amount}</span>
                  <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} disabled={paying} onClick={()=>onPay(d.key, d.amount)} style={{ border:'none', borderRadius:10, padding:'8px 12px', color:'#0b1220', background:'linear-gradient(135deg, #22d3ee, #3b82f6)', fontWeight:800, opacity: paying? .7: 1 }}>
                    <CreditCardIcon style={{ width:18, height:18, display:'inline-block', verticalAlign:'middle', marginRight: 6 }} /> {paying? 'Processing...': 'Pay'}
                  </motion.button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 style={{ color:'#cbd5e1', margin:'8px 0' }}>Recent Payments</h3>
            <div style={{ display:'grid', gap:10 }}>
              {history.length === 0 && <div style={{ color:'#94a3b8' }}>No payments yet.</div>}
              {history.map((r,i)=> (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:12, border:'1px solid rgba(100,116,139,.3)', background:'rgba(2,6,23,.35)' }}>
                  <span style={{ color:'#cbd5e1', fontWeight:700 }}>{(r.feeType || '').replace('_',' ').toUpperCase()}</span>
                  <span style={{ color: r.status==='success' ? '#86efac' : '#fda4af', fontWeight:900 }}>₹ {r.amount}</span>
                  <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                    <span style={{ color:'#38bdf8', fontWeight:700, fontSize:12 }}>{r.paidAt ? new Date(r.paidAt).toLocaleString() : '-'}</span>
                    <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={async ()=>{
                      try{
                        const blobRes = await PaymentsAPI.receiptPdf(r.paymentId)
                        const blob = new Blob([blobRes.data], { type: 'application/pdf' })
                        const url = URL.createObjectURL(blob)
                        window.open(url, '_blank')
                        setTimeout(()=>URL.revokeObjectURL(url), 10000)
                      }catch{}
                    }} style={{ border:'1px solid rgba(100,116,139,.35)', borderRadius:10, padding:'6px 10px', color:'#cbd5e1', background:'transparent' }}>
                      <DocumentTextIcon style={{ width:16, height:16, display:'inline-block', verticalAlign:'middle', marginRight: 6 }} /> Receipt
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Card>
    </Wrap>
  )
}
