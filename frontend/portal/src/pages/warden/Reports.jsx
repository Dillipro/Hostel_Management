import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { Box, Typography, Grid, Card, CardContent, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Chip, TextField, FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
  IconButton, Tooltip, Alert, Snackbar, Fab, LinearProgress, InputAdornment, Avatar, Divider, Fade, Zoom, Container } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import {
  Assessment, BarChart, PieChart, TrendingUp, Equalizer, GetApp, Refresh, Search, FilterList,
  Business, Person, Payment, ReportProblem, Gavel, Assignment, AssignmentTurnedIn, People
} from '@mui/icons-material'

export default function WardenReports() {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = React.useState({
    blocks: [],
    fees: { totalCollected: 0, totalDue: 0, collectionRate: 0 },
    complaints: { total: 0, resolved: 0, pending: 0 },
    discipline: { total: 0, active: 0, resolved: 0 },
    students: { total: 0, active: 0, inactive: 0 }
  })
  const [reports, setReports] = React.useState({
    blockOccupancy: [],
    feeCollection: [],
    complaintResolution: [],
    disciplinaryActions: []
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [dateRange, setDateRange] = React.useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  })
  const [reportType, setReportType] = React.useState('overview')
  const [tabValue, setTabValue] = React.useState(0)

  React.useEffect(() => {
    loadAnalytics()
    loadReports()
  }, [dateRange])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get block data
      const blocksRes = await api.get('/api/rc/blocks')
      const blocks = blocksRes.data || []

      // Get fee analytics
      const feesRes = await api.get('/api/admin/warden-fees')
      const fees = feesRes.data || []
      const totalDue = fees.reduce((sum, f) => sum + f.amount_due, 0)
      const totalCollected = fees.reduce((sum, f) => sum + f.amount_paid, 0)

      // Get complaint analytics
      const complaintsRes = await api.get('/api/complaints/warden-complaints')
      const complaints = complaintsRes.data || []

      // Get disciplinary analytics
      const disciplineRes = await api.get('/api/disciplinary/warden-disciplinary-analytics')
      const discipline = disciplineRes.data || {}

      // Get student analytics
      const studentsRes = await api.get('/api/rc/students')
      const students = studentsRes.data || []

      setAnalytics({
        blocks,
        fees: {
          totalCollected,
          totalDue,
          collectionRate: totalDue > 0 ? (totalCollected / totalDue) * 100 : 0
        },
        complaints: {
          total: complaints.length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          pending: complaints.filter(c => c.status !== 'resolved').length
        },
        discipline,
        students: {
          total: students.length,
          active: students.filter(s => s.status === 'active').length,
          inactive: students.filter(s => s.status !== 'active').length
        }
      })

      setSnackbar({ open: true, message: 'Analytics data loaded successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError('Failed to load analytics data. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load analytics data', severity: 'error' })
    }
    setLoading(false)
  }

  const loadReports = async () => {
    try {
      // Block occupancy report
      const blocksRes = await api.get('/api/rc/blocks')
      const blockOccupancy = blocksRes.data?.map(block => ({
        name: block.name,
        capacity: block.capacity,
        occupied: block.occupied_rooms || 0,
        occupancyRate: block.capacity > 0 ? ((block.occupied_rooms || 0) / block.capacity) * 100 : 0
      })) || []

      // Fee collection report
      const feesRes = await api.get('/api/admin/warden-fees')
      const feeCollection = feesRes.data?.reduce((acc, fee) => {
        const block = fee.student?.hostel?.name || 'Unknown'
        if (!acc[block]) {
          acc[block] = { block, totalDue: 0, totalPaid: 0, students: 0 }
        }
        acc[block].totalDue += fee.amount_due
        acc[block].totalPaid += fee.amount_paid
        acc[block].students += 1
        return acc
      }, {})

      // Complaint resolution report
      const complaintsRes = await api.get('/api/complaints/warden-complaints')
      const complaintResolution = complaintsRes.data?.reduce((acc, complaint) => {
        const block = complaint.student?.hostel?.name || 'Unknown'
        if (!acc[block]) {
          acc[block] = { block, total: 0, resolved: 0, pending: 0, avgResolutionTime: 0 }
        }
        acc[block].total += 1
        if (complaint.status === 'resolved') {
          acc[block].resolved += 1
        } else {
          acc[block].pending += 1
        }
        return acc
      }, {})

      // Disciplinary actions report
      const disciplineRes = await api.get('/api/disciplinary/warden-disciplinary')
      const disciplinaryActions = disciplineRes.data?.reduce((acc, record) => {
        const block = record.student?.hostel?.name || 'Unknown'
        if (!acc[block]) {
          acc[block] = { block, total: 0, active: 0, resolved: 0, bySeverity: {} }
        }
        acc[block].total += 1
        if (record.status === 'active') {
          acc[block].active += 1
        } else {
          acc[block].resolved += 1
        }
        acc[block].bySeverity[record.severity] = (acc[block].bySeverity[record.severity] || 0) + 1
        return acc
      }, {})

      setReports({
        blockOccupancy,
        feeCollection: Object.values(feeCollection || {}),
        complaintResolution: Object.values(complaintResolution || {}),
        disciplinaryActions: Object.values(disciplinaryActions || {})
      })

      setSnackbar({ open: true, message: 'Reports data loaded successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to load reports:', err)
      setSnackbar({ open: true, message: 'Failed to load reports data', severity: 'error' })
    }
  }

  const exportReport = (type) => {
    // Mock export functionality
    setSnackbar({ open: true, message: `${type} report exported successfully`, severity: 'success' })
  }

  const getOccupancyColor = (rate) => {
    if (rate >= 90) return 'success'
    if (rate >= 70) return 'warning'
    return 'error'
  }

  const getCollectionColor = (rate) => {
    if (rate >= 95) return 'success'
    if (rate >= 80) return 'warning'
    return 'error'
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Modern Gradient Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            borderRadius: 0,
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Assessment sx={{ mr: 2, fontSize: '2.5rem' }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                Reports & Analytics
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                Comprehensive reports and analytics for your assigned blocks and students
              </Typography>
            </Box>
          </Box>

          {/* Date Range Filter in Header */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 3 }}>
            <DatePicker
              label="Start Date"
              value={dateRange.start}
              onChange={(date) => setDateRange(prev => ({ ...prev, start: date }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                    '& .MuiOutlinedInput-input': { color: 'white' },
                  }}
                />
              )}
            />
            <DatePicker
              label="End Date"
              value={dateRange.end}
              onChange={(date) => setDateRange(prev => ({ ...prev, end: date }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.8)' },
                    '& .MuiOutlinedInput-input': { color: 'white' },
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              onClick={() => loadAnalytics()}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                border: '1px solid rgba(255,255,255,0.3)',
              }}
              startIcon={<Refresh />}
            >
              Refresh Data
            </Button>
          </Box>
        </Box>

        <Container maxWidth="xl">
          {/* Enhanced Analytics Cards with Zoom Animation */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ mr: 2, fontSize: '2rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Students
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {analytics.students.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {analytics.students.active} active, {analytics.students.inactive} inactive
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Payment sx={{ mr: 2, fontSize: '2rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Fee Collection
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    ₹{analytics.fees.totalCollected.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {analytics.fees.collectionRate.toFixed(1)}% of ₹{analytics.fees.totalDue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ReportProblem sx={{ mr: 2, fontSize: '2rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Complaints
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {analytics.complaints.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {analytics.complaints.resolved} resolved, {analytics.complaints.pending} pending
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Gavel sx={{ mr: 2, fontSize: '2rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Disciplinary Cases
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {analytics.discipline.totalRecords || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {analytics.discipline.activeRecords || 0} active, {analytics.discipline.resolvedRecords || 0} resolved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Report Tabs */}
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e0e0e0',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                },
              }}
            >
              <Tab label="Block Occupancy" icon={<Business />} iconPosition="start" />
              <Tab label="Fee Collection" icon={<Payment />} iconPosition="start" />
              <Tab label="Complaint Resolution" icon={<ReportProblem />} iconPosition="start" />
              <Tab label="Disciplinary Actions" icon={<Gavel />} iconPosition="start" />
            </Tabs>

            {/* Block Occupancy Report */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    Block Occupancy Report
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => exportReport('Block Occupancy')}
                    startIcon={<GetApp />}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                    }}
                  >
                    Export Report
                  </Button>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Block Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Occupied</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Occupancy Rate</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.blockOccupancy.map(block => (
                        <TableRow key={block.name} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{block.name}</TableCell>
                          <TableCell>{block.capacity}</TableCell>
                          <TableCell>{block.occupied}</TableCell>
                          <TableCell>{block.occupancyRate.toFixed(1)}%</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={getOccupancyColor(block.occupancyRate)}
                              label={block.occupancyRate >= 90 ? 'High' : block.occupancyRate >= 70 ? 'Medium' : 'Low'}
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Fee Collection Report */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    Fee Collection Report
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => exportReport('Fee Collection')}
                    startIcon={<GetApp />}
                    sx={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #e083eb 0%, #e5475c 100%)',
                      },
                    }}
                  >
                    Export Report
                  </Button>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Block</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Students</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Due</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Paid</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Collection Rate</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.feeCollection.map(block => {
                        const rate = block.totalDue > 0 ? (block.totalPaid / block.totalDue) * 100 : 0
                        return (
                          <TableRow key={block.block} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{block.block}</TableCell>
                            <TableCell>{block.students}</TableCell>
                            <TableCell>₹{block.totalDue.toLocaleString()}</TableCell>
                            <TableCell>₹{block.totalPaid.toLocaleString()}</TableCell>
                            <TableCell>{rate.toFixed(1)}%</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                color={getCollectionColor(rate)}
                                label={rate >= 95 ? 'Excellent' : rate >= 80 ? 'Good' : 'Needs Attention'}
                                sx={{ fontWeight: 500 }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Complaint Resolution Report */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    Complaint Resolution Report
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => exportReport('Complaint Resolution')}
                    startIcon={<GetApp />}
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3f9cee 0%, #00e2ee 100%)',
                      },
                    }}
                  >
                    Export Report
                  </Button>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Block</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Complaints</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Resolved</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Pending</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Resolution Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.complaintResolution.map(block => {
                        const rate = block.total > 0 ? (block.resolved / block.total) * 100 : 0
                        return (
                          <TableRow key={block.block} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{block.block}</TableCell>
                            <TableCell>{block.total}</TableCell>
                            <TableCell>{block.resolved}</TableCell>
                            <TableCell>{block.pending}</TableCell>
                            <TableCell>{rate.toFixed(1)}%</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Disciplinary Actions Report */}
            {tabValue === 3 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    Disciplinary Actions Report
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => exportReport('Disciplinary Actions')}
                    startIcon={<GetApp />}
                    sx={{
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #33d96b 0%, #28e9c7 100%)',
                      },
                    }}
                  >
                    Export Report
                  </Button>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Block</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total Cases</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Resolved</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Minor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Major</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Critical</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.disciplinaryActions.map(block => (
                        <TableRow key={block.block} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                          <TableCell sx={{ fontWeight: 500 }}>{block.block}</TableCell>
                          <TableCell>{block.total}</TableCell>
                          <TableCell>{block.active}</TableCell>
                          <TableCell>{block.resolved}</TableCell>
                          <TableCell>{block.bySeverity?.minor || 0}</TableCell>
                          <TableCell>{block.bySeverity?.major || 0}</TableCell>
                          <TableCell>{block.bySeverity?.critical || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Container>

        {/* Snackbar for notifications */}
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
    </LocalizationProvider>
  )
}