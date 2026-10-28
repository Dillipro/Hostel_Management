import React from 'react'
import Page from '../../components/Page'
import { api } from '../../api'
import {
  Box, Button, Typography, Card, CardContent, Grid, Chip, LinearProgress,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Stack, Divider, Avatar,
  IconButton, Tooltip, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Paper, Snackbar
} from '@mui/material'
import {
  Payment, Receipt, CreditCard, AccountBalance, CheckCircle, Pending,
  Error, Download, Refresh, AttachMoney, Schedule, Info
} from '@mui/icons-material'

export default function StudentFees(){
  const [payments, setPayments] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [feeSummary, setFeeSummary] = React.useState({
    totalPaid: 0,
    totalPending: 0,
    lastPayment: null,
    paymentCount: 0
  })

  // Payment initiation
  const [paymentDialog, setPaymentDialog] = React.useState(false)
  const [paymentForm, setPaymentForm] = React.useState({
    feeType: 'hostel_fee',
    amount: '',
    description: ''
  })
  const [initiatingPayment, setInitiatingPayment] = React.useState(false)

  // UI state
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  const feeTypes = [
    { value: 'hostel_fee', label: 'Hostel Fee', defaultAmount: 12000 },
    { value: 'mess_fee', label: 'Mess Fee', defaultAmount: 3000 },
    { value: 'maintenance_fee', label: 'Maintenance Fee', defaultAmount: 1000 },
    { value: 'other', label: 'Other Fee', defaultAmount: 0 }
  ]

  const loadPayments = async () => {
    try {
      setLoading(true)
      const r = await api.get('/api/payments')
      const paymentData = r.data || []
      setPayments(paymentData)

      // Calculate fee summary
      const totalPaid = paymentData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0)

      const totalPending = paymentData
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0)

      const completedPayments = paymentData.filter(p => p.status === 'completed')
      const lastPayment = completedPayments.length > 0
        ? completedPayments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
        : null

      setFeeSummary({
        totalPaid,
        totalPending,
        lastPayment,
        paymentCount: paymentData.length
      })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load payment data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { loadPayments() }, [])

  const initiatePayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'error' })
      return
    }

    try {
      setInitiatingPayment(true)
      const r = await api.post('/api/payments/initiate', {
        amount: parseFloat(paymentForm.amount),
        fee_type: paymentForm.feeType,
        description: paymentForm.description || undefined
      })

      setPaymentDialog(false)
      setPaymentForm({ feeType: 'hostel_fee', amount: '', description: '' })
      setSnackbar({
        open: true,
        message: `Payment initiated successfully! Order ID: ${r.data.order.id}`,
        severity: 'success'
      })

      // Reload payments to show the new pending payment
      await loadPayments()

      // In a real app, you would redirect to payment gateway here
      // window.location.href = r.data.payment_url

    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Failed to initiate payment',
        severity: 'error'
      })
    } finally {
      setInitiatingPayment(false)
    }
  }

  const handleFeeTypeChange = (feeType) => {
    const selectedType = feeTypes.find(t => t.value === feeType)
    setPaymentForm(prev => ({
      ...prev,
      feeType,
      amount: selectedType ? selectedType.defaultAmount.toString() : ''
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'pending': return 'warning'
      case 'failed': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />
      case 'pending': return <Pending />
      case 'failed': return <Error />
      default: return <Info />
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <Page title="Fees & Payments">
      {/* Modern Gradient Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            💳 Fees & Payments
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Manage your hostel fees, view payment history, and make secure payments
          </Typography>
          <Button
            variant="contained"
            startIcon={<Payment />}
            onClick={() => setPaymentDialog(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            Make Payment
          </Button>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        />
      </Box>

      {/* Fee Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(feeSummary.totalPaid)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Paid
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(feeSummary.totalPending)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Amount
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {feeSummary.paymentCount}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Transactions
                  </Typography>
                </Box>
                <Receipt sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {feeSummary.lastPayment ? new Date(feeSummary.lastPayment.created_at).toLocaleDateString() : 'None'}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Last Payment
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment History */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                📄 Payment History
              </Typography>
              <Tooltip title="Refresh">
                <IconButton onClick={loadPayments} disabled={loading}>
                  <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography>Loading payment history...</Typography>
            </Box>
          ) : payments.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No payments found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your payment history will appear here once you make transactions
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell><strong>Fee Type</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            <AttachMoney sx={{ fontSize: 16 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {payment.fee_type || 'Other Fee'}
                            </Typography>
                            {payment.description && (
                              <Typography variant="caption" color="text.secondary">
                                {payment.description}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(payment.status)}
                          label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          size="small"
                          color={getStatusColor(payment.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(payment.created_at).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {payment.status === 'completed' && (
                          <Tooltip title="Download Receipt">
                            <IconButton
                              component="a"
                              href={`/api/payments/${payment.id}/receipt`}
                              target="_blank"
                              size="small"
                              color="primary"
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Payment Initiation Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Payment />
          Make a Payment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Fee Type</InputLabel>
              <Select
                value={paymentForm.feeType}
                onChange={(e) => handleFeeTypeChange(e.target.value)}
                label="Fee Type"
              >
                {feeTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label} - Default: {formatCurrency(type.defaultAmount)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
              }}
              helperText="Enter the amount you want to pay"
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              multiline
              rows={2}
              value={paymentForm.description}
              onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add any additional notes for this payment"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> You will be redirected to our secure payment gateway to complete the transaction.
                Your payment information is encrypted and secure.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={initiatePayment}
            disabled={initiatingPayment || !paymentForm.amount}
            startIcon={initiatingPayment ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <CreditCard />}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {initiatingPayment ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Page>
  )
}
