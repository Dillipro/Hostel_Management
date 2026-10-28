import React from 'react'
import Page from '../../components/Page'
import { api } from '../../api'
import {
  Box, Button, TextField, Typography, Card, CardContent, Grid, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Stack, Alert, Snackbar, LinearProgress, IconButton,
  Tooltip, Divider, Paper, Stepper, Step, StepLabel
} from '@mui/material'
import {
  Assignment, Description, CheckCircle, Pending, Error, Send, Refresh,
  AccessTime, School, MeetingRoom, Flight, ExitToApp, Schedule,
  Person, LocationOn, Event, Delete
} from '@mui/icons-material'
import FormHeader from '../../components/FormHeader'

export default function StudentApplications(){
  const [applications, setApplications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  const [applicationType, setApplicationType] = React.useState('bonafide')
  const [form, setForm] = React.useState({
    purpose: '',
    reason: '',
    from_date: '',
    to_date: '',
    effective_date: '',
    preferred_block: '',
    // New fields for additional application types
    device_type: 'Laptop',
    brand_model: '',
    mac_address: '',
    exit_date: '',
    exit_time: '',
    return_date: '',
    complaint_type: 'Plumbing',
    description: '',
    ticket_no: '',
    feedback_type: 'Mess Food Quality',
    rating: 3,
    comments: '',
    academic_year: '',
    block_preferences: ['', '', '', '', '']
  })

  const applicationTypes = [
    {
      value: 'bonafide',
      label: 'Bonafide Certificate',
      icon: School,
      color: '#4caf50',
      description: 'Request an official certificate confirming your student status',
      fields: ['purpose']
    },
    {
      value: 'duplicate-id',
      label: 'Duplicate ID Card Request',
      icon: Description,
      color: '#ff9800',
      description: 'Request replacement for lost or damaged ID card',
      fields: ['reason', 'upload_fir']
    },
    {
      value: 'wifi-registration',
      label: 'WiFi Registration',
      icon: Person,
      color: '#9c27b0',
      description: 'Register your device for hostel WiFi access',
      fields: ['device_type', 'brand_model', 'mac_address']
    },
    {
      value: 'outing',
      label: 'Outing / Day Pass Request',
      icon: Flight,
      color: '#2196f3',
      description: 'Request permission for short-term exit from hostel',
      fields: ['exit_date', 'exit_time', 'return_date', 'reason']
    },
    {
      value: 'room-change',
      label: 'Room Change Request',
      icon: MeetingRoom,
      color: '#2196f3',
      description: 'Request to change your room or block',
      fields: ['reason', 'preferred_block']
    },
    {
      value: 'complaint-escalation',
      label: 'Complaint Escalation',
      icon: Error,
      color: '#f44336',
      description: 'Escalate unresolved hostel complaints',
      fields: ['complaint_type', 'description', 'ticket_no']
    },
    {
      value: 'medical-rebate',
      label: 'Medical Rebate Application',
      icon: Person,
      color: '#e91e63',
      description: 'Apply for mess rebate due to medical absence',
      fields: ['from_date', 'to_date', 'upload_certificate']
    },
    {
      value: 'feedback',
      label: 'Feedback Form',
      icon: Assignment,
      color: '#607d8b',
      description: 'Provide feedback on hostel facilities and services',
      fields: ['feedback_type', 'rating', 'comments']
    },
    {
      value: 'readmission',
      label: 'Hostel Readmission',
      icon: School,
      color: '#4caf50',
      description: 'Apply for hostel readmission for next academic year',
      fields: ['academic_year', 'block_preferences']
    },
    {
      value: 'leave',
      label: 'Leave Application',
      icon: Flight,
      color: '#ff9800',
      description: 'Apply for leave from the hostel',
      fields: ['reason', 'from_date', 'to_date']
    },
    {
      value: 'hostel-leaving',
      label: 'Hostel Leaving Certificate',
      icon: ExitToApp,
      color: '#f44336',
      description: 'Request certificate for leaving the hostel',
      fields: ['reason', 'effective_date']
    }
  ]

  const loadApplications = async () => {
    try {
      setLoading(true)
      const r = await api.get('/api/applications/me')
      setApplications(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load applications', severity: 'error' })
    } finally {
      setLoading(false)
    }
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


  const handleTypeChange = (newType) => {
    setApplicationType(newType)
    // Reset form when type changes
    setForm({
      purpose: '',
      reason: '',
      from_date: '',
      to_date: '',
      effective_date: '',
      preferred_block: '',
      // New fields for additional application types
      device_type: 'Laptop',
      brand_model: '',
      mac_address: '',
      exit_date: '',
      exit_time: '',
      return_date: '',
      complaint_type: 'Plumbing',
      description: '',
      ticket_no: '',
      feedback_type: 'Mess Food Quality',
      rating: 3,
      comments: '',
      academic_year: '',
      block_preferences: ['', '', '', '', '']
    })
  }

  React.useEffect(() => { loadApplications() }, [])

  const submitApplication = async () => {
    const selectedType = applicationTypes.find(t => t.value === applicationType)
    if (!selectedType) return

    // Validate required fields
    const missingFields = selectedType.fields.filter(field => {
      if (field === 'purpose') return !form.purpose.trim()
      if (field === 'reason') return !form.reason.trim()
      if (field === 'from_date' || field === 'to_date' || field === 'effective_date' || field === 'exit_date' || field === 'exit_time' || field === 'return_date') {
        return !form[field]
      }
      if (field === 'preferred_block') return !form.preferred_block.trim()
      if (field === 'device_type') return !form.device_type.trim()
      if (field === 'brand_model') return !form.brand_model.trim()
      if (field === 'mac_address') return !form.mac_address.trim()
      if (field === 'complaint_type') return !form.complaint_type.trim()
      if (field === 'description') return !form.description.trim()
      if (field === 'ticket_no') return !form.ticket_no.trim()
      if (field === 'feedback_type') return !form.feedback_type.trim()
      if (field === 'rating') return !form.rating
      if (field === 'comments') return !form.comments.trim()
      if (field === 'academic_year') return !form.academic_year.trim()
      if (field === 'block_preferences') return !form.block_preferences.filter(p => p.trim()).length
      return false
    })

    if (missingFields.length > 0) {
      setSnackbar({
        open: true,
        message: `Please fill in all required fields: ${missingFields.join(', ')}`,
        severity: 'error'
      })
      return
    }

    try {
      setSubmitting(true)
      let data = {}
      if (applicationType === 'bonafide') {
        data = { purpose: form.purpose || 'Bonafide Certificate' }
      } else if (applicationType === 'duplicate-id') {
        data = { reason: form.reason, upload_fir: form.upload_fir }
      } else if (applicationType === 'wifi-registration') {
        data = { device_type: form.device_type, brand_model: form.brand_model, mac_address: form.mac_address }
      } else if (applicationType === 'outing') {
        data = { exit_date: form.exit_date, exit_time: form.exit_time, return_date: form.return_date, reason: form.reason }
      } else if (applicationType === 'room-change') {
        data = { reason: form.reason, preferred_block: form.preferred_block }
      } else if (applicationType === 'complaint-escalation') {
        data = { complaint_type: form.complaint_type, description: form.description, ticket_no: form.ticket_no }
      } else if (applicationType === 'medical-rebate') {
        data = { from_date: form.from_date, to_date: form.to_date, upload_certificate: form.upload_certificate }
      } else if (applicationType === 'feedback') {
        data = { feedback_type: form.feedback_type, rating: form.rating, comments: form.comments }
      } else if (applicationType === 'readmission') {
        data = { academic_year: form.academic_year, block_preferences: form.block_preferences.filter(p => p.trim()) }
      } else if (applicationType === 'leave') {
        data = { reason: form.reason, from: form.from_date, to: form.to_date }
      } else if (applicationType === 'hostel-leaving') {
        data = { reason: form.reason, effective_date: form.effective_date }
      }

      await api.post('/api/applications', { type: applicationType, data })
      setSnackbar({ open: true, message: 'Application submitted successfully!', severity: 'success' })
      setForm({
        purpose: '',
        reason: '',
        from_date: '',
        to_date: '',
        effective_date: '',
        preferred_block: '',
        // New fields for additional application types
        device_type: 'Laptop',
        brand_model: '',
        mac_address: '',
        exit_date: '',
        exit_time: '',
        return_date: '',
        complaint_type: 'Plumbing',
        description: '',
        ticket_no: '',
        feedback_type: 'Mess Food Quality',
        rating: 3,
        comments: '',
        academic_year: '',
        block_preferences: ['', '', '', '', '']
      })
      setDialogOpen(false)
      await loadApplications()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Failed to submit application',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      case 'processing': return 'info'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle />
      case 'pending': return <Pending />
      case 'rejected': return <Error />
      case 'processing': return <AccessTime />
      default: return <Assignment />
    }
  }

  const getTypeIcon = (type) => {
    const appType = applicationTypes.find(t => t.value === type)
    return appType ? appType.icon : Assignment
  }

  const deleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/api/applications/${id}`);
      setSnackbar({ open: true, message: 'Application deleted successfully', severity: 'success' });
      loadApplications();
    } catch (err) {
      console.error('Failed to delete application:', err);
      setSnackbar({ open: true, message: err?.response?.data?.error || 'Failed to delete application', severity: 'error' });
    }
  }

  return (
    <Page title="Applications">
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📄 Applications & Requests
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Submit and track your hostel applications and certificates
          </Typography>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => setDialogOpen(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            New Application
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
                    {applications.filter(a => a.status?.toLowerCase() === 'approved').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Approved
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
                    {applications.filter(a => a.status?.toLowerCase() === 'pending').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending
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
                    {applications.filter(a => a.status?.toLowerCase() === 'processing').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Processing
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
                    {applications.filter(a => a.status?.toLowerCase() === 'rejected').length}
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

      {/* Applications History */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                📋 Application History
              </Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={loadApplications} disabled={loading}>
                  <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography>Loading applications...</Typography>
            </Box>
          ) : applications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No applications found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your application history will appear here once you submit requests
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 3, pt: 0 }}>
              <Grid container spacing={2}>
                {applications.map((application) => {
                  const TypeIcon = getTypeIcon(application.type)
                  const appType = applicationTypes.find(t => t.value === application.type)
                  return (
                    <Grid item xs={12} md={6} key={application.id}>
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
                              bgcolor: appType?.color || 'primary.main',
                              width: 48,
                              height: 48
                            }}>
                              <TypeIcon sx={{ fontSize: 24 }} />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                  #{application.id} - {appType?.label || application.type}
                                </Typography>
                              </Box>

                              {/* Application Data Display */}
                              {application.data && (
                                <Box sx={{ mb: 2 }}>
                                  {application.type === 'bonafide' && application.data.purpose && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                      <strong>Purpose:</strong> {application.data.purpose}
                                    </Typography>
                                  )}
                                  {application.type === 'room-change' && (
                                    <>
                                      {application.data.reason && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Reason:</strong> {application.data.reason}
                                        </Typography>
                                      )}
                                      {application.data.preferred_block && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Preferred Block:</strong> {application.data.preferred_block}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'leave' && (
                                    <>
                                      {application.data.reason && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Reason:</strong> {application.data.reason}
                                        </Typography>
                                      )}
                                      {application.data.from && application.data.to && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Duration:</strong> {new Date(application.data.from).toLocaleDateString()} to {new Date(application.data.to).toLocaleDateString()}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'hostel-leaving' && (
                                    <>
                                      {application.data.reason && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Reason:</strong> {application.data.reason}
                                        </Typography>
                                      )}
                                      {application.data.effective_date && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Effective Date:</strong> {new Date(application.data.effective_date).toLocaleDateString()}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'duplicate-id' && (
                                    <>
                                      {application.data.reason && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Reason:</strong> {application.data.reason}
                                        </Typography>
                                      )}
                                      {application.data.upload_fir && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>FIR Upload:</strong> {application.data.upload_fir}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'wifi-registration' && (
                                    <>
                                      {application.data.device_type && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Device Type:</strong> {application.data.device_type}
                                        </Typography>
                                      )}
                                      {application.data.brand_model && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Brand/Model:</strong> {application.data.brand_model}
                                        </Typography>
                                      )}
                                      {application.data.mac_address && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>MAC Address:</strong> {application.data.mac_address}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'outing' && (
                                    <>
                                      {application.data.exit_date && application.data.exit_time && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Exit:</strong> {new Date(application.data.exit_date).toLocaleDateString()} at {application.data.exit_time}
                                        </Typography>
                                      )}
                                      {application.data.return_date && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Expected Return:</strong> {new Date(application.data.return_date).toLocaleDateString()}
                                        </Typography>
                                      )}
                                      {application.data.reason && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Reason:</strong> {application.data.reason}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'complaint-escalation' && (
                                    <>
                                      {application.data.complaint_type && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Type:</strong> {application.data.complaint_type}
                                        </Typography>
                                      )}
                                      {application.data.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Description:</strong> {application.data.description}
                                        </Typography>
                                      )}
                                      {application.data.ticket_no && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Previous Ticket:</strong> {application.data.ticket_no}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'medical-rebate' && (
                                    <>
                                      {application.data.from_date && application.data.to_date && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Medical Absence:</strong> {new Date(application.data.from_date).toLocaleDateString()} to {new Date(application.data.to_date).toLocaleDateString()}
                                        </Typography>
                                      )}
                                      {application.data.upload_certificate && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Certificate:</strong> {application.data.upload_certificate}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'feedback' && (
                                    <>
                                      {application.data.feedback_type && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Type:</strong> {application.data.feedback_type}
                                        </Typography>
                                      )}
                                      {application.data.rating && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Rating:</strong> {application.data.rating}/5
                                        </Typography>
                                      )}
                                      {application.data.comments && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Comments:</strong> {application.data.comments}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                  {application.type === 'readmission' && (
                                    <>
                                      {application.data.academic_year && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Academic Year:</strong> {application.data.academic_year}
                                        </Typography>
                                      )}
                                      {application.data.block_preferences && application.data.block_preferences.length > 0 && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                          <strong>Block Preferences:</strong> {application.data.block_preferences.filter(p => p).join(', ')}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                                </Box>
                              )}

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                                <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  Submitted on {new Date(application.created_at).toLocaleDateString()} at {new Date(application.created_at).toLocaleTimeString()}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  icon={getStatusIcon(application.status)}
                                  label={application.status || 'Unknown'}
                                  size="small"
                                  color={getStatusColor(application.status)}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    size="small"
                                    onClick={() => viewPdf(application.id)}
                                    startIcon={<Description />}
                                    sx={{ textTransform: 'none' }}
                                  >
                                    Download PDF
                                  </Button>
                                  {application.status === 'pending' && (
                                    <Button
                                      size="small"
                                      onClick={() => deleteApplication(application.id)}
                                      startIcon={<Delete />}
                                      color="error"
                                      sx={{ textTransform: 'none' }}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </Box>
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

      {/* Application Submission Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Assignment />
          Submit New Application
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Professional Form Header */}
            <FormHeader title={applicationTypes.find(t => t.value === applicationType)?.label || 'Application Form'} />

            <FormControl fullWidth>
              <InputLabel>Application Type</InputLabel>
              <Select
                value={applicationType}
                onChange={(e) => handleTypeChange(e.target.value)}
                label="Application Type"
              >
                {applicationTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconComponent sx={{ color: type.color }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {type.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>

            {/* Dynamic Form Fields Based on Application Type */}
            {applicationType === 'bonafide' && (
              <TextField
                fullWidth
                label="Purpose"
                value={form.purpose}
                onChange={(e) => setForm(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="e.g., Bank loan, Scholarship application, etc."
                helperText="Specify the purpose for requesting the bonafide certificate"
              />
            )}

            {(applicationType === 'room-change' || applicationType === 'leave' || applicationType === 'hostel-leaving') && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason"
                value={form.reason}
                onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide detailed reason for your application..."
                helperText="Explain why you are making this application"
              />
            )}

            {applicationType === 'room-change' && (
              <TextField
                fullWidth
                label="Preferred Block"
                value={form.preferred_block}
                onChange={(e) => setForm(prev => ({ ...prev, preferred_block: e.target.value }))}
                placeholder="e.g., Block A, Block B, etc."
                helperText="Specify which block you prefer to move to"
              />
            )}

            {applicationType === 'leave' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="From Date"
                    value={form.from_date}
                    onChange={(e) => setForm(prev => ({ ...prev, from_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    helperText="Leave start date"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="To Date"
                    value={form.to_date}
                    onChange={(e) => setForm(prev => ({ ...prev, to_date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    helperText="Leave end date"
                  />
                </Grid>
              </Grid>
            )}

            {applicationType === 'hostel-leaving' && (
              <TextField
                fullWidth
                type="date"
                label="Effective Date"
                value={form.effective_date}
                onChange={(e) => setForm(prev => ({ ...prev, effective_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                helperText="Date when you plan to leave the hostel"
              />
            )}

            {applicationType === 'duplicate-id' && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Reason for Duplicate</InputLabel>
                  <Select
                    value={form.reason}
                    onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                    label="Reason for Duplicate"
                  >
                    <MenuItem value="Lost ID Card">Lost ID Card</MenuItem>
                    <MenuItem value="Damaged ID Card">Damaged ID Card</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="FIR Copy Upload"
                  value={form.upload_fir}
                  onChange={(e) => setForm(prev => ({ ...prev, upload_fir: e.target.value }))}
                  placeholder="Upload FIR copy (PDF/JPG) if lost"
                  helperText="Required if ID card is lost"
                />
              </Stack>
            )}

            {applicationType === 'wifi-registration' && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Device Type</InputLabel>
                  <Select
                    value={form.device_type}
                    onChange={(e) => setForm(prev => ({ ...prev, device_type: e.target.value }))}
                    label="Device Type"
                  >
                    <MenuItem value="Laptop">Laptop</MenuItem>
                    <MenuItem value="Mobile">Mobile</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Brand/Model"
                  value={form.brand_model}
                  onChange={(e) => setForm(prev => ({ ...prev, brand_model: e.target.value }))}
                  placeholder="e.g., Dell Inspiron 15, Samsung Galaxy S21"
                  helperText="Specify the brand and model of your device"
                />
                <TextField
                  fullWidth
                  label="MAC Address"
                  value={form.mac_address}
                  onChange={(e) => setForm(prev => ({ ...prev, mac_address: e.target.value }))}
                  placeholder="e.g., 00:1B:44:11:3A:B7"
                  helperText="Find MAC address in device settings"
                />
              </Stack>
            )}

            {applicationType === 'outing' && (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Exit Date"
                      value={form.exit_date}
                      onChange={(e) => setForm(prev => ({ ...prev, exit_date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Exit Time"
                      value={form.exit_time}
                      onChange={(e) => setForm(prev => ({ ...prev, exit_time: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  type="date"
                  label="Expected Return Date"
                  value={form.return_date}
                  onChange={(e) => setForm(prev => ({ ...prev, return_date: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Reason"
                  value={form.reason}
                  onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Please provide detailed reason for outing..."
                />
              </Stack>
            )}

            {applicationType === 'complaint-escalation' && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Complaint Type</InputLabel>
                  <Select
                    value={form.complaint_type}
                    onChange={(e) => setForm(prev => ({ ...prev, complaint_type: e.target.value }))}
                    label="Complaint Type"
                  >
                    <MenuItem value="Plumbing">Plumbing</MenuItem>
                    <MenuItem value="Electrical">Electrical</MenuItem>
                    <MenuItem value="Carpentry">Carpentry</MenuItem>
                    <MenuItem value="WiFi">WiFi</MenuItem>
                    <MenuItem value="Mess/Food">Mess/Food</MenuItem>
                    <MenuItem value="Water Supply">Water Supply</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Complaint Description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your complaint in detail..."
                />
                <TextField
                  fullWidth
                  label="Previous Ticket No"
                  value={form.ticket_no}
                  onChange={(e) => setForm(prev => ({ ...prev, ticket_no: e.target.value }))}
                  placeholder="RC Ticket No: ______"
                  helperText="Previous unresolved complaint ticket number"
                />
              </Stack>
            )}

            {applicationType === 'medical-rebate' && (
              <Stack spacing={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="From Date"
                      value={form.from_date}
                      onChange={(e) => setForm(prev => ({ ...prev, from_date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      helperText="Medical absence start date"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="To Date"
                      value={form.to_date}
                      onChange={(e) => setForm(prev => ({ ...prev, to_date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                      helperText="Medical absence end date"
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Medical Certificate Upload"
                  value={form.upload_certificate}
                  onChange={(e) => setForm(prev => ({ ...prev, upload_certificate: e.target.value }))}
                  placeholder="Upload medical certificate (PDF, <1MB)"
                  helperText="Required medical certificate for rebate approval"
                />
              </Stack>
            )}

            {applicationType === 'feedback' && (
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Feedback Type</InputLabel>
                  <Select
                    value={form.feedback_type}
                    onChange={(e) => setForm(prev => ({ ...prev, feedback_type: e.target.value }))}
                    label="Feedback Type"
                  >
                    <MenuItem value="Mess Food Quality">Mess Food Quality</MenuItem>
                    <MenuItem value="Hostel Facilities">Hostel Facilities (Water, WiFi, Cleanliness, Electricity)</MenuItem>
                    <MenuItem value="Staff Behaviour">Staff Behaviour</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Rating</InputLabel>
                  <Select
                    value={form.rating}
                    onChange={(e) => setForm(prev => ({ ...prev, rating: e.target.value }))}
                    label="Rating"
                  >
                    <MenuItem value={1}>1 - Poor</MenuItem>
                    <MenuItem value={2}>2 - Below Average</MenuItem>
                    <MenuItem value={3}>3 - Average</MenuItem>
                    <MenuItem value={4}>4 - Good</MenuItem>
                    <MenuItem value={5}>5 - Excellent</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comments"
                  value={form.comments}
                  onChange={(e) => setForm(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Please provide detailed feedback..."
                />
              </Stack>
            )}

            {applicationType === 'readmission' && (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Updated Academic Year"
                  value={form.academic_year}
                  onChange={(e) => setForm(prev => ({ ...prev, academic_year: e.target.value }))}
                  placeholder="e.g., 2025-2026"
                  helperText="Academic year for readmission"
                />
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Block Preferences (Rank 1 to 5):
                </Typography>
                {[0, 1, 2, 3, 4].map((index) => (
                  <TextField
                    key={index}
                    fullWidth
                    label={`Preference ${index + 1}`}
                    value={form.block_preferences[index]}
                    onChange={(e) => {
                      const newPrefs = [...form.block_preferences]
                      newPrefs[index] = e.target.value
                      setForm(prev => ({ ...prev, block_preferences: newPrefs }))
                    }}
                    placeholder={`Block preference ${index + 1}`}
                  />
                ))}
              </Stack>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Your application will be reviewed by the hostel administration.
                You will receive updates on the status via notifications.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitApplication}
            disabled={submitting}
            startIcon={submitting ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Send />}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
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
