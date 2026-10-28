import React from 'react'
import { api } from '../../api'
import Page from '../../components/Page'
import {
  TextField, Box, Button, Typography, Grid, Alert, Avatar, Stack, Card, CardContent,
  Divider, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Chip, Fab, Snackbar, FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import {
  Edit, Save, Cancel, PhotoCamera, Security, AccountCircle, School, Phone,
  Email, CalendarToday, Badge, Engineering, Person, Lock, CheckCircle,
  Error, Visibility, VisibilityOff
} from '@mui/icons-material'
import { cropImageToSquare } from '../../utils/image'

export default function StudentProfile(){
  const [me, setMe] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [editMode, setEditMode] = React.useState(false)

  // Profile form state
  const [profileData, setProfileData] = React.useState({
    name: '',
    phone: '',
    dob: '',
    regNo: '',
    department: '',
    year: '',
    avatarUrl: ''
  })

  // Password change state
  const [passwordDialog, setPasswordDialog] = React.useState(false)
  const [passwordData, setPasswordData] = React.useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswords, setShowPasswords] = React.useState({
    current: false,
    new: false,
    confirm: false
  })

  // UI state
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })
  const [passwordMessage, setPasswordMessage] = React.useState(null)
  const load = async () => {
    try {
      setLoading(true)
      const r = await api.get('/api/students/me')
      setMe(r.data)
      setProfileData({
        name: r.data.name || '',
        phone: r.data.phone || '',
        dob: r.data.dob ? r.data.dob.slice(0, 10) : '',
        regNo: r.data.reg_no || '',
        department: r.data.department || '',
        year: r.data.year || '',
        avatarUrl: r.data.avatar_url || ''
      })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load profile', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [])

  const saveProfile = async () => {
    try {
      setSaving(true)
      await api.put('/api/students/me', {
        name: profileData.name,
        phone: profileData.phone,
        dob: profileData.dob || undefined,
        reg_no: profileData.regNo || undefined,
        department: profileData.department || undefined,
        year: profileData.year || undefined,
        avatar_url: profileData.avatarUrl || undefined,
      })
      await load()
      setEditMode(false)
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    // Reset to original data
    if (me) {
      setProfileData({
        name: me.name || '',
        phone: me.phone || '',
        dob: me.dob ? me.dob.slice(0, 10) : '',
        regNo: me.reg_no || '',
        department: me.department || '',
        year: me.year || '',
        avatarUrl: me.avatar_url || ''
      })
    }
    setEditMode(false)
  }

  const onPickAvatar = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const cropped = await cropImageToSquare(f, 256).catch(() => f)
      const fd = new FormData()
      fd.append('file', cropped)
      const r = await api.post('/api/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfileData(prev => ({ ...prev, avatarUrl: r.data.url }))
      setSnackbar({ open: true, message: 'Avatar updated successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to upload avatar', severity: 'error' })
    }
  }

  const changePassword = async () => {
    setPasswordMessage(null)
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      setPasswordMessage({ type: 'error', text: 'Fill all password fields' })
      return
    }
    if (passwordData.new !== passwordData.confirm) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (passwordData.new.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    try {
      await api.post('/api/auth/change-password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      })
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' })
      setPasswordData({ current: '', new: '', confirm: '' })
      setTimeout(() => setPasswordDialog(false), 2000)
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to change password'
      setPasswordMessage({ type: 'error', text: msg })
    }
  }
  if (loading) {
    return (
      <Page title="Profile">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LinearProgress sx={{ width: '200px' }} />
        </Box>
      </Page>
    )
  }

  return (
    <Page title="My Profile">
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
            👤 My Profile
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Manage your personal information and account settings
          </Typography>
          <Stack direction="row" spacing={2}>
            <Chip
              label="Student"
              color="success"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            />
            {me?.active && (
              <Chip
                label="Active"
                color="success"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              />
            )}
          </Stack>
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

      <Grid container spacing={4}>
        {/* Profile Avatar & Basic Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, textAlign: 'center', p: 2 }}>
            <CardContent>
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                <Avatar
                  src={profileData.avatarUrl || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    border: '4px solid #667eea',
                    boxShadow: 3
                  }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
                <Tooltip title="Change Avatar">
                  <label>
                    <input type="file" accept="image/*" hidden onChange={onPickAvatar} />
                    <Fab
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: 16 }} />
                    </Fab>
                  </label>
                </Tooltip>
              </Box>

              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {profileData.name || 'Student'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {me?.email}
              </Typography>

              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => setPasswordDialog(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Change Password
                </Button>
                {!editMode ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    sx={{
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={saveProfile}
                      disabled={saving}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={cancelEdit}
                      sx={{ borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                📋 Personal Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={profileData.dob}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dob: e.target.value }))}
                    disabled={!editMode}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    value={profileData.regNo}
                    onChange={(e) => setProfileData(prev => ({ ...prev, regNo: e.target.value }))}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={profileData.department}
                    onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: <Engineering sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={!editMode}>
                    <InputLabel>Year of Study</InputLabel>
                    <Select
                      value={profileData.year}
                      onChange={(e) => setProfileData(prev => ({ ...prev, year: e.target.value }))}
                      label="Year of Study"
                      startAdornment={<School sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      <MenuItem value="1">1st Year</MenuItem>
                      <MenuItem value="2">2nd Year</MenuItem>
                      <MenuItem value="3">3rd Year</MenuItem>
                      <MenuItem value="4">4th Year</MenuItem>
                      <MenuItem value="5">5th Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                🔐 Account Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {me?.email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Account Status
                    </Typography>
                    <Chip
                      label={me?.active ? 'Active' : 'Inactive'}
                      color={me?.active ? 'success' : 'error'}
                      size="small"
                      icon={me?.active ? <CheckCircle /> : <Error />}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Member Since
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {me?.created_at ? new Date(me.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Last Updated
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {me?.updated_at ? new Date(me.updated_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Lock />
          Change Password
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {passwordMessage && (
            <Alert severity={passwordMessage.type} sx={{ mb: 2 }}>
              {passwordMessage.text}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              fullWidth
              type={showPasswords.current ? 'text' : 'password'}
              label="Current Password"
              value={passwordData.current}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              type={showPasswords.new ? 'text' : 'password'}
              label="New Password"
              value={passwordData.new}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              type={showPasswords.confirm ? 'text' : 'password'}
              label="Confirm New Password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={changePassword}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Update Password
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
