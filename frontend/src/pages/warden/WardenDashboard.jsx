import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  EyeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  HomeIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import {
  UserGroupIcon as UserGroupSolid,
  BuildingOfficeIcon as BuildingSolid,
  ExclamationTriangleIcon as ExclamationSolid,
  ShieldCheckIcon as ShieldSolid
} from '@heroicons/react/24/solid'
import { useAuthStore } from '../../stores/useAuthStore'

// Shell and background
const Shell = styled(motion.div)`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: radial-gradient(1200px 600px at 10% -10%, rgba(16,185,129,0.08), transparent 40%),
              radial-gradient(1200px 600px at 90% 10%, rgba(14,165,233,0.08), transparent 40%),
              linear-gradient(135deg, #0f172a 0%, #111827 40%, #0b1220 100%);
`

const GridPattern = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
`

// Header
const HeaderBar = styled.header`
  position: relative; z-index: 10;
  border-bottom: 1px solid rgba(100,116,139,0.3);
  background: rgba(15,23,42,0.5);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
`

const Container = styled.div`
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
`

const HeaderRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; height: 80px;
`

const Brand = styled(motion.div)`
  display: flex; align-items: center; gap: 16px;
`

const LogoBadge = styled.div`
  width: 48px; height: 48px; border-radius: 16px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #10b981, #059669, #0ea5e9);
  box-shadow: 0 10px 24px rgba(16,185,129,0.35);
`

const TitleWrap = styled.div``
const Title = styled.h1`
  font-size: 22px; font-weight: 900; margin: 0;
  background: linear-gradient(90deg, #86efac, #34d399, #22d3ee);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`
const Subtitle = styled.span`
  display: block; font-size: 13px; color: #94a3b8; font-weight: 600;
`

const RightBar = styled(motion.div)`
  display: flex; align-items: center; gap: 24px;
`

const IconButton = styled(motion.button)`
  position: relative; display: grid; place-items: center;
  width: 44px; height: 44px; border-radius: 12px; border: 1px solid rgba(100,116,139,0.3);
  color: #cbd5e1; background: rgba(51,65,85,0.4);
  backdrop-filter: blur(6px);
  transition: all .25s ease;
  &:hover { color: #86efac; background: rgba(51,65,85,0.55); }
`

const Badge = styled.div`
  position: absolute; right: -6px; top: -6px; width: 20px; height: 20px; border-radius: 999px;
  background: #ef4444; display: grid; place-items: center; color: white; font-weight: 800; font-size: 11px;
  box-shadow: 0 6px 16px rgba(239,68,68,0.4);
`

const Profile = styled.div`
  display: flex; align-items: center; gap: 12px; border-radius: 18px; padding: 12px 16px;
  border: 1px solid rgba(100,116,139,0.35); background: rgba(15,23,42,0.45); backdrop-filter: blur(16px);
`

const Avatar = styled.div`
  width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; color: white; font-weight: 900;
  background: linear-gradient(135deg, #34d399, #059669);
`

const LogoutBtn = styled(IconButton)`
  width: 36px; height: 36px; color: #94a3b8;
  &:hover { color: #f87171; background: rgba(248,113,113,0.2); }
`

// Content
const Main = styled.main`
  position: relative; z-index: 1; padding: 32px 0 48px;
`

const Hero = styled(motion.div)`
  position: relative; border: 1px solid rgba(100,116,139,0.35); border-radius: 24px; padding: 32px;
  background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15));
  box-shadow: 0 24px 60px rgba(0,0,0,0.45);
  overflow: hidden;
`

const HeroGlow = styled.div`
  position: absolute; inset: 0; background: linear-gradient(90deg, rgba(16,185,129,0.08), rgba(14,165,233,0.08));
  border-radius: 24px;
`

const HeroTitle = styled.h2`
  margin: 0 0 12px; font-size: 34px; font-weight: 900; color: white;
`

const HeroP = styled.p`
  margin: 0; font-size: 18px; color: #cbd5e1; max-width: 780px; line-height: 1.7;
`

