import React from 'react'
import { api } from '../../api'
import { Box, Grid, Paper, Typography, Select, MenuItem, Card, CardContent, Avatar, LinearProgress, Tooltip, Chip } from '@mui/material'
import { People, School, Business, MeetingRoom, ReportProblem, AttachMoney, TrendingUp, TrendingDown } from '@mui/icons-material'
import dayjs from 'dayjs'

function StatCard({ title, value, icon: Icon, color = 'primary', trend }){
  return (
    <Card sx={{
      background: `linear-gradient(135deg, ${color === 'primary' ? '#6a4cff' : color === 'secondary' ? '#ff6aa2' : '#4caf50'} 0%, ${color === 'primary' ? '#8c66ff' : color === 'secondary' ? '#ffa0c2' : '#66bb6a'} 100%)`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 100,
        height: 100,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        transform: 'translate(30px, -30px)'
      }
    }}>
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>{title}</Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            width: 48,
            height: 48
          }}>
            <Icon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function MiniBar({ data, color = '#6a4cff' }){
  const max = Math.max(1, ...data.map(d=>d.v))
  return (
    <Box sx={{ display:'flex', gap:1, alignItems:'flex-end', height: 100, mt: 2 }}>
      {data.map((d,i)=> (
        <Tooltip key={i} title={`${d.k}: ${d.v}`} arrow>
          <Box
            sx={{
              width: 24,
              height: `${(d.v/max)*100}%`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}aa 100%)`,
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                background: `linear-gradient(180deg, ${color}dd 0%, ${color} 100%)`
              },
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 2,
                height: 6,
                background: color,
                borderRadius: '1px 1px 0 0',
                opacity: 0.7
              }
            }}
          />
        </Tooltip>
      ))}
    </Box>
  )
}

export default function AdminDashboard(){
  const [overview, setOverview] = React.useState(null)
  const [analytics, setAnalytics] = React.useState(null)
  const [range, setRange] = React.useState('90')
  const [loading, setLoading] = React.useState(true)
  const load = React.useCallback(async ()=>{
    setLoading(true)
    try {
      const o = await api.get('/api/admin/overview')
      const to = dayjs()
      const from = to.subtract(Number(range), 'day')
      const a = await api.get('/api/admin/analytics', { params: { from: from.format('YYYY-MM-DD'), to: to.format('YYYY-MM-DD') } })
      setOverview(o.data)
      setAnalytics(a.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  },[range])
  React.useEffect(()=>{ load() },[load])
  const revenuePairs = analytics?.revenueByMonth ? Object.entries(analytics.revenueByMonth) : []
  const revenueBars = revenuePairs.map(([k, v]) => ({ k, v: Object.values(v).reduce((a,n)=> a + Number(n||0), 0) }))

  // Calculate trends (mock data for now - in real app, compare with previous period)
  const mockTrends = { users: 5, students: 8, blocks: 0, rooms: 2, complaints: -12, revenue: 15 }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #6a4cff, #ff6aa2)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Admin Dashboard
        </Typography>
        <Chip
          label={`Last updated: ${dayjs().format('MMM DD, HH:mm')}`}
          variant="outlined"
          sx={{ borderColor: 'primary.main', color: 'primary.main' }}
        />
      </Box>

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Total Users"
            value={overview?.users ?? '-'}
            icon={People}
            color="primary"
            trend={mockTrends.users}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Students"
            value={overview?.students ?? '-'}
            icon={School}
            color="secondary"
            trend={mockTrends.students}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Blocks"
            value={overview?.blocks ?? '-'}
            icon={Business}
            color="#4caf50"
            trend={mockTrends.blocks}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Rooms"
            value={overview?.rooms ?? '-'}
            icon={MeetingRoom}
            color="#ff9800"
            trend={mockTrends.rooms}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Open Complaints"
            value={overview?.openComplaints ?? '-'}
            icon={ReportProblem}
            color="#f44336"
            trend={mockTrends.complaints}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="Revenue"
            value={`₹${(overview?.revenue||0).toLocaleString()}`}
            icon={AttachMoney}
            color="#9c27b0"
            trend={mockTrends.revenue}
          />
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Revenue Trends
                </Typography>
                <Select
                  size="small"
                  value={range}
                  onChange={e=>setRange(e.target.value)}
                  sx={{
                    minWidth: 120,
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                  }}
                >
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 90 days</MenuItem>
                  <MenuItem value="180">Last 180 days</MenuItem>
                </Select>
              </Box>
              <MiniBar data={revenueBars} color="#6a4cff" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Monthly revenue breakdown
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main', mb: 2 }}>
                Block Occupancy
              </Typography>
              <MiniBar data={(analytics?.occupancy||[]).map(o=>({ k: o.block_name||o.block_id, v: Number(o.occupied||0) }))} color="#ff6aa2" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Current occupancy by block
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
