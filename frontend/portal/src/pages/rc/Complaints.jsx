import React from 'react'
import { api } from '../../api'
import Page from '../../components/Page'
import {
  Box, Button, Typography, Card, CardContent, Grid, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Stack, Alert, Snackbar, LinearProgress, IconButton,
  Tooltip, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Paper
} from '@mui/material'
import {
  ReportProblem, Build, Plumbing, ElectricalServices, Wifi, CleaningServices,
  PriorityHigh, AccessTime, CheckCircle, Error, Pending, Refresh,
  Assignment, Person, Schedule, LocationOn, Engineering
} from '@mui/icons-material'

export default function RCComplaints(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [complaints, setComplaints] = React.useState([])
  const [technicians, setTechnicians] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [assigning, setAssigning] = React.useState(false)
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

  // Load technicians
  React.useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const r = await api.get('/api/admin/technicians')
        setTechnicians(r.data || [])
      } catch (error) {
        console.error('Failed to load technicians:', error)
      }
    }
    loadTechnicians()
  }, [])

  // Load complaints when block changes
  const loadComplaints = React.useCallback(async () => {
    if (!blockId) return

    try {
      setLoading(true)
      const r = await api.get(`/api/rc/blocks/${blockId}/complaints`)
      setComplaints(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load complaints', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [blockId])

  React.useEffect(() => { loadComplaints() }, [loadComplaints])

  const startComplaint = async (id) => {
    try {
      await api.post(`/api/complaints/${id}/start`)
      setSnackbar({ open: true, message: 'Complaint marked as in progress', severity: 'success' })
      await loadComplaints()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to start complaint', severity: 'error' })
    }
  }

  const completeComplaint = async (id) => {
    try {
      await api.post(`/api/complaints/${id}/stop`)
      setSnackbar({ open: true, message: 'Complaint marked as completed', severity: 'success' })
      await loadComplaints()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to complete complaint', severity: 'error' })
    }
  }

  const assignTechnician = async (complaintId, techId) => {
    try {
      setAssigning(true)
      await api.post(`/api/complaints/${complaintId}/assign`, {
        assigned_to: techId,
        status: 'assigned'
      })
      setSnackbar({ open: true, message: 'Technician assigned successfully', severity: 'success' })
      await loadComplaints()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to assign technician', severity: 'error' })
    } finally {
      setAssigning(false)
    }
  }

  const generatePdf = async (id) => {
    try {
      await api.post(`/api/complaints/${id}/generate-pdf`)
      setSnackbar({ open: true, message: 'PDF generated successfully', severity: 'success' })
      await loadComplaints()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate PDF', severity: 'error' })
    }
  }

  const viewPdf = (id) => {
    window.open(`/api/complaints/${id}/letter.pdf`, '_blank')
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': case 'resolved': return 'success'
      case 'in_progress': case 'in progress': return 'warning'
      case 'assigned': return 'info'
      case 'open': case 'pending': return 'default'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': case 'resolved': return <CheckCircle />
      case 'in_progress': case 'in progress': return <Pending />
      case 'assigned': return <Assignment />
      case 'open': case 'pending': return <AccessTime />
      case 'rejected': return <Error />
      default: return <ReportProblem />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'error'
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'electrical': return <ElectricalServices />
      case 'plumbing': return <Plumbing />
      case 'carpentry': return <Build />
      case 'cleaning': return <CleaningServices />
      case 'internet': return <Wifi />
      default: return <ReportProblem />
    }
  }

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = complaints.length
    const completed = complaints.filter(c => c.status?.toLowerCase() === 'completed' || c.status?.toLowerCase() === 'resolved').length
    const inProgress = complaints.filter(c => c.status?.toLowerCase() === 'in_progress' || c.status?.toLowerCase() === 'in progress').length
    const pending = complaints.filter(c => c.status?.toLowerCase() === 'open' || c.status?.toLowerCase() === 'pending').length
    const urgent = complaints.filter(c => c.priority?.toLowerCase() === 'urgent').length

    return { total, completed, inProgress, pending, urgent }
  }, [complaints])
  return (
    <Page title="Complaints Management">
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔧 Complaints Management
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Manage and track maintenance complaints for your block
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
              <InputLabel sx={{ color: 'white' }}>Select Block</InputLabel>
              <Select
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
                label="Select Block"
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
              >
                {blocks.map(b => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Refresh">
              <IconButton onClick={loadComplaints} disabled={loading} sx={{ color: 'white' }}>
                <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
              </IconButton>
            </Tooltip>
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Complaints
                  </Typography>
                </Box>
                <ReportProblem sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Completed
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    In Progress
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats.urgent}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Urgent Priority
                  </Typography>
                </Box>
                <PriorityHigh sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Complaints Table */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              📋 Block Complaints
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography>Loading complaints...</Typography>
            </Box>
          ) : complaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No complaints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All complaints for this block have been resolved
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><strong>Complaint</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Technician</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40
                          }}>
                            {getTypeIcon(complaint.type)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              #{complaint.id} - {complaint.type}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {complaint.description}
                            </Typography>
                            {complaint.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <LocationOn sx={{ fontSize: 12, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {complaint.location}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={complaint.priority}
                          color={getPriorityColor(complaint.priority)}
                          icon={complaint.priority?.toLowerCase() === 'urgent' ? <PriorityHigh /> : undefined}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(complaint.status)}
                          label={complaint.status || 'Unknown'}
                          size="small"
                          color={getStatusColor(complaint.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <Select
                            value={complaint.assigned_to || ''}
                            onChange={(e) => assignTechnician(complaint.id, e.target.value)}
                            disabled={assigning}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Unassigned</em>
                            </MenuItem>
                            {technicians.map(tech => (
                              <MenuItem key={tech.id} value={tech.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Engineering sx={{ fontSize: 16 }} />
                                  {tech.name}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(complaint.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {complaint.status === 'open' && (
                            <Tooltip title="Start Work">
                              <IconButton
                                size="small"
                                onClick={() => startComplaint(complaint.id)}
                                color="primary"
                              >
                                <Pending />
                              </IconButton>
                            </Tooltip>
                          )}
                          {complaint.status === 'in_progress' && (
                            <Tooltip title="Mark Complete">
                              <IconButton
                                size="small"
                                onClick={() => completeComplaint(complaint.id)}
                                color="success"
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Generate PDF">
                            <IconButton
                              size="small"
                              onClick={() => generatePdf(complaint.id)}
                              color="secondary"
                            >
                              <Assignment />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View PDF">
                            <IconButton
                              size="small"
                              onClick={() => viewPdf(complaint.id)}
                              color="info"
                            >
                              <ReportProblem />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

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