const HeroChips = styled.div`
  display: flex; align-items: center; gap: 24px; margin-top: 18px;
`

const StatusChip = styled.div`
  display: flex; align-items: center; gap: 8px; color: #86efac; font-weight: 700;
  .dot { width: 10px; height: 10px; border-radius: 999px; background: #34d399; box-shadow: 0 0 0 4px rgba(52,211,153,0.2); animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%{ transform: scale(1); opacity: 1;} 70%{ transform: scale(1.3); opacity: .5;} 100%{ transform: scale(1); opacity: 1;} }
`

const TimeChip = styled.div`
  display: flex; align-items: center; gap: 8px; color: #7dd3fc; font-weight: 600;
  svg { width: 16px; height: 16px; }
`

// Stats
const StatGrid = styled(motion.div)`
  display: grid; grid-template-columns: repeat(1, minmax(0,1fr)); gap: 24px; margin: 24px 0 32px;
  @media (min-width: 768px){ grid-template-columns: repeat(2, minmax(0,1fr)); }
  @media (min-width: 1024px){ grid-template-columns: repeat(4, minmax(0,1fr)); }
`

const StatCard = styled(motion.div)`
  border: 1px solid rgba(100,116,139,0.35); border-radius: 20px; padding: 20px;
  background: ${({variant}) =>
    variant==='blue' ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(6,182,212,0.18))' :
    variant==='green' ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.18))' :
    variant==='purple' ? 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.18))' :
    'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(239,68,68,0.18))'};
  box-shadow: 0 16px 40px rgba(0,0,0,0.4);
`

const StatTop = styled.div` display:flex; align-items:center; justify-content:space-between; margin-bottom: 14px; `
const StatIcon = styled.div`
  width: 48px; height: 48px; border-radius: 14px; display: grid; place-items: center; color: white;
  background: ${({variant}) =>
    variant==='blue' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
    variant==='green' ? 'linear-gradient(135deg, #10b981, #059669)' :
    variant==='purple' ? 'linear-gradient(135deg, #a855f7, #ec4899)' :
    'linear-gradient(135deg, #f59e0b, #ef4444)'};
`

const KpiLabel = styled.div` color:#cbd5e1; font-weight: 700; margin-bottom: 6px; `
const KpiValue = styled.div` color:white; font-size:28px; font-weight: 900; line-height:1; margin-bottom: 6px; `
const KpiHint = styled.div` display:flex; align-items:center; gap:6px; font-size: 13px; font-weight:600; color: ${({variant}) =>
  variant==='blue' ? '#93c5fd' : variant==='green' ? '#86efac' : variant==='purple' ? '#e9d5ff' : '#fdba74'};
  svg{ width: 16px; height: 16px; }
`

// Grid sections
const Grid = styled.div`
  display: grid; grid-template-columns: 1fr; gap: 32px; margin-bottom: 32px;
  @media (min-width: 1024px){ grid-template-columns: 2fr 1fr; }
`

const Card = styled(motion.div)`
  border: 1px solid rgba(100,116,139,0.35); border-radius: 24px; padding: 24px;
  background: rgba(15,23,42,0.45); backdrop-filter: blur(16px);
`

const CardTitle = styled.h3`
  margin: 0 0 20px; color: white; font-size: 22px; font-weight: 900; display:flex; align-items:center; gap:10px;
  .icon { color: #22d3ee; width: 22px; height: 22px; }
`

const ActivityItem = styled(motion.div)`
  display:flex; align-items:center; gap: 16px; padding: 14px; border-radius: 14px; border: 1px solid rgba(100,116,139,0.3);
  background: rgba(2,6,23,0.35); transition: border-color .25s ease;
  &:hover { border-color: rgba(100,116,139,0.6); }
`

const ActivityIcon = styled.div`
  width: 48px; height: 48px; border-radius: 999px; display:grid; place-items:center; color: currentColor;
  ${({type}) => type==='entry' && 'background: rgba(34,197,94,0.2); color: #34d399;'}
  ${({type}) => type==='leave' && 'background: rgba(59,130,246,0.2); color: #60a5fa;'}
  ${({type}) => type==='visitor' && 'background: rgba(168,85,247,0.2); color: #a78bfa;'}
  ${({type}) => type==='complaint' && 'background: rgba(249,115,22,0.2); color: #fb923c;'}
  svg{ width: 20px; height: 20px; }
`

