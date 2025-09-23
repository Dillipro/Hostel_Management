import React from 'react'
import { api } from '../../api'
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent,
  TextField, Select, MenuItem, LinearProgress, Alert, Chip, Avatar, Stack, LinearProgress as MuiLinearProgress,
  Card, CardContent, Grid, InputAdornment, IconButton, Tooltip, Snackbar, Pagination, Fab
} from '@mui/material'
import {
  Search, FilterList, Download, Refresh, Payment, CheckCircle, Pending, Cancel, Receipt,
  TrendingUp, AccountBalance, CreditCard, GetApp
} from '@mui/icons-material'

export default function AdminPayments(){
  const [summary, setSummary] = React.useState({ byType: [], byStatus: [] })
  const [payments, setPayments] = React.useState([])
  const [filteredPayments, setFilteredPayments] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState('')
  const [page, setPage] = React.useState(1)
  const [rowsPerPage] = React.useState(10)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  const loadData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, paymentsRes] = await Promise.all([
        api.get('/api/admin/payments/summary'),
        api.get('/api/admin/payments', {
          params: {
            status: statusFilter || undefined,
            fee_type: typeFilter || undefined
          }
        })
      ])
      setSummary(summaryRes.data || { byType: [], byStatus: [] })
      setPayments(paymentsRes.data?.payments || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load payment data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  React.useEffect(() => { loadData() }, [loadData])

  React.useEffect(() => {
    const filtered = payments.filter(payment =>
      payment.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.fee_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPayments(filtered)
    setPage(1)
  }, [searchTerm, payments])

  const exportPayments = () => {
    const csv = [
      ['Student', 'Fee Type', 'Amount', 'Status', 'Transaction ID', 'Date'],
      ...filteredPayments.map(p => [
        p.student?.name || '',
        p.fee_type,
        p.amount,
        p.status,
        p.transaction_id || '',
        p.created_at
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'payments.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle />
      case 'pending': return <Pending />
      case 'failed': return <Cancel />
      default: return <Payment />
    }
  }

  const getPaymentStats = () => {
    const totalAmount = summary.byType?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
    const totalTransactions = summary.byType?.reduce((sum, item) => sum + (item.count || 0), 0) || 0
    const completedPayments = summary.byStatus?.find(s => s.status === 'completed')?.count || 0
    const pendingPayments = summary.byStatus?.find(s => s.status === 'pending')?.count || 0

    return { totalAmount, totalTransactions, completedPayments, pendingPayments }
  }
  const stats = getPaymentStats()
  const paginatedPayments = filteredPayments.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.ceil(filteredPayments.length / rowsPerPage)

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #4caf50, #66bb6a)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
            Payment Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor transactions, track payment status, and manage fee collections
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={exportPayments}
            disabled={!filteredPayments.length}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{stats.totalAmount.toLocaleString()}</Typography>
                </Box>
                <AccountBalance sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Transactions</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalTransactions}</Typography>
                </Box>
                <Receipt sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Completed</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.completedPayments}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Pending</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.pendingPayments}</Typography>
                </Box>
                <Pending sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Tables */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard />
                Payments by Fee Type
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Fee Type</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(summary.byType || []).map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{row.fee_type}</TableCell>
                      <TableCell align="right">{row._count?._all || 0}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        ₹{(row._sum?.amount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp />
                Payments by Status
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(summary.byStatus || []).map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(row.status)}
                          <Typography sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                            {row.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{row._count?._all || 0}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        ₹{(row._sum?.amount || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by student name, fee type, or transaction ID..."
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
            <Grid item xs={12} sm={6} md={2}>
              <Select
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value=""><em>All Status</em></MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Select
                fullWidth
                size="small"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                displayEmpty
              >
                <MenuItem value=""><em>All Types</em></MenuItem>
                <MenuItem value="hostel">Hostel Fee</MenuItem>
                <MenuItem value="mess">Mess Fee</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Showing {paginatedPayments.length} of {filteredPayments.length} payments
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
              <Typography sx={{ mt: 2 }}>Loading payments...</Typography>
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Student</TableCell>
                    <TableCell>Fee Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPayments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {payment.student?.name?.charAt(0)?.toUpperCase() || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {payment.student?.name || 'Unknown Student'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {payment.student_id?.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payment.fee_type?.charAt(0).toUpperCase() + payment.fee_type?.slice(1)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 500 }}>
                        ₹{payment.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(payment.status)}
                          label={payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                          color={getStatusColor(payment.status)}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {payment.transaction_id || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(payment.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
