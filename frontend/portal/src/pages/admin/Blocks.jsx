import React from 'react'
import { api } from '../../api'
import {
  Box, Button, Dialog, DialogContent, DialogTitle, DialogActions, TextField, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, IconButton,
  Typography, Card, CardContent, Grid, Chip, Avatar, Stack, LinearProgress, Alert, Snackbar, Tooltip, InputAdornment, Fab, FormControl, InputLabel
} from '@mui/material'
import {
  Add, Edit, Person, People, MeetingRoom, Business, Search, Refresh, CheckCircle, Warning, Error,
  AdminPanelSettings, Engineering, Hotel, Group
} from '@mui/icons-material'

export default function AdminBlocks(){
  const [rows, setRows] = React.useState([])
  const [filteredRows, setFilteredRows] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name:'', type:'boys', category:'', capacity:0 })
  const [genOpen, setGenOpen] = React.useState(false)
  const [genForm, setGenForm] = React.useState({ block_id:'', count:5, start:1, prefix:'', capacity:2 })
  const [edit, setEdit] = React.useState(null)
  const [staff, setStaff] = React.useState({ rcs: [], wardens: [] })
  const [searchTerm, setSearchTerm] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })
  const load = React.useCallback(async ()=>{
    setLoading(true)
    try {
      const [b, r, w] = await Promise.all([
        api.get('/api/admin/blocks'),
        api.get('/api/admin/users', { params: { role: 'rc' } }),
        api.get('/api/admin/users', { params: { role: 'warden' } })
      ])
      setRows(b.data)
      setStaff({ rcs: r.data, wardens: w.data })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load blocks', severity: 'error' })
    } finally {
      setLoading(false)
    }
  },[])

  React.useEffect(()=>{ load() },[load])

  React.useEffect(() => {
    const filtered = rows.filter(block =>
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.type.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(block => !typeFilter || block.type === typeFilter)
    setFilteredRows(filtered)
  }, [searchTerm, typeFilter, rows])
  const create = async ()=>{
    try {
      await api.post('/api/admin/blocks', form)
      setOpen(false)
      setForm({ name:'', type:'boys', category:'', capacity:0 })
      load()
      setSnackbar({ open: true, message: 'Block created successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create block', severity: 'error' })
    }
  }

  const save = async ()=>{
    if (!edit) return
    try {
      const { id, rc_id, warden_id, rooms_count, students_count, ...payload } = edit
      await api.put(`/api/admin/blocks/${id}`, payload)
      setEdit(null)
      load()
      setSnackbar({ open: true, message: 'Block updated successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update block', severity: 'error' })
    }
  }

  const assignRc = async (id, rc_id)=>{
    try {
      await api.post(`/api/admin/blocks/${id}/assign-rc`, { rc_id })
      load()
      setSnackbar({ open: true, message: 'RC assigned successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to assign RC', severity: 'error' })
    }
  }

  const assignWarden = async (id, warden_id)=>{
    try {
      await api.post(`/api/admin/blocks/${id}/assign-warden`, { warden_id })
      load()
      setSnackbar({ open: true, message: 'Warden assigned successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to assign warden', severity: 'error' })
    }
  }

  const generateRooms = async ()=>{
    if (!genForm.block_id) return
    try {
      await api.post(`/api/admin/blocks/${genForm.block_id}/rooms/generate`, {
        prefix: genForm.prefix,
        start: genForm.start,
        count: genForm.count,
        capacity: genForm.capacity
      })
      setGenOpen(false)
      load()
      setSnackbar({ open: true, message: 'Rooms generated successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate rooms', severity: 'error' })
    }
  }

  const getCapacityStatus = (block) => {
    if (!block.capacity || !block.students_count) return { status: 'unknown', color: 'default', icon: <Warning /> }
    const percentage = (block.students_count / block.capacity) * 100
    if (percentage >= 90) return { status: 'full', color: 'error', icon: <Error /> }
    if (percentage >= 75) return { status: 'high', color: 'warning', icon: <Warning /> }
    return { status: 'normal', color: 'success', icon: <CheckCircle /> }
  }

  const getBlockStats = () => {
    const totalBlocks = rows.length
    const boysBlocks = rows.filter(b => b.type === 'boys').length
    const girlsBlocks = rows.filter(b => b.type === 'girls').length
    const totalCapacity = rows.reduce((sum, b) => sum + (b.capacity || 0), 0)
    const totalStudents = rows.reduce((sum, b) => sum + (b.students_count || 0), 0)
    const totalRooms = rows.reduce((sum, b) => sum + (b.rooms_count || 0), 0)

    return { totalBlocks, boysBlocks, girlsBlocks, totalCapacity, totalStudents, totalRooms }
  }
  const stats = getBlockStats()

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #2196f3, #21cbf3)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
            Block Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage hostel blocks, room allocation, and staff assignments
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={load}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Add Block
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Blocks</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalBlocks}</Typography>
                </Box>
                <Business sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Boys Blocks</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.boysBlocks}</Typography>
                </Box>
                <People sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #e91e63 0%, #f06292 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Girls Blocks</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.girlsBlocks}</Typography>
                </Box>
                <Group sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Capacity</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalCapacity}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {stats.totalStudents} occupied
                  </Typography>
                </Box>
                <Hotel sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Rooms</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalRooms}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Across all blocks
                  </Typography>
                </Box>
                <MeetingRoom sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search blocks by name, category, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                size="small"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value=""><em>All Types</em></MenuItem>
                <MenuItem value="boys">Boys Blocks</MenuItem>
                <MenuItem value="girls">Girls Blocks</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredRows.length} of {rows.length} blocks
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Blocks Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
              <Typography sx={{ mt: 2 }}>Loading blocks...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Block Details</TableCell>
                  <TableCell>Capacity & Occupancy</TableCell>
                  <TableCell>Room Stats</TableCell>
                  <TableCell>Resident Counselor</TableCell>
                  <TableCell>Warden</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((block) => {
                  const capacityStatus = getCapacityStatus(block)
                  const occupancyRate = block.capacity && block.students_count ?
                    Math.round((block.students_count / block.capacity) * 100) : 0

                  return (
                    <TableRow key={block.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: block.type === 'boys' ? 'primary.main' : 'secondary.main' }}>
                            {block.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {block.name}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                              <Chip
                                label={block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                                size="small"
                                color={block.type === 'boys' ? 'primary' : 'secondary'}
                                variant="outlined"
                              />
                              {block.category && (
                                <Chip
                                  label={block.category}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {block.students_count || 0} / {block.capacity || 0} students
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(occupancyRate, 100)}
                              sx={{
                                flexGrow: 1,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: capacityStatus.color === 'error' ? 'error.main' :
                                          capacityStatus.color === 'warning' ? 'warning.main' : 'success.main'
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ minWidth: 35 }}>
                              {occupancyRate}%
                            </Typography>
                            {capacityStatus.icon}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {block.rooms_count || 0} rooms
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Available for allocation
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          value={block.rc_id || ''}
                          onChange={(e) => assignRc(block.id, e.target.value)}
                          displayEmpty
                          sx={{ minWidth: 150 }}
                        >
                          <MenuItem value=""><em>No RC Assigned</em></MenuItem>
                          {staff.rcs.map((rc) => (
                            <MenuItem key={rc.id} value={rc.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Engineering sx={{ fontSize: 16 }} />
                                {rc.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          fullWidth
                          value={block.warden_id || ''}
                          onChange={(e) => assignWarden(block.id, e.target.value)}
                          displayEmpty
                          sx={{ minWidth: 150 }}
                        >
                          <MenuItem value=""><em>No Warden Assigned</em></MenuItem>
                          {staff.wardens.map((warden) => (
                            <MenuItem key={warden.id} value={warden.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AdminPanelSettings sx={{ fontSize: 16 }} />
                                {warden.name}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Generate Rooms">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setGenForm({
                                  ...genForm,
                                  block_id: block.id,
                                  prefix: block.name?.slice(0, 1)?.toUpperCase() || '',
                                  count: 5,
                                  start: 1,
                                  capacity: 2
                                })
                                setGenOpen(true)
                              }}
                            >
                              <Add />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Block">
                            <IconButton size="small" onClick={() => setEdit({ ...block })}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Block Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add />
          Create New Block
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Block Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                displayEmpty
              >
                <MenuItem value="boys">Boys Hostel</MenuItem>
                <MenuItem value="girls">Girls Hostel</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g., Premium, Standard"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Capacity"
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                helperText="Maximum number of students this block can accommodate"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={create}
            disabled={!form.name.trim()}
          >
            Create Block
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Rooms Dialog */}
      <Dialog open={genOpen} onClose={() => setGenOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MeetingRoom />
          Generate Rooms
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Room Prefix"
                value={genForm.prefix}
                onChange={(e) => setGenForm({ ...genForm, prefix: e.target.value })}
                helperText="e.g., A, B, C"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Starting Number"
                type="number"
                value={genForm.start}
                onChange={(e) => setGenForm({ ...genForm, start: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Rooms"
                type="number"
                value={genForm.count}
                onChange={(e) => setGenForm({ ...genForm, count: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity per Room"
                type="number"
                value={genForm.capacity}
                onChange={(e) => setGenForm({ ...genForm, capacity: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={generateRooms}
            disabled={!genForm.prefix.trim() || genForm.count <= 0}
          >
            Generate Rooms
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog open={!!edit} onClose={() => setEdit(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit />
          Edit Block
        </DialogTitle>
        {edit && (
          <>
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Block Name"
                    value={edit.name || ''}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Select
                    fullWidth
                    value={edit.type || 'boys'}
                    onChange={(e) => setEdit({ ...edit, type: e.target.value })}
                  >
                    <MenuItem value="boys">Boys Hostel</MenuItem>
                    <MenuItem value="girls">Girls Hostel</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={edit.category || ''}
                    onChange={(e) => setEdit({ ...edit, category: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Total Capacity"
                    type="number"
                    value={edit.capacity || 0}
                    onChange={(e) => setEdit({ ...edit, capacity: Number(e.target.value) })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEdit(null)}>Cancel</Button>
              <Button variant="contained" onClick={save}>
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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
