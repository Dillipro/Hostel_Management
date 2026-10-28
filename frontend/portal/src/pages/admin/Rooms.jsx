import React from 'react'
import { api } from '../../api'
import {
  Box, Select, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, Switch, FormControlLabel, Button, TextField, IconButton,
  Card, CardContent, Grid, Chip, Stack, LinearProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, TableContainer, Paper, Typography, Tooltip, Fab, Accordion, AccordionSummary, AccordionDetails,
  DialogContentText, Tabs, Tab
} from '@mui/material'
import {
  Save, Edit, Delete, Add, Search, Clear, FilterList, Refresh, Build, CheckCircle, Warning, Error, Info,
  People, Person, MeetingRoom, Hotel, Business, ExpandMore, Visibility, Assignment, SwapHoriz,
  Engineering, Schedule, EventAvailable, Block
} from '@mui/icons-material'

export default function AdminRooms(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [rooms, setRooms] = React.useState([])
  const [filteredRooms, setFilteredRooms] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [availabilityFilter, setAvailabilityFilter] = React.useState('all')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Dialog states
  const [moveDialog, setMoveDialog] = React.useState(false)
  const [maintenanceDialog, setMaintenanceDialog] = React.useState({ open: false, room: null })
  const [editDialog, setEditDialog] = React.useState({ open: false, room: null })

  // Form states
  const [move, setMove] = React.useState({ student_id:'', room_id:'' })
  const [maintenanceForm, setMaintenanceForm] = React.useState({ reason: '', estimated_completion: '', notes: '' })
  const [editForm, setEditForm] = React.useState({ capacity: 0, room_type: 'standard' })

  // Stats calculation
  const stats = React.useMemo(() => {
    const total = rooms.length
    const occupied = rooms.filter(r => r.student_count > 0).length
    const available = rooms.filter(r => r.availability === 'available' && !r.maintenance).length
    const maintenance = rooms.filter(r => r.maintenance || r.availability === 'maintenance').length
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
    return { total, occupied, available, maintenance, occupancyRate }
  }, [rooms])
  // Filter rooms based on search and availability
  React.useEffect(() => {
    let filtered = rooms
    if (availabilityFilter !== 'all') {
      switch (availabilityFilter) {
        case 'available':
          filtered = filtered.filter(room => room.availability === 'available' && !room.maintenance)
          break
        case 'occupied':
          filtered = filtered.filter(room => room.student_count > 0)
          break
        case 'maintenance':
          filtered = filtered.filter(room => room.maintenance || room.availability === 'maintenance')
          break
        case 'vacant':
          filtered = filtered.filter(room => room.student_count === 0 && room.availability === 'available' && !room.maintenance)
          break
      }
    }
    if (searchTerm) {
      filtered = filtered.filter(room =>
        room.room_no?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.room_type?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredRooms(filtered)
  }, [rooms, availabilityFilter, searchTerm])

  const loadBlocks = async () => {
    try {
      const r = await api.get('/api/admin/blocks')
      setBlocks(r.data || [])
      if (r.data && r.data[0] && !blockId) setBlockId(r.data[0].id)
    } catch (err) {
      setError('Failed to load blocks')
      setSnackbar({ open: true, message: 'Failed to load blocks', severity: 'error' })
      console.error('Load blocks error:', err)
    }
  }

  const load = React.useCallback(async () => {
    if (!blockId) return
    try {
      setLoading(true)
      setError('')
      const r = await api.get(`/api/admin/blocks/${blockId}/rooms`)
      setRooms(r.data || [])
      setSnackbar({ open: true, message: 'Rooms loaded successfully', severity: 'success' })
    } catch (err) {
      setError('Failed to load rooms')
      setSnackbar({ open: true, message: 'Failed to load rooms', severity: 'error' })
      console.error('Load rooms error:', err)
    } finally {
      setLoading(false)
    }
  }, [blockId])

  React.useEffect(() => { loadBlocks() }, [])
  React.useEffect(() => { load() }, [load])
  const toggleMaint = async (id, v) => {
    try {
      await api.patch(`/api/admin/rooms/${id}`, {
        maintenance: v,
        availability: v ? 'maintenance' : 'available'
      })
      load()
      setSnackbar({
        open: true,
        message: `Room ${v ? 'marked for maintenance' : 'maintenance cleared'}`,
        severity: 'success'
      })
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update maintenance status',
        severity: 'error'
      })
      console.error('Toggle maintenance error:', err)
    }
  }

  const doMove = async () => {
    if (!move.student_id || !move.room_id) return
    try {
      await api.post('/api/admin/rooms/move', move)
      setMove({ student_id: '', room_id: '' })
      setMoveDialog(false)
      load()
      setSnackbar({ open: true, message: 'Student moved successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to move student', severity: 'error' })
      console.error('Move student error:', err)
    }
  }

  const updateRoom = async (roomId, updates) => {
    try {
      await api.patch(`/api/admin/rooms/${roomId}`, updates)
      load()
      setSnackbar({ open: true, message: 'Room updated successfully', severity: 'success' })
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update room', severity: 'error' })
      console.error('Update room error:', err)
    }
  }

  const openEditDialog = (room) => {
    setEditForm({ capacity: room.capacity || 0, room_type: room.room_type || 'standard' })
    setEditDialog({ open: true, room })
  }

  const submitEdit = async () => {
    await updateRoom(editDialog.room.id, editForm)
    setEditDialog({ open: false, room: null })
  }

  const getAvailabilityColor = (room) => {
    if (room.maintenance || room.availability === 'maintenance') return 'warning'
    if (room.availability === 'available' && room.student_count === 0) return 'success'
    if (room.student_count > 0) return 'primary'
    return 'default'
  }

  const getAvailabilityText = (room) => {
    if (room.maintenance || room.availability === 'maintenance') return 'Maintenance'
    if (room.availability === 'available' && room.student_count === 0) return 'Vacant'
    if (room.student_count > 0) return 'Occupied'
    return 'Unknown'
  }

  const getOccupancyPercentage = (room) => {
    if (!room.capacity || room.capacity === 0) return 0
    return Math.round((room.student_count / room.capacity) * 100)
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
          🏠 Rooms Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Manage hostel rooms with occupancy tracking, maintenance scheduling, and student assignments
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
                    Total Rooms
                  </Typography>
                </Box>
                <MeetingRoom sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.occupied}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Occupied
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {stats.available}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Available
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
                    {stats.occupancyRate}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Occupancy Rate
                  </Typography>
                </Box>
                <Hotel sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls Card */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🔍 Block & Filter Controls
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Block</InputLabel>
                <Select value={blockId} onChange={e=>setBlockId(e.target.value)} label="Select Block">
                  {blocks.map(b => (
                    <MenuItem key={b.id} value={b.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ fontSize: 18 }} />
                        <Typography>{b.name || b.id}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: 'action.active' }} />
                  ),
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Clear />
                    </IconButton>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Availability Filter</InputLabel>
                <Select value={availabilityFilter} onChange={e=>setAvailabilityFilter(e.target.value)} label="Availability Filter">
                  <MenuItem value="all">All Rooms</MenuItem>
                  <MenuItem value="available">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                      <Typography>Available</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="occupied">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <People sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography>Occupied</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="vacant">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MeetingRoom sx={{ fontSize: 18, color: 'info.main' }} />
                      <Typography>Vacant</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="maintenance">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Build sx={{ fontSize: 18, color: 'warning.main' }} />
                      <Typography>Maintenance</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
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
                  onClick={() => setMoveDialog(true)}
                  startIcon={<SwapHoriz />}
                >
                  Move Student
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🏢 Rooms in {blocks.find(b => b.id === blockId)?.name || blockId} ({filteredRooms.length} {availabilityFilter !== 'all' ? availabilityFilter : 'total'})
          </Typography>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell><strong>Room No</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Capacity</strong></TableCell>
                  <TableCell><strong>Occupancy</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Maintenance</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Loading rooms...' : 'No rooms found matching your criteria'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRooms.map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {r.room_no}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.room_type || 'Standard'}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {r.capacity || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {r.student_count ?? 0}/{r.capacity || 0}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getOccupancyPercentage(r)}
                            sx={{ width: 60, height: 6 }}
                            color={getOccupancyPercentage(r) === 100 ? 'error' : 'primary'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getOccupancyPercentage(r)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getAvailabilityText(r)}
                          size="small"
                          color={getAvailabilityColor(r)}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!r.maintenance || r.availability === 'maintenance'}
                              onChange={e => toggleMaint(r.id, e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="caption">
                              {r.maintenance ? 'On' : 'Off'}
                            </Typography>
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit Room">
                            <IconButton size="small" onClick={() => openEditDialog(r)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Save Capacity">
                            <IconButton
                              size="small"
                              onClick={() => updateRoom(r.id, { capacity: r.capacity })}
                              color="primary"
                            >
                              <Save />
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

      {/* Move Student Dialog */}
      <Dialog open={moveDialog} onClose={() => setMoveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapHoriz />
          Move Student to Different Room
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student ID"
                value={move.student_id}
                onChange={e => setMove({ ...move, student_id: e.target.value })}
                placeholder="Enter student ID to move"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Room</InputLabel>
                <Select
                  value={move.room_id}
                  onChange={e => setMove({ ...move, room_id: e.target.value })}
                  label="Target Room"
                >
                  <MenuItem value=""><em>Select room</em></MenuItem>
                  {rooms.filter(r => r.availability === 'available' && !r.maintenance).map(r => (
                    <MenuItem key={r.id} value={r.id}>
                      Room {r.room_no} ({r.student_count || 0}/{r.capacity || 0} occupied)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoveDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={doMove}
            variant="contained"
            disabled={!move.student_id || !move.room_id}
            startIcon={<SwapHoriz />}
          >
            Move Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, room: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit />
          Edit Room Details
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={editForm.capacity}
                onChange={e => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={editForm.room_type}
                  onChange={e => setEditForm({ ...editForm, room_type: e.target.value })}
                  label="Room Type"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="premium">Premium</MenuItem>
                  <MenuItem value="suite">Suite</MenuItem>
                  <MenuItem value="accessible">Accessible</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, room: null })}>
            Cancel
          </Button>
          <Button
            onClick={submitEdit}
            variant="contained"
            startIcon={<Save />}
          >
            Update Room
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
