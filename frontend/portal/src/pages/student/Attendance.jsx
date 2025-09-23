import React from 'react'
import Page from '../../components/Page'
import { api } from '../../api'
import {
  Box, Button, Typography, Card, CardContent, Grid, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  LinearProgress, IconButton, Tooltip, Divider, Paper, Alert,
  Snackbar, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer
} from '@mui/material'
import {
  CheckCircle, AccessTime, QrCode, Refresh, Schedule, LocationOn,
  CalendarToday, Timeline, TrendingUp, Info, Warning
} from '@mui/icons-material'

export default function StudentAttendance(){
  const [logs, setLogs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [qrDialog, setQrDialog] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Mock QR code for demonstration - in real app, this would come from API
  const [qrCode, setQrCode] = React.useState('SAMPLE_QR_CODE_12345')

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const r = await api.get('/api/attendance/me')
      setLogs(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load attendance data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadAttendance() }, [])

  const scanAttendance = async (method) => {
    try {
      setSubmitting(true)
      const r = await api.post('/api/attendance/scan', {
        method,
        location: 'gate'
      })
      setSnackbar({
        open: true,
        message: 'Attendance marked successfully!',
        severity: 'success'
      })
      await loadAttendance()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Failed to mark attendance',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const scanCodeAttendance = async () => {
    if (!code || code.length !== 6) {
      setSnackbar({ open: true, message: 'Please enter a valid 6-digit code', severity: 'error' })
      return
    }

    try {
      setSubmitting(true)
      const r = await api.post('/api/attendance/scan-token', {
        code,
        location: 'gate'
      })
      setCode('')
      setSnackbar({
        open: true,
        message: 'Attendance marked successfully!',
        severity: 'success'
      })
      await loadAttendance()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Failed to mark attendance',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const totalLogs = logs.length
    const thisMonthLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp)
      const now = new Date()
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()
    })

    // Assuming hostel requires attendance logging twice daily (in/out)
    const expectedDays = new Date().getDate() // Days in current month so far
    const expectedLogs = expectedDays * 2 // 2 logs per day
    const attendancePercentage = expectedLogs > 0 ? Math.round((thisMonthLogs.length / expectedLogs) * 100) : 0

    return {
      totalLogs,
      thisMonthLogs: thisMonthLogs.length,
      attendancePercentage,
      expectedLogs
    }
  }

  const stats = getAttendanceStats()

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'qr': return <QrCode />
      case 'code': return <AccessTime />
      default: return <CheckCircle />
    }
  }

  const getMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'qr': return 'primary'
      case 'code': return 'secondary'
      default: return 'success'
    }
  }
  return (
    <Page title="Attendance">
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📊 Attendance Tracking
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Monitor your hostel attendance and mark entries/exits
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<QrCode />}
              onClick={() => setQrDialog(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Scan QR Code
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccessTime />}
              onClick={() => scanAttendance('manual')}
              disabled={submitting}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {submitting ? 'Marking...' : 'Mark Attendance'}
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
      </Box>

      {/* Attendance Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.attendancePercentage}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    This Month
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.thisMonthLogs}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Logs This Month
                  </Typography>
                </Box>
                <CalendarToday sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.expectedLogs}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Expected Logs
                  </Typography>
                </Box>
                <Timeline sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.totalLogs}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Logs
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Manual Code Entry */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
            🔢 Manual Code Entry
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            If QR scanning is not available, enter the 6-digit code displayed at the gate
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              label="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              inputProps={{ maxLength: 6 }}
              sx={{ minWidth: 150 }}
            />
            <Button
              variant="contained"
              onClick={scanCodeAttendance}
              disabled={submitting || code.length !== 6}
              startIcon={submitting ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <AccessTime />}
            >
              {submitting ? 'Submitting...' : 'Submit Code'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                📅 Attendance History
              </Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={loadAttendance} disabled={loading}>
                  <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography>Loading attendance history...</Typography>
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No attendance records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your attendance history will appear here once you start logging entries
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><strong>Date & Time</strong></TableCell>
                    <TableCell><strong>Method</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {new Date(log.timestamp).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getMethodIcon(log.method)}
                          label={log.method || 'Manual'}
                          size="small"
                          color={getMethodColor(log.method)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {log.location || 'Gate'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<CheckCircle />}
                          label="Marked"
                          size="small"
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <QrCode />
          Scan QR Code
        </DialogTitle>
        <DialogContent sx={{ pt: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Scan this QR code at the hostel gate
          </Typography>

          {/* Mock QR Code Display */}
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mx: 'auto',
              maxWidth: 200,
              bgcolor: 'white',
              border: '2px solid #4caf50'
            }}
          >
            <Box
              sx={{
                width: 150,
                height: 150,
                mx: 'auto',
                bgcolor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <QrCode sx={{ fontSize: 80, color: 'white' }} />
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
              {qrCode}
            </Typography>
          </Paper>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>How to use:</strong> Open your phone's camera or QR scanner app and point it at this code when entering/leaving the hostel.
            </Typography>
          </Alert>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => scanAttendance('qr')}
              disabled={submitting}
              startIcon={submitting ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle />}
              sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' }}
            >
              {submitting ? 'Marking Attendance...' : 'Mark Attendance Now'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Page>
  )
}
