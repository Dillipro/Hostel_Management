import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Paper, TableContainer, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, Grid, IconButton, Tooltip, Alert, Snackbar, Fab, LinearProgress, Tabs, Tab, InputAdornment, Avatar
} from '@mui/material'
import {
  ReportProblem, Build, CheckCircle, Warning, Error, Info, Refresh, Search, FilterList, Assignment, Person, Business,
  Schedule, Description, PriorityHigh, Equalizer, Add, Visibility, Edit, Delete
} from '@mui/icons-material'

export default function WardenComplaints() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = React.useState([])
  const [blocks, setBlocks] = React.useState([])
  const [technicians, setTechnicians] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [selectedComplaint, setSelectedComplaint] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState('table')
  const [filters, setFilters] = React.useState({
    status: '',
    blockId: '',
    priority: ''
  })
  const [escalateDialog, setEscalateDialog] = React.useState(false)
  const [escalationNote, setEscalationNote] = React.useState('')

  React.useEffect(() => {
    loadData()
  }, [])

  React.useEffect(() => {
    loadComplaints()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const [blocksRes, techRes] = await Promise.all([
        api.get('/api/rc/blocks'),
        api.get('/api/admin/technicians')
      ])
      setBlocks(blocksRes.data || [])
      setTechnicians(techRes.data || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    }
    setLoading(false)
  }

  const loadComplaints = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const res = await api.get(`/api/complaints?${params}`)
      setComplaints(res.data || [])
      setSnackbar({ open: true, message: `Loaded ${res.data?.length || 0} complaints`, severity: 'success' })
    } catch (err) {
      console.error('Failed to load complaints:', err)
      setError('Failed to load complaints. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load complaints', severity: 'error' })
    }
    setLoading(false)
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })

  const updateStatus = async (id, status) => {
    try {
      await api.post(`/api/complaints/${id}/status`, { status })
      setSnackbar({ open: true, message: `Complaint status updated to ${status}`, severity: 'success' })
      loadComplaints()
    } catch (err) {
      console.error('Failed to update status:', err)
      setSnackbar({ open: true, message: 'Failed to update complaint status', severity: 'error' })
    }
  }

  const assignTechnician = async (id, techId) => {
    try {
      await api.post(`/api/complaints/${id}/assign`, { assigned_to: techId, status: 'assigned' })
      setSnackbar({ open: true, message: 'Technician assigned successfully', severity: 'success' })
      loadComplaints()
    } catch (err) {
      console.error('Failed to assign technician:', err)
      setSnackbar({ open: true, message: 'Failed to assign technician', severity: 'error' })
    }
  }

  const startWork = async (id) => {
    try {
      await api.post(`/api/complaints/${id}/start`)
      setSnackbar({ open: true, message: 'Work started on complaint', severity: 'success' })
      loadComplaints()
    } catch (err) {
      console.error('Failed to start work:', err)
      setSnackbar({ open: true, message: 'Failed to start work', severity: 'error' })
    }
  }

  const completeWork = async (id) => {
    try {
      await api.post(`/api/complaints/${id}/stop`)
      setSnackbar({ open: true, message: 'Work completed successfully', severity: 'success' })
      loadComplaints()
    } catch (err) {
      console.error('Failed to complete work:', err)
      setSnackbar({ open: true, message: 'Failed to complete work', severity: 'error' })
    }
  }

  const generatePdf = async (id) => {
    try {
      await api.post(`/api/complaints/${id}/generate-pdf`)
      setSnackbar({ open: true, message: 'PDF generated successfully', severity: 'success' })
      loadComplaints()
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      setSnackbar({ open: true, message: 'Failed to generate PDF', severity: 'error' })
    }
  }

  const submitEscalation = async () => {
    if (!selectedComplaint || !escalationNote) return

    try {
      await api.post(`/api/complaints/${selectedComplaint.id}/status`, {
        status: 'escalated'
      })
      setSnackbar({ open: true, message: 'Complaint escalated successfully', severity: 'success' })
      setEscalateDialog(false)
      setSelectedComplaint(null)
      setEscalationNote('')
      loadComplaints()
    } catch (err) {
      console.error('Failed to escalate:', err)
      setSnackbar({ open: true, message: 'Failed to escalate complaint', severity: 'error' })
    }
  }

  const filteredComplaints = complaints.filter(complaint => {
    const searchLower = searchTerm.toLowerCase()
    return !searchTerm ||
      complaint.type?.toLowerCase().includes(searchLower) ||
      complaint.description?.toLowerCase().includes(searchLower) ||
      getBlockName(complaint.block_id)?.toLowerCase().includes(searchLower)
  })

  const complaintStats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    completed: complaints.filter(c => ['completed', 'resolved', 'closed'].includes(c.status)).length,
    escalated: complaints.filter(c => c.status === 'escalated').length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error'
      case 'assigned': return 'warning'
      case 'in-progress': return 'info'
      case 'completed':
      case 'resolved':
      case 'closed': return 'success'
      case 'rejected': return 'error'
      case 'escalated': return 'secondary'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getBlockName = (blockId) => {
    const block = blocks.find(b => b.id === blockId)
    return block?.name || blockId
  }

  const getTechnicianName = (techId) => {
    const tech = technicians.find(t => t.id === techId)
    return tech?.name || 'Unassigned'
  }

  if (loading) {
    return (
      <Box>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            borderRadius: 2,
            mb: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            <ReportProblem sx={{ mr: 2, verticalAlign: 'middle' }} />
            Complaint Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Oversee complaints from all blocks, handle escalations, and approve special requests.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <LinearProgress sx={{ mb: 2, width: 300 }} />
            <Typography variant="body1" color="text.secondary">Loading complaints...</Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            borderRadius: 2,
            mb: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            <ReportProblem sx={{ mr: 2, verticalAlign: 'middle' }} />
            Complaint Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Oversee complaints from all blocks, handle escalations, and approve special requests.
          </Typography>
        </Box>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadComplaints}>
              <Refresh sx={{ mr: 1 }} />
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      </Box>
    )
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
          mb: 3,
          position: 'relative'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          <ReportProblem sx={{ mr: 2, verticalAlign: 'middle' }} />
          Complaint Management
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          Oversee complaints from all blocks, handle escalations, and approve special requests.
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Refresh />}
            onClick={loadComplaints}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Refresh Data
          </Button>
          <Button
            variant="outlined"
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            startIcon={<Equalizer />}
            onClick={() => navigate('/warden/reports')}
          >
            View Reports
          </Button>
        </Box>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">{complaintStats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Complaints</Typography>
                </Box>
                <ReportProblem color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#d32f2f' }}>{complaintStats.open}</Typography>
                  <Typography variant="body2" color="text.secondary">Open</Typography>
                </Box>
                <Error sx={{ fontSize: 40, color: '#d32f2f' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#f57c00' }}>{complaintStats.inProgress}</Typography>
                  <Typography variant="body2" color="text.secondary">In Progress</Typography>
                </Box>
                <Build sx={{ fontSize: 40, color: '#f57c00' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2e7d32' }}>{complaintStats.completed}</Typography>
                  <Typography variant="body2" color="text.secondary">Completed</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#2e7d32' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
          <Tab label="Table View" value="table" icon={<Assignment />} iconPosition="start" />
          <Tab label="Card View" value="cards" icon={<ReportProblem />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search complaints by type, description, or block..."
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                  startAdornment={<CheckCircle sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="escalated">Escalated</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Block</InputLabel>
                <Select
                  value={filters.blockId}
                  onChange={(e) => setFilters(prev => ({ ...prev, blockId: e.target.value }))}
                  label="Block"
                  startAdornment={<Business sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">All Blocks</MenuItem>
                  {blocks.map(block => (
                    <MenuItem key={block.id} value={block.id}>{block.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  label="Priority"
                  startAdornment={<PriorityHigh sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilters({ status: '', blockId: '', priority: '' })
                  setSearchTerm('')
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Complaint Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Block</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Technician</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No complaints found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredComplaints.map(complaint => (
                  <TableRow key={complaint.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {complaint.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {complaint.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getPriorityColor(complaint.priority)}
                        label={complaint.priority}
                        icon={<PriorityHigh />}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2">{getBlockName(complaint.block_id)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(complaint.status)}
                        label={complaint.status}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={complaint.assigned_to || ''}
                        onChange={(e) => assignTechnician(complaint.id, e.target.value)}
                        displayEmpty
                        sx={{ minWidth: 140 }}
                      >
                        <MenuItem value="">Unassigned</MenuItem>
                        {technicians.map(tech => (
                          <MenuItem key={tech.id} value={tech.id}>{tech.name}</MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(complaint.created_at).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setSelectedComplaint(complaint)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {complaint.status === 'open' && (
                          <Tooltip title="Start Work">
                            <IconButton size="small" color="primary" onClick={() => startWork(complaint.id)}>
                              <Build />
                            </IconButton>
                          </Tooltip>
                        )}
                        {complaint.status === 'in-progress' && (
                          <Tooltip title="Complete Work">
                            <IconButton size="small" color="success" onClick={() => completeWork(complaint.id)}>
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Escalate">
                          <IconButton size="small" color="warning" onClick={() => handleEscalate(complaint)}>
                            <PriorityHigh />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Generate PDF">
                          <IconButton size="small" onClick={() => generatePdf(complaint.id)}>
                            <Description />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* Card View */
        <Grid container spacing={3}>
          {filteredComplaints.map(complaint => (
            <Grid item xs={12} md={6} lg={4} key={complaint.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <ReportProblem />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {complaint.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {getBlockName(complaint.block_id)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        size="small"
                        color={getPriorityColor(complaint.priority)}
                        label={complaint.priority}
                      />
                      <Chip
                        size="small"
                        color={getStatusColor(complaint.status)}
                        label={complaint.status}
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
                    {complaint.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Technician</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {getTechnicianName(complaint.assigned_to) || 'Unassigned'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Created</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setSelectedComplaint(complaint)}
                      sx={{ flex: 1 }}
                    >
                      Details
                    </Button>
                    {complaint.status === 'open' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Build />}
                        onClick={() => startWork(complaint.id)}
                        sx={{ flex: 1 }}
                      >
                        Start
                      </Button>
                    )}
                    {complaint.status === 'in-progress' && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={() => completeWork(complaint.id)}
                        sx={{ flex: 1 }}
                      >
                        Complete
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Complaint Details Dialog */}
      <Dialog open={!!selectedComplaint} onClose={() => setSelectedComplaint(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReportProblem color="warning" />
          Complaint Details - {selectedComplaint?.type}
        </DialogTitle>
        <DialogContent>
          {selectedComplaint && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Complaint Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{selectedComplaint.type}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Priority</Typography>
                  <Chip
                    size="small"
                    color={getPriorityColor(selectedComplaint.priority)}
                    label={selectedComplaint.priority}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Block</Typography>
                  <Typography variant="body1">{getBlockName(selectedComplaint.block_id)}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    color={getStatusColor(selectedComplaint.status)}
                    label={selectedComplaint.status}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Assignment & Timeline</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Assigned Technician</Typography>
                  <Typography variant="body1">{getTechnicianName(selectedComplaint.assigned_to) || 'Unassigned'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">
                    {new Date(selectedComplaint.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {selectedComplaint.updated_at && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {new Date(selectedComplaint.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Description</Typography>
                <Typography variant="body1" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  {selectedComplaint.description}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedComplaint(null)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<Description />}
            onClick={() => viewPdf(selectedComplaint.id)}
          >
            View PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<PriorityHigh />}
            onClick={() => {
              handleEscalate(selectedComplaint)
              setSelectedComplaint(null)
            }}
          >
            Escalate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Escalation Dialog */}
      <Dialog open={escalateDialog} onClose={() => setEscalateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PriorityHigh color="warning" />
          Escalate Complaint
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Escalating complaint: <strong>{selectedComplaint?.type}</strong> from {getBlockName(selectedComplaint?.block_id)}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Escalation Reason"
            value={escalationNote}
            onChange={(e) => setEscalationNote(e.target.value)}
            placeholder="Provide detailed reason for escalation..."
            helperText="This will be forwarded to the administrator for review"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEscalateDialog(false)}>Cancel</Button>
          <Button
            onClick={submitEscalation}
            variant="contained"
            color="warning"
            startIcon={<PriorityHigh />}
            disabled={!escalationNote.trim()}
          >
            Escalate to Admin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/warden/dashboard')}
      >
        <Equalizer />
      </Fab>
    </Box>
  )
}