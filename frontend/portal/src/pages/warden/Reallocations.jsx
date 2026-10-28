import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Paper, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  Container, Snackbar, Alert, Fab, IconButton, Tooltip, Grid, Card, CardContent, Avatar
} from '@mui/material'
import {
  SwapHoriz as SwapHorizIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Person as PersonIcon,
  MeetingRoom as MeetingRoomIcon
} from '@mui/icons-material'

export default function WardenReallocations() {
  const navigate = useNavigate()
  const [swaps, setSwaps] = React.useState([])
  const [students, setStudents] = React.useState([])
  const [blocks, setBlocks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const [manualDialog, setManualDialog] = React.useState(false)
  const [manualData, setManualData] = React.useState({
    studentId: '',
    blockId: '',
    roomId: ''
  })

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [swapsRes, studentsRes, blocksRes] = await Promise.all([
        api.get('/api/rc-extras/swaps'),
        api.get('/api/rc/students'),
        api.get('/api/rc/blocks')
      ])
      setSwaps(swapsRes.data || [])
      setStudents(studentsRes.data || [])
      setBlocks(blocksRes.data || [])
      setSnackbar({
        open: true,
        message: 'Reallocation data loaded successfully',
        severity: 'success'
      })
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load reallocation data')
      setSnackbar({
        open: true,
        message: 'Failed to load reallocation data',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const decideSwap = async (id, decision) => {
    try {
      await api.patch(`/api/rc-extras/swaps/${id}/decision`, { decision })
      setSnackbar({
        open: true,
        message: `Swap request ${decision}d successfully`,
        severity: 'success'
      })
      loadData()
    } catch (err) {
      console.error('Failed to update swap:', err)
      setSnackbar({
        open: true,
        message: 'Failed to update swap request',
        severity: 'error'
      })
    }
  }

  const handleManualReassign = async () => {
    if (!manualData.studentId || !manualData.blockId) return

    try {
      // For manual reallocation, we might need a different endpoint
      // For now, let's use the admin room move endpoint if available
      await api.post('/api/admin/rooms/move', {
        student_id: manualData.studentId,
        block_id: manualData.blockId,
        room_id: manualData.roomId || undefined
      })
      setSnackbar({
        open: true,
        message: 'Student reassigned successfully',
        severity: 'success'
      })
      setManualDialog(false)
      setManualData({ studentId: '', blockId: '', roomId: '' })
      loadData()
    } catch (err) {
      console.error('Failed to reassign:', err)
      setSnackbar({
        open: true,
        message: 'Failed to reassign student',
        severity: 'error'
      })
    }
  }

  const getStudentName = (userId) => {
    const student = students.find(s => s.user_id === userId)
    return student?.user?.name || userId
  }

  const getBlockName = (blockId) => {
    const block = blocks.find(b => b.id === blockId)
    return block?.name || blockId
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      default: return 'warning'
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          borderRadius: 0,
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SwapHorizIcon sx={{ mr: 2, fontSize: '2.5rem' }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Reallocation Control
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Approve swap requests and perform manual room reassignments
            </Typography>
          </Box>
        </Box>

        {/* Header Actions */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => loadData()}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            startIcon={<RefreshIcon />}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      <Container maxWidth="xl">
        {/* Enhanced Analytics Cards with Zoom Animation */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SwapHorizIcon sx={{ mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Pending Swaps
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {swaps.filter(s => s.status === 'pending').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Awaiting approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Approved Swaps
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {swaps.filter(s => s.status === 'approved').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Successfully completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total Students
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {students.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Available for reallocation
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          {/* Header with Manual Reassignment Button */}
          <Box sx={{
            p: 3,
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentTurnedInIcon sx={{ mr: 2, color: '#667eea' }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e', mb: 0.5 }}>
                  Swap Requests Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review and approve room swap requests from students
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Manual Reassignment">
              <Fab
                color="primary"
                size="medium"
                onClick={() => setManualDialog(true)}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  }
                }}
              >
                <AddIcon />
              </Fab>
            </Tooltip>
          </Box>

          {/* Swap Requests Table */}
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Requester</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Target Student</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Loading swap requests...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : swaps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No swap requests found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  swaps.map(swap => (
                    <TableRow key={swap.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#667eea' }}>
                            {getStudentName(swap.requester_student_id).charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {getStudentName(swap.requester_student_id)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Requester
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: '#43e97b' }}>
                            {getStudentName(swap.target_student_id).charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {getStudentName(swap.target_student_id)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Target
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={getStatusColor(swap.status)}
                          label={swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(swap.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(swap.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {swap.status === 'pending' && (
                          <Box display="flex" gap={1}>
                            <Tooltip title="Approve Swap">
                              <IconButton
                                size="small"
                                onClick={() => decideSwap(swap.id, 'approve')}
                                sx={{
                                  color: '#43e97b',
                                  '&:hover': { backgroundColor: '#43e97b', color: 'white' }
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Swap">
                              <IconButton
                                size="small"
                                onClick={() => decideSwap(swap.id, 'reject')}
                                sx={{
                                  color: '#f5576c',
                                  '&:hover': { backgroundColor: '#f5576c', color: 'white' }
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Enhanced Manual Reassignment Dialog */}
      <Dialog
        open={manualDialog}
        onClose={() => setManualDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MeetingRoomIcon sx={{ mr: 2 }} />
            Manual Room Reassignment
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, color: '#1a237e', fontWeight: 500 }}>
            Reassign a student to a different block or room
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Student</InputLabel>
                <Select
                  value={manualData.studentId}
                  onChange={(e) => setManualData(prev => ({ ...prev, studentId: e.target.value }))}
                  label="Select Student"
                  sx={{ borderRadius: 2 }}
                >
                  {students.map(student => (
                    <MenuItem key={student.user_id} value={student.user_id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {student.user?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {student.user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.user?.reg_no} • {getBlockName(student.hostel_id)}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Block</InputLabel>
                <Select
                  value={manualData.blockId}
                  onChange={(e) => setManualData(prev => ({ ...prev, blockId: e.target.value }))}
                  label="Target Block"
                  sx={{ borderRadius: 2 }}
                >
                  {blocks.map(block => (
                    <MenuItem key={block.id} value={block.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BusinessIcon sx={{ color: '#667eea' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {block.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {block.type}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Room Number (Optional)"
                value={manualData.roomId}
                onChange={(e) => setManualData(prev => ({ ...prev, roomId: e.target.value }))}
                placeholder="Leave empty for auto-assignment"
                sx={{ borderRadius: 2 }}
                helperText="If left empty, system will auto-assign an available room"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setManualDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleManualReassign}
            variant="contained"
            disabled={!manualData.studentId || !manualData.blockId}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Reassign Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}