import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  WrenchScrewdriverIcon,
  BoltIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const Shell = styled.div`
  min-height: 100vh; position: relative; overflow: hidden;
  background: radial-gradient(1200px 600px at 0% -10%, rgba(59,130,246,0.08), transparent 40%),
              radial-gradient(1200px 600px at 100% 10%, rgba(16,185,129,0.08), transparent 40%),
              linear-gradient(135deg, #0f172a 0%, #0b1220 100%);
`
const GridPattern = styled.div`
  position: absolute; inset: 0; pointer-events:none;
  background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 50px 50px; opacity: .7;
  mask-image: radial-gradient(ellipse at center, black 25%, transparent 70%);
`
const Container = styled.div` max-width: 1200px; margin: 0 auto; padding: 32px 24px; position: relative; z-index:1; `

const Header = styled(motion.div)`
  margin-bottom: 20px; display:flex; align-items:center; justify-content:space-between;
`
const Brand = styled.div` display:flex; align-items:center; gap: 14px; `
const Badge = styled.div`
  width: 44px; height: 44px; border-radius: 14px; display:grid; place-items:center; color:#fff;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  box-shadow: 0 16px 36px rgba(59,130,246,0.35);
`
const Title = styled.h1`
  margin:0; font-weight: 900; font-size: 24px;
  background: linear-gradient(90deg, #93c5fd, #60a5fa, #34d399);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`
const Sub = styled.p` margin: 2px 0 0; color:#94a3b8; font-weight:600; font-size: 13px; `

const StatGrid = styled(motion.div)`
  display:grid; gap: 20px; grid-template-columns: repeat(1,minmax(0,1fr)); margin: 20px 0 28px;
  @media (min-width: 768px){ grid-template-columns: repeat(2,minmax(0,1fr)); }
  @media (min-width: 1024px){ grid-template-columns: repeat(4,minmax(0,1fr)); }
`
const Stat = styled(motion.div)`
  border: 1px solid rgba(100,116,139,0.35); border-radius: 18px; padding: 18px;
  background: ${({variant}) =>
    variant==='blue' ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(6,182,212,0.18))' :
    variant==='emerald' ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.18))' :
    variant==='amber' ? 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,113,133,0.18))' :
    'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(147,51,234,0.18))'};
`
const StatTop = styled.div` display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; `
const StatIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px; display:grid; place-items:center; color:#fff;
  background: ${({variant}) =>
    variant==='blue' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
    variant==='emerald' ? 'linear-gradient(135deg, #10b981, #059669)' :
    variant==='amber' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
    'linear-gradient(135deg, #6366f1, #8b5cf6)'};
  svg{ width: 20px; height: 20px; }
`
const KpiLabel = styled.div` color:#cbd5e1; font-weight:700; font-size: 13px; `
const KpiValue = styled.div` color:#fff; font-weight:900; font-size: 26px; line-height:1; `
const KpiHint = styled.div` color:#cbd5e1; font-size: 12px; font-weight:600; opacity: .8; `

const Grid = styled.div`
  display:grid; gap: 24px; grid-template-columns: 1fr; margin-bottom: 16px;
  @media (min-width: 1024px){ grid-template-columns: 2fr 1fr; }
`
const Card = styled(motion.div)`
  border: 1px solid rgba(100,116,139,0.35); border-radius: 22px; padding: 20px;
  background: rgba(15,23,42,0.45); backdrop-filter: blur(16px);
`
const CardTitle = styled.h3` margin:0 0 16px; color:#fff; font-size: 20px; font-weight: 900; display:flex; gap:10px; align-items:center; `
const Ticket = styled(motion.div)`
  display:flex; gap: 14px; padding: 14px; border-radius: 14px; border:1px solid rgba(100,116,139,0.3);
  background: rgba(2,6,23,0.35);
`
const StatusDot = styled.span`
  width:10px; height:10px; border-radius:999px; display:inline-block; margin-right:8px;
  ${({status})=> status==='open' && 'background:#f59e0b;'}
  ${({status})=> status==='in-progress' && 'background:#60a5fa;'}
  ${({status})=> status==='completed' && 'background:#34d399;'}
`

const MaintenanceDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setData({
        stats: {
          open: 12,
          inProgress: 7,
          completedToday: 19,
          avgResponseTime: '32m'
        },
        recentTickets: [
          { id: 'MT-4821', title: 'Leaking faucet - Block B, R-210', status: 'open', time: '12 min ago' },
          { id: 'MT-4819', title: 'AC not cooling - Block A, R-104', status: 'in-progress', time: '28 min ago' },
          { id: 'MT-4813', title: 'Light flicker - Block C, Corridor 2', status: 'completed', time: '1 hr ago' },
          { id: 'MT-4809', title: 'Door hinge issue - Block A, R-309', status: 'open', time: '2 hr ago' }
        ],
        schedule: [
          { time: '10:00 AM', task: 'Generator maintenance' },
          { time: '12:00 PM', task: 'Water tank inspection' },
          { time: '03:00 PM', task: 'Elevator safety check' }
        ]
      })
      setLoading(false)
    }, 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <Shell>
      <GridPattern />
      <Container>
        <Header initial={{ opacity:0, y: -12 }} animate={{ opacity:1, y:0 }}>
          <Brand>
            <Badge><WrenchScrewdriverIcon style={{ width:22, height:22 }} /></Badge>
            <div>
              <Title>Maintenance Dashboard</Title>
              <Sub>Hostel upkeep, repairs and scheduled services</Sub>
            </div>
          </Brand>
        </Header>

        {loading ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{textAlign:'center', padding:'48px 0'}}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ width:56, height:56, borderRadius:999, border:'4px solid #60a5fa', borderTopColor:'transparent', margin:'0 auto 10px' }} />
            <div style={{ color:'#cbd5e1' }}>Loading...</div>
          </motion.div>
        ) : (
          <>
            <StatGrid initial={{ opacity:0, y: 16 }} animate={{ opacity:1, y:0 }}>
              <Stat whileHover={{ y:-4, scale:1.01 }} variant="blue">
                <StatTop>
                  <StatIcon variant="blue"><ExclamationTriangleIcon /></StatIcon>
                  <span style={{ color:'#93c5fd', fontSize:11, fontWeight:800, background:'rgba(59,130,246,0.18)', padding:'6px 10px', borderRadius:999 }}>Open</span>
                </StatTop>
                <KpiLabel>Open Tickets</KpiLabel>
                <KpiValue>{data.stats.open}</KpiValue>
                <KpiHint>Awaiting assignment</KpiHint>
              </Stat>

              <Stat whileHover={{ y:-4, scale:1.01 }} variant="indigo">
                <StatTop>
                  <StatIcon variant="indigo"><BoltIcon /></StatIcon>
                  <span style={{ color:'#ddd6fe', fontSize:11, fontWeight:800, background:'rgba(99,102,241,0.18)', padding:'6px 10px', borderRadius:999 }}>Active</span>
                </StatTop>
                <KpiLabel>In Progress</KpiLabel>
                <KpiValue>{data.stats.inProgress}</KpiValue>
                <KpiHint>Team on the job</KpiHint>
              </Stat>

              <Stat whileHover={{ y:-4, scale:1.01 }} variant="emerald">
                <StatTop>
                  <StatIcon variant="emerald"><CheckCircleIcon /></StatIcon>
                  <span style={{ color:'#86efac', fontSize:11, fontWeight:800, background:'rgba(16,185,129,0.18)', padding:'6px 10px', borderRadius:999 }}>Today</span>
                </StatTop>
                <KpiLabel>Completed Today</KpiLabel>
                <KpiValue>{data.stats.completedToday}</KpiValue>
                <KpiHint>Great pace</KpiHint>
              </Stat>

              <Stat whileHover={{ y:-4, scale:1.01 }} variant="amber">
                <StatTop>
                  <StatIcon variant="amber"><ClockIcon /></StatIcon>
                  <span style={{ color:'#fdba74', fontSize:11, fontWeight:800, background:'rgba(251,146,60,0.18)', padding:'6px 10px', borderRadius:999 }}>Avg</span>
                </StatTop>
                <KpiLabel>Response Time</KpiLabel>
                <KpiValue>{data.stats.avgResponseTime}</KpiValue>
                <KpiHint>From report to assignment</KpiHint>
              </Stat>
            </StatGrid>

            <Grid>
              <Card initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}>
                <CardTitle>
                  <ExclamationTriangleIcon style={{ width:20, height:20, color:'#22d3ee' }} />
                  Recent Tickets
                </CardTitle>
                <div style={{ display:'grid', gap: 12 }}>
                  {data.recentTickets.map((t, i) => (
                    <Ticket key={t.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06 }}>
                      <div style={{ width:40, height:40, borderRadius:10, display:'grid', placeItems:'center', color:'#fff', background:'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                        <WrenchScrewdriverIcon style={{ width:18, height:18 }} />
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <strong style={{ color:'#fff' }}>{t.id}</strong>
                          <span style={{ color:'#94a3b8', fontSize:12 }}>{t.time}</span>
                        </div>
                        <div style={{ color:'#cbd5e1', fontSize:14 }}>{t.title}</div>
                      </div>
                      <div>
                        <span style={{ color:'#cbd5e1', fontSize:12, fontWeight:700 }}>
                          <StatusDot status={t.status} />{t.status}
                        </span>
                      </div>
                    </Ticket>
                  ))}
                </div>
              </Card>

              <Card initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}>
                <CardTitle>
                  <CalendarDaysIcon style={{ width:20, height:20, color:'#22d3ee' }} />
                  Today's Schedule
                </CardTitle>
                <div style={{ display:'grid', gap: 12 }}>
                  {data.schedule.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:12, border:'1px solid rgba(100,116,139,0.3)', background:'rgba(2,6,23,0.35)' }}>
                      <span style={{ color:'#38bdf8', fontWeight:700, fontSize:13 }}>{s.time}</span>
                      <span style={{ color:'#cbd5e1', fontWeight:600, fontSize:14 }}>{s.task}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </Grid>
          </>
        )}
      </Container>
    </Shell>
  )
}

export default MaintenanceDashboard