const ActivityBody = styled.div` flex:1; `
const ActivityHeader = styled.div` display:flex; align-items:center; gap:8px; margin-bottom: 4px; `
const ActivityName = styled.p` margin:0; color:white; font-weight: 700; `
const ActivityRoom = styled.span` font-size: 11px; color:#94a3b8; background: rgba(30,41,59,0.6); padding: 4px 8px; border-radius: 8px; `
const ActivityText = styled.p` margin:0; font-size: 14px; color:#cbd5e1; `
const ActivityTime = styled.p` margin:0; font-size: 12px; color:#94a3b8; `
const GhostButton = styled(motion.button)`
  width: 36px; height: 36px; display:grid; place-items:center; border-radius: 10px;
  color:#94a3b8; background: transparent; border: 1px solid transparent;
  &:hover{ color:#67e8f9; background: rgba(34,211,238,0.15); border-color: rgba(103,232,249,0.3); }
  svg{ width: 18px; height: 18px; }
`

// Schedule
const ScheduleItem = styled(motion.div)`
  display:flex; align-items:flex-start; gap: 16px; padding: 14px; border-radius: 14px;
  border: 1px solid rgba(100,116,139,0.3); background: rgba(2,6,23,0.35);
`

const ScheduleTime = styled.span` font-size: 12px; color:#94a3b8; font-weight: 700; margin-bottom: 8px; display:block; `
const StatusDot = styled.div`
  width: 12px; height: 12px; border-radius: 999px;
  ${({status}) => status==='completed' && 'background:#34d399;'}
  ${({status}) => status==='ongoing' && 'background:#60a5fa; animation: pulse 1.5s infinite;'}
  ${({status}) => status==='pending' && 'background:#64748b;'}
  @keyframes pulse { 0%{ transform: scale(1); opacity: 1;} 70%{ transform: scale(1.3); opacity: .6;} 100%{ transform: scale(1); opacity: 1;} }
`
const ScheduleTitle = styled.p` margin:0 0 8px; color:white; font-weight: 700; font-size: 14px; `
const ScheduleTag = styled.span`
  font-size: 11px; font-weight: 800; text-transform: capitalize; padding: 4px 8px; border-radius: 999px;
  ${({status}) => status==='completed' && 'background: rgba(34,197,94,0.18); color:#86efac;'}
  ${({status}) => status==='ongoing' && 'background: rgba(59,130,246,0.18); color:#93c5fd;'}
  ${({status}) => status==='pending' && 'background: rgba(100,116,139,0.25); color:#cbd5e1;'}
`

// Quick stats
const QuickGrid = styled(motion.div)`
  display:grid; grid-template-columns: 1fr; gap: 24px;
  @media (min-width: 768px){ grid-template-columns: repeat(3, minmax(0,1fr)); }
`
const QuickCard = styled(motion.div)`
  border: 1px solid rgba(100,116,139,0.35); border-radius: 20px; padding: 20px;
  background: ${({variant}) =>
    variant==='indigo' ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(147,51,234,0.18))' :
    variant==='teal' ? 'linear-gradient(135deg, rgba(13,148,136,0.18), rgba(8,145,178,0.18))' :
    'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(236,72,153,0.18))'};
`
const QuickTop = styled.div` display:flex; align-items:center; justify-content:space-between; margin-bottom: 14px; `
const QuickIcon = styled.div`
  width: 40px; height: 40px; border-radius: 12px; display:grid; place-items:center; color:#fff;
  background: ${({variant}) =>
    variant==='indigo' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' :
    variant==='teal' ? 'linear-gradient(135deg, #14b8a6, #06b6d4)' :
    'linear-gradient(135deg, #f43f5e, #ec4899)'};
  svg{ width: 18px; height: 18px; }
`
const QuickHint = styled.span`
  font-size: 11px; font-weight: 800; color: ${({variant}) =>
    variant==='indigo' ? '#c7d2fe' : variant==='teal' ? '#99f6e4' : '#fecdd3'};
`
const QuickLabel = styled.h4` margin:0 0 8px; font-size: 13px; color:#94a3b8; font-weight: 800; letter-spacing: .4px; `
const QuickValue = styled.p` margin:0; color:#fff; font-weight: 900; font-size: 24px; `

