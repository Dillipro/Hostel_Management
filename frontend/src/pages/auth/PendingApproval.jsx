import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ClockIcon, XCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../stores/useAuthStore'
import axios from 'axios'

const Shell = styled.div`
  min-height: 100vh; display:grid; place-items:center;
  background: radial-gradient(1200px 600px at 10% -10%, rgba(59,130,246,0.08), transparent 40%),
              radial-gradient(1200px 600px at 90% 10%, rgba(16,185,129,0.08), transparent 40%),
              linear-gradient(135deg, #0f172a 0%, #111827 40%, #0b1220 100%);
`
const Card = styled(motion.div)`
  width: 100%; max-width: 680px; border-radius: 24px; padding: 28px;
  border: 1px solid rgba(100,116,139,0.35); background: rgba(15,23,42,0.55);
  backdrop-filter: blur(16px); box-shadow: 0 24px 60px rgba(0,0,0,0.45);
`
const Title = styled.h1` margin: 0 0 8px; color:#fff; font-weight: 900; font-size: 28px; `
const Sub = styled.p` margin: 0 0 16px; color:#cbd5e1; `
const Badge = styled.span`
  display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px;
  font-size:12px; font-weight:800;
  ${({status}) => status==='approved' && 'background: rgba(34,197,94,0.18); color:#86efac;'}
  ${({status}) => status==='pending' && 'background: rgba(59,130,246,0.18); color:#93c5fd;'}
  ${({status}) => status==='rejected' && 'background: rgba(239,68,68,0.18); color:#fca5a5;'}
`
const Row = styled.div` display:flex; align-items:center; gap: 12px; margin-top: 12px; color:#94a3b8; `
const Actions = styled.div` display:flex; gap: 12px; margin-top: 20px; `
const Button = styled(motion.button)`
  border-radius: 12px; padding: 10px 14px; font-weight: 800; font-size: 14px; display:inline-flex; align-items:center; gap:8px;
  color:#0b1220; background: linear-gradient(135deg, #60a5fa, #22d3ee);
  border: none; cursor: pointer;
  &:disabled { opacity:.6; cursor: not-allowed; }
`
const Ghost = styled(Button)`
  color:#cbd5e1; background: transparent; border:1px solid rgba(100,116,139,0.35);
`

export default function PendingApproval(){
  const { user, logout } = useAuthStore()
  const [status, setStatus] = useState(() => (user?.approvalStatus || user?.status || user?.accountStatus || 'pending').toString().toLowerCase())
  const [loading, setLoading] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/auth/profile')
      const fresh = (res.data?.data?.user?.approvalStatus || res.data?.data?.user?.status || res.data?.data?.user?.accountStatus || 'pending').toString().toLowerCase()
      setStatus(fresh)
    } catch (e) {
      // no-op
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    // poll occasionally to auto-refresh status
    const id = setInterval(fetchStatus, 15000)
    return ()=> clearInterval(id)
  },[])

  return (
    <Shell>
      <Card initial={{ opacity:0, y: 20 }} animate={{ opacity:1, y:0 }}>
        <Title>Account Review in Progress</Title>
        <Sub>Thanks for registering. Your student account needs admin approval before full access is granted.</Sub>
        <Badge status={status}>
          {status === 'approved' && <CheckCircleIcon style={{ width:16, height:16 }} />}
          {status === 'pending' && <ClockIcon style={{ width:16, height:16 }} />}
          {status === 'rejected' && <XCircleIcon style={{ width:16, height:16 }} />}
          Status: {status}
        </Badge>

        <Row>
          <span>• You can still update profile details in the meantime.</span>
        </Row>
        <Row>
          <span>• Once approved, you’ll be auto-redirected to your dashboard on next login.</span>
        </Row>

        <Actions>
          <Button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={loading} onClick={fetchStatus}>
            <ClockIcon style={{ width:18, height:18 }} /> Refresh Status
          </Button>
          <Ghost whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => logout()}>
            <ArrowRightOnRectangleIcon style={{ width:18, height:18 }} /> Logout
          </Ghost>
        </Actions>
      </Card>
    </Shell>
  )
}
