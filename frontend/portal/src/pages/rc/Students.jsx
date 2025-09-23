import React from 'react'
import { api } from '../../api'
import Page from '../../components/Page'
import {
  Box, Button, Typography, Card, CardContent, Grid, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel,
  Select, MenuItem, Stack, Alert, Snackbar, LinearProgress, IconButton,
  Tooltip, Divider, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Paper, TextField, InputAdornment, CircularProgress
} from '@mui/material'
import {
  People, Person, School, LocationOn, CheckCircle, Error, Pending,
  Refresh, Search, Room, AccountCircle, Engineering
} from '@mui/icons-material'

export default function RCStudents(){
  const [blocks, setBlocks] = React.useState([])
  const [blockId, setBlockId] = React.useState('')
  const [students, setStudents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

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

  // Load students when block changes
  const loadStudents = React.useCallback(async () => {
    if (!blockId) return

    try {
      setLoading(true)
      const r = await api.get(`/api/rc/blocks/${blockId}/occupancy`)
      setStudents(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load students', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [blockId])

  React.useEffect(() => { loadStudents() }, [loadStudents])

  // Filter students based on search term
  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return students
    return students.filter(student =>
      student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user?.reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user?.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.room?.room_no?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [students, searchTerm])

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = students.length
    const occupied = students.filter(s => s.status === 'occupied').length
    const vacant = students.filter(s => s.status === 'vacant').length
    const maintenance = students.filter(s => s.status === 'maintenance').length
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0

    return { total, occupied, vacant, maintenance, occupancyRate }
  }, [students])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'occupied': return 'success'
      case 'vacant': return 'warning'
      case 'maintenance': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'occupied': return <CheckCircle />
      case 'vacant': return <Pending />
      case 'maintenance': return <Error />
      default: return <AccountCircle />
    }
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
          <People sx={{ mr: 2, verticalAlign: 'middle' }} />
          Student Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Monitor and manage student occupancy across hostel blocks
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Room sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Rooms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.occupied}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Occupied
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Pending sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.vacant}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vacant
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.maintenance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maintenance
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
                label="Search Students"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Occupancy Rate: <strong>{stats.occupancyRate}%</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students Table */}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Registration No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No students found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.user_id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {student.user?.name?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {student.user?.name || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.user?.reg_no || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.user?.department || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {student.room?.room_no || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(student.status)}
                            label={student.status || 'Unknown'}
                            color={getStatusColor(student.status)}
                            size="small"
                            variant="outlined"
                          />
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
