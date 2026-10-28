import React from 'react'
import { api } from '../../api'
import {
  Box, Select, MenuItem, Paper, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, Checkbox, FormControlLabel, Card, CardContent,
  Grid, Chip, Avatar, IconButton, Tooltip, CircularProgress, Snackbar, Alert,
  InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Fab, TableContainer
} from '@mui/material'
import {
  Campaign, Add, Edit, Delete, Search, Refresh, Schedule,
  PushPin, Visibility, CheckCircle, Event
} from '@mui/icons-material'

export default function RCNotices(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [notices, setNotices] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Create notice dialog state
  const [createDialog, setCreateDialog] = React.useState(false)
  const [form, setForm] = React.useState({
    title: '', body: '', publish_at: '', expires_at: '',
    pinned: false, dept_targets: '', year_targets: ''
  })
  const [submitting, setSubmitting] = React.useState(false)

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

  // Load notices
  const loadNotices = React.useCallback(async () => {
    if (!blockId) return

    try {
      setLoading(true)
      const r = await api.get(`/api/rc-extras/blocks/${blockId}/notices`)
      setNotices(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load notices', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [blockId])

  React.useEffect(() => { loadNotices() }, [loadNotices])

  // Filter notices based on search term
  const filteredNotices = React.useMemo(() => {
    if (!searchTerm) return notices
    return notices.filter(notice =>
      notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.body?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [notices, searchTerm])

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = notices.length
    const active = notices.filter(n => !n.expires_at || new Date(n.expires_at) > new Date()).length
    const expired = total - active
    const pinned = notices.filter(n => n.pinned).length

    return { total, active, expired, pinned }
  }, [notices])

  // Create notice
  const createNotice = async () => {
    try {
      setSubmitting(true)
      const payload = {
        title: form.title,
        body: form.body,
        publish_at: form.publish_at,
        expires_at: form.expires_at,
        pinned: !!form.pinned,
        dept_targets: form.dept_targets ? form.dept_targets.split(',').map(s => s.trim()).filter(Boolean) : [],
        year_targets: form.year_targets ? form.year_targets.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)) : []
      }
      await api.post(`/api/rc-extras/blocks/${blockId}/notices`, payload)
      setSnackbar({ open: true, message: 'Notice created successfully', severity: 'success' })
      setCreateDialog(false)
      setForm({ title: '', body: '', publish_at: '', expires_at: '', pinned: false, dept_targets: '', year_targets: '' })
      loadNotices()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create notice', severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // Delete notice
  const deleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return

    try {
      await api.delete(`/api/rc-extras/notices/${id}`)
      setSnackbar({ open: true, message: 'Notice deleted successfully', severity: 'success' })
      loadNotices()
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete notice', severity: 'error' })
    }
  }

  const isExpired = (expires_at) => {
    return expires_at && new Date(expires_at) < new Date()
  }

  const isPublished = (publish_at) => {
    return !publish_at || new Date(publish_at) <= new Date()
  }

  const getStatusColor = (notice) => {
    if (isExpired(notice.expires_at)) return 'error'
    if (!isPublished(notice.publish_at)) return 'warning'
    return 'success'
  }

  const getStatusLabel = (notice) => {
    if (isExpired(notice.expires_at)) return 'Expired'
    if (!isPublished(notice.publish_at)) return 'Scheduled'
    return 'Active'
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
          <Campaign sx={{ mr: 2, verticalAlign: 'middle' }} />
          Notice Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Create and manage notices for students in your assigned blocks
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Campaign sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Notices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.expired}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PushPin sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.pinned}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pinned
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
                label="Search Notices"
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
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialog(true)}
                  disabled={!blockId}
                  size="small"
                >
                  Create Notice
                </Button>
                <Tooltip title="Refresh">
                  <IconButton onClick={loadNotices} disabled={loading}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notices Table */}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Notice</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Publish Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredNotices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No notices found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotices.map((notice) => (
                      <TableRow key={notice.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: notice.pinned ? 'warning.main' : 'primary.main' }}>
                              {notice.pinned ? <PushPin sx={{ fontSize: 18 }} /> : <Campaign sx={{ fontSize: 18 }} />}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {notice.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {notice.body}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(notice)}
                            color={getStatusColor(notice)}
                            size="small"
                            variant="outlined"
                          />
                          {notice.pinned && (
                            <Chip
                              label="Pinned"
                              color="warning"
                              size="small"
                              sx={{ ml: 1 }}
                              icon={<PushPin sx={{ fontSize: 14 }} />}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {notice.publish_at ? new Date(notice.publish_at).toLocaleDateString() : 'Immediate'}
                          </Typography>
                          {notice.publish_at && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notice.publish_at).toLocaleTimeString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {notice.expires_at ? new Date(notice.expires_at).toLocaleDateString() : 'Never'}
                          </Typography>
                          {notice.expires_at && (
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notice.expires_at).toLocaleTimeString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton size="small" color="primary">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Notice">
                              <IconButton
                                size="small"
                                onClick={() => deleteNotice(notice.id)}
                                color="error"
                              >
                                <Delete />
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
          )}
        </CardContent>
      </Card>

      {/* Create Notice Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notice Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Publish At (Optional)"
                value={form.publish_at}
                onChange={(e) => setForm({ ...form, publish_at: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Expires At (Optional)"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notice Content"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Departments (comma-separated)"
                value={form.dept_targets}
                onChange={(e) => setForm({ ...form, dept_targets: e.target.value })}
                placeholder="e.g., CSE, ECE, IT"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target Years (comma-separated)"
                value={form.year_targets}
                onChange={(e) => setForm({ ...form, year_targets: e.target.value })}
                placeholder="e.g., 1, 2, 3"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.pinned}
                    onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  />
                }
                label="Pin this notice (appears at the top)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={createNotice}
            variant="contained"
            disabled={!form.title || !form.body || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <Add />}
          >
            {submitting ? 'Creating...' : 'Create Notice'}
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
