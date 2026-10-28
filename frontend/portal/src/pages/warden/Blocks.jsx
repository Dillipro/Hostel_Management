import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Card, CardContent, Typography, Grid, Box, LinearProgress, Chip, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer,
  Button, IconButton, Tooltip, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Fab
} from '@mui/material'
import {
  Business, People, MeetingRoom, Warning, CheckCircle, Error, Info, Refresh, Add, Edit, Delete, Visibility,
  TrendingUp, TrendingDown, Equalizer, Build, Security, ReportProblem
} from '@mui/icons-material'

export default function WardenBlocks() {
  const navigate = useNavigate()
  const [blocks, setBlocks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [selectedBlock, setSelectedBlock] = React.useState(null)
  const [maintenanceDialog, setMaintenanceDialog] = React.useState({ open: false, block: null, issue: '', priority: 'medium' })

  React.useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = () => {
    setLoading(true)
    setError(null)
    api.get('/api/rc/blocks')
      .then(r => {
        setBlocks(r.data)
        setSnackbar({ open: true, message: 'Blocks loaded successfully', severity: 'success' })
      })
      .catch(err => {
        console.error('Failed to load blocks:', err)
        setError('Failed to load blocks. Please try again.')
        setSnackbar({ open: true, message: 'Failed to load blocks', severity: 'error' })
      })
      .finally(() => setLoading(false))
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })

  const handleMaintenanceRequest = (block) => {
    setMaintenanceDialog({ open: true, block, issue: '', priority: 'medium' })
  }

  const submitMaintenanceRequest = () => {
    if (!maintenanceDialog.issue.trim()) {
      setSnackbar({ open: true, message: 'Please describe the maintenance issue', severity: 'warning' })
      return
    }

    // Here you would typically send the maintenance request to the API
    setSnackbar({
      open: true,
      message: `Maintenance request submitted for ${maintenanceDialog.block.name}`,
      severity: 'success'
    })
    setMaintenanceDialog({ open: false, block: null, issue: '', priority: 'medium' })
  }

  const getBlockIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'boys': return <People color="primary" />
      case 'girls': return <People color="secondary" />
      default: return <Business />
    }
  }

  const getOccupancyColor = (percentage) => {
    if (percentage >= 90) return 'error'
    if (percentage >= 75) return 'warning'
    return 'success'
  }

  const getOccupancyLabel = (percentage) => {
    if (percentage >= 90) return 'High'
    if (percentage >= 75) return 'Moderate'
    return 'Low'
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
            <Business sx={{ mr: 2, verticalAlign: 'middle' }} />
            Block Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Supervise occupancy status and distribution across all blocks.
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <LinearProgress sx={{ mb: 2, width: 300 }} />
            <Typography variant="body1" color="text.secondary">Loading blocks...</Typography>
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
            <Business sx={{ mr: 2, verticalAlign: 'middle' }} />
            Block Management
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Supervise occupancy status and distribution across all blocks.
          </Typography>
        </Box>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadBlocks}>
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
          <Business sx={{ mr: 2, verticalAlign: 'middle' }} />
          Block Management
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
          Supervise occupancy status and distribution across all blocks.
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Refresh />}
            onClick={loadBlocks}
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
                  <Typography variant="h4" color="primary">{blocks.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Blocks</Typography>
                </Box>
                <Business color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f3e5f5' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="secondary">
                    {blocks.reduce((sum, block) => sum + block.occupancy, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Occupied</Typography>
                </Box>
                <People color="secondary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#2e7d32' }}>
                    {blocks.reduce((sum, block) => sum + (block.capacity - block.occupancy), 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Vacant</Typography>
                </Box>
                <MeetingRoom sx={{ fontSize: 40, color: '#2e7d32' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: '#f57c00' }}>
                    {blocks.length > 0 ? Math.round(
                      blocks.reduce((sum, block) => sum + (block.capacity > 0 ? (block.occupancy / block.capacity) * 100 : 0), 0) / blocks.length
                    ) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Avg Occupancy</Typography>
                </Box>
                <Equalizer sx={{ fontSize: 40, color: '#f57c00' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Block Cards */}
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Block Overview</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {blocks.map(block => {
          const occupancyRate = block.capacity > 0 ? Math.round((block.occupancy / block.capacity) * 100) : 0
          const vacancies = block.capacity - block.occupancy

          return (
            <Grid item xs={12} md={6} lg={4} key={block.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  position: 'relative'
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getBlockIcon(block.type)}
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{block.name}</Typography>
                    </Box>
                    <Box>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setSelectedBlock(block)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Report Maintenance">
                        <IconButton size="small" color="warning" onClick={() => handleMaintenanceRequest(block)}>
                          <Build />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {block.type} • {block.category || 'General'}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2">Occupancy</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          size="small"
                          color={getOccupancyColor(occupancyRate)}
                          label={`${occupancyRate}%`}
                        />
                        {occupancyRate >= 90 && <Warning color="error" fontSize="small" />}
                        {occupancyRate <= 20 && <Info color="info" fontSize="small" />}
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={occupancyRate}
                      color={getOccupancyColor(occupancyRate)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Occupied</Typography>
                      <Typography variant="h6" color="primary">{block.occupancy}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Vacant</Typography>
                      <Typography variant="h6" sx={{ color: vacancies > 0 ? '#2e7d32' : '#f57c00' }}>
                        {vacancies}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Capacity</Typography>
                      <Typography variant="body2">{block.capacity}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Typography variant="body2">{getOccupancyLabel(occupancyRate)}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<People />}
                      onClick={() => navigate(`/warden/students?block=${block.id}`)}
                      sx={{ flex: 1 }}
                    >
                      Students
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Security />}
                      onClick={() => navigate(`/warden/security?block=${block.id}`)}
                      sx={{ flex: 1 }}
                    >
                      Security
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Enhanced Block Details Table */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Detailed Block Information</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/warden/blocks/add')}
          sx={{ bgcolor: 'primary.main' }}
        >
          Add Block
        </Button>
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Block Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Capacity</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Occupied</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Vacant</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Occupancy %</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blocks.map(block => {
              const occupancyRate = block.capacity > 0 ? Math.round((block.occupancy / block.capacity) * 100) : 0
              const vacancies = block.capacity - block.occupancy

              return (
                <TableRow key={block.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getBlockIcon(block.type)}
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{block.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{block.type}</TableCell>
                  <TableCell>{block.category || '-'}</TableCell>
                  <TableCell align="right">{block.capacity}</TableCell>
                  <TableCell align="right">{block.occupancy}</TableCell>
                  <TableCell align="right">
                    <Typography sx={{ color: vacancies > 0 ? '#2e7d32' : '#f57c00', fontWeight: 'medium' }}>
                      {vacancies}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      <Typography>{occupancyRate}%</Typography>
                      {occupancyRate >= 90 && <TrendingUp color="error" fontSize="small" />}
                      {occupancyRate <= 20 && <TrendingDown color="info" fontSize="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={getOccupancyColor(occupancyRate)}
                      label={getOccupancyLabel(occupancyRate)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => setSelectedBlock(block)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Block">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/warden/blocks/edit/${block.id}`)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Report Maintenance">
                        <IconButton size="small" color="warning" onClick={() => handleMaintenanceRequest(block)}>
                          <Build />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Maintenance Request Dialog */}
      <Dialog open={maintenanceDialog.open} onClose={() => setMaintenanceDialog({ open: false, block: null, issue: '', priority: 'medium' })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Build color="warning" />
          Report Maintenance Issue - {maintenanceDialog.block?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Issue Description"
            fullWidth
            multiline
            rows={4}
            value={maintenanceDialog.issue}
            onChange={(e) => setMaintenanceDialog({ ...maintenanceDialog, issue: e.target.value })}
            placeholder="Describe the maintenance issue in detail..."
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Priority"
            value={maintenanceDialog.priority}
            onChange={(e) => setMaintenanceDialog({ ...maintenanceDialog, priority: e.target.value })}
            fullWidth
          >
            <MenuItem value="low">
              <Box display="flex" alignItems="center" gap={1}>
                <Info color="info" fontSize="small" />
                Low Priority
              </Box>
            </MenuItem>
            <MenuItem value="medium">
              <Box display="flex" alignItems="center" gap={1}>
                <Warning color="warning" fontSize="small" />
                Medium Priority
              </Box>
            </MenuItem>
            <MenuItem value="high">
              <Box display="flex" alignItems="center" gap={1}>
                <Error color="error" fontSize="small" />
                High Priority
              </Box>
            </MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog({ open: false, block: null, issue: '', priority: 'medium' })}>
            Cancel
          </Button>
          <Button
            onClick={submitMaintenanceRequest}
            variant="contained"
            color="primary"
            startIcon={<ReportProblem />}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Details Dialog */}
      <Dialog open={!!selectedBlock} onClose={() => setSelectedBlock(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedBlock && getBlockIcon(selectedBlock.type)}
          {selectedBlock?.name} - Detailed Information
        </DialogTitle>
        <DialogContent>
          {selectedBlock && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography variant="body1">{selectedBlock.type}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Category</Typography>
                  <Typography variant="body1">{selectedBlock.category || 'General'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Capacity</Typography>
                  <Typography variant="body1">{selectedBlock.capacity}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Occupancy Details</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Currently Occupied</Typography>
                  <Typography variant="body1">{selectedBlock.occupancy}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Available Spaces</Typography>
                  <Typography variant="body1">{selectedBlock.capacity - selectedBlock.occupancy}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Occupancy Rate</Typography>
                  <Typography variant="body1">
                    {selectedBlock.capacity > 0 ? Math.round((selectedBlock.occupancy / selectedBlock.capacity) * 100) : 0}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBlock(null)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<People />}
            onClick={() => {
              navigate(`/warden/students?block=${selectedBlock.id}`)
              setSelectedBlock(null)
            }}
          >
            View Students
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

      {/* Floating Action Button for Quick Actions */}
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