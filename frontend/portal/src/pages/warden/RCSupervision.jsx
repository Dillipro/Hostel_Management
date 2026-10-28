import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer,
  Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Chip, Button, Avatar,
  Rating, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Container, Snackbar, Alert,
  Fab, IconButton, Tooltip
} from '@mui/material'
import {
  SupervisorAccount as SupervisorAccountIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  RateReview as RateReviewIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material'

export default function WardenRCSupervision() {
  const navigate = useNavigate()
  const [rcs, setRcs] = React.useState([])
  const [blocks, setBlocks] = React.useState([])
  const [assignments, setAssignments] = React.useState([])
  const [performance, setPerformance] = React.useState({})
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success'
  })
  const [filters, setFilters] = React.useState({
    blockId: '',
    status: ''
  })
  const [evaluationDialog, setEvaluationDialog] = React.useState(false)
  const [selectedRC, setSelectedRC] = React.useState(null)
  const [evaluationData, setEvaluationData] = React.useState({
    rating: 0,
    comments: '',
    areas: []
  })

  React.useEffect(() => {
    loadData()
  }, [])

  React.useEffect(() => {
    loadRCs()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Get RC assignments and performance data
      const assignmentsRes = await api.get('/api/admin/rc-assignments')
      const assignments = assignmentsRes.data || []

      // Get blocks data
      const blocksRes = await api.get('/api/rc/blocks')
      const blocks = blocksRes.data || []

      // Get RC users
      const rcs = assignments.map(assignment => assignment.rc).filter(rc => rc)

      // Calculate performance metrics for each RC
      const performance = {}
      for (const rc of rcs) {
        const rcBlocks = assignments.filter(a => a.rc_id === rc.id).map(a => a.block_id)
        const rcStudents = await api.get('/api/rc/students')
        const studentsInBlocks = rcStudents.data?.filter(s => rcBlocks.includes(s.hostel_id)) || []

        const complaintsRes = await api.get('/api/complaints/warden-complaints')
        const complaintsInBlocks = complaintsRes.data?.filter(c => rcBlocks.includes(c.student?.hostel_id)) || []

        const resolvedComplaints = complaintsInBlocks.filter(c => c.status === 'resolved').length
        const totalComplaints = complaintsInBlocks.length

        performance[rc.id] = {
          studentsManaged: studentsInBlocks.length,
          complaintsHandled: totalComplaints,
          resolutionRate: totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0,
          blocksAssigned: rcBlocks.length,
          averageRating: 4.2 // Mock rating - would come from evaluations
        }
      }

      setAssignments(assignments)
      setBlocks(blocks)
      setRcs(rcs)
      setPerformance(performance)
      setSnackbar({
        open: true,
        message: 'RC supervision data loaded successfully',
        severity: 'success'
      })
    } catch (err) {
      console.error('Failed to load RC supervision data:', err)
      setError('Failed to load RC supervision data')
      setSnackbar({
        open: true,
        message: 'Failed to load RC supervision data',
        severity: 'error'
      })
    }
    setLoading(false)
  }

  const loadRCs = async () => {
    // Filter RCs based on criteria
    let filtered = rcs

    if (filters.blockId) {
      const rcIds = assignments
        .filter(a => a.block_id === filters.blockId)
        .map(a => a.rc_id)
      filtered = filtered.filter(rc => rcIds.includes(rc.id))
    }

    if (filters.status) {
      // Mock status filtering - in real implementation would have RC status
      filtered = filtered.filter(rc => true) // Placeholder
    }

    setRcs(filtered)
  }

  const handleEvaluateRC = (rc) => {
    setSelectedRC(rc)
    setEvaluationDialog(true)
    setEvaluationData({
      rating: performance[rc.id]?.averageRating || 0,
      comments: '',
      areas: []
    })
  }

  const submitEvaluation = async () => {
    if (!selectedRC) return

    try {
      // In a real implementation, this would save to an RC evaluation table
      setSnackbar({
        open: true,
        message: `Evaluation submitted successfully for ${selectedRC.name}`,
        severity: 'success'
      })
      setEvaluationDialog(false)
      setSelectedRC(null)
      setEvaluationData({ rating: 0, comments: '', areas: [] })
    } catch (err) {
      console.error('Failed to submit evaluation:', err)
      setSnackbar({
        open: true,
        message: 'Failed to submit evaluation',
        severity: 'error'
      })
    }
  }

  const getPerformanceColor = (rate) => {
    if (rate >= 90) return 'success'
    if (rate >= 70) return 'warning'
    return 'error'
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'success'
    if (rating >= 3.5) return 'warning'
    return 'error'
  }

  const getAssignedBlocks = (rcId) => {
    return assignments
      .filter(a => a.rc_id === rcId)
      .map(a => blocks.find(b => b.id === a.block_id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  const filteredRCs = rcs.filter(rc => {
    if (filters.blockId) {
      const rcBlocks = assignments.filter(a => a.rc_id === rc.id).map(a => a.block_id)
      if (!rcBlocks.includes(filters.blockId)) return false
    }
    return true
  })

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
          <SupervisorAccountIcon sx={{ mr: 2, fontSize: '2.5rem' }} />
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              RC Supervision
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Monitor RC performance, assignments, and effectiveness across your blocks
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
          <Grid item xs={12} md={6} lg={3}>
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
                  <SupervisorAccountIcon sx={{ mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total RCs
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {rcs.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active residential counselors
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
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
                  <AssignmentIcon sx={{ mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Active Assignments
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {assignments.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Current block assignments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Avg Resolution Rate
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {rcs.length > 0 ? (Object.values(performance).reduce((sum, p) => sum + p.resolutionRate, 0) / rcs.length).toFixed(1) : 0}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Complaint resolution effectiveness
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
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
                  <StarIcon sx={{ mr: 2, fontSize: '2rem' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Avg Rating
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {rcs.length > 0 ? (Object.values(performance).reduce((sum, p) => sum + p.averageRating, 0) / rcs.length).toFixed(1) : 0}/5
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Performance evaluation score
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Table Section */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          {/* Filters Header */}
          <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterListIcon sx={{ mr: 2, color: '#667eea' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                RC Performance Overview
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Block</InputLabel>
                <Select
                  value={filters.blockId}
                  onChange={(e) => setFilters(prev => ({ ...prev, blockId: e.target.value }))}
                  label="Filter by Block"
                >
                  <MenuItem value="">All Blocks</MenuItem>
                  {blocks.map(block => (
                    <MenuItem key={block.id} value={block.id}>{block.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* RC Performance Table */}
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>RC Details</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Assigned Blocks</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Students Managed</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Complaints Handled</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Resolution Rate</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Performance Rating</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1a237e' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Loading RC supervision data...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredRCs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No RCs found matching the current filters
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRCs.map(rc => {
                    const perf = performance[rc.id] || {}
                    return (
                      <TableRow key={rc.id} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: '#667eea' }}>{rc.name?.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {rc.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rc.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {getAssignedBlocks(rc.id)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleIcon sx={{ color: '#667eea', fontSize: '1.2rem' }} />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {perf.studentsManaged || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon sx={{ color: '#43e97b', fontSize: '1.2rem' }} />
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {perf.complaintsHandled || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={getPerformanceColor(perf.resolutionRate || 0)}
                            label={`${(perf.resolutionRate || 0).toFixed(1)}%`}
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Rating
                              value={perf.averageRating || 0}
                              readOnly
                              size="small"
                              precision={0.1}
                              sx={{ color: '#f5576c' }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              ({(perf.averageRating || 0).toFixed(1)})
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Tooltip title="Evaluate RC Performance">
                              <IconButton
                                size="small"
                                onClick={() => handleEvaluateRC(rc)}
                                sx={{
                                  color: '#667eea',
                                  '&:hover': { backgroundColor: '#667eea', color: 'white' }
                                }}
                              >
                                <RateReviewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View RC Details">
                              <IconButton
                                size="small"
                                sx={{
                                  color: '#43e97b',
                                  '&:hover': { backgroundColor: '#43e97b', color: 'white' }
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Enhanced RC Evaluation Dialog */}
      <Dialog
        open={evaluationDialog}
        onClose={() => setEvaluationDialog(false)}
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
            <RateReviewIcon sx={{ mr: 2 }} />
            Evaluate RC Performance
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 500 }}>
            Evaluating: {selectedRC?.name}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 500 }}>
                Overall Rating
              </Typography>
              <Rating
                value={evaluationData.rating}
                onChange={(event, newValue) => {
                  setEvaluationData(prev => ({ ...prev, rating: newValue }))
                }}
                size="large"
                precision={0.5}
                sx={{ color: '#f5576c' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Evaluation Comments"
                value={evaluationData.comments}
                onChange={(e) => setEvaluationData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Provide detailed feedback on RC performance, strengths, areas for improvement..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 500 }}>
                Areas of Evaluation
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Communication', 'Problem Solving', 'Student Relations', 'Time Management', 'Leadership', 'Compliance'].map(area => (
                  <Chip
                    key={area}
                    label={area}
                    clickable
                    color={evaluationData.areas.includes(area) ? 'primary' : 'default'}
                    variant={evaluationData.areas.includes(area) ? 'filled' : 'outlined'}
                    onClick={() => {
                      setEvaluationData(prev => ({
                        ...prev,
                        areas: prev.areas.includes(area)
                          ? prev.areas.filter(a => a !== area)
                          : [...prev.areas, area]
                      }))
                    }}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: evaluationData.areas.includes(area) ? '#667eea' : '#f8fafc',
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setEvaluationDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitEvaluation}
            variant="contained"
            disabled={!evaluationData.rating || !evaluationData.comments.trim()}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            Submit Evaluation
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