import React from 'react'
import { api } from '../../api'
import {
  Box, Select, MenuItem, Paper, Typography, Card, CardContent, Grid,
  Button, CircularProgress, Snackbar, Alert, InputLabel, FormControl,
  TextField, Divider, Chip, Avatar, IconButton, Tooltip, Fab
} from '@mui/material'
import {
  Assessment, Download, Refresh, DateRange, People, Business,
  CheckCircle, ReportProblem, Payment, TrendingUp, BarChart,
  PieChart, Timeline
} from '@mui/icons-material'

export default function RCReports(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [reportType, setReportType] = React.useState('occupancy')
  const [dateRange, setDateRange] = React.useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days ago
    end: new Date().toISOString().slice(0, 10)
  })
  const [reports, setReports] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

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

  // Load report data
  const loadReport = React.useCallback(async () => {
    if (!blockId) return

    try {
      setLoading(true)
      const endpoints = {
        occupancy: `/api/rc/blocks/${blockId}/reports/occupancy`,
        attendance: `/api/rc/blocks/${blockId}/reports/attendance?start=${dateRange.start}&end=${dateRange.end}`,
        complaints: `/api/rc/blocks/${blockId}/reports/complaints?start=${dateRange.start}&end=${dateRange.end}`,
        fees: `/api/rc/blocks/${blockId}/reports/fees`,
        applications: `/api/rc/blocks/${blockId}/reports/applications?start=${dateRange.start}&end=${dateRange.end}`
      }

      const r = await api.get(endpoints[reportType])
      setReports(prev => ({ ...prev, [reportType]: r.data }))
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load report data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [blockId, reportType, dateRange])

  React.useEffect(() => { loadReport() }, [loadReport])

  // Generate and download report
  const generateReport = async () => {
    try {
      setSnackbar({ open: true, message: 'Generating report...', severity: 'info' })

      const r = await api.get(`/api/rc/blocks/${blockId}/reports/${reportType}/export`, {
        params: { start: dateRange.start, end: dateRange.end },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([r.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportType}_report_${blockId}_${dateRange.start}_to_${dateRange.end}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      setSnackbar({ open: true, message: 'Report downloaded successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate report', severity: 'error' })
    }
  }

  const currentReport = reports[reportType]

  // Render different report types
  const renderReportContent = () => {
    if (!currentReport) return null

    switch (reportType) {
      case 'occupancy':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Occupancy Overview</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>{currentReport.students || 0}</strong> students out of <strong>{currentReport.capacity || 0}</strong> capacity
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body1">
                      Occupancy Rate: <strong>{currentReport.capacity ? Math.round((currentReport.students / currentReport.capacity) * 100) : 0}%</strong>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Room Distribution</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Detailed breakdown of room occupancy by type and floor
                  </Typography>
                  {/* Placeholder for room distribution chart */}
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <BarChart sx={{ color: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary">
                      Chart visualization would be displayed here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )

      case 'attendance':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {currentReport.present || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ReportProblem sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {currentReport.absent || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Timeline sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {currentReport.late || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Late
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )

      case 'complaints':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Complaints Summary</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="primary.main">
                          {currentReport.total || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Complaints
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                          {currentReport.pending || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pending
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {currentReport.inProgress || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          In Progress
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {currentReport.resolved || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Resolved
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )

      default:
        return (
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Report Data</Typography>
              <Typography variant="body2" color="text.secondary">
                {JSON.stringify(currentReport, null, 2)}
              </Typography>
            </CardContent>
          </Card>
        )
    }
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
          <Assessment sx={{ mr: 2, verticalAlign: 'middle' }} />
          Reports & Analytics
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Generate comprehensive reports and analytics for your assigned blocks
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ borderRadius: 2, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="occupancy">Occupancy Report</MenuItem>
                  <MenuItem value="attendance">Attendance Report</MenuItem>
                  <MenuItem value="complaints">Complaints Report</MenuItem>
                  <MenuItem value="fees">Fees Report</MenuItem>
                  <MenuItem value="applications">Applications Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh Report">
                  <IconButton onClick={loadReport} disabled={loading}>
                    <Refresh sx={{ color: loading ? 'grey.400' : 'primary.main' }} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={generateReport}
                  disabled={!blockId || loading}
                  size="small"
                >
                  Download
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Generating report...</Typography>
        </Box>
      ) : (
        renderReportContent()
      )}

      {/* Report Summary */}
      {currentReport && (
        <Card sx={{ borderRadius: 2, mt: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <BarChart sx={{ mr: 1, verticalAlign: 'middle' }} />
              Report Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Block</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {blocks.find(b => b.id === blockId)?.name || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateRange sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Date Range</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Report Type</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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
