import React from 'react'
import { api } from '../../api'
import {
  Grid, Paper, Typography, Box, Button, LinearProgress, Chip, Stack, Divider,
  Avatar, Card as MuiCard, CardContent, IconButton, Tooltip, Snackbar, Alert,
  List, ListItem, ListItemText, ListItemAvatar, Badge, Fab
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import RefreshIcon from '@mui/icons-material/Refresh'
import CampaignIcon from '@mui/icons-material/Campaign'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import AssessmentIcon from '@mui/icons-material/Assessment'
import PeopleIcon from '@mui/icons-material/People'
import BusinessIcon from '@mui/icons-material/Business'
import PaymentIcon from '@mui/icons-material/Payment'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import EventIcon from '@mui/icons-material/Event'
import NotificationsIcon from '@mui/icons-material/Notifications'
import QrCodeIcon from '@mui/icons-material/QrCode'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ScheduleIcon from '@mui/icons-material/Schedule'

const Card = ({ title, value, subtitle, color, icon: Icon, trend }) => (
  <MuiCard sx={{
    background: `linear-gradient(135deg, ${color === 'primary' ? '#6a4cff' : color === 'secondary' ? '#ff6aa2' : color === 'success' ? '#4caf50' : color === 'warning' ? '#ff9800' : '#2196f3'} 0%, ${color === 'primary' ? '#8c66ff' : color === 'secondary' ? '#ffa0c2' : color === 'success' ? '#66bb6a' : color === 'warning' ? '#ffb74d' : '#64b5f6'} 100%)`,
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 80,
      height: 80,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: '50%',
      transform: 'translate(30px, -30px)'
    }
  }}>
    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>{title}</Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TrendingUpIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {trend}%
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
          {subtitle && (
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </MuiCard>
)

const BlockCard = ({ block }) => {
  const occupancyPercent = Math.round((block.occupancy / block.capacity) * 100)
  const attendanceColor = block.attendancePct >= 85 ? 'success' : block.attendancePct >= 60 ? 'warning' : 'error'

  return (
    <MuiCard sx={{
      borderRadius: 3,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      },
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {block.type}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {block.name}
            </Typography>
          </Box>
          <Avatar sx={{
            bgcolor: occupancyPercent > 90 ? 'error.main' : occupancyPercent > 70 ? 'warning.main' : 'success.main',
            width: 40,
            height: 40
          }}>
            <BusinessIcon sx={{ fontSize: 20 }} />
          </Avatar>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Occupancy
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {block.occupancy}/{block.capacity} ({occupancyPercent}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={occupancyPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: occupancyPercent > 90 ? 'error.main' : occupancyPercent > 70 ? 'warning.main' : 'success.main',
                borderRadius: 4
              }
            }}
          />
        </Box>

        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            label={`Today: ${block.attendancePct}%`}
            color={attendanceColor}
            variant="filled"
            icon={<CheckCircleIcon />}
          />
          <Chip
            size="small"
            label={`${block.occupancy} students`}
            variant="outlined"
            icon={<PeopleIcon />}
          />
        </Stack>
      </CardContent>
    </MuiCard>
  )
}

export default function RCDashboard(){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })
  const nav = useNavigate()

  const load = React.useCallback(async ()=>{
    setLoading(true)
    try{
      const r = await api.get('/api/rc/overview')
      setData(r.data)
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  },[])

  React.useEffect(()=>{ load() },[load])

  // Mock recent activities for demonstration
  const recentActivities = [
    { id: 1, type: 'attendance', message: 'High attendance rate today (95%)', time: '2 hours ago', icon: CheckCircleIcon, color: 'success' },
    { id: 2, type: 'application', message: '3 new room change applications', time: '4 hours ago', icon: AssignmentIcon, color: 'primary' },
    { id: 3, type: 'complaint', message: 'Maintenance complaint resolved', time: '6 hours ago', icon: ReportProblemIcon, color: 'warning' },
    { id: 4, type: 'fee', message: '15 fee payments received', time: '1 day ago', icon: PaymentIcon, color: 'info' },
  ]

  // Mock trends for demonstration
  const mockTrends = { students: 2, occupancy: 3, fees: -5, complaints: -8 }

  if (loading) return (
    <Box sx={{ p: 3 }}>
      <LinearProgress />
      <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading dashboard...</Typography>
    </Box>
  )

  if (!data) return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="error" sx={{ mb: 2 }}>Failed to load dashboard data</Typography>
      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>
        Retry
      </Button>
    </Box>
  )

  const { totals, fees, complaints, blocks } = data

  return (
    <Box sx={{ p: 3 }}>
      {/* Enhanced Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <BusinessIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
            Resident Counselor Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Comprehensive overview of your assigned blocks and student management activities
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label="Live Data"
              color="success"
              size="small"
              icon={<CheckCircleIcon />}
            />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }}
        />
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            title="Total Students"
            value={totals.students.total}
            subtitle={`Boys ${totals.students.boys} • Girls ${totals.students.girls}`}
            color="primary"
            icon={PeopleIcon}
            trend={mockTrends.students}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            title="Occupancy Rate"
            value={`${totals.occupancyRate}%`}
            subtitle="Across assigned blocks"
            color="secondary"
            icon={BusinessIcon}
            trend={mockTrends.occupancy}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            title="Fees Summary"
            value={`${fees.pending} pending`}
            subtitle={`${fees.partial} partial • ${fees.settled} settled`}
            color="warning"
            icon={PaymentIcon}
            trend={mockTrends.fees}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            title="Complaints"
            value={`${complaints.pending} pending`}
            subtitle={`${complaints.resolved} resolved`}
            color="error"
            icon={ReportProblemIcon}
            trend={mockTrends.complaints}
          />
        </Grid>
      </Grid>

      {/* Quick Actions & Recent Activities */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <MuiCard sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  <EventIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Quick Actions
                </Typography>
                <Tooltip title="Refresh Dashboard">
                  <IconButton onClick={load} disabled={loading}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<QrCodeIcon />}
                    onClick={() => nav('/rc/attendance')}
                    sx={{ py: 1.5 }}
                  >
                    Take Attendance
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssignmentTurnedInIcon />}
                    onClick={() => nav('/rc/applications')}
                    sx={{ py: 1.5 }}
                  >
                    Review Applications
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReportProblemIcon />}
                    onClick={() => nav('/rc/complaints')}
                    sx={{ py: 1.5 }}
                  >
                    Handle Complaints
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    onClick={() => nav('/rc/reports')}
                    sx={{ py: 1.5 }}
                  >
                    Generate Reports
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<PeopleIcon />}
                    onClick={() => nav('/rc/students')}
                    sx={{ py: 1.5 }}
                  >
                    View Students
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="text"
                    startIcon={<CampaignIcon />}
                    onClick={() => nav('/rc/notices')}
                    sx={{ py: 1.5 }}
                  >
                    Issue Notices
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </MuiCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <MuiCard sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Activities
              </Typography>
              <List sx={{ width: '100%' }}>
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon
                  return (
                    <ListItem key={activity.id} sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${activity.color}.main` }}>
                          <IconComponent sx={{ fontSize: 18 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.message}
                        secondary={activity.time}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  )
                })}
              </List>
            </CardContent>
          </MuiCard>
        </Grid>
      </Grid>

      {/* Blocks Overview */}
      <MuiCard sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Blocks Overview
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${blocks.length} Blocks`}
                color="primary"
                size="small"
                variant="outlined"
              />
              <Chip
                label={`${blocks.reduce((sum, b) => sum + b.occupancy, 0)} Students`}
                color="secondary"
                size="small"
                variant="outlined"
              />
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {blocks.map(b => (
              <Grid item xs={12} md={6} lg={4} key={b.id}>
                <BlockCard block={b} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </MuiCard>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
