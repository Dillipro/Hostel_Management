import React from 'react'
import { api } from '../../api'
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress, Alert,
  Card, CardContent, Grid, Chip, Stack, Snackbar, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip, InputAdornment, Fab, Accordion, AccordionSummary, AccordionDetails,
  TableContainer, DialogContentText, Switch, FormControlLabel
} from '@mui/material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import {
  Add, Edit, Delete, Publish, Cancel, Visibility, FileDownload, Search, Clear, FilterList,
  Schedule, People, Description, AttachFile, Send, Drafts, CheckCircle, Pending,
  PictureAsPdf, Event, Group, Refresh
} from '@mui/icons-material'

export default function WardenCirculars(){
  const [items, setItems] = React.useState([])
  const [filteredItems, setFilteredItems] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Dialog states
  const [createDialog, setCreateDialog] = React.useState(false)
  const [editDialog, setEditDialog] = React.useState({ open: false, circular: null })

  // Form state
  const [form, setForm] = React.useState({
    title: '',
    body: '',
    attachments: '',
    targetAudience: 'all',
    scheduledPublish: null,
    isDraft: false
  })

  // Upload state
  const [uploading, setUploading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState('')

  // Stats calculation
  const stats = React.useMemo(() => ({
    total: items.length,
    published: items.filter(i => i.is_published).length,
    draft: items.filter(i => !i.is_published).length,
    scheduled: items.filter(i => i.scheduled_publish && new Date(i.scheduled_publish) > new Date()).length
  }), [items])

  React.useEffect(() => {
    load()
  }, [])

  React.useEffect(() => {
    const filtered = items.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.body?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'published' && item.is_published) ||
        (statusFilter === 'draft' && !item.is_published) ||
        (statusFilter === 'scheduled' && item.scheduled_publish && new Date(item.scheduled_publish) > new Date())
      
      return matchesSearch && matchesStatus
    })
    setFilteredItems(filtered)
  }, [items, searchTerm, statusFilter])

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/api/circulars')
      setItems(response.data || [])
      setSnackbar({ open: true, message: 'Circulars loaded successfully', severity: 'success' })
    } catch (err) {
      console.error('Error loading circulars:', err)
      setError('Failed to load circulars. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load circulars', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const create = async () => {
    try {
      setUploading(true)
      setUploadProgress('Creating circular...')
      
      const payload = {
        ...form,
        scheduled_publish: form.scheduledPublish?.toISOString() || null,
        is_published: !form.isDraft
      }
      
      const response = await api.post('/api/circulars', payload)
      setItems(prev => [response.data, ...prev])
      
      // Reset form and close dialog
      setForm({
        title: '',
        body: '',
        attachments: '',
        targetAudience: 'all',
        scheduledPublish: null,
        isDraft: false
      })
      setCreateDialog(false)
      setSnackbar({ open: true, message: 'Circular created successfully', severity: 'success' })
    } catch (err) {
      console.error('Error creating circular:', err)
      setSnackbar({ open: true, message: 'Failed to create circular', severity: 'error' })
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  const update = async () => {
    try {
      setUploading(true)
      setUploadProgress('Updating circular...')
      
      const payload = {
        ...form,
        scheduled_publish: form.scheduledPublish?.toISOString() || null,
        is_published: !form.isDraft
      }
      
      const response = await api.put(`/api/circulars/${editDialog.circular.id}`, payload)
      setItems(prev => prev.map(item => item.id === editDialog.circular.id ? response.data : item))
      
      setEditDialog({ open: false, circular: null })
      setSnackbar({ open: true, message: 'Circular updated successfully', severity: 'success' })
    } catch (err) {
      console.error('Error updating circular:', err)
      setSnackbar({ open: true, message: 'Failed to update circular', severity: 'error' })
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  const remove = async (id) => {
    try {
      await api.delete(`/api/circulars/${id}`)
      setItems(prev => prev.filter(item => item.id !== id))
      setSnackbar({ open: true, message: 'Circular deleted successfully', severity: 'success' })
    } catch (err) {
      console.error('Error deleting circular:', err)
      setSnackbar({ open: true, message: 'Failed to delete circular', severity: 'error' })
    }
  }

  const publish = async (id) => {
    try {
      const response = await api.post(`/api/circulars/${id}/publish`)
      setItems(prev => prev.map(item => item.id === id ? response.data : item))
      setSnackbar({ open: true, message: 'Circular published successfully', severity: 'success' })
    } catch (err) {
      console.error('Error publishing circular:', err)
      setSnackbar({ open: true, message: 'Failed to publish circular', severity: 'error' })
    }
  }

  const openEditDialog = (circular) => {
    setForm({
      title: circular.title || '',
      body: circular.body || '',
      attachments: circular.attachments || '',
      targetAudience: circular.target_audience || 'all',
      scheduledPublish: circular.scheduled_publish ? new Date(circular.scheduled_publish) : null,
      isDraft: !circular.is_published
    })
    setEditDialog({ open: true, circular })
  }

  const getStatusColor = (item) => {
    if (!item.is_published) return 'default'
    if (item.scheduled_publish && new Date(item.scheduled_publish) > new Date()) return 'warning'
    return 'success'
  }

  const getStatusText = (item) => {
    if (!item.is_published) return 'Draft'
    if (item.scheduled_publish && new Date(item.scheduled_publish) > new Date()) return 'Scheduled'
    return 'Published'
  }

  return (
    <Box>
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 2,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Circulars & Announcements
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Create and manage circulars and announcements for your assigned blocks
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={() => setCreateDialog(true)}
            >
              Create Circular
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={load}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)'
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Loading circulars...
          </Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Description sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Total Circulars</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Published</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">{stats.published}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Drafts sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Drafts</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">{stats.draft}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h6">Scheduled</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">{stats.scheduled}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search circulars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredItems.length} of {items.length} circulars
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Circulars Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Target Audience</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Description sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">No circulars found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first circular'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map(item => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.body?.substring(0, 100)}{item.body?.length > 100 ? '...' : ''}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={getStatusColor(item)}
                      label={getStatusText(item)}
                    />
                  </TableCell>
                  <TableCell>{item.target_audience || 'All'}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDialog(item)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {!item.is_published && (
                        <Tooltip title="Publish">
                          <IconButton size="small" color="success" onClick={() => publish(item.id)}>
                            <Publish />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this circular?')) {
                              remove(item.id)
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={createDialog || editDialog.open}
        onClose={() => {
          setCreateDialog(false)
          setEditDialog({ open: false, circular: null })
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editDialog.open ? 'Edit Circular' : 'Create New Circular'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Content"
              value={form.body}
              onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
              multiline
              rows={6}
              sx={{ mb: 3 }}
              required
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={form.targetAudience}
                onChange={(e) => setForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                label="Target Audience"
              >
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="first_year">First Year</MenuItem>
                <MenuItem value="second_year">Second Year</MenuItem>
                <MenuItem value="third_year">Third Year</MenuItem>
                <MenuItem value="final_year">Final Year</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Scheduled Publish (Optional)"
                value={form.scheduledPublish}
                onChange={(newValue) => setForm(prev => ({ ...prev, scheduledPublish: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 3 }} />}
              />
            </LocalizationProvider>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isDraft}
                  onChange={(e) => setForm(prev => ({ ...prev, isDraft: e.target.checked }))}
                />
              }
              label="Save as Draft"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialog(false)
              setEditDialog({ open: false, circular: null })
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editDialog.open ? update : create}
            variant="contained"
            disabled={!form.title || !form.body || uploading}
            startIcon={uploading ? <Schedule /> : <Send />}
          >
            {uploading ? 'Saving...' : editDialog.open ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}