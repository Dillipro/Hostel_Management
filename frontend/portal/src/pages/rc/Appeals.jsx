import React from 'react'
import { api } from '../../api'
import {
  Box, Button, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Typography, Card, CardContent, Grid, Chip, Avatar, IconButton,
  Tooltip, CircularProgress, Snackbar, Alert, InputLabel, FormControl,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, TableContainer
} from '@mui/material'
import {
  Gavel, CheckCircle, Cancel, Schedule, Search, FilterList,
  Refresh, Description, Person, Event
} from '@mui/icons-material'

export default function RCAppeals(){
  const [appeals, setAppeals] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState('pending')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Decision dialog state
  const [decisionDialog, setDecisionDialog] = React.useState({ open: false, appeal: null, action: '' })
  const [decisionNote, setDecisionNote] = React.useState('')

  // Load appeals
  const loadAppeals = React.useCallback(async () => {
    try {
      setLoading(true)
      const r = await api.get('/api/appeals', { params: { status: statusFilter || undefined } })
      setAppeals(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load appeals', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  React.useEffect(() => { loadAppeals() }, [loadAppeals])

  // Filter appeals based on search term
  const filteredAppeals = React.useMemo(() => {
    if (!searchTerm) return appeals
    return appeals.filter(appeal =>
      appeal.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appeal.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [appeals, searchTerm])

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = appeals.length
    const pending = appeals.filter(a => a.status === 'pending').length
    const approved = appeals.filter(a => a.status === 'approved').length
    const rejected = appeals.filter(a => a.status === 'rejected').length

    return { total, pending, approved, rejected }
  }, [appeals])

  // Handle decision
  const handleDecision = async () => {
    try {
      await api.post(`/api/appeals/${decisionDialog.appeal.id}/decision`, {
        decision: decisionDialog.action,
        note: decisionNote
      })
      setSnackbar({
        open: true,
        message: `Appeal ${decisionDialog.action} successfully`,
        severity: 'success'
      })
      setDecisionDialog({ open: false, appeal: null, action: '' })
      setDecisionNote('')
      loadAppeals()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to process appeal decision', severity: 'error' })
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Schedule />
      case 'approved': return <CheckCircle />
      case 'rejected': return <Cancel />
      default: return <Gavel />
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
          <Gavel sx={{ mr: 2, verticalAlign: 'middle' }} />
          Appeals Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Review and process student appeals with comprehensive decision tracking
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Gavel sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Appeals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} sm={6} md={3}>
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
      </Grid>

      {/* Controls */}
      <Card sx={{ borderRadius: 2, mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="">All Appeals</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Search Appeals"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadAppeals}
                  disabled={loading}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Appeals Table */}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAppeals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No appeals found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppeals.map((appeal) => (
                      <TableRow key={appeal.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {appeal.student_id?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {appeal.student_id}
                              </Typography>
                              {appeal.student_name && (
                                <Typography variant="caption" color="text.secondary">
                                  {appeal.student_name}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {appeal.reason || 'No reason provided'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(appeal.status)}
                            label={appeal.status?.toUpperCase()}
                            color={getStatusColor(appeal.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(appeal.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(appeal.created_at).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {appeal.status === 'pending' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Approve Appeal">
                                <IconButton
                                  size="small"
                                  onClick={() => setDecisionDialog({ open: true, appeal, action: 'approved' })}
                                  color="success"
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Appeal">
                                <IconButton
                                  size="small"
                                  onClick={() => setDecisionDialog({ open: true, appeal, action: 'rejected' })}
                                  color="error"
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
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

      {/* Decision Dialog */}
      <Dialog open={decisionDialog.open} onClose={() => setDecisionDialog({ open: false, appeal: null, action: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {decisionDialog.action === 'approved' ? 'Approve Appeal' : 'Reject Appeal'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Student: {decisionDialog.appeal?.student_id}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Reason: {decisionDialog.appeal?.reason}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Decision Note (Optional)"
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            placeholder="Add any notes or comments about this decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionDialog({ open: false, appeal: null, action: '' })}>
            Cancel
          </Button>
          <Button
            onClick={handleDecision}
            variant="contained"
            color={decisionDialog.action === 'approved' ? 'success' : 'error'}
          >
            {decisionDialog.action === 'approved' ? 'Approve' : 'Reject'}
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
