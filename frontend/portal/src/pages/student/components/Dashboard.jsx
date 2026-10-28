import React from 'react'
import { Box, Button, Typography, Grid, Card, CardContent, Avatar, Chip, LinearProgress, Divider, List, ListItem, ListItemText, ListItemIcon } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Page from '../../../components/Page'
import SchoolIcon from '@mui/icons-material/School'
import PaymentIcon from '@mui/icons-material/Payment'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AnnouncementIcon from '@mui/icons-material/Announcement'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { api } from '../../../api'

function QuickActionButton({ to, icon: Icon, label, color = 'primary', variant = 'outlined' }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      variant={variant}
      startIcon={<Icon />}
      sx={{
        minWidth: 120,
        borderRadius: 2,
        textTransform: 'none',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2
        },
        transition: 'all 0.2s ease'
      }}
      color={color}
    >
      {label}
    </Button>
  )
}

function StatusCard({ title, value, subtitle, icon: Icon, color = 'primary', progress }) {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, ${color === 'primary' ? '#6a4cff' : color === 'secondary' ? '#ff6aa2' : color === 'success' ? '#4caf50' : color === 'warning' ? '#ff9800' : '#2196f3'} 0%, ${color === 'primary' ? '#8c66ff' : color === 'secondary' ? '#ffa0c2' : color === 'success' ? '#66bb6a' : color === 'warning' ? '#ffb74d' : '#64b5f6'} 100%)`,
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        width: 60,
        height: 60,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        transform: 'translate(20px, -20px)'
      }
    }}>
      <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Icon sx={{ fontSize: 20 }} />
          <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {subtitle}
          </Typography>
        )}
        {progress !== undefined && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default function StudentDashboard({ me }){
  const [loading, setLoading] = React.useState(true)
  const [dashboardData, setDashboardData] = React.useState({
    feesPaid: 0,
    attendance: 0,
    complaints: 0,
    applications: 0,
    notifications: 0
  })

  // Load dashboard data
  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        // In a real app, you'd fetch this data from multiple endpoints
        // For now, we'll simulate with mock data based on the student
        const mockData = {
          feesPaid: Math.floor(Math.random() * 100), // Mock percentage
          attendance: Math.floor(Math.random() * 100), // Mock percentage
          complaints: Math.floor(Math.random() * 5), // Mock count
          applications: Math.floor(Math.random() * 3), // Mock count
          notifications: Math.floor(Math.random() * 10) // Mock count
        }
        setDashboardData(mockData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [me])

  const recentActivities = [
    { id: 1, action: 'Fee payment received', time: '2 hours ago', icon: PaymentIcon, color: 'success' },
    { id: 2, action: 'Attendance marked', time: '1 day ago', icon: CheckCircleIcon, color: 'primary' },
    { id: 3, action: 'Application submitted', time: '3 days ago', icon: AssignmentIcon, color: 'secondary' },
    { id: 4, action: 'Complaint resolved', time: '1 week ago', icon: ReportProblemIcon, color: 'warning' }
  ]

  const quickActions = [
    { to: "/student/admission", icon: SchoolIcon, label: "Admission", color: "primary" },
    { to: "/student/fees", icon: PaymentIcon, label: "Fees", color: "success" },
    { to: "/student/complaints", icon: ReportProblemIcon, label: "Complaints", color: "warning" },
    { to: "/student/idcard", icon: CreditCardIcon, label: "ID Card", color: "secondary" },
    { to: "/student/attendance", icon: CheckCircleIcon, label: "Attendance", color: "info" },
    { to: "/student/applications", icon: AssignmentIcon, label: "Applications", color: "primary" }
  ]

  return (
    <Page title="Student Dashboard">
      {/* Welcome Header */}
      <Box sx={{ mb: 4, p: 3, background: 'linear-gradient(135deg, #6a4cff 0%, #8c66ff 100%)', borderRadius: 3, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.3)'
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Welcome back, {me?.name || 'Student'}!
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Here's your hostel overview for today
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                label="Active Student"
                color="success"
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip
                label={me?.course || 'Course'}
                variant="outlined"
                size="small"
                sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Status Cards */}
      {loading ? (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card sx={{ borderRadius: 3, p: 2 }}>
                  <LinearProgress sx={{ mb: 2 }} />
                  <Typography>Loading...</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard
              title="Fees Paid"
              value={`${dashboardData.feesPaid}%`}
              subtitle="₹12,000 of ₹14,000"
              icon={PaymentIcon}
              color="success"
              progress={dashboardData.feesPaid}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard
              title="Attendance"
              value={`${dashboardData.attendance}%`}
              subtitle="This month"
              icon={CheckCircleIcon}
              color="primary"
              progress={dashboardData.attendance}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard
              title="Open Items"
              value={dashboardData.complaints + dashboardData.applications}
              subtitle={`${dashboardData.complaints} complaints, ${dashboardData.applications} applications`}
              icon={ReportProblemIcon}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatusCard
              title="Notifications"
              value={dashboardData.notifications}
              subtitle="Unread messages"
              icon={NotificationsIcon}
              color="secondary"
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                ⚡ Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action) => (
                  <Grid item xs={6} key={action.to}>
                    <Button
                      component={RouterLink}
                      to={action.to}
                      variant="contained"
                      fullWidth
                      startIcon={<action.icon />}
                      sx={{
                        minHeight: 80,
                        borderRadius: 2,
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${action.color === 'primary' ? '#667eea' : action.color === 'success' ? '#4caf50' : action.color === 'warning' ? '#ff9800' : action.color === 'secondary' ? '#9c27b0' : action.color === 'info' ? '#2196f3' : '#667eea'} 0%, ${action.color === 'primary' ? '#764ba2' : action.color === 'success' ? '#66bb6a' : action.color === 'warning' ? '#ffb74d' : action.color === 'secondary' ? '#ba68c8' : action.color === 'info' ? '#64b5f6' : '#764ba2'} 100%)`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        },
                        transition: 'all 0.2s ease'
                      }}
                      color={action.color}
                    >
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  📋 Recent Activity
                </Typography>
                <Chip
                  label={`${recentActivities.length} activities`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
              <List sx={{ p: 0 }}>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar sx={{
                          width: 32,
                          height: 32,
                          bgcolor: `${activity.color}.main`
                        }}>
                          <activity.icon sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={activity.time}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500
                        }}
                        secondaryTypographyProps={{
                          variant: 'caption',
                          color: 'text.secondary'
                        }}
                      />
                    </ListItem>
                    {index < recentActivities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  component={RouterLink}
                  to="/student/activity"
                  variant="text"
                  size="small"
                  sx={{ textTransform: 'none' }}
                >
                  View all activity →
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Announcements */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <AnnouncementIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  📢 Latest Announcements
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Stay updated with the latest hostel news and important notices.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to="/student/circulars"
                  variant="outlined"
                  startIcon={<AnnouncementIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  View All Circulars
                </Button>
                <Button
                  component={RouterLink}
                  to="/student/notifications"
                  variant="text"
                  startIcon={<NotificationsIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Notifications ({dashboardData.notifications})
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  )
}
