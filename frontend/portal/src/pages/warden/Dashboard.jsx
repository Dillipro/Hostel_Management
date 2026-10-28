import React from 'react'
import {
  Typography, Grid, Card, CardContent, Box, CircularProgress, LinearProgress,
  Avatar, Chip, Button, IconButton, Tooltip, Snackbar, Alert, List,
  ListItem, ListItemText, ListItemAvatar, Divider, Fab
} from '@mui/material'
import {
  People, Business, Payment, ReportProblem, CheckCircle, Assignment,
  Notifications, Assessment, TrendingUp, TrendingDown, Refresh,
  Event, Security, Gavel, Feedback, SupervisorAccount, SwapHoriz
} from '@mui/icons-material'
import { api } from '../../api'
import { useNavigate } from 'react-router-dom'

function MetricCard({ title, value, subtitle, icon: Icon, color = 'primary', progress, trend, showProgress = false }) {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, ${color === 'primary' ? '#6a4cff' : color === 'secondary' ? '#ff6aa2' : color === 'success' ? '#4caf50' : color === 'warning' ? '#ff9800' : color === 'error' ? '#f44336' : '#2196f3'} 0%, ${color === 'primary' ? '#8c66ff' : color === 'secondary' ? '#ffa0c2' : color === 'success' ? '#66bb6a' : color === 'warning' ? '#ffb74d' : color === 'error' ? '#ef5350' : '#64b5f6'} 100%)`,
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
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
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

        {showProgress && progress !== undefined && (
          <Box sx={{ mt: 'auto' }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(progress, 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 3
                }
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
              {progress}% complete
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

function QuickActionCard({ title, description, icon: Icon, onClick, color = 'primary' }) {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          borderColor: `${color}.main`
        },
        border: '1px solid transparent'
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
            <Icon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function WardenDashboard() {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })
  const nav = useNavigate()

  // Load dashboard data
  const loadDashboard = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/warden-overview')
      setData(res.data)
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { loadDashboard() }, [loadDashboard])

  // Mock recent activities for demonstration
  const recentActivities = [
    { id: 1, type: 'application', message: '15 new room applications received', time: '2 hours ago', icon: Assignment, color: 'primary' },
    { id: 2, type: 'complaint', message: 'Maintenance complaint escalated to warden', time: '4 hours ago', icon: ReportProblem, color: 'warning' },
    { id: 3, type: 'fee', message: 'Fee collection target achieved (95%)', time: '6 hours ago', icon: Payment, color: 'success' },
    { id: 4, type: 'security', message: 'Security incident reported in Block A', time: '8 hours ago', icon: Security, color: 'error' },
    { id: 5, type: 'discipline', message: 'Disciplinary action taken for 3 students', time: '1 day ago', icon: Gavel, color: 'info' },
  ]

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    )
  }

  const stats = data || { students: 0, boys: 0, girls: 0, occupancy: 0, openComplaints: 0, feePaymentRate: 0 }

  // Mock trends for demonstration
  const mockTrends = { students: 3, occupancy: 5, feePaymentRate: -2, complaints: -15 }

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
            <SupervisorAccount sx={{ mr: 2, verticalAlign: 'middle' }} />
            Warden Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Central control panel for comprehensive hostel management and supervision
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label="Live Data"
              color="success"
              size="small"
              icon={<CheckCircle />}
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
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Total Students"
            value={stats.students}
            subtitle={`Boys: ${stats.boys} | Girls: ${stats.girls}`}
            icon={People}
            color="primary"
            trend={mockTrends.students}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Occupancy Rate"
            value={`${stats.occupancy}%`}
            subtitle="Current capacity utilization"
            icon={Business}
            color="secondary"
            progress={stats.occupancy}
            showProgress={true}
            trend={mockTrends.occupancy}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Fee Payment Status"
            value={`${stats.feePaymentRate}%`}
            subtitle="Students with cleared dues"
            icon={Payment}
            color="success"
            progress={stats.feePaymentRate}
            showProgress={true}
            trend={mockTrends.feePaymentRate}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Open Complaints"
            value={stats.openComplaints}
            subtitle="Pending complaints"
            icon={ReportProblem}
            color="warning"
            trend={mockTrends.complaints}
          />
        </Grid>
      </Grid>

      {/* Quick Actions & Recent Activities */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Quick Actions
                </Typography>
                <Tooltip title="Refresh Dashboard">
                  <IconButton onClick={loadDashboard} disabled={loading}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Approve Applications"
                    description="Review and approve student applications"
                    icon={Assignment}
                    color="primary"
                    onClick={() => nav('/warden/applications')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Manage Blocks"
                    description="Oversee block operations and maintenance"
                    icon={Business}
                    color="secondary"
                    onClick={() => nav('/warden/blocks')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Handle Complaints"
                    description="Manage and resolve student complaints"
                    icon={ReportProblem}
                    color="warning"
                    onClick={() => nav('/warden/complaints')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Monitor Fees"
                    description="Track fee payments and collections"
                    icon={Payment}
                    color="success"
                    onClick={() => nav('/warden/fees')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Security Management"
                    description="Handle security incidents and access"
                    icon={Security}
                    color="error"
                    onClick={() => nav('/warden/security')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Generate Reports"
                    description="Export comprehensive reports"
                    icon={Assessment}
                    color="info"
                    onClick={() => nav('/warden/reports')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Student Management"
                    description="Manage student records and allocations"
                    icon={People}
                    color="primary"
                    onClick={() => nav('/warden/students')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Discipline Actions"
                    description="Track disciplinary measures"
                    icon={Gavel}
                    color="warning"
                    onClick={() => nav('/warden/discipline')}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <QuickActionCard
                    title="Room Reallocations"
                    description="Manage room changes and swaps"
                    icon={SwapHoriz}
                    color="secondary"
                    onClick={() => nav('/warden/reallocations')}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
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
          </Card>
        </Grid>
      </Grid>

      {/* Additional Management Sections */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                <SupervisorAccount sx={{ mr: 1, verticalAlign: 'middle' }} />
                RC Supervision
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Monitor Residential Counselor performance and activities
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SupervisorAccount />}
                  onClick={() => nav('/warden/rc-supervision')}
                  sx={{ mb: 1 }}
                >
                  View RC Performance
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Feedback />}
                  onClick={() => nav('/warden/feedback')}
                >
                  Collect Feedback
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                System Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Key performance indicators and system health
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="All Systems Operational" color="success" size="small" />
                <Chip label="95% Uptime" color="success" size="small" />
                <Chip label="Real-time Updates" color="info" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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