import React from 'react'
import Page from '../../components/Page'
import { api } from '../../api'
import {
  Box, Button, Typography, Card, CardContent, Grid, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
  LinearProgress, IconButton, Tooltip, Divider, Paper, Alert,
  Snackbar, Stack
} from '@mui/material'
import {
  CreditCard, Download, Refresh, Person, School, LocationOn,
  CalendarToday, CheckCircle, Info, Warning, Print
} from '@mui/icons-material'

export default function StudentIDCard(){
  const [me, setMe] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [generating, setGenerating] = React.useState(false)
  const [previewDialog, setPreviewDialog] = React.useState(false)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  const loadStudentData = async () => {
    try {
      setLoading(true)
      const r = await api.get('/api/students/me')
      setMe(r.data)
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load student data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadStudentData() }, [])

  const generateIDCard = async () => {
    if (!me?.id) return

    try {
      setGenerating(true)
      await api.post(`/api/students/${me.id}/idcard`)
      setSnackbar({
        open: true,
        message: 'ID Card generated successfully!',
        severity: 'success'
      })
      // Refresh student data to get updated ID card info
      await loadStudentData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Failed to generate ID card',
        severity: 'error'
      })
    } finally {
      setGenerating(false)
    }
  }

  const pdfUrl = me?.id ? `/api/students/${me.id}/idcard.pdf` : ''

  // Mock ID card data - in real app, this would come from the student record
  const idCardData = {
    cardNumber: `HTL${me?.id?.toString().padStart(4, '0') || '0000'}`,
    issueDate: new Date().toLocaleDateString(),
    expiryDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), new Date().getDate()).toLocaleDateString(),
    bloodGroup: me?.blood_group || 'Not specified',
    emergencyContact: me?.emergency_contact || 'Not specified',
    roomNumber: me?.room?.room_number || 'Not assigned',
    block: me?.room?.block || 'Not assigned'
  }
  return (
    <Page title="ID Card">
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            🆔 Student ID Card
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Generate and manage your official hostel identification card
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CreditCard />}
              onClick={() => setPreviewDialog(true)}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              Preview Card
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={generateIDCard}
              disabled={generating || loading}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {generating ? 'Generating...' : 'Generate ID Card'}
            </Button>
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

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading student information...</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Student Information Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.main',
                      fontSize: '2rem'
                    }}
                  >
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {me?.name || 'Student Name'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {me?.id || 'Not available'}
                    </Typography>
                    <Chip
                      label="Active Student"
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <School sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Course</Typography>
                      <Typography variant="body1">{me?.course || 'Not specified'}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Room</Typography>
                      <Typography variant="body1">
                        {idCardData.roomNumber} - {idCardData.block}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarToday sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">Joining Date</Typography>
                      <Typography variant="body1">
                        {me?.joining_date ? new Date(me.joining_date).toLocaleDateString() : 'Not specified'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* ID Card Details */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                  🆔 ID Card Information
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Card Number</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {idCardData.cardNumber}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Issue Date</Typography>
                    <Typography variant="body1">{idCardData.issueDate}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body1">{idCardData.expiryDate}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Blood Group</Typography>
                    <Typography variant="body1">{idCardData.bloodGroup}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Emergency Contact</Typography>
                    <Typography variant="body1">{idCardData.emergencyContact}</Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Important:</strong> Keep your ID card safe and carry it at all times within the hostel premises.
                  </Typography>
                </Alert>

                {pdfUrl && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Download />}
                    component="a"
                    href={pdfUrl}
                    target="_blank"
                    sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)' }}
                  >
                    Download ID Card PDF
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ID Card Preview Dialog */}
      <Dialog open={previewDialog} onClose={() => setPreviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CreditCard />
          ID Card Preview
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Mock ID Card Design */}
          <Paper
            elevation={4}
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Anna University
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Hostel Management System
              </Typography>
            </Box>

            {/* Student Photo Placeholder */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  border: '3px solid rgba(255,255,255,0.3)'
                }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
            </Box>

            {/* Student Details */}
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {me?.name || 'Student Name'}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.9 }}>
                ID: {idCardData.cardNumber}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.9 }}>
                Room: {idCardData.roomNumber} - {idCardData.block}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.9 }}>
                Course: {me?.course || 'Not specified'}
              </Typography>
            </Stack>

            {/* Validity */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Valid From</Typography>
                <Typography variant="body2">{idCardData.issueDate}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Valid Till</Typography>
                <Typography variant="body2">{idCardData.expiryDate}</Typography>
              </Box>
            </Box>

            {/* Barcode/QR Placeholder */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Box
                sx={{
                  width: 120,
                  height: 40,
                  mx: 'auto',
                  bgcolor: 'white',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" sx={{ color: 'black', fontWeight: 'bold' }}>
                  {idCardData.cardNumber}
                </Typography>
              </Box>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
              }}
            />
          </Paper>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This is a preview of your ID card. Generate the actual card to get the PDF version.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={generateIDCard}
            disabled={generating}
            startIcon={generating ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Print />}
            sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)' }}
          >
            {generating ? 'Generating...' : 'Generate Card'}
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
