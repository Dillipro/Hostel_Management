import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Paper, TableContainer, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Card, CardContent, Grid, IconButton, Tooltip, Alert, Snackbar, Fab, LinearProgress, Tabs, Tab, InputAdornment, Avatar
} from '@mui/material'
import {
  Assignment, CheckCircle, Cancel, Description, Person, Business, Schedule, Search, FilterList, Refresh,
  Equalizer, Visibility, Edit, Done, Close, PictureAsPdf, School
} from '@mui/icons-material'

export default function WardenApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = React.useState([])
  const [blocks, setBlocks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [selectedApplication, setSelectedApplication] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState('table')
  const [filters, setFilters] = React.useState({
    status: '',
    blockId: ''
  })
  const [approveDialog, setApproveDialog] = React.useState(false)
  const [approvalRemark, setApprovalRemark] = React.useState('')

  React.useEffect(() => {
    loadData()
  }, [])

  React.useEffect(() => {
    loadApplications()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const blocksRes = await api.get('/api/rc/blocks')
      setBlocks(blocksRes.data || [])
    } catch (err) {
      console.error('Failed to load blocks:', err)
    }
    setLoading(false)
  }

  const loadApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      const res = await api.get(`/api/applications?${params}`)
      setApplications(res.data || [])
      setSnackbar({ open: true, message: `Loaded ${res.data?.length || 0} applications`, severity: 'success' })
    } catch (err) {
      console.error('Failed to load applications:', err)
      setError('Failed to load applications. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load applications', severity: 'error' })
    }
    setLoading(false)
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })

  const handleDecision = async (id, decision) => {
    try {
      await api.patch(`/api/applications/${id}/decision`, { decision })
      const action = decision === 'approve' ? 'RC approved' : 'rejected'
      setSnackbar({ open: true, message: `Application ${action} successfully`, severity: 'success' })
      loadApplications()
    } catch (err) {
      console.error('Failed to update application:', err)
      setSnackbar({ open: true, message: 'Failed to update application', severity: 'error' })
    }
  }

  const submitApproval = async () => {
    if (!selectedApplication) return

    try {
      await api.patch(`/api/applications/${selectedApplication.id}/approve`, {
        remark: approvalRemark
      })
      setSnackbar({ open: true, message: 'Application approved and signed successfully', severity: 'success' })
      setApproveDialog(false)
      setSelectedApplication(null)
      setApprovalRemark('')
      loadApplications()
    } catch (err) {
      console.error('Failed to approve application:', err)
      setSnackbar({ open: true, message: 'Failed to approve application', severity: 'error' })
    }
  }

  const generateCertificate = async (id) => {
    try {
      await api.post(`/api/applications/${id}/generate-cert`)
      setSnackbar({ open: true, message: 'Certificate generated successfully', severity: 'success' })
      loadApplications()
    } catch (err) {
      console.error('Failed to generate certificate:', err)
      setSnackbar({ open: true, message: 'Failed to generate certificate', severity: 'error' })
    }
  }

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase()
    return !searchTerm ||
      app.student?.user?.name?.toLowerCase().includes(searchLower) ||
      app.student?.user?.reg_no?.toLowerCase().includes(searchLower) ||
      app.type?.toLowerCase().includes(searchLower)
  })

  const applicationStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    rcApproved: applications.filter(a => a.status === 'rc-approved').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  const viewPdf = async (id) => {
    try {
      const response = await api.get(`/api/applications/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      window.open(url, '_blank')
    } catch (err) {
      console.error('Failed to load PDF:', err)
      setSnackbar({ open: true, message: 'Failed to load PDF', severity: 'error' })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'rc-approved': return 'warning'
      case 'pending': return 'info'
      default: return 'default'
    }
  }

  const getBlockName = (blockId) => {
    const block = blocks.find(b => b.id === blockId)
    return block?.name || blockId
  }

  const canApprove = (status) => {
    return status === 'rc-approved' || status === 'pending'
  }

  const canGenerateCert = (type, status) => {
    return ['bonafide', 'duplicate-id', 'study-certificate'].includes(type) && status === 'approved'
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
            <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
            Application Approvals
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Review and approve student applications, certificates, and special requests.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <LinearProgress sx={{ mb: 2, width: 300 }} />
            <Typography variant="body1" color="text.secondary">Loading applications...</Typography>
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
            <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
            Application Approvals
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Review and approve student applications, certificates, and special requests.
          </Typography>
        </Box>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadApplications}>
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
          <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
          Application Approvals
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          Review and approve student applications, certificates, and special requests.
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Refresh />}
            onClick={loadApplications}
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
                  <Typography variant="h4" color="primary">{applicationStats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Applications</Typography>
                </Box>
                <Assignment color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#f57c00' }}>{applicationStats.pending}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: '#f57c00' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2e7d32' }}>{applicationStats.approved}</Typography>
                  <Typography variant="body2" color="text.secondary">Approved</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#2e7d32' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#d32f2f' }}>{applicationStats.rejected}</Typography>
                  <Typography variant="body2" color="text.secondary">Rejected</Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, color: '#d32f2f' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
          <Tab label="Table View" value="table" icon={<Assignment />} iconPosition="start" />
          <Tab label="Card View" value="cards" icon={<Person />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by student name, reg no, or application type..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                  startAdornment={<CheckCircle sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rc-approved">RC Approved</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
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
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setFilters({ status: '', blockId: '' })
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
                <TableCell sx={{ fontWeight: 'bold' }}>Student Details</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Application Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Block</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No applications found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map(app => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {app.student?.user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {app.student?.user?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {app.student?.user?.reg_no}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                          {app.type?.replace('-', ' ')}
                        </Typography>
                        {app.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {app.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="body2">{getBlockName(app.student?.hostel_id)}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(app.status)}
                        label={app.status?.replace('-', ' ')}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(app.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(app.created_at).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setSelectedApplication(app)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {app.status === 'pending' && (
                          <>
                            <Tooltip title="RC Approve">
                              <IconButton size="small" color="primary" onClick={() => handleDecision(app.id, 'approve')}>
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" color="error" onClick={() => handleDecision(app.id, 'reject')}>
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {canApprove(app.status) && (
                          <Tooltip title="Final Approve">
                            <IconButton size="small" sx={{ color: '#2e7d32' }} onClick={() => handleApprove(app)}>
                              <Done />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canGenerateCert(app.type, app.status) && (
                          <Tooltip title="Generate Certificate">
                            <IconButton size="small" color="secondary" onClick={() => generateCertificate(app.id)}>
                              <PictureAsPdf />
                            </IconButton>
                          </Tooltip>
                        )}
                        {app.pdf && (
                          <Tooltip title="View PDF">
                            <IconButton size="small" onClick={() => viewPdf(app.id)}>
                              <Description />
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
        /* Card View */
        <Grid container spacing={3}>
          {filteredApplications.map(app => (
            <Grid item xs={12} md={6} lg={4} key={app.id}>
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
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {app.student?.user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {app.student?.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {app.student?.user?.reg_no}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      size="small"
                      color={getStatusColor(app.status)}
                      label={app.status?.replace('-', ' ')}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 'medium', textTransform: 'capitalize' }}>
                    {app.type?.replace('-', ' ')}
                  </Typography>

                  {app.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {app.description}
                    </Typography>
                  )}

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Block</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{getBlockName(app.student?.hostel_id)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Submitted</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {new Date(app.created_at).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setSelectedApplication(app)}
                      sx={{ flex: 1 }}
                    >
                      Details
                    </Button>
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={() => handleDecision(app.id, 'approve')}
                          sx={{ flex: 1 }}
                        >
                          RC Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleDecision(app.id, 'reject')}
                          sx={{ flex: 1 }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {canApprove(app.status) && (
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ bgcolor: '#2e7d32', flex: 1 }}
                        startIcon={<Done />}
                        onClick={() => handleApprove(app)}
                      >
                        Final Approve
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onClose={() => setSelectedApplication(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assignment color="primary" />
          Application Details - {selectedApplication?.type?.replace('-', ' ')}
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Student Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedApplication.student?.user?.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Registration Number</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedApplication.student?.user?.reg_no}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Block</Typography>
                  <Typography variant="body1">{getBlockName(selectedApplication.student?.hostel_id)}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{selectedApplication.student?.user?.department}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Application Details</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{selectedApplication.type?.replace('-', ' ')}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    color={getStatusColor(selectedApplication.status)}
                    label={selectedApplication.status?.replace('-', ' ')}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Submitted</Typography>
                  <Typography variant="body1">
                    {new Date(selectedApplication.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {selectedApplication.updated_at && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {new Date(selectedApplication.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Grid>
              {selectedApplication.description && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography variant="body1" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {selectedApplication.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedApplication(null)}>Close</Button>
          {selectedApplication?.pdf && (
            <Button
              variant="outlined"
              startIcon={<Description />}
              onClick={() => viewPdf(selectedApplication.id)}
            >
              View PDF
            </Button>
          )}
          {canGenerateCert(selectedApplication?.type, selectedApplication?.status) && (
            <Button
              variant="contained"
              startIcon={<PictureAsPdf />}
              onClick={() => {
                generateCertificate(selectedApplication.id)
                setSelectedApplication(null)
              }}
            >
              Generate Certificate
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Enhanced Approval Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Done sx={{ color: '#2e7d32' }} />
          Final Approval
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            You are about to provide final approval for <strong>{selectedApplication?.type?.replace('-', ' ')}</strong> application
            from <strong>{selectedApplication?.student?.user?.name}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This action will sign and finalize the application. Make sure all details are correct.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Approval Remarks (Optional)"
            value={approvalRemark}
            onChange={(e) => setApprovalRemark(e.target.value)}
            placeholder="Add any final remarks or notes..."
            helperText="These remarks will be included in the final document"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button
            onClick={submitApproval}
            variant="contained"
            sx={{ bgcolor: '#2e7d32' }}
            startIcon={<Done />}
          >
            Approve & Sign
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