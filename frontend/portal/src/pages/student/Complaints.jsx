import React from 'react'
import Page from '../../components/Page'
import { api } from '../../api'
import {
  Box, Button, TextField, Typography, Card, CardContent, Grid, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Stack, Alert, Snackbar, LinearProgress, IconButton,
  Tooltip, Divider, Paper
} from '@mui/material'
import {
  ReportProblem, Build, Plumbing, ElectricalServices, Wifi, CleaningServices,
  PriorityHigh, AccessTime, CheckCircle, Error, Pending, Send, Refresh,
  Description, LocationOn, Schedule
} from '@mui/icons-material'
import FormHeader from '../../components/FormHeader'

export default function StudentComplaints(){
  const [complaints, setComplaints] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  const [form, setForm] = React.useState({
    type: 'Electrical',
    priority: 'Low',
    description: '',
    location: ''
  })

  const complaintTypes = [
    { value: 'Electrical', label: 'Electrical Issue', icon: ElectricalServices, color: '#ff9800' },
    { value: 'Plumbing', label: 'Plumbing Issue', icon: Plumbing, color: '#2196f3' },
    { value: 'Carpentry', label: 'Carpentry Work', icon: Build, color: '#8d6e63' },
    { value: 'Cleaning', label: 'Cleaning Required', icon: CleaningServices, color: '#4caf50' },
    { value: 'Internet', label: 'Internet Problem', icon: Wifi, color: '#9c27b0' },
    { value: 'Other', label: 'Other Issue', icon: ReportProblem, color: '#f44336' }
  ]

  const priorities = [
    { value: 'Low', label: 'Low Priority', color: 'success', icon: AccessTime },
    { value: 'Medium', label: 'Medium Priority', color: 'warning', icon: PriorityHigh },
    { value: 'High', label: 'High Priority', color: 'error', icon: PriorityHigh },
    { value: 'Urgent', label: 'Urgent', color: 'error', icon: Error }
  ]

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const r = await api.get('/api/complaints')
      setComplaints(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load complaints', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadComplaints() }, [])

  const submitComplaint = async () => {
    if (!form.description.trim()) {
      setSnackbar({ open: true, message: 'Please provide a description', severity: 'error' })
      return
    }

    try {
      setSubmitting(true)
      await api.post('/api/complaints', form)
      setSnackbar({ open: true, message: 'Complaint submitted successfully!', severity: 'success' })
      setForm({ type: 'Electrical', priority: 'Low', description: '', location: '' })
      setDialogOpen(false)
      await loadComplaints()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Failed to submit complaint',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'success'
      case 'in_progress': case 'in progress': return 'warning'
      case 'pending': return 'info'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return <CheckCircle />
      case 'in_progress': case 'in progress': return <Pending />
      case 'pending': return <AccessTime />
      case 'rejected': return <Error />
      default: return <ReportProblem />
    }
  }

  const getTypeIcon = (type) => {
    const complaintType = complaintTypes.find(t => t.value === type)
    return complaintType ? complaintType.icon : ReportProblem
  }

  const getPriorityColor = (priority) => {
    const p = priorities.find(p => p.value === priority)
    return p ? p.color : 'default'
  }
  return (
    <Page title="Complaints">
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
            🛠️ Complaints & Maintenance
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Report issues and track maintenance requests for your hostel
          </Typography>
          <Button
            variant="contained"
            startIcon={<ReportProblem />}
            onClick={() => setDialogOpen(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            Report Issue
          </Button>
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
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {complaints.filter(c => c.status?.toLowerCase() === 'resolved').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Resolved
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
                    {complaints.filter(c => c.status?.toLowerCase() === 'in_progress' || c.status?.toLowerCase() === 'in progress').length}
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
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {complaints.filter(c => c.status?.toLowerCase() === 'pending').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending
                  </Typography>
                </Box>
                <AccessTime sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {complaints.filter(c => c.status?.toLowerCase() === 'rejected').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Rejected
                  </Typography>
                </Box>
                <Error sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Complaints History */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                📋 Complaint History
              </Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={loadComplaints} disabled={loading}>
                  <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography>Loading complaints...</Typography>
            </Box>
          ) : complaints.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ReportProblem sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No complaints found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your complaint history will appear here once you submit issues
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3, pt: 0 }}>
              <Grid container spacing={2}>
                {complaints.map((complaint) => {
                  const TypeIcon = getTypeIcon(complaint.type)
                  return (
                    <Grid item xs={12} md={6} key={complaint.id}>
                      <Card sx={{
                        borderRadius: 2,
                        boxShadow: 2,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            <Avatar sx={{
                              bgcolor: complaintTypes.find(t => t.value === complaint.type)?.color || 'primary.main',
                              width: 48,
                              height: 48
                            }}>
                              <TypeIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                  #{complaint.id} - {complaint.type}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={complaint.priority}
                                  color={getPriorityColor(complaint.priority)}
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {complaint.description}
                              </Typography>
                              {complaint.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {complaint.location}
                                  </Typography>
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(complaint.created_at).toLocaleDateString()} at {new Date(complaint.created_at).toLocaleTimeString()}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  icon={getStatusIcon(complaint.status)}
                                  label={complaint.status || 'Unknown'}
                                  size="small"
                                  color={getStatusColor(complaint.status)}
                                />
                                <Button
                                  size="small"
                                  component="a"
                                  href={`/api/complaints/${complaint.id}/letter.pdf`}
                                  target="_blank"
                                  startIcon={<Description />}
                                  sx={{ textTransform: 'none' }}
                                >
                                  View Letter
                                </Button>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Complaint Submission Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ReportProblem />
          Report a Maintenance Issue
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Professional Form Header */}
            <FormHeader title="MAINTENANCE COMPLAINT FORM" />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Issue Type</InputLabel>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                    label="Issue Type"
                  >
                    {complaintTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconComponent sx={{ color: type.color }} />
                            {type.label}
                          </Box>
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={form.priority}
                    onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                    label="Priority"
                  >
                    {priorities.map((priority) => {
                      const IconComponent = priority.icon
                      return (
                        <MenuItem key={priority.value} value={priority.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconComponent sx={{ color: `${priority.color}.main` }} />
                            {priority.label}
                          </Box>
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Location (Optional)"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Room 101, Common Area, etc."
              InputProps={{
                startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide detailed description of the issue..."
              helperText="Be specific about the problem to help maintenance team understand and fix it quickly"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Your complaint will be reviewed by the maintenance team.
                You will receive updates on the status via notifications.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitComplaint}
            disabled={submitting || !form.description.trim()}
            startIcon={submitting ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Send />}
            sx={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </Button>
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
