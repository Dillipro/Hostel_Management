import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab,
  IconButton, Tooltip, Alert, Snackbar, Fab, LinearProgress, InputAdornment, Avatar, Divider, Fade, Zoom
} from '@mui/material'
import {
  Security, Build, Lock, Warning, CheckCircle, Info, Refresh, Search, FilterList, Equalizer,
  Person, Business, Schedule, Description, Add, GetApp, Visibility, Edit, Delete,
  TableChart, ViewModule, Report, Assignment, AssignmentTurnedIn, Shield, VpnKey, Camera
} from '@mui/icons-material'

export default function WardenSecurity() {
  const navigate = useNavigate()
  const [incidents, setIncidents] = React.useState([])
  const [maintenance, setMaintenance] = React.useState([])
  const [accessLogs, setAccessLogs] = React.useState([])
  const [analytics, setAnalytics] = React.useState({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedIncidents: 0,
    maintenanceRequests: 0,
    pendingMaintenance: 0,
    accessViolations: 0
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState('table')
  const [filters, setFilters] = React.useState({
    type: '',
    status: '',
    blockId: ''
  })
  const [tabValue, setTabValue] = React.useState(0)
  const [incidentDialog, setIncidentDialog] = React.useState(false)
  const [maintenanceDialog, setMaintenanceDialog] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    severity: 'low',
    block_id: '',
    type: 'security'
  })

  React.useEffect(() => {
    loadData()
  }, [])

  React.useEffect(() => {
    loadIncidents()
    loadMaintenance()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock data for security incidents and maintenance
      // In a real implementation, these would come from dedicated API endpoints
      const mockIncidents = [
        {
          id: '1',
          title: 'Unauthorized Access Attempt',
          description: 'Suspicious individual attempting to enter Block A after hours',
          severity: 'high',
          status: 'investigating',
          block_id: 'block-a',
          reported_by: 'Security Guard',
          reported_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved_at: null
        },
        {
          id: '2',
          title: 'Lost Item Report',
          description: 'Student reported missing laptop from common area',
          severity: 'medium',
          status: 'resolved',
          block_id: 'block-b',
          reported_by: 'Student',
          reported_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          resolved_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ]

      const mockMaintenance = [
        {
          id: '1',
          title: 'Broken Light Fixture',
          description: 'Light fixture in corridor needs replacement',
          priority: 'medium',
          status: 'pending',
          block_id: 'block-a',
          requested_by: 'RC',
          requested_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_to: null
        },
        {
          id: '2',
          title: 'Leaking Faucet',
          description: 'Bathroom faucet leaking water continuously',
          priority: 'high',
          status: 'in-progress',
          block_id: 'block-c',
          requested_by: 'Student',
          requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          assigned_to: 'Maintenance Team'
        }
      ]

      const mockAccessLogs = [
        {
          id: '1',
          student_name: 'John Doe',
          block_name: 'Block A',
          access_type: 'entry',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'granted'
        },
        {
          id: '2',
          student_name: 'Jane Smith',
          block_name: 'Block B',
          access_type: 'exit',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'granted'
        }
      ]

      setIncidents(mockIncidents)
      setMaintenance(mockMaintenance)
      setAccessLogs(mockAccessLogs)

      // Calculate analytics
      const totalIncidents = mockIncidents.length
      const activeIncidents = mockIncidents.filter(i => i.status !== 'resolved').length
      const resolvedIncidents = mockIncidents.filter(i => i.status === 'resolved').length
      const maintenanceRequests = mockMaintenance.length
      const pendingMaintenance = mockMaintenance.filter(m => m.status === 'pending').length
      const accessViolations = mockAccessLogs.filter(l => l.status === 'denied').length

      setAnalytics({
        totalIncidents,
        activeIncidents,
        resolvedIncidents,
        maintenanceRequests,
        pendingMaintenance,
        accessViolations
      })

      setSnackbar({ open: true, message: 'Security data loaded successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to load security data:', err)
      setError('Failed to load security data. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load security data', severity: 'error' })
    }
    setLoading(false)
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = !searchTerm ||
      incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reported_by?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filters.type || incident.type === filters.type
    const matchesStatus = !filters.status || incident.status === filters.status
    const matchesBlock = !filters.blockId || incident.block_id === filters.blockId
    return matchesSearch && matchesType && matchesStatus && matchesBlock
  })

  const filteredMaintenance = maintenance.filter(item => {
    const matchesSearch = !searchTerm ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requested_by?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filters.status || item.status === filters.status
    const matchesBlock = !filters.blockId || item.block_id === filters.blockId
    return matchesSearch && matchesStatus && matchesBlock
  })

  const handleReportIncident = () => {
    setIncidentDialog(true)
    setFormData({
      title: '',
      description: '',
      severity: 'low',
      block_id: '',
      type: 'security'
    })
  }

  const handleReportMaintenance = () => {
    setMaintenanceDialog(true)
    setFormData({
      title: '',
      description: '',
      priority: 'low',
      block_id: '',
      type: 'maintenance'
    })
  }

  const submitReport = async () => {
    if (!formData.title || !formData.description || !formData.block_id) return

    try {
      // In a real implementation, this would call the appropriate API
      setSnackbar({
        open: true,
        message: `${formData.type === 'security' ? 'Incident' : 'Maintenance request'} reported successfully`,
        severity: 'success'
      })
      setIncidentDialog(false)
      setMaintenanceDialog(false)
      setFormData({ title: '', description: '', severity: 'low', block_id: '', type: 'security' })
      loadData()
    } catch (err) {
      console.error('Failed to submit report:', err)
      setSnackbar({ open: true, message: 'Failed to submit report', severity: 'error' })
    }
  }

  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      // Mock status update
      setIncidents(prev => prev.map(incident =>
        incident.id === incidentId
          ? { ...incident, status: newStatus, resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null }
          : incident
      ))
      setSnackbar({ open: true, message: 'Incident status updated successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to update incident status:', err)
      setSnackbar({ open: true, message: 'Failed to update incident status', severity: 'error' })
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'success'
      case 'investigating':
      case 'in-progress': return 'warning'
      case 'pending': return 'info'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
      default: return 'default'
    }
  }

  return (
    <Box>
      {/* Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 2,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Security & Maintenance
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Monitor security incidents, facility maintenance, and access control across your blocks
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Security />}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              onClick={() => setIncidentDialog(true)}
            >
              Report Incident
            </Button>
            <Button
              variant="outlined"
              startIcon={<Build />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={() => setMaintenanceDialog(true)}
            >
              Maintenance Request
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Export Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={loadData}
              disabled={loading}
            >
              Refresh Data
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Active Incidents</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.activeIncidents}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Resolved</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.resolvedIncidents}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Build sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Maintenance</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.maintenanceRequests}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Zoom in={true} style={{ transitionDelay: '400ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Schedule sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Pending</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.pendingMaintenance}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Zoom in={true} style={{ transitionDelay: '500ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VpnKey sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Access Logs</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{accessLogs.length}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Zoom in={true} style={{ transitionDelay: '600ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #607d8b 0%, #90a4ae 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Shield sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Violations</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.accessViolations}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search incidents or maintenance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status Filter"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="investigating">Investigating</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Block Filter</InputLabel>
              <Select
                value={filters.blockId}
                onChange={(e) => setFilters(prev => ({ ...prev, blockId: e.target.value }))}
                label="Block Filter"
              >
                <MenuItem value="">All Blocks</MenuItem>
                <MenuItem value="block-a">Block A</MenuItem>
                <MenuItem value="block-b">Block B</MenuItem>
                <MenuItem value="block-c">Block C</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ minHeight: 40 }}
            >
              <Tab icon={<Security />} label="Incidents" />
              <Tab icon={<Build />} label="Maintenance" />
              <Tab icon={<VpnKey />} label="Access Logs" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {tabValue === 0 && (
          <Box>
            {viewMode === 'table' ? (
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell><strong>Title</strong></TableCell>
                      <TableCell><strong>Severity</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Block</strong></TableCell>
                      <TableCell><strong>Reported By</strong></TableCell>
                      <TableCell><strong>Reported At</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <LinearProgress sx={{ mb: 2 }} />
                          <Typography>Loading incidents...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredIncidents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Info sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">No security incidents found</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or check back later
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredIncidents.map(incident => (
                        <TableRow key={incident.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">{incident.title}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {incident.description.length > 50 ? `${incident.description.substring(0, 50)}...` : incident.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={getSeverityColor(incident.severity)}
                              label={incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={getStatusColor(incident.status)}
                              label={incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell>{incident.block_id.replace('-', ' ').toUpperCase()}</TableCell>
                          <TableCell>{incident.reported_by}</TableCell>
                          <TableCell>{new Date(incident.reported_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View Details">
                                <IconButton size="small" color="primary">
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {incident.status !== 'resolved' && (
                                <Tooltip title="Mark as Resolved">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={3}>
                {loading ? (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <LinearProgress sx={{ width: '50%' }} />
                    </Box>
                  </Grid>
                ) : filteredIncidents.length === 0 ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Info sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">No security incidents found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or check back later
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  filteredIncidents.map(incident => (
                    <Grid item xs={12} md={6} lg={4} key={incident.id}>
                      <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Security sx={{ mr: 2, color: 'error.main' }} />
                            <Box>
                              <Typography variant="h6" fontWeight="medium">
                                {incident.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {incident.block_id.replace('-', ' ').toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {incident.description}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Severity</Typography>
                              <Chip
                                size="small"
                                color={getSeverityColor(incident.severity)}
                                label={incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip
                                size="small"
                                color={getStatusColor(incident.status)}
                                label={incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Reported By</Typography>
                              <Typography variant="body2">{incident.reported_by}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Reported</Typography>
                              <Typography variant="body2">{new Date(incident.reported_at).toLocaleDateString()}</Typography>
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button size="small" startIcon={<Visibility />} variant="outlined" fullWidth>
                              View Details
                            </Button>
                            {incident.status !== 'resolved' && (
                              <Button
                                size="small"
                                startIcon={<CheckCircle />}
                                variant="outlined"
                                color="success"
                                onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                              >
                                Resolve
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {viewMode === 'table' ? (
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell><strong>Title</strong></TableCell>
                      <TableCell><strong>Priority</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Block</strong></TableCell>
                      <TableCell><strong>Requested By</strong></TableCell>
                      <TableCell><strong>Requested At</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <LinearProgress sx={{ mb: 2 }} />
                          <Typography>Loading maintenance requests...</Typography>
                        </TableCell>
                      </TableRow>
                    ) : filteredMaintenance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Info sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">No maintenance requests found</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters or check back later
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMaintenance.map(item => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">{item.title}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={getPriorityColor(item.priority)}
                              label={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              color={getStatusColor(item.status)}
                              label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell>{item.block_id.replace('-', ' ').toUpperCase()}</TableCell>
                          <TableCell>{item.requested_by}</TableCell>
                          <TableCell>{new Date(item.requested_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View Details">
                                <IconButton size="small" color="primary">
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              {item.status === 'pending' && (
                                <Tooltip title="Assign to Team">
                                  <IconButton size="small" color="warning">
                                    <Assignment />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={3}>
                {loading ? (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <LinearProgress sx={{ width: '50%' }} />
                    </Box>
                  </Grid>
                ) : filteredMaintenance.length === 0 ? (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <Info sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">No maintenance requests found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or check back later
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  filteredMaintenance.map(item => (
                    <Grid item xs={12} md={6} lg={4} key={item.id}>
                      <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Build sx={{ mr: 2, color: 'warning.main' }} />
                            <Box>
                              <Typography variant="h6" fontWeight="medium">
                                {item.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.block_id.replace('-', ' ').toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {item.description}
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Priority</Typography>
                              <Chip
                                size="small"
                                color={getPriorityColor(item.priority)}
                                label={item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip
                                size="small"
                                color={getStatusColor(item.status)}
                                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Requested By</Typography>
                              <Typography variant="body2">{item.requested_by}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="text.secondary">Requested</Typography>
                              <Typography variant="body2">{new Date(item.requested_at).toLocaleDateString()}</Typography>
                            </Grid>
                          </Grid>
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button size="small" startIcon={<Visibility />} variant="outlined" fullWidth>
                              View Details
                            </Button>
                            {item.status === 'pending' && (
                              <Button
                                size="small"
                                startIcon={<Assignment />}
                                variant="outlined"
                                color="warning"
                              >
                                Assign
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><strong>Student</strong></TableCell>
                    <TableCell><strong>Block</strong></TableCell>
                    <TableCell><strong>Access Type</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Timestamp</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <LinearProgress sx={{ mb: 2 }} />
                        <Typography>Loading access logs...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : accessLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Info sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">No access logs found</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Access logs will appear here when available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    accessLogs.map(log => (
                      <TableRow key={log.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {log.student_name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Typography variant="body1">{log.student_name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{log.block_name}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={log.access_type === 'entry' ? 'success' : 'info'}
                            label={log.access_type.charAt(0).toUpperCase() + log.access_type.slice(1)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={log.status === 'granted' ? 'success' : 'error'}
                            label={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          />
                        </TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Zoom in={true}>
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setIncidentDialog(true)}
        >
          <Add />
        </Fab>
      </Zoom>

      {/* Incident Report Dialog */}
      <Dialog open={incidentDialog} onClose={() => setIncidentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Security sx={{ mr: 1 }} />
          Report Security Incident
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Incident Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                  label="Severity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Block</InputLabel>
                <Select
                  value={formData.block_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, block_id: e.target.value }))}
                  label="Block"
                >
                  <MenuItem value="block-a">Block A</MenuItem>
                  <MenuItem value="block-b">Block B</MenuItem>
                  <MenuItem value="block-c">Block C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed description of the incident..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncidentDialog(false)}>Cancel</Button>
          <Button
            onClick={submitReport}
            variant="contained"
            color="error"
            disabled={!formData.title || !formData.description || !formData.block_id}
            startIcon={<Security />}
          >
            Report Incident
          </Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Report Dialog */}
      <Dialog open={maintenanceDialog} onClose={() => setMaintenanceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Build sx={{ mr: 1 }} />
          Report Maintenance Issue
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Issue Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Block</InputLabel>
                <Select
                  value={formData.block_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, block_id: e.target.value }))}
                  label="Block"
                >
                  <MenuItem value="block-a">Block A</MenuItem>
                  <MenuItem value="block-b">Block B</MenuItem>
                  <MenuItem value="block-c">Block C</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed description of the maintenance issue..."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog(false)}>Cancel</Button>
          <Button
            onClick={submitReport}
            variant="contained"
            color="warning"
            disabled={!formData.title || !formData.description || !formData.block_id}
            startIcon={<Build />}
          >
            Report Issue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
