import React from 'react'
import { api } from '../../api'
import {
  Box, Button, Select, MenuItem, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField,
  Card, CardContent, Grid, Chip, Stack, LinearProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, IconButton, Tooltip, InputAdornment, Fab, Accordion, AccordionSummary, AccordionDetails,
  FormControl, InputLabel, TableContainer, DialogContentText
} from '@mui/material'
import {
  PlayArrow, CheckCircle, Save, Compare, GetApp, PictureAsPdf, ExpandMore, Settings,
  Assignment, Timeline, People, Business, Warning, Error, Info, Refresh,
  Analytics, AssignmentTurnedIn, CompareArrows, History, PlayCircleOutline, CheckCircle as CheckCircleIcon,
  FileDownload, Visibility, Forward, Restore, Add, Delete, Search, FilterList, Clear,
  ThumbUp, ThumbDown, Schedule, CheckCircleOutline, CancelOutlined, Description
} from '@mui/icons-material'

export default function AdminAppeals(){
  const [items, setItems] = React.useState([])
  const [filteredItems, setFilteredItems] = React.useState([])
  const [status, setStatus] = React.useState('pending')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })
  const [selectedAppeal, setSelectedAppeal] = React.useState(null)
  const [decisionDialog, setDecisionDialog] = React.useState({ open: false, appeal: null, decision: '', note: '' })

  // Stats calculation
  const stats = React.useMemo(() => ({
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    approved: items.filter(i => i.status === 'approved').length,
    rejected: items.filter(i => i.status === 'rejected').length
  }), [items])

  const load = async ()=>{
    try {
      setLoading(true)
      setError('')
      const r = await api.get('/api/appeals', { params: { status: status||undefined } })
      setItems(r.data||[])
      setSnackbar({ open: true, message: 'Appeals loaded successfully', severity: 'success' })
    } catch (err) {
      setError('Failed to load appeals')
      setSnackbar({ open: true, message: 'Failed to load appeals', severity: 'error' })
      console.error('Load appeals error:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() },[status])
  const handleDecision = async (appeal, decision) => {
    setDecisionDialog({ open: true, appeal, decision, note: '' })
  }

  const submitDecision = async () => {
    try {
      const { appeal, decision, note } = decisionDialog
      await api.post(`/api/appeals/${appeal.id}/decision`, { decision, note })
      setDecisionDialog({ open: false, appeal: null, decision: '', note: '' })
      await load()
      setSnackbar({
        open: true,
        message: `Appeal ${decision} successfully`,
        severity: 'success'
      })
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to ${decisionDialog.decision} appeal`,
        severity: 'error'
      })
      console.error('Decision error:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Schedule />
      case 'approved': return <CheckCircleOutline />
      case 'rejected': return <CancelOutlined />
      default: return <Info />
    }
  }
  return (
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
          📋 Appeals Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Review and manage student appeals with streamlined approval workflows
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
                    Total Appeals
                  </Typography>
                </Box>
                <Description sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Review
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Approved
                  </Typography>
                </Box>
                <CheckCircleOutline sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Rejected
                  </Typography>
                </Box>
                <CancelOutlined sx={{ fontSize: 40, opacity: 0.8 }} />
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
                label="Search appeals..."
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
                <Select value={status} onChange={e=>setStatus(e.target.value)} label="Status Filter">
                  <MenuItem value="">All Appeals</MenuItem>
                  <MenuItem value="pending">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 18 }} />
                      <Typography>Pending</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="approved">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutline sx={{ fontSize: 18 }} />
                      <Typography>Approved</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CancelOutlined sx={{ fontSize: 18 }} />
                      <Typography>Rejected</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={load}
                  disabled={loading}
                  startIcon={loading ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Refresh />}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  onClick={() => {
                    // Export functionality could be added here
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

      {/* Appeals Table */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            📝 Appeals List ({filteredItems.length} {status ? status : 'total'})
          </Typography>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Student ID</strong></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Loading appeals...' : 'No appeals found matching your criteria'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(it => (
                    <TableRow key={it.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(it.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(it.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={it.student_id}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                          {it.reason?.length > 100 ? `${it.reason.substring(0, 100)}...` : it.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(it.status)}
                          label={it.status}
                          size="small"
                          color={getStatusColor(it.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {it.status === 'pending' ? (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<ThumbUp />}
                              onClick={() => handleDecision(it, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<ThumbDown />}
                              onClick={() => handleDecision(it, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {it.status === 'approved' ? 'Approved' : 'Rejected'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Decision Dialog */}
      <Dialog open={decisionDialog.open} onClose={() => setDecisionDialog({ open: false, appeal: null, decision: '', note: '' })}>
        <DialogTitle>
          {decisionDialog.decision === 'approved' ? '✅ Approve Appeal' : '❌ Reject Appeal'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {decisionDialog.appeal && (
              <>
                <strong>Student:</strong> {decisionDialog.appeal.student_id}<br />
                <strong>Reason:</strong> {decisionDialog.appeal.reason}<br />
                <strong>Decision:</strong> {decisionDialog.decision}
              </>
            )}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Decision Note (Optional)"
            fullWidth
            multiline
            rows={3}
            value={decisionDialog.note}
            onChange={(e) => setDecisionDialog(prev => ({ ...prev, note: e.target.value }))}
            placeholder="Add any notes or comments about this decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDecisionDialog({ open: false, appeal: null, decision: '', note: '' })}>
            Cancel
          </Button>
          <Button
            onClick={submitDecision}
            variant="contained"
            color={decisionDialog.decision === 'approved' ? 'success' : 'error'}
          >
            {decisionDialog.decision === 'approved' ? 'Approve' : 'Reject'}
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
  )
}
