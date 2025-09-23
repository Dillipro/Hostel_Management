import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import {
  Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Box, Typography, TextField, Grid, Paper, TableContainer,
  Card, CardContent, Chip, Button, IconButton, Tooltip, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Avatar, Fab, LinearProgress, Tabs, Tab
} from '@mui/material'
import {
  People, Search, FilterList, Refresh, Person, School, Phone, Email, LocationOn, Edit, Visibility,
  CheckCircle, Pending, Cancel, MeetingRoom, Business, Equalizer, Add, MoreVert, MenuBook
} from '@mui/icons-material'

export default function WardenStudents(){
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [blocks, setBlocks] = React.useState([])
  const [students, setStudents] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [selectedStudent, setSelectedStudent] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState('table')
  const [filters, setFilters] = React.useState({
    blockId: searchParams.get('block') || '',
    department: '',
    year: '',
    status: ''
  })

  React.useEffect(() => {
    // Load warden's blocks
    api.get('/api/rc/blocks').then(r => {
      setBlocks(r.data)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load blocks:', err)
      setLoading(false)
    })
  }, [])

  React.useEffect(() => {
    loadStudents()
  }, [filters])

  const loadStudents = () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    api.get(`/api/rc/students?${params}`)
      .then(r => {
        setStudents(r.data)
        setSnackbar({ open: true, message: `Loaded ${r.data.length} students`, severity: 'success' })
      })
      .catch(err => {
        console.error('Failed to load students:', err)
        setError('Failed to load students. Please try again.')
        setSnackbar({ open: true, message: 'Failed to load students', severity: 'error' })
      })
      .finally(() => setLoading(false))
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'checked-in': return 'success'
      case 'allotted': return 'primary'
      case 'pending': return 'warning'
      case 'checked-out': return 'default'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'checked-in': return <CheckCircle />
      case 'allotted': return <Person />
      case 'pending': return <Pending />
      case 'checked-out': return <Cancel />
      default: return <Person />
    }
  }

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase()
    return !searchTerm ||
      student.user?.name?.toLowerCase().includes(searchLower) ||
      student.user?.reg_no?.toLowerCase().includes(searchLower) ||
      student.user?.department?.toLowerCase().includes(searchLower)
  })

  const uniqueDepartments = [...new Set(students.map(s => s.user?.department).filter(Boolean))]
  const uniqueYears = [...new Set(students.map(s => s.user?.year).filter(Boolean))].sort()

  const studentStats = {
    total: students.length,
    checkedIn: students.filter(s => s.status === 'checked-in').length,
    allotted: students.filter(s => s.status === 'allotted').length,
    pending: students.filter(s => s.status === 'pending').length
  }

  if (loading) {
    return (
      <Box>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            borderRadius: 2,
            mb: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            <People sx={{ mr: 2, verticalAlign: 'middle' }} />
            Student Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            View and manage students across all blocks under your supervision.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <LinearProgress sx={{ mb: 2, width: 300 }} />
            <Typography variant="body1" color="text.secondary">Loading students...</Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 4,
            borderRadius: 2,
            mb: 3
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            <People sx={{ mr: 2, verticalAlign: 'middle' }} />
            Student Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            View and manage students across all blocks under your supervision.
          </Typography>
        </Box>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadStudents}>
              <Refresh sx={{ mr: 1 }} />
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      {/* Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 2,
          mb: 3,
          position: 'relative'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          <People sx={{ mr: 2, verticalAlign: 'middle' }} />
          Student Management
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          View and manage students across all blocks under your supervision.
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Refresh />}
            onClick={loadStudents}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Refresh Data
          </Button>
          <Button
            variant="outlined"
            sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            startIcon={<Equalizer />}
            onClick={() => navigate('/warden/reports')}
          >
            View Reports
          </Button>
        </Box>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">{studentStats.total}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                </Box>
                <People color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2e7d32' }}>{studentStats.checkedIn}</Typography>
                  <Typography variant="body2" color="text.secondary">Checked In</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#2e7d32' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#f57c00' }}>{studentStats.allotted}</Typography>
                  <Typography variant="body2" color="text.secondary">Allotted</Typography>
                </Box>
                <Person sx={{ fontSize: 40, color: '#f57c00' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fce4ec' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#c2185b' }}>{studentStats.pending}</Typography>
                  <Typography variant="body2" color="text.secondary">Pending</Typography>
                </Box>
                <Pending sx={{ fontSize: 40, color: '#c2185b' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* View Mode Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)}>
          <Tab label="Table View" value="table" icon={<MenuBook />} iconPosition="start" />
          <Tab label="Card View" value="cards" icon={<People />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, reg no, or department..."
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
            <Grid item xs={12} md={2}>
              <Select
                fullWidth
                size="small"
                value={filters.blockId}
                onChange={(e) => handleFilterChange('blockId', e.target.value)}
                displayEmpty
                startAdornment={<Business sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">All Blocks</MenuItem>
                {blocks.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Select
                fullWidth
                size="small"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                displayEmpty
                startAdornment={<School sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">All Departments</MenuItem>
                {uniqueDepartments.map(dept => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Select
                fullWidth
                size="small"
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                displayEmpty
                startAdornment={<MenuBook sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">All Years</MenuItem>
                {uniqueYears.map(year => <MenuItem key={year} value={year}>{year}</MenuItem>)}
              </Select>
            </Grid>
            <Grid item xs={12} md={2}>
              <Select
                fullWidth
                size="small"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                displayEmpty
                startAdornment={<CheckCircle sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="allotted">Allotted</MenuItem>
                <MenuItem value="checked-in">Checked In</MenuItem>
                <MenuItem value="checked-out">Checked Out</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reg No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Year</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Block/Room</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No students found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map(s => (
                  <TableRow key={s.user_id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {s.user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {s.user?.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {s.user?.reg_no}
                      </Typography>
                    </TableCell>
                    <TableCell>{s.user?.department}</TableCell>
                    <TableCell>{s.user?.year}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{s.hostel?.name || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Room: {s.room?.room_no || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(s.status)}
                        label={s.status}
                        icon={getStatusIcon(s.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">{s.user?.phone || '-'}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">{s.user?.email || '-'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setSelectedStudent(s)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Student">
                          <IconButton size="small" color="primary" onClick={() => navigate(`/warden/students/edit/${s.user_id}`)}>
                            <Edit />
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
      ) : (
        /* Card View */
        <Grid container spacing={3}>
          {filteredStudents.map(s => (
            <Grid item xs={12} md={6} lg={4} key={s.user_id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                        {s.user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {s.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {s.user?.reg_no}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      size="small"
                      color={getStatusColor(s.status)}
                      label={s.status}
                      icon={getStatusIcon(s.status)}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Department</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{s.user?.department}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Year</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{s.user?.year}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Block</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{s.hostel?.name || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Room</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{s.room?.room_no || '-'}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{s.user?.phone || 'Not provided'}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2">{s.user?.email || 'Not provided'}</Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => setSelectedStudent(s)}
                      sx={{ flex: 1 }}
                    >
                      Details
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/warden/students/edit/${s.user_id}`)}
                      sx={{ flex: 1 }}
                    >
                      Edit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onClose={() => setSelectedStudent(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {selectedStudent?.user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          {selectedStudent?.user?.name} - Student Details
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{selectedStudent.user?.name}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Registration Number</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedStudent.user?.reg_no}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedStudent.user?.email || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedStudent.user?.phone || 'Not provided'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Academic Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{selectedStudent.user?.department}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Year</Typography>
                  <Typography variant="body1">{selectedStudent.user?.year}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    color={getStatusColor(selectedStudent.status)}
                    label={selectedStudent.status}
                    icon={getStatusIcon(selectedStudent.status)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Accommodation Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Block</Typography>
                      <Typography variant="h6">{selectedStudent.hostel?.name || 'Not assigned'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Room Number</Typography>
                      <Typography variant="h6">{selectedStudent.room?.room_no || 'Not assigned'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Room Type</Typography>
                      <Typography variant="h6">{selectedStudent.room?.type || 'N/A'}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedStudent(null)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => {
              navigate(`/warden/students/edit/${selectedStudent.user_id}`)
              setSelectedStudent(null)
            }}
          >
            Edit Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/warden/dashboard')}
      >
        <Equalizer />
      </Fab>
    </Box>
  )
}