const Spinner = styled(motion.div)`
  width: 64px; height: 64px; border-radius: 999px; border: 4px solid #22d3ee; border-top-color: transparent; margin: 0 auto 12px;
`

const WardenDashboard = () => {
  const { user, logout } = useAuthStore()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200))

      setDashboardData({
        stats: {
          totalStudents: 324,
          availableRooms: 15,
          occupancyRate: 92.5,
          pendingRequests: 8,
          todayVisitors: 12,
          activeLeaves: 18
        },
        recentActivities: [
          { id: 1, type: 'entry', student: 'Rahul Kumar', action: 'entered hostel', time: '10 mins ago', room: 'A-301' },
          { id: 2, type: 'leave', student: 'Priya Sharma', action: 'requested leave', time: '25 mins ago', room: 'B-205' },
          { id: 3, type: 'visitor', student: 'Amit Singh', action: 'visitor registered', time: '45 mins ago', room: 'C-102' },
          { id: 4, type: 'complaint', student: 'Neha Patel', action: 'submitted complaint', time: '1 hour ago', room: 'A-215' }
        ],
        todaySchedule: [
          { time: '09:00 AM', event: 'Morning Inspection - Block A', status: 'completed' },
          { time: '11:00 AM', event: 'New Student Orientation', status: 'ongoing' },
          { time: '02:00 PM', event: 'Mess Committee Meeting', status: 'pending' },
          { time: '04:00 PM', event: 'Room Allocation Review', status: 'pending' },
          { time: '06:00 PM', event: 'Evening Attendance Check', status: 'pending' }
        ]
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Shell>
        <GridPattern />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{display:'grid', placeItems:'center', minHeight:'100vh'}}>
          <div style={{textAlign:'center'}}>
            <Spinner animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
            <p style={{color:'#fff', fontSize:16, fontWeight:600}}>Loading Warden Dashboard...</p>
          </div>
        </motion.div>
      </Shell>
    )
  }

  return (
    <Shell>
      <GridPattern />

      {/* Floating background shapes */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          style={{ position:'absolute', left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, filter:'blur(2px)', zIndex:0,
            width: i%3===0?64:i%3===1?48:56, height: i%3===0?64:i%3===1?48:56, borderRadius: i%3===0?999: i%3===1?12:20, opacity:.25,
            background: i%3===0? 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(16,185,129,0.2))' : i%3===1? 'linear-gradient(135deg, rgba(96,165,250,0.2), rgba(34,211,238,0.2))' : 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(244,114,182,0.2))'
          }}
          animate={{ x:[0, Math.random()*80-40, 0], y:[0, Math.random()*80-40, 0], rotate:[0, 360, 0], opacity:[.15, .35, .15] }}
          transition={{ duration: 18 + Math.random()*12, repeat: Infinity, ease: 'easeInOut', delay: Math.random()*4 }}
        />
      ))}

      {/* Header */}
      <HeaderBar>
        <Container>
          <HeaderRow>
            <Brand initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6 }}>
              <LogoBadge><ShieldSolid style={{ width: 28, height: 28 }} /></LogoBadge>
              <TitleWrap>
                <Title>Warden Dashboard</Title>
                <Subtitle>Hostel Management & Student Care</Subtitle>
              </TitleWrap>
            </Brand>

            <RightBar initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6, delay: .2 }}>
              <div style={{ position:'relative' }}>
                <IconButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="Notifications">
                  <BellIcon style={{ width: 22, height: 22 }} />
                </IconButton>
                <Badge>5</Badge>
              </div>

              <Profile>
                <Avatar>{user?.name?.charAt(0) || 'W'}</Avatar>
                <div style={{ fontSize: 13 }}>
                  <div style={{ color:'#fff', fontWeight:700 }}>{user?.name || 'Warden'}</div>
                  <div style={{ color:'#94a3b8' }}>Hostel Warden</div>
                </div>
                <LogoutBtn whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={logout} aria-label="Logout">
                  <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
                </LogoutBtn>
              </Profile>
            </RightBar>
          </HeaderRow>
        </Container>
      </HeaderBar>

      {/* Main */}
      <Main>
        <Container>
          {/* Welcome */}
          <Hero initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .25 }}>
            <HeroGlow />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="9" stroke="#fbbf24" strokeWidth="2" />
                  <circle cx="10" cy="10" r="5" fill="#facc15" />
                </svg>
                <span style={{ color:'#86efac', fontSize:13, fontWeight:800, letterSpacing:.6 }}>Hostel Management</span>
              </div>
              <HeroTitle>
                {`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Warden!`}
              </HeroTitle>
              <HeroP>
                Oversee student welfare, manage daily operations, and ensure a safe and conducive living environment.
                Monitor room allocations, handle student requests, and maintain discipline with comprehensive oversight tools.
              </HeroP>
              <HeroChips>
                <StatusChip>
                  <span className="dot" />
                  All Blocks Secure
                </StatusChip>
                <TimeChip>
                  <ClockIcon />
                  Last round: 30 mins ago
                </TimeChip>
              </HeroChips>
            </div>
          </Hero>

          {/* KPIs */}
          <StatGrid initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .35 }}>
            <StatCard whileHover={{ y: -6, scale: 1.01 }} variant="blue">
              <StatTop>
                <StatIcon variant="blue"><UserGroupSolid style={{ width: 24, height: 24 }} /></StatIcon>
                <span style={{ color:'#93c5fd', fontSize:11, fontWeight:800, background:'rgba(59,130,246,0.2)', padding:'6px 10px', borderRadius:999 }}>Assigned</span>
              </StatTop>
              <KpiLabel>Total Students</KpiLabel>
              <KpiValue>{dashboardData?.stats?.totalStudents || 0}</KpiValue>
              <KpiHint variant="blue"><UserIcon />Under your supervision</KpiHint>
            </StatCard>

            <StatCard whileHover={{ y: -6, scale: 1.01 }} variant="green">
              <StatTop>
                <StatIcon variant="green"><BuildingSolid style={{ width: 24, height: 24 }} /></StatIcon>
                <span style={{ color:'#86efac', fontSize:11, fontWeight:800, background:'rgba(16,185,129,0.2)', padding:'6px 10px', borderRadius:999 }}>Available</span>
              </StatTop>
              <KpiLabel>Available Rooms</KpiLabel>
              <KpiValue>{dashboardData?.stats?.availableRooms || 0}</KpiValue>
              <KpiHint variant="green"><HomeIcon />Ready for allocation</KpiHint>
            </StatCard>

            <StatCard whileHover={{ y: -6, scale: 1.01 }} variant="purple">
              <StatTop>
                <StatIcon variant="purple"><ChartBarIcon style={{ width: 24, height: 24 }} /></StatIcon>
                <span style={{ color:'#e9d5ff', fontSize:11, fontWeight:800, background:'rgba(168,85,247,0.2)', padding:'6px 10px', borderRadius:999 }}>{dashboardData?.stats?.occupancyRate?.toFixed(1)}%</span>
              </StatTop>
              <KpiLabel>Occupancy Rate</KpiLabel>
              <KpiValue>{dashboardData?.stats?.occupancyRate?.toFixed(1)}%</KpiValue>
              <KpiHint variant="purple"><ArrowTrendingUpIcon />Optimal capacity</KpiHint>
            </StatCard>

            <StatCard whileHover={{ y: -6, scale: 1.01 }} variant="orange">
              <StatTop>
                <StatIcon variant="orange"><ExclamationSolid style={{ width: 24, height: 24 }} /></StatIcon>
                <span style={{ color:'#fdba74', fontSize:11, fontWeight:800, background:'rgba(249,115,22,0.2)', padding:'6px 10px', borderRadius:999 }}>Priority</span>
              </StatTop>
              <KpiLabel>Pending Requests</KpiLabel>
              <KpiValue>{dashboardData?.stats?.pendingRequests || 0}</KpiValue>
              <KpiHint variant="orange"><ClipboardDocumentListIcon />Require attention</KpiHint>
            </StatCard>
          </StatGrid>

          {/* Content grid */}
          <Grid>
            {/* Recent Activities */}
            <Card as={motion.div} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6, delay: .45 }}>
              <CardTitle><BellIcon className="icon" />Recent Activities</CardTitle>
              <div style={{ display:'grid', gap: 14 }}>
                {dashboardData?.recentActivities?.map((activity, index) => (
                  <ActivityItem key={activity.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index*0.08 }}>
                    <ActivityIcon type={activity.type}>
                      {activity.type === 'entry' && <KeyIcon />}
                      {activity.type === 'leave' && <CalendarDaysIcon />}
                      {activity.type === 'visitor' && <UserIcon />}
                      {activity.type === 'complaint' && <ExclamationTriangleIcon />}
                    </ActivityIcon>
                    <ActivityBody>
                      <ActivityHeader>
                        <ActivityName>{activity.student}</ActivityName>
                        <ActivityRoom>{activity.room}</ActivityRoom>
                      </ActivityHeader>
                      <ActivityText>{activity.action}</ActivityText>
                      <ActivityTime>{activity.time}</ActivityTime>
                    </ActivityBody>
                    <GhostButton whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} aria-label="View details">
                      <EyeIcon />
                    </GhostButton>
                  </ActivityItem>
                ))}
              </div>
            </Card>

            {/* Today schedule */}
            <Card as={motion.div} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6, delay: .5 }}>
              <CardTitle><CalendarDaysIcon className="icon" />Today's Schedule</CardTitle>
              <div style={{ display:'grid', gap: 14 }}>
                {dashboardData?.todaySchedule?.map((item, index) => (
                  <ScheduleItem key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index*0.08 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <ScheduleTime>{item.time}</ScheduleTime>
                      <StatusDot status={item.status} />
                    </div>
                    <div style={{ flex:1 }}>
                      <ScheduleTitle>{item.event}</ScheduleTitle>
                      <ScheduleTag status={item.status}>{item.status}</ScheduleTag>
                    </div>
                  </ScheduleItem>
                ))}
              </div>
            </Card>
          </Grid>

          {/* Quick stats */}
          <QuickGrid initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .55 }}>
            <QuickCard whileHover={{ scale: 1.02 }} variant="indigo">
              <QuickTop>
                <QuickIcon variant="indigo"><UserIcon /></QuickIcon>
                <QuickHint variant="indigo">Today</QuickHint>
              </QuickTop>
              <QuickLabel>Visitors</QuickLabel>
              <QuickValue>{dashboardData?.stats?.todayVisitors || 0}</QuickValue>
            </QuickCard>

            <QuickCard whileHover={{ scale: 1.02 }} variant="teal">
              <QuickTop>
                <QuickIcon variant="teal"><CalendarDaysIcon /></QuickIcon>
                <QuickHint variant="teal">Active</QuickHint>
              </QuickTop>
              <QuickLabel>Student Leaves</QuickLabel>
              <QuickValue>{dashboardData?.stats?.activeLeaves || 0}</QuickValue>
            </QuickCard>

            <QuickCard whileHover={{ scale: 1.02 }} variant="rose">
              <QuickTop>
                <QuickIcon variant="rose"><ShieldCheckIcon /></QuickIcon>
                <QuickHint variant="rose">Status</QuickHint>
              </QuickTop>
              <QuickLabel>Security Level</QuickLabel>
              <QuickValue>High</QuickValue>
            </QuickCard>
          </QuickGrid>
        </Container>
      </Main>
    </Shell>
  )
}

export default WardenDashboard
