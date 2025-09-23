import React from 'react'
import { api } from '../../api'
import {
  Box, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, Card, CardContent, Grid, Typography, Avatar, IconButton,
  Tooltip, CircularProgress, Snackbar, Alert, InputLabel, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider,
  Badge, Fab, TableContainer
} from '@mui/material'
import {
  Assignment, CheckCircle, Cancel, Schedule, Forward, Search,
  FilterList, Visibility, Person, Event, Description, Refresh
} from '@mui/icons-material'

export default function RCApplications(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [applications, setApplications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Dialog states
  const [detailDialog, setDetailDialog] = React.useState(false)
  const [selectedApplication, setSelectedApplication] = React.useState(null)
  const [confirmDialog, setConfirmDialog] = React.useState({ open: false, action: '', applicationId: null })

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

  // Load applications
  const loadApplications = React.useCallback(async () => {
    if (!blockId) return

    try {
      setLoading(true)
      const r = await api.get(`/api/rc/blocks/${blockId}/applications`)
      setApplications(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load applications', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [blockId])

  React.useEffect(() => { loadApplications() }, [loadApplications])

  // Filter applications based on search term and status
  const filteredApplications = React.useMemo(() => {
    let filtered = applications

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [applications, searchTerm, statusFilter])

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = applications.length
    const pending = applications.filter(app => app.status === 'pending').length
    const approved = applications.filter(app => app.status === 'approved').length
    const rejected = applications.filter(app => app.status === 'rejected').length
    const forwarded = applications.filter(app => app.status === 'forwarded').length

    return { total, pending, approved, rejected, forwarded }
  }, [applications])

  // Handle decision making
  const handleDecision = async (id, decision) => {
    try {
      await api.patch(`/api/applications/${id}/decision`, { decision })
      setSnackbar({
        open: true,
        message: `Application ${decision} successfully`,
        severity: 'success'
      })
      loadApplications()
      setConfirmDialog({ open: false, action: '', applicationId: null })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update application', severity: 'error' })
    }
  }

  // Open detail dialog
  const openDetailDialog = (application) => {
    setSelectedApplication(application)
    setDetailDialog(true)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'forwarded': return 'info'
      default: return 'default'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Schedule />
      case 'approved': return <CheckCircle />
      case 'rejected': return <Cancel />
      case 'forwarded': return <Forward />
      default: return <Assignment />
    }
  }

  // Get application type color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'room_change': return 'primary'
      case 'complaint': return 'warning'
      case 'leave': return 'info'
      case 'maintenance': return 'error'
      default: return 'default'
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
          <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
          Application Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Review and manage student applications across hostel blocks
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Forward sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.forwarded}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Forwarded
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ borderRadius: 2, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Applications"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="forwarded">Forwarded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Applications Table */}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No applications found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((application) => (
                      <TableRow key={application.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {application.student_id?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {application.student_id}
                              </Typography>
                              {application.student_name && (
                                <Typography variant="caption" color="text.secondary">
                                  {application.student_name}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.type?.replace('_', ' ').toUpperCase()}
                            color={getTypeColor(application.type)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(application.status)}
                            label={application.status?.toUpperCase()}
                            color={getStatusColor(application.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(application.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(application.created_at).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => openDetailDialog(application)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {application.status === 'pending' && (
                              <>
                                <Tooltip title="Approve">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmDialog({ open: true, action: 'approve', applicationId: application.id })}
                                    color="success"
                                  >
                                    <CheckCircle />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmDialog({ open: true, action: 'reject', applicationId: application.id })}
                                    color="error"
                                  >
                                    <Cancel />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Forward">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmDialog({ open: true, action: 'forward', applicationId: application.id })}
                                    color="info"
                                  >
                                    <Forward />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
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

      {/* Application Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Description sx={{ mr: 1 }} />
            Application Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
                  <Typography variant="body1" gutterBottom>{selectedApplication.student_id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Application Type</Typography>
                  <Chip
                    label={selectedApplication.type?.replace('_', ' ').toUpperCase()}
                    color={getTypeColor(selectedApplication.type)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    icon={getStatusIcon(selectedApplication.status)}
                    label={selectedApplication.status?.toUpperCase()}
                    color={getStatusColor(selectedApplication.status)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Submitted</Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedApplication.created_at).toLocaleString()}
                  </Typography>
                </Grid>
                {selectedApplication.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                      {selectedApplication.description}
                    </Typography>
                  </Grid>
                )}
                {selectedApplication.updated_at && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedApplication.updated_at).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: '', applicationId: null })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} this application?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, action: '', applicationId: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDecision(confirmDialog.applicationId, confirmDialog.action)}
            variant="contained"
            color={confirmDialog.action === 'approve' ? 'success' : confirmDialog.action === 'reject' ? 'error' : 'info'}
          >
            {confirmDialog.action?.charAt(0).toUpperCase() + confirmDialog.action?.slice(1)}
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
