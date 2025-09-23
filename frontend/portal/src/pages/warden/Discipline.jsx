import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Autocomplete,
  IconButton, Tooltip, Alert, Snackbar, Fab, LinearProgress, Tabs, Tab, InputAdornment, Avatar, Divider, Fade, Zoom
} from '@mui/material'
import {
  Gavel, Warning, CheckCircle, Info, Refresh, Search, FilterList, Equalizer,
  Person, Business, Schedule, Description, Add, GetApp, Visibility, Edit, Delete,
  TableChart, ViewModule, Report, Assignment, AssignmentTurnedIn
} from '@mui/icons-material'

export default function WardenDiscipline() {
  const navigate = useNavigate()
  const [records, setRecords] = React.useState([])
  const [students, setStudents] = React.useState([])
  const [analytics, setAnalytics] = React.useState({
    totalRecords: 0,
    activeRecords: 0,
    resolvedRecords: 0,
    bySeverity: {},
    byViolation: {}
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState('table')
  const [filters, setFilters] = React.useState({
    status: '',
    severity: ''
  })
  const [createDialog, setCreateDialog] = React.useState(false)
  const [selectedRecord, setSelectedRecord] = React.useState(null)
  const [formData, setFormData] = React.useState({
    student_id: '',
    violation: '',
    severity: 'minor',
    description: '',
    action: 'warning'
  })

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [recordsRes, analyticsRes, studentsRes] = await Promise.all([
        api.get('/api/disciplinary/warden-disciplinary'),
        api.get('/api/disciplinary/warden-disciplinary-analytics'),
        api.get('/api/rc/students')
      ])
      setRecords(recordsRes.data || [])
      setAnalytics(analyticsRes.data || {})
      setStudents(studentsRes.data || [])
      setSnackbar({ open: true, message: 'Disciplinary data loaded successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to load disciplinary data:', err)
      setError('Failed to load disciplinary data. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load disciplinary data', severity: 'error' })
    }
    setLoading(false)
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm ||
      record.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student?.user?.reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.violation?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filters.status || record.status === filters.status
    const matchesSeverity = !filters.severity || record.severity === filters.severity
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const handleCreateRecord = async () => {
    if (!formData.student_id || !formData.violation || !formData.action) return

    try {
      await api.post('/api/disciplinary/warden-disciplinary', formData)
      setCreateDialog(false)
      setFormData({
        student_id: '',
        violation: '',
        severity: 'minor',
        description: '',
        action: 'warning'
      })
      loadData()
      setSnackbar({ open: true, message: 'Disciplinary record created successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to create record:', err)
      setSnackbar({ open: true, message: 'Failed to create disciplinary record', severity: 'error' })
    }
  }

  const handleUpdateStatus = async (recordId, newStatus) => {
    try {
      await api.patch(`/api/disciplinary/warden-disciplinary/${recordId}`, {
        status: newStatus
      })
      loadData()
      setSnackbar({ open: true, message: 'Record status updated successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to update status:', err)
      setSnackbar({ open: true, message: 'Failed to update record status', severity: 'error' })
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minor': return 'info'
      case 'major': return 'warning'
      case 'critical': return 'error'
      default: return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'error'
      case 'resolved': return 'success'
      case 'appealed': return 'warning'
      default: return 'default'
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'warning': return 'warning'
      case 'fine': return 'info'
      case 'suspension': return 'error'
      case 'expulsion': return 'error'
      default: return 'default'
    }
  }

  const studentOptions = students.map(student => ({
    label: `${student.user.name} (${student.user.reg_no})`,
    value: student.user_id
  }))

  return (
    <Box>
      {/* Gradient Header */}
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
            Disciplinary Management
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Monitor student conduct, manage disciplinary actions, and track case resolutions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              onClick={() => setCreateDialog(true)}
            >
              New Record
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Export Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={loadData}
              disabled={loading}
            >
              Refresh Data
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
        <Fade in={!!error}>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        </Fade>
      )}

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assignment sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Total Records</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.totalRecords}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Active Cases</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.activeRecords}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Resolved Cases</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.resolvedRecords}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '400ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Equalizer sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Resolution Rate</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {analytics.totalRecords > 0 ? Math.round((analytics.resolvedRecords / analytics.totalRecords) * 100) : 0}%
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search students or violations..."
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
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                label="Status Filter"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="appealed">Appealed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity Filter</InputLabel>
              <Select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                label="Severity Filter"
              >
                <MenuItem value="">All Severity</MenuItem>
                <MenuItem value="minor">Minor</MenuItem>
                <MenuItem value="major">Major</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              sx={{ minHeight: 40 }}
            >
              <Tab icon={<TableChart />} label="Table" value="table" />
              <Tab icon={<ViewModule />} label="Cards" value="cards" />
            </Tabs>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Display */}
      {viewMode === 'table' ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Block</strong></TableCell>
                <TableCell><strong>Violation</strong></TableCell>
                <TableCell><strong>Severity</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Issued On</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography>Loading disciplinary records...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Info sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No disciplinary records found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or check back later
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map(record => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {record.student?.user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {record.student?.user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.student?.user?.reg_no}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{record.student?.hostel?.name}</TableCell>
                    <TableCell>{record.violation}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getSeverityColor(record.severity)}
                        label={record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getActionColor(record.action)}
                        label={record.action.charAt(0).toUpperCase() + record.action.slice(1)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(record.status)}
                        label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {record.status === 'active' && (
                          <Tooltip title="Mark as Resolved">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleUpdateStatus(record.id, 'resolved')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Edit Record">
                          <IconButton size="small" color="secondary">
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
        <Grid container spacing={3}>
          {loading ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <LinearProgress sx={{ width: '50%' }} />
              </Box>
            </Grid>
          ) : filteredRecords.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Info sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No disciplinary records found</Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or check back later
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredRecords.map(record => (
              <Grid item xs={12} md={6} lg={4} key={record.id}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {record.student?.user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {record.student?.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.student?.user?.reg_no}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Block</Typography>
                        <Typography variant="body1">{record.student?.hostel?.name}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Violation</Typography>
                        <Typography variant="body1">{record.violation}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Severity</Typography>
                        <Chip
                          size="small"
                          color={getSeverityColor(record.severity)}
                          label={record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Action</Typography>
                        <Chip
                          size="small"
                          color={getActionColor(record.action)}
                          label={record.action.charAt(0).toUpperCase() + record.action.slice(1)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          size="small"
                          color={getStatusColor(record.status)}
                          label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Issued</Typography>
                        <Typography variant="body2">{new Date(record.created_at).toLocaleDateString()}</Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<Visibility />} variant="outlined" fullWidth>
                        View Details
                      </Button>
                      {record.status === 'active' && (
                        <Button
                          size="small"
                          startIcon={<CheckCircle />}
                          variant="outlined"
                          color="success"
                          onClick={() => handleUpdateStatus(record.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Zoom in={true}>
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setCreateDialog(true)}
        >
          <Add />
        </Fab>
      </Zoom>

      {/* Create Record Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Gavel sx={{ mr: 1 }} />
          Create Disciplinary Record
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={studentOptions}
                value={studentOptions.find(option => option.value === formData.student_id) || null}
                onChange={(e, newValue) => setFormData(prev => ({ ...prev, student_id: newValue?.value || '' }))}
                renderInput={(params) => <TextField {...params} label="Student" required />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Violation Type</InputLabel>
                <Select
                  value={formData.violation}
                  onChange={(e) => setFormData(prev => ({ ...prev, violation: e.target.value }))}
                  label="Violation Type"
                >
                  <MenuItem value="Late to class">Late to class</MenuItem>
                  <MenuItem value="Unauthorized absence">Unauthorized absence</MenuItem>
                  <MenuItem value="Disruptive behavior">Disruptive behavior</MenuItem>
                  <MenuItem value="Property damage">Property damage</MenuItem>
                  <MenuItem value="Violation of rules">Violation of rules</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                  label="Severity"
                >
                  <MenuItem value="minor">Minor</MenuItem>
                  <MenuItem value="major">Major</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={formData.action}
                  onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                  label="Action"
                >
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="fine">Fine</MenuItem>
                  <MenuItem value="suspension">Suspension</MenuItem>
                  <MenuItem value="expulsion">Expulsion</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed description of the incident..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateRecord}
            variant="contained"
            color="primary"
            disabled={!formData.student_id || !formData.violation || !formData.action}
            startIcon={<Gavel />}
          >
            Create Record
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}