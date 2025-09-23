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

export default function AdminCirculars(){
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

  // Filter items based on search and status
  React.useEffect(() => {
    let filtered = items
    if (statusFilter !== 'all') {
      if (statusFilter === 'published') {
        filtered = filtered.filter(item => item.is_published)
      } else if (statusFilter === 'draft') {
        filtered = filtered.filter(item => !item.is_published)
      } else if (statusFilter === 'scheduled') {
        filtered = filtered.filter(item => item.scheduled_publish && new Date(item.scheduled_publish) > new Date())
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.body?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredItems(filtered)
  }, [items, statusFilter, searchTerm])

  const load = async ()=>{
    try {
      setLoading(true)
      setError('')
      const r = await api.get('/api/circulars')
      setItems(r.data||[])
      setSnackbar({ open: true, message: 'Circulars loaded successfully', severity: 'success' })
    } catch (err) {
      setError('Failed to load circulars')
      setSnackbar({ open: true, message: 'Failed to load circulars', severity: 'error' })
      console.error('Load circulars error:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() },[])

  const create = async ()=>{
    try {
      await api.post('/api/circulars', form)
      setCreateDialog(false)
      setForm({ title:'', body:'', attachments:'', targetAudience: 'all', scheduledPublish: null, isDraft: false })
      load()
      setSnackbar({ open: true, message: 'Circular created successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create circular', severity: 'error' })
      console.error('Create circular error:', err)
    }
  }

  const update = async ()=>{
    try {
      await api.patch(`/api/circulars/${editDialog.circular.id}`, form)
      setEditDialog({ open: false, circular: null })
      setForm({ title:'', body:'', attachments:'', targetAudience: 'all', scheduledPublish: null, isDraft: false })
      load()
      setSnackbar({ open: true, message: 'Circular updated successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update circular', severity: 'error' })
      console.error('Update circular error:', err)
    }
  }

  const publish = async (id)=>{
    try {
      await api.patch(`/api/circulars/${id}/publish`)
      load()
      setSnackbar({ open: true, message: 'Circular published successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to publish circular', severity: 'error' })
      console.error('Publish circular error:', err)
    }
  }

  const unpublish = async (id)=>{
    try {
      await api.patch(`/api/circulars/${id}/unpublish`)
      load()
      setSnackbar({ open: true, message: 'Circular unpublished successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to unpublish circular', severity: 'error' })
      console.error('Cancel circular error:', err)
    }
  }

  const deleteCircular = async (id)=>{
    if (!window.confirm('Are you sure you want to delete this circular?')) return
    try {
      await api.delete(`/api/circulars/${id}`)
      load()
      setSnackbar({ open: true, message: 'Circular deleted successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete circular', severity: 'error' })
      console.error('Delete circular error:', err)
    }
  }

  const onFileUpload = async (e)=>{
    const file = e.target.files?.[0]; if(!file) return;
    const fd = new FormData(); fd.append('file', file)
    setUploading(true); setUploadProgress('Uploading...')
    try {
      const r = await api.post('/api/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(f => ({ ...f, attachments: r.data.url }))
      setUploadProgress('Upload complete')
      setSnackbar({ open: true, message: 'File uploaded successfully', severity: 'success' })
    } catch (err) {
      setUploadProgress('Upload failed')
      setSnackbar({ open: true, message: 'Failed to upload file', severity: 'error' })
    } finally { setUploading(false); e.target.value = '' }
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

  const getStatusColor = (circular) => {
    if (circular.is_published) return 'success'
    if (circular.scheduled_publish && new Date(circular.scheduled_publish) > new Date()) return 'warning'
    return 'default'
  }

  const getStatusIcon = (circular) => {
    if (circular.is_published) return <CheckCircle />
    if (circular.scheduled_publish && new Date(circular.scheduled_publish) > new Date()) return <Schedule />
    return <Drafts />
  }

  const getStatusText = (circular) => {
    if (circular.is_published) return 'Published'
    if (circular.scheduled_publish && new Date(circular.scheduled_publish) > new Date()) return 'Scheduled'
    return 'Draft'
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Modern Gradient Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 3,
            mb: 3,
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📢 Circulars Management
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Create, schedule, and manage hostel circulars with advanced publishing tools
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Circulars
                    </Typography>
                  </Box>
                  <Description sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stats.published}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Published
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stats.draft}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Drafts
                    </Typography>
                  </Box>
                  <Drafts sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {stats.scheduled}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Scheduled
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls Card */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              🔍 Search & Filter
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search circulars..."
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
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Filter</InputLabel>
                  <Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} label="Status Filter">
                    <MenuItem value="all">All Circulars</MenuItem>
                    <MenuItem value="published">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 18 }} />
                        <Typography>Published</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="draft">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Drafts sx={{ fontSize: 18 }} />
                        <Typography>Drafts</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="scheduled">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule sx={{ fontSize: 18 }} />
                        <Typography>Scheduled</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => setCreateDialog(true)}
                    startIcon={<Add />}
                  >
                    New Circular
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={load}
                    disabled={loading}
                    startIcon={loading ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Refresh />}
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownload />}
                    onClick={() => {
                      setSnackbar({ open: true, message: 'Export feature coming soon', severity: 'info' })
                    }}
                  >
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Circulars Table */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              📋 Circulars List ({filteredItems.length} {statusFilter !== 'all' ? statusFilter : 'total'})
            </Typography>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Published</strong></TableCell>
                    <TableCell><strong>Attachments</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {loading ? 'Loading circulars...' : 'No circulars found matching your criteria'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map(c => (
                      <TableRow key={c.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', maxWidth: 200 }}>
                            {c.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, display: 'block' }}>
                            {c.body?.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(c)}
                            label={getStatusText(c)}
                            size="small"
                            color={getStatusColor(c)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(c.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(c.created_at).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {c.published_at ? (
                            <>
                              <Typography variant="body2">
                                {new Date(c.published_at).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(c.published_at).toLocaleTimeString()}
                              </Typography>
                            </>
                          ) : c.scheduled_publish ? (
                            <>
                              <Typography variant="body2" color="warning.main">
                                {new Date(c.scheduled_publish).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="warning.main">
                                {new Date(c.scheduled_publish).toLocaleTimeString()}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Not published
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {c.attachments ? (
                            <IconButton
                              size="small"
                              component="a"
                              href={c.attachments}
                              target="_blank"
                              title="View attachment"
                            >
                              <PictureAsPdf color="primary" />
                            </IconButton>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              None
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEditDialog(c)}>
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            {c.is_published ? (
                              <Tooltip title="Unpublish">
                                <IconButton size="small" onClick={() => unpublish(c.id)}>
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Publish">
                                <IconButton size="small" onClick={() => publish(c.id)}>
                                  <Publish />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => deleteCircular(c.id)}>
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
          </CardContent>
        </Card>

        {/* Create Circular Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add />
            Create New Circular
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={form.title}
                  onChange={e=>setForm(f=>({...f, title:e.target.value}))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Content"
                  multiline
                  rows={6}
                  value={form.body}
                  onChange={e=>setForm(f=>({...f, body:e.target.value}))}
                  required
                  placeholder="Enter the circular content..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={form.targetAudience}
                    onChange={e=>setForm(f=>({...f, targetAudience:e.target.value}))}
                    label="Target Audience"
                  >
                    <MenuItem value="all">All Students</MenuItem>
                    <MenuItem value="undergraduate">Undergraduate</MenuItem>
                    <MenuItem value="postgraduate">Postgraduate</MenuItem>
                    <MenuItem value="freshmen">Freshmen</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isDraft}
                      onChange={e=>setForm(f=>({...f, isDraft:e.target.checked}))}
                    />
                  }
                  label="Save as Draft"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" component="label" disabled={uploading}>
                    <AttachFile sx={{ mr: 1 }} />
                    Upload PDF Attachment
                    <input type="file" accept=".pdf" hidden onChange={onFileUpload} />
                  </Button>
                  {uploading && <LinearProgress sx={{ flex: 1 }} />}
                  {uploadProgress && (
                    <Typography variant="body2" color={uploadProgress === 'Upload failed' ? 'error' : 'success'}>
                      {uploadProgress}
                    </Typography>
                  )}
                </Box>
                {form.attachments && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    PDF attached: {form.attachments.split('/').pop()}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setCreateDialog(false)
              setForm({ title:'', body:'', attachments:'', targetAudience: 'all', scheduledPublish: null, isDraft: false })
            }}>
              Cancel
            </Button>
            <Button
              onClick={create}
              variant="contained"
              disabled={!form.title || !form.body}
              startIcon={<Send />}
            >
              Create Circular
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Circular Dialog */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, circular: null })} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit />
            Edit Circular
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={form.title}
                  onChange={e=>setForm(f=>({...f, title:e.target.value}))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Content"
                  multiline
                  rows={6}
                  value={form.body}
                  onChange={e=>setForm(f=>({...f, body:e.target.value}))}
                  required
                  placeholder="Enter the circular content..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={form.targetAudience}
                    onChange={e=>setForm(f=>({...f, targetAudience:e.target.value}))}
                    label="Target Audience"
                  >
                    <MenuItem value="all">All Students</MenuItem>
                    <MenuItem value="undergraduate">Undergraduate</MenuItem>
                    <MenuItem value="postgraduate">Postgraduate</MenuItem>
                    <MenuItem value="freshmen">Freshmen</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isDraft}
                      onChange={e=>setForm(f=>({...f, isDraft:e.target.checked}))}
                    />
                  }
                  label="Save as Draft"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" component="label" disabled={uploading}>
                    <AttachFile sx={{ mr: 1 }} />
                    Upload PDF Attachment
                    <input type="file" accept=".pdf" hidden onChange={onFileUpload} />
                  </Button>
                  {uploading && <LinearProgress sx={{ flex: 1 }} />}
                  {uploadProgress && (
                    <Typography variant="body2" color={uploadProgress === 'Upload failed' ? 'error' : 'success'}>
                      {uploadProgress}
                    </Typography>
                  )}
                </Box>
                {form.attachments && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    PDF attached: {form.attachments.split('/').pop()}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setEditDialog({ open: false, circular: null })
              setForm({ title:'', body:'', attachments:'', targetAudience: 'all', scheduledPublish: null, isDraft: false })
            }}>
              Cancel
            </Button>
            <Button
              onClick={update}
              variant="contained"
              disabled={!form.title || !form.body}
              startIcon={<Send />}
            >
              Update Circular
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
      </Box>
    </LocalizationProvider>
  )
}