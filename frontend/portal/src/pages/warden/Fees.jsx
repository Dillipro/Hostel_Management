import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, Paper, TableContainer, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent,
  IconButton, Tooltip, Alert, Snackbar, Fab, LinearProgress, Tabs, Tab, InputAdornment, Avatar, Divider, Fade, Zoom
} from '@mui/material'
import {
  AccountBalance, Payment, Receipt, TrendingUp, TrendingDown, Warning, CheckCircle, Info, Refresh, Search, FilterList, Equalizer,
  Person, Business, Schedule, Description, Money, AttachMoney, CreditCard, ReceiptLong, Add, GetApp, Visibility, Edit, Delete,
  TableChart, ViewModule
} from '@mui/icons-material'

export default function WardenFees() {
  const navigate = useNavigate()
  const [fees, setFees] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' })
  const [selectedFee, setSelectedFee] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [viewMode, setViewMode] = React.useState('table')
  const [filters, setFilters] = React.useState({
    status: '',
    blockId: ''
  })
  const [refundDialog, setRefundDialog] = React.useState(false)
  const [refundReason, setRefundReason] = React.useState('')
  const [summary, setSummary] = React.useState({
    totalStudents: 0,
    paidStudents: 0,
    pendingStudents: 0,
    totalAmount: 0,
    collectedAmount: 0
  })

  React.useEffect(() => {
    loadFees()
  }, [])

  React.useEffect(() => {
    loadFees()
    calculateSummary()
  }, [filters, fees])

  const loadFees = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/api/admin/warden-fees')
      setFees(response.data || [])
      setSnackbar({ open: true, message: `Loaded ${response.data?.length || 0} fee records`, severity: 'success' })
    } catch (err) {
      console.error('Failed to load fees:', err)
      setError('Failed to load fee records. Please try again.')
      setSnackbar({ open: true, message: 'Failed to load fee records', severity: 'error' })
    }
    setLoading(false)
  }

  const calculateSummary = () => {
    const totalStudents = fees.length
    const paidStudents = fees.filter(f => f.status === 'settled').length
    const pendingStudents = totalStudents - paidStudents
    const totalAmount = fees.reduce((sum, f) => sum + f.amount_due, 0)
    const collectedAmount = fees.reduce((sum, f) => sum + f.amount_paid, 0)

    setSummary({
      totalStudents,
      paidStudents,
      pendingStudents,
      totalAmount,
      collectedAmount
    })
  }

  const handleRefund = (fee) => {
    setSelectedFee(fee)
    setRefundDialog(true)
  }

  const submitRefund = async () => {
    if (!selectedFee || !refundReason) return

    try {
      // In a real implementation, this would call a refund API
      setSnackbar({ open: true, message: `Refund request submitted for ${selectedFee.student.user.name}`, severity: 'success' })
      setRefundDialog(false)
      setSelectedFee(null)
      setRefundReason('')
    } catch (err) {
      console.error('Failed to submit refund:', err)
      setSnackbar({ open: true, message: 'Failed to submit refund request', severity: 'error' })
    }
  }

  const generateReport = () => {
    // Mock report generation
    alert('Fee collection report generated and downloaded')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'settled': return 'success'
      case 'partial': return 'warning'
      case 'pending': return 'error'
      default: return 'default'
    }
  }

  const filteredFees = fees.filter(fee => {
    const matchesSearch = !searchTerm ||
      fee.student?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.student?.user?.reg_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.student?.hostel?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filters.status || fee.status === filters.status
    const matchesBlock = !filters.blockId || fee.student?.hostel?.name === filters.blockId
    return matchesSearch && matchesStatus && matchesBlock
  })

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
            Fee Management
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Monitor fee collection, track payments, and manage outstanding balances
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<GetApp />}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              onClick={generateReport}
            >
              Generate Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
              onClick={loadFees}
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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Total Students</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{summary.totalStudents}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Paid Students</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{summary.paidStudents}</Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6">Pending Students</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">{summary.pendingStudents}</Typography>
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
                  <Typography variant="h6">Collection Rate</Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold">
                  {summary.totalAmount > 0 ? Math.round((summary.collectedAmount / summary.totalAmount) * 100) : 0}%
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
              placeholder="Search students..."
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
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="settled">Settled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Block Filter</InputLabel>
              <Select
                value={filters.blockId}
                onChange={(e) => setFilters(prev => ({ ...prev, blockId: e.target.value }))}
                label="Block Filter"
              >
                <MenuItem value="">All Blocks</MenuItem>
                {[...new Set(fees.map(f => f.student?.hostel?.name).filter(Boolean))].map(blockName => (
                  <MenuItem key={blockName} value={blockName}>{blockName}</MenuItem>
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

      {/* Data Display */}
      {viewMode === 'table' ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell><strong>Block</strong></TableCell>
                <TableCell><strong>Fee Plan</strong></TableCell>
                <TableCell><strong>Amount Due</strong></TableCell>
                <TableCell><strong>Amount Paid</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Assigned On</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography>Loading fee records...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Info sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No fee records found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or check back later
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFees.map(fee => (
                  <TableRow key={fee.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {fee.student?.user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {fee.student?.user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fee.student?.user?.reg_no}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{fee.student?.hostel?.name}</TableCell>
                    <TableCell>{fee.plan?.name}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">₹{fee.amount_due}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium" color="success.main">₹{fee.amount_paid}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getStatusColor(fee.status)}
                        label={fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{new Date(fee.assigned_on).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {fee.amount_paid > 0 && (
                          <Tooltip title="Process Refund">
                            <IconButton size="small" color="warning" onClick={() => handleRefund(fee)}>
                              <Money />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Download Receipt">
                          <IconButton size="small" color="success">
                            <ReceiptLong />
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
          ) : filteredFees.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Info sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">No fee records found</Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or check back later
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredFees.map(fee => (
              <Grid item xs={12} md={6} lg={4} key={fee.id}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {fee.student?.user?.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="medium">
                          {fee.student?.user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fee.student?.user?.reg_no}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Block</Typography>
                        <Typography variant="body1">{fee.student?.hostel?.name}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Plan</Typography>
                        <Typography variant="body1">{fee.plan?.name}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Amount Due</Typography>
                        <Typography variant="body1" fontWeight="medium">₹{fee.amount_due}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                        <Typography variant="body1" fontWeight="medium" color="success.main">₹{fee.amount_paid}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          size="small"
                          color={getStatusColor(fee.status)}
                          label={fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Assigned</Typography>
                        <Typography variant="body2">{new Date(fee.assigned_on).toLocaleDateString()}</Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button size="small" startIcon={<Visibility />} variant="outlined" fullWidth>
                        View Details
                      </Button>
                      {fee.amount_paid > 0 && (
                        <Button
                          size="small"
                          startIcon={<Money />}
                          variant="outlined"
                          color="warning"
                          onClick={() => handleRefund(fee)}
                        >
                          Refund
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
          onClick={() => navigate('/warden/fees/new')}
        >
          <Add />
        </Fab>
      </Zoom>

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onClose={() => setRefundDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Money sx={{ mr: 1 }} />
          Process Refund Request
        </DialogTitle>
        <DialogContent>
          {selectedFee && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {selectedFee.student?.user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Registration: {selectedFee.student?.user?.reg_no}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount Paid: ₹{selectedFee.amount_paid}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Refund Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Provide detailed reason for refund request..."
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(false)}>Cancel</Button>
          <Button
            onClick={submitRefund}
            variant="contained"
            color="warning"
            disabled={!refundReason.trim()}
            startIcon={<Money />}
          >
            Submit Refund Request
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