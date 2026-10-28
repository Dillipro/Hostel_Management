import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TableContainer, Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent, Chip, Rating, Tabs, Tab,
  IconButton, Tooltip, Alert, Snackbar, Fab, LinearProgress, InputAdornment, Avatar, Divider, Fade, Zoom, Button, TextField
} from '@mui/material'
import {
  Feedback, Star, TrendingUp, Equalizer, Message, ThumbsUpDown,
  Person, Business, Schedule, Description, Add, GetApp, Visibility, Edit, Delete,
  TableChart, ViewModule, Report, Assignment, AssignmentTurnedIn, Refresh, Search, Info
} from '@mui/icons-material'

export default function WardenFeedback() {
  const navigate = useNavigate()
  const [feedback, setFeedback] = React.useState([])
  const [analytics, setAnalytics] = React.useState({
    totalFeedback: 0,
    averageRating: 0,
    feedbackByType: {},
    feedbackByBlock: {}
  })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState('table')
  const [filters, setFilters] = React.useState({
    type: '',
    block: ''
  })
  const [tabValue, setTabValue] = React.useState(0)

  React.useEffect(() => {
    loadData()
  }, [])

  React.useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [feedbackRes, analyticsRes] = await Promise.all([
        api.get('/api/feedback/warden-feedback'),
        api.get('/api/feedback/warden-feedback-analytics')
      ])
      setFeedback(feedbackRes.data || [])
      setAnalytics(analyticsRes.data || {})
      setSnackbar({ open: true, message: 'Feedback data loaded successfully', severity: 'success' })
    } catch (err) {
      console.error('Failed to load feedback data:', err)
      setError('Failed to load feedback data. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load feedback data', severity: 'error' })
      setFeedback([])
      setAnalytics({ totalFeedback: 0, averageRating: 0, feedbackByType: {}, feedbackByBlock: {} })
    }
    setLoading(false)
  }

  const filteredFeedback = feedback.filter(f => {
    const matchesSearch = !searchTerm ||
      f.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.student?.user?.reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.feedback_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.type?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filters.type || f.type === filters.type
    const matchesBlock = !filters.block || f.student?.hostel?.name === filters.block
    return matchesSearch && matchesType && matchesBlock
  })

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'success'
    if (rating >= 3) return 'warning'
    return 'error'
  }

  const getTypeColor = (type) => {
    const colors = {
      'accommodation': 'primary',
      'food': 'secondary',
      'cleanliness': 'info',
      'security': 'warning',
      'facilities': 'success',
      'staff': 'error'
    }
    return colors[type] || 'default'
  }

  const uniqueTypes = [...new Set(feedback.map(f => f.type).filter(Boolean))]
  const uniqueBlocks = [...new Set(feedback.map(f => f.student?.hostel?.name).filter(Boolean))]

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
            Feedback & Welfare
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Monitor student feedback, satisfaction ratings, and welfare indicators across your blocks
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                  <Message sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Total Feedback</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.totalFeedback}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Star sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Average Rating</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{analytics.averageRating}/5</Typography>
                <Rating value={analytics.averageRating} readOnly precision={0.1} size="small" />
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Positive Feedback</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {analytics.totalFeedback > 0 ? Math.round((filteredFeedback.filter(f => f.rating >= 4).length / analytics.totalFeedback) * 100) : 0}%
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '400ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ThumbsUpDown sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Response Rate</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {analytics.totalFeedback > 0 ? Math.round((filteredFeedback.filter(f => f.response).length / analytics.totalFeedback) * 100) : 0}%
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
              placeholder="Search feedback..."
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
              <InputLabel>Type Filter</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                label="Type Filter"
              >
                <MenuItem value="">All Types</MenuItem>
                {uniqueTypes.map(type => (
                  <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Block Filter</InputLabel>
              <Select
                value={filters.block}
                onChange={(e) => setFilters(prev => ({ ...prev, block: e.target.value }))}
                label="Block Filter"
              >
                <MenuItem value="">All Blocks</MenuItem>
                {uniqueBlocks.map(block => (
                  <MenuItem key={block} value={block}>{block}</MenuItem>
                ))}
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

      {/* Feedback Display */}
      {viewMode === 'table' ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Rating</strong></TableCell>
                <TableCell><strong>Feedback</strong></TableCell>
                <TableCell><strong>Block</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography>Loading feedback...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Info sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No feedback found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or check back later
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {item.student?.user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {item.student?.user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.student?.user?.reg_no}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getTypeColor(item.type)}
                        label={item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={item.rating} readOnly size="small" />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {item.rating}/5
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.feedback_text}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.student?.hostel?.name}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {!item.response && (
                          <Tooltip title="Respond">
                            <IconButton size="small" color="secondary">
                              <Message />
                            </IconButton>
                          </Tooltip>
                        )}
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
          ) : filteredFeedback.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Info sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No feedback found</Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or check back later
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredFeedback.map(item => (
              <Grid item xs={12} md={6} lg={4} key={item.id}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {item.student?.user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {item.student?.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.student?.user?.reg_no}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={item.rating} readOnly size="small" />
                      <Typography variant="body1" sx={{ ml: 1, fontWeight: 'medium' }}>
                        {item.rating}/5
                      </Typography>
                      <Chip
                        size="small"
                        color={getTypeColor(item.type)}
                        label={item.type?.charAt(0).toUpperCase() + item.type?.slice(1)}
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                      {item.feedback_text}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {item.student?.hostel?.name} • {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {!item.response && (
                          <Tooltip title="Respond">
                            <IconButton size="small" color="secondary">
                              <Message />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

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