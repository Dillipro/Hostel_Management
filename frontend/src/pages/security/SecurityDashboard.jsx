import React from 'react'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import {
  ShieldCheckIcon,
  BellAlertIcon,
  KeyIcon,
  CameraIcon,
  WifiIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const Shell = styled.div`
  min-height: 100vh;
  background: radial-gradient(1200px 600px at -10% -10%, rgba(59,130,246,0.12), transparent),
              radial-gradient(1200px 600px at 110% 110%, rgba(14,165,233,0.12), transparent),
              #0b1220;
  color: #e5e7eb;
`

const Card = styled(motion.div)`
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 18px;
  padding: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
`

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(17, 24, 39, 0.6);
  border-bottom: 1px solid rgba(59,130,246,0.25);
  backdrop-filter: blur(10px);
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`

const Stat = styled(Card)`
  grid-column: span 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const StatLabel = styled.div`
  font-size: 14px;
  color: #93c5fd;
  margin-bottom: 6px;
`

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #fff;
`

const Tag = styled.span`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(59,130,246,0.35);
  background: rgba(59,130,246,0.12);
  color: #bfdbfe;
`

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
  grid-column: 1 / -1;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const List = styled.div`
  display: grid;
  gap: 12px;
`

const ListItem = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(59,130,246,0.2);
`

const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
  margin-left: 8px;
  background: ${p => p.$ok ? '#10b981' : p.$warn ? '#f59e0b' : '#ef4444'};
  box-shadow: 0 0 0 6px rgba(16,185,129,0.08);
`

const SecurityDashboard = () => {
  const stats = [
    { label: 'Active Cameras', value: 42, icon: CameraIcon },
    { label: 'Online Devices', value: 128, icon: WifiIcon },
    { label: 'Access Granted (24h)', value: 972, icon: KeyIcon },
    { label: 'On-duty Guards', value: 8, icon: UserGroupIcon },
  ]

  const alerts = [
    { id: 1, title: 'Door forced open - Block C', time: '2m ago', severity: 'high' },
    { id: 2, title: 'Camera offline - A-Entrance', time: '8m ago', severity: 'medium' },
    { id: 3, title: 'Multiple failed entries - B-203', time: '14m ago', severity: 'low' },
  ]

  const activity = [
    { id: 1, message: 'Visitor checked-in at Gate 2', time: '09:12 AM' },
    { id: 2, message: 'Student exit approved - B-115', time: '08:47 AM' },
    { id: 3, message: 'Emergency drill scheduled', time: '08:00 AM' },
  ]

  return (
    <Shell>
      <Header>
        <Grid style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'grid', placeItems: 'center' }}>
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 18 }}>Security Dashboard</div>
              <div style={{ color: '#93c5fd', fontSize: 12 }}>Live monitoring and access control</div>
            </div>
          </div>
          <div style={{ justifySelf: 'end', display: 'flex', gap: 8 }}>
            <Tag><BellAlertIcon className="w-4 h-4" style={{ marginRight: 6 }} /> Alerts</Tag>
          </div>
        </Grid>
      </Header>

      <Grid>
        {stats.map((s, i) => (
          <Stat key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <div>
              <StatLabel>{s.label}</StatLabel>
              <StatValue>{s.value}</StatValue>
            </div>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(59,130,246,0.2)', display: 'grid', placeItems: 'center' }}>
              <s.icon className="w-6 h-6 text-blue-300" />
            </div>
          </Stat>
        ))}

        <Row>
          <Card initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <SectionTitle>
              <BellAlertIcon className="w-5 h-5 text-amber-300" />
              Active Alerts
            </SectionTitle>
            <List>
              {alerts.map(a => (
                <ListItem key={a.id}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251, 191, 36, 0.18)', display: 'grid', placeItems: 'center' }}>
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{a.title} <Dot $warn={a.severity!=='low'} $ok={a.severity==='low'} /></div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{a.time}</div>
                  </div>
                  <Tag>{a.severity}</Tag>
                </ListItem>
              ))}
            </List>
          </Card>

          <Card initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <SectionTitle>
              <KeyIcon className="w-5 h-5 text-cyan-300" />
              Recent Activity
            </SectionTitle>
            <List>
              {activity.map(ev => (
                <ListItem key={ev.id}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(34, 197, 94, 0.18)', display: 'grid', placeItems: 'center' }}>
                    <KeyIcon className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{ev.message}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{ev.time}</div>
                  </div>
                </ListItem>
              ))}
            </List>
          </Card>
        </Row>
      </Grid>
    </Shell>
  )
}

export default SecurityDashboard
