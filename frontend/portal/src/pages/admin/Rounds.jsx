import React from 'react'
import { api } from '../../api'
import {
  Box, Paper, Typography, Button, TextField, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  Card, CardContent, Grid, Chip, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, LinearProgress, FormControl, InputLabel, Stack, Avatar, Fab,
  TableContainer, TableSortLabel, InputAdornment
} from '@mui/material'
import {
  Add, Edit, Delete, Refresh, FileDownload, Search, FilterList,
  Schedule, EventAvailable, EventBusy, CheckCircle, Cancel, Pending,
  CalendarToday, Timeline
} from '@mui/icons-material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

export default function AdminRounds(){
  const [rows, setRows] = React.useState([])
  const [filteredRows, setFilteredRows] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [typeFilter, setTypeFilter] = React.useState('all')
  const [sortConfig, setSortConfig] = React.useState({ key: 'open_date', direction: 'desc' })

  // Dialog states
  const [createDialog, setCreateDialog] = React.useState(false)
  const [editDialog, setEditDialog] = React.useState({ open: false, round: null })
  const [deleteDialog, setDeleteDialog] = React.useState({ open: false, round: null })

  // Form states
  const [form, setForm] = React.useState({
    academic_year: dayjs().year() + '-' + (dayjs().year() + 1).toString().slice(-2),
    round_type: 'initial',
    open_date: dayjs().add(1, 'day').startOf('day'),
    close_date: dayjs().add(7, 'day').endOf('day'),
    status: 'open'
  })

  // Snackbar
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Metrics
  const [metrics, setMetrics] = React.useState({
    totalRounds: 0,
    activeRounds: 0,
    upcomingRounds: 0,
    completedRounds: 0
  })

  const load = async ()=>{
    try {
      setLoading(true)
      setError(null)
      const r = await api.get('/api/admin/rounds')
      const rounds = r.data || []
      setRows(rounds)
      setFilteredRows(rounds)

      // Calculate metrics
      const now = new Date()
      const metrics = {
        totalRounds: rounds.length,
        activeRounds: rounds.filter(r => r.status === 'open' && new Date(r.open_date) <= now && (!r.close_date || new Date(r.close_date) >= now)).length,
        upcomingRounds: rounds.filter(r => new Date(r.open_date) > now).length,
        completedRounds: rounds.filter(r => r.status === 'finalized' || (r.close_date && new Date(r.close_date) < now)).length
      }
      setMetrics(metrics)

      setSnackbar({ open: true, message: 'Rounds data loaded successfully', severity: 'success' })
    } catch (err) {
      setError('Failed to load rounds data')
      setSnackbar({ open: true, message: 'Failed to load rounds data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() },[])

  // Filter and sort data
  React.useEffect(() => {
    let filtered = rows.filter(round => {
      const matchesSearch = round.academic_year.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           round.round_type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || round.status === statusFilter
      const matchesType = typeFilter === 'all' || round.round_type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (sortConfig.key === 'open_date' || sortConfig.key === 'close_date') {
        const aDate = new Date(aValue || '1970-01-01')
        const bDate = new Date(bValue || '1970-01-01')
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredRows(filtered)
  }, [rows, searchTerm, statusFilter, typeFilter, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const valid = React.useMemo(()=>{
    if (!form.open_date || !form.academic_year) return false
    if (form.close_date && dayjs(form.open_date).isAfter(dayjs(form.close_date))) return false
    return true
  },[form])

  const create = async ()=>{
    if(!valid) return
    try {
      await api.post('/api/admin/rounds', {
        ...form,
        open_date: form.open_date.toISOString(),
        close_date: form.close_date ? form.close_date.toISOString() : null
      })
      setForm({
        academic_year: dayjs().year() + '-' + (dayjs().year() + 1).toString().slice(-2),
        round_type: 'initial',
        open_date: dayjs().add(1, 'day').startOf('day'),
        close_date: dayjs().add(7, 'day').endOf('day'),
        status: 'open'
      })
      setCreateDialog(false)
      load()
      setSnackbar({ open: true, message: 'Round created successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create round', severity: 'error' })
    }
  }

  const update = async (id, patch)=>{
    try {
      await api.put(`/api/admin/rounds/${id}`, patch)
      load()
      setSnackbar({ open: true, message: 'Round updated successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update round', severity: 'error' })
    }
  }

  const remove = async (id)=>{
    try {
      await api.delete(`/api/admin/rounds/${id}`)
      setDeleteDialog({ open: false, round: null })
      load()
      setSnackbar({ open: true, message: 'Round deleted successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete round', severity: 'error' })
    }
  }

  const exportRounds = () => {
    const csv = [
      ['Academic Year', 'Round Type', 'Open Date', 'Close Date', 'Status'],
      ...filteredRows.map(row => [
        row.academic_year,
        row.round_type,
        new Date(row.open_date).toLocaleString(),
        row.close_date ? new Date(row.close_date).toLocaleString() : 'No close date',
        row.status
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rounds.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    setSnackbar({ open: true, message: 'Rounds data exported successfully', severity: 'success' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success'
      case 'closed': return 'warning'
      case 'finalized': return 'info'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <CheckCircle />
      case 'closed': return <Cancel />
      case 'finalized': return <EventAvailable />
      default: return <Pending />
    }
  }

  const getRoundTypeColor = (type) => {
    switch (type) {
      case 'initial': return 'primary'
      case 'readmission': return 'secondary'
      case 'extra': return 'warning'
      default: return 'default'
    }
  }

  const handleEdit = (round) => {
    setEditDialog({
      open: true,
      round: {
        ...round,
        open_date: dayjs(round.open_date),
        close_date: round.close_date ? dayjs(round.close_date) : null
      }
    })
  }

  const saveEdit = async () => {
    if (!editDialog.round) return
    const patch = {
      academic_year: editDialog.round.academic_year,
      round_type: editDialog.round.round_type,
      open_date: editDialog.round.open_date.toISOString(),
      close_date: editDialog.round.close_date ? editDialog.round.close_date.toISOString() : null,
      status: editDialog.round.status
    }
    await update(editDialog.round.id, patch)
    setEditDialog({ open: false, round: null })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            📅 Admission Rounds Management
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Manage admission rounds, schedules, and application periods for hostel allotments
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {metrics.totalRounds}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Rounds
                    </Typography>
                  </Box>
                  <Timeline sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {metrics.activeRounds}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Rounds
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
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
                      {metrics.upcomingRounds}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Upcoming Rounds
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {metrics.completedRounds}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Completed Rounds
                    </Typography>
                  </Box>
                  <EventAvailable sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls Card */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                🔍 Search & Filters
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialog(true)}
                  sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  Create Round
                </Button>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={load} disabled={loading}>
                    <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export Data">
                  <IconButton onClick={exportRounds}>
                    <FileDownload />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by academic year or type..."
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
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status Filter"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                    <MenuItem value="finalized">Finalized</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type Filter</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type Filter"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="initial">Initial</MenuItem>
                    <MenuItem value="readmission">Readmission</MenuItem>
                    <MenuItem value="extra">Extra</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredRows.length} of {rows.length} rounds
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Rounds Table */}
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'academic_year'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('academic_year')}
                      >
                        Academic Year
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'round_type'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('round_type')}
                      >
                        Round Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'open_date'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('open_date')}
                      >
                        Open Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortConfig.key === 'close_date'}
                        direction={sortConfig.direction}
                        onClick={() => handleSort('close_date')}
                      >
                        Close Date
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((round) => (
                    <TableRow key={round.id} hover sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {round.academic_year}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={round.round_type}
                          size="small"
                          color={getRoundTypeColor(round.round_type)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {new Date(round.open_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(round.open_date).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {round.close_date ? (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EventBusy sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {new Date(round.close_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(round.close_date).toLocaleTimeString()}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No close date
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(round.status)}
                          label={round.status}
                          size="small"
                          color={getStatusColor(round.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit Round">
                          <IconButton size="small" onClick={() => handleEdit(round)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={round.status === 'open' ? 'Close Round' : 'Reopen Round'}>
                          <IconButton
                            size="small"
                            onClick={() => update(round.id, { status: round.status === 'open' ? 'closed' : 'open' })}
                          >
                            {round.status === 'open' ? <Cancel /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Round">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, round })}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredRows.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No rounds found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Create Round Dialog */}
        <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            ➕ Create New Admission Round
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Academic Year"
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  placeholder="e.g., 2024-25"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Round Type</InputLabel>
                  <Select
                    value={form.round_type}
                    onChange={(e) => setForm({ ...form, round_type: e.target.value })}
                    label="Round Type"
                  >
                    <MenuItem value="initial">Initial</MenuItem>
                    <MenuItem value="readmission">Readmission</MenuItem>
                    <MenuItem value="extra">Extra</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Open Date & Time"
                  value={form.open_date}
                  onChange={(value) => setForm({ ...form, open_date: value })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Close Date & Time (Optional)"
                  value={form.close_date}
                  onChange={(value) => setForm({ ...form, close_date: value })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                    <MenuItem value="finalized">Finalized</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={create}
              disabled={!valid}
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Create Round
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Round Dialog */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, round: null })} maxWidth="md" fullWidth>
          <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            ✏️ Edit Admission Round
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {editDialog.round && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={editDialog.round.academic_year}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      round: { ...editDialog.round, academic_year: e.target.value }
                    })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Round Type</InputLabel>
                    <Select
                      value={editDialog.round.round_type}
                      onChange={(e) => setEditDialog({
                        ...editDialog,
                        round: { ...editDialog.round, round_type: e.target.value }
                      })}
                      label="Round Type"
                    >
                      <MenuItem value="initial">Initial</MenuItem>
                      <MenuItem value="readmission">Readmission</MenuItem>
                      <MenuItem value="extra">Extra</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Open Date & Time"
                    value={editDialog.round.open_date}
                    onChange={(value) => setEditDialog({
                      ...editDialog,
                      round: { ...editDialog.round, open_date: value }
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Close Date & Time (Optional)"
                    value={editDialog.round.close_date}
                    onChange={(value) => setEditDialog({
                      ...editDialog,
                      round: { ...editDialog.round, close_date: value }
                    })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={editDialog.round.status}
                      onChange={(e) => setEditDialog({
                        ...editDialog,
                        round: { ...editDialog.round, status: e.target.value }
                      })}
                      label="Status"
                    >
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                      <MenuItem value="finalized">Finalized</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, round: null })}>Cancel</Button>
            <Button
              variant="contained"
              onClick={saveEdit}
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, round: null })}>
          <DialogTitle sx={{ color: 'error.main' }}>⚠️ Delete Admission Round</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the round for <strong>{deleteDialog.round?.academic_year}</strong> ({deleteDialog.round?.round_type})?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, round: null })}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => remove(deleteDialog.round.id)}
            >
              Delete
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
