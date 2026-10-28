import React from 'react'
import { api } from '../../api'
import {
  Box, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Typography, Paper, Card, CardContent, Grid,
  Chip, Avatar, IconButton, Tooltip, CircularProgress, Snackbar, Alert,
  InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions,
  Fab, Divider, Badge, TableContainer
} from '@mui/material'
import {
  QrCode, Refresh, Upload, Add, CheckCircle, Cancel, Schedule,
  AccessTime, LocationOn, Person, Event, Search, FilterList,
  CloudUpload, FileUpload
} from '@mui/icons-material'

export default function RCAttendance(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0,10))
  const [attendance, setAttendance] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Override dialog state
  const [overrideDialog, setOverrideDialog] = React.useState(false)
  const [override, setOverride] = React.useState({ student_id:'', timestamp:'' })

  // QR token state
  const [token, setToken] = React.useState({ code:'------', expires_at:null, period:60 })
  const [qrLoading, setQrLoading] = React.useState(false)

  // Bulk upload state
  const [bulkDialog, setBulkDialog] = React.useState(false)
  const [csv, setCsv] = React.useState('')
  const [bulkRes, setBulkRes] = React.useState(null)
  const [bulkLoading, setBulkLoading] = React.useState(false)

  // Load blocks and set default
  React.useEffect(() => {
    const loadBlocks = async () => {
      try {
        const r = await api.get('/api/rc/blocks')
        setBlocks(r.data || [])
        if (r.data && r.data[0]) {
          setBlockId(r.data[0].id)
        }
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to load blocks', severity: 'error' })
      }
    }
    loadBlocks()
  }, [])

  // Load attendance data
  const loadAttendance = React.useCallback(async () => {
    if (!blockId) return

    try {
      setLoading(true)
      const r = await api.get(`/api/rc/blocks/${blockId}/attendance`, { params: { date } })
      setAttendance(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load attendance', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [blockId, date])

  React.useEffect(() => { loadAttendance() }, [loadAttendance])

  // Load QR token
  const loadToken = async () => {
    try {
      setQrLoading(true)
      const r = await api.get('/api/attendance/qr-token')
      setToken(r.data)
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load QR token', severity: 'error' })
    } finally {
      setQrLoading(false)
    }
  }

  React.useEffect(() => {
    loadToken()
    const t = setInterval(loadToken, 15000)
    return () => clearInterval(t)
  }, [])

  // Filter attendance based on search term
  const filteredAttendance = React.useMemo(() => {
    if (!searchTerm) return attendance
    return attendance.filter(record =>
      record.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [attendance, searchTerm])

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = attendance.length
    const biometric = attendance.filter(r => r.method === 'biometric').length
    const qr = attendance.filter(r => r.method === 'qr').length
    const manual = attendance.filter(r => r.method === 'manual').length

    // Calculate time-based stats (assuming 8 AM cutoff for morning attendance)
    const morningCutoff = new Date(date + 'T08:00:00')
    const onTime = attendance.filter(r => new Date(r.timestamp) <= morningCutoff).length
    const late = total - onTime

    return { total, biometric, qr, manual, onTime, late }
  }, [attendance, date])

  // Apply override
  const applyOverride = async () => {
    try {
      await api.post('/api/attendance/override', override)
      setSnackbar({ open: true, message: 'Override applied successfully', severity: 'success' })
      setOverrideDialog(false)
      setOverride({ student_id:'', timestamp:'' })
      loadAttendance()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to apply override', severity: 'error' })
    }
  }

  // Submit bulk upload
  const submitBulk = async () => {
    try {
      setBulkLoading(true)
      const r = await api.post('/api/attendance/bulk-upload', { csv })
      setBulkRes(r.data)
      setSnackbar({
        open: true,
        message: `Bulk upload completed: ${r.data.inserted} inserted, ${r.data.errors?.length || 0} errors`,
        severity: r.data.errors?.length > 0 ? 'warning' : 'success'
      })
      if (r.data.inserted > 0) {
        loadAttendance()
        setBulkDialog(false)
        setCsv('')
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Bulk upload failed', severity: 'error' })
    } finally {
      setBulkLoading(false)
    }
  }

  const getMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'biometric': return 'primary'
      case 'qr': return 'secondary'
      case 'manual': return 'warning'
      default: return 'default'
    }
  }

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'biometric': return <Person />
      case 'qr': return <QrCode />
      case 'manual': return <Add />
      default: return <AccessTime />
    }
  }

  const isLate = (timestamp) => {
    const recordTime = new Date(timestamp)
    const morningCutoff = new Date(date + 'T08:00:00')
    return recordTime > morningCutoff
  }
  return (
    <Box sx={{ p: 3 }}>
      {/* Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <Event sx={{ mr: 2, verticalAlign: 'middle' }} />
          Attendance Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Monitor and manage student attendance with QR codes and bulk operations
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.biometric}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Biometric
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <QrCode sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {stats.qr}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                QR Code
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Add sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.manual}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manual
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.onTime}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                On Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTime sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.late}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Late
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code and Controls */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} />
                  QR Code Token
                </Typography>
                <Tooltip title="Refresh Token">
                  <IconButton onClick={loadToken} disabled={qrLoading} size="small">
                    <Refresh sx={{ color: qrLoading ? 'grey.400' : 'primary.main' }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h2" sx={{ letterSpacing: 4, fontWeight: 900, fontFamily: 'monospace' }}>
                  {token.code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expires: {token.expires_at ? new Date(token.expires_at).toLocaleTimeString() : 'Loading...'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                Filters & Actions
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Block</InputLabel>
                    <Select
                      value={blockId}
                      onChange={(e) => setBlockId(e.target.value)}
                      label="Select Block"
                    >
                      {blocks.map(b => (
                        <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    label="Attendance Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search Records"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setOverrideDialog(true)}
                      size="small"
                    >
                      Override
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={() => setBulkDialog(true)}
                      size="small"
                    >
                      Bulk Upload
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Method</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No attendance records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {record.student_id?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {record.student_id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(record.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getMethodIcon(record.method)}
                            label={record.method || 'Unknown'}
                            color={getMethodColor(record.method)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, color: 'action.active', fontSize: 18 }} />
                            <Typography variant="body2">
                              {record.location || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={isLate(record.timestamp) ? 'Late' : 'On Time'}
                            color={isLate(record.timestamp) ? 'error' : 'success'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog open={overrideDialog} onClose={() => setOverrideDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Attendance Override</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID"
                value={override.student_id}
                onChange={(e) => setOverride({ ...override, student_id: e.target.value })}
                placeholder="e.g., U12345"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Timestamp"
                value={override.timestamp}
                onChange={(e) => setOverride({ ...override, timestamp: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverrideDialog(false)}>Cancel</Button>
          <Button onClick={applyOverride} variant="contained">Apply Override</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkDialog} onClose={() => setBulkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Upload Attendance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Format: student_id,timestamp[,method,location]
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Example: U123,2025-09-21T08:00:00Z,biometric,gate
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={8}
            label="CSV Data"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder="U123,2025-09-21T08:00:00Z,biometric,gate&#10;U456,2025-09-21T08:05:00Z,qr,main_entrance"
          />
          {bulkRes && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Results:</strong> {bulkRes.inserted} records inserted
                {bulkRes.errors?.length > 0 && `, ${bulkRes.errors.length} errors`}
              </Typography>
              {bulkRes.errors?.length > 0 && (
                <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                  Errors: {bulkRes.errors.join(', ')}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog(false)}>Cancel</Button>
          <Button
            onClick={submitBulk}
            variant="contained"
            disabled={bulkLoading || !csv.trim()}
            startIcon={bulkLoading ? <CircularProgress size={16} /> : <FileUpload />}
          >
            {bulkLoading ? 'Uploading...' : 'Upload CSV'}
          </Button>
        </DialogActions>
      </Dialog>

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
