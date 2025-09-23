import React from 'react'
import { api } from '../../api'
import {
  Box, Paper, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, Grid, Chip, Stack,
  IconButton, Tooltip, Alert, Snackbar, LinearProgress, Fab, InputAdornment
} from '@mui/material'
import {
  Add, Edit, Delete, Save, Cancel, Receipt, AccountBalance, TrendingUp, Search,
  Refresh, GetApp, Assignment, Calculate
} from '@mui/icons-material'

export default function AdminFinance(){
  const [plans, setPlans] = React.useState([])
  const [filteredPlans, setFilteredPlans] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [name, setName] = React.useState('Semester Fee')
  const [year, setYear] = React.useState('2025-26')
  const [items, setItems] = React.useState([{ name:'Hostel Fee', amount:20000 }, { name:'Mess Advance', amount:10000 }])
  const [open, setOpen] = React.useState(false)
  const [editPlan, setEditPlan] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  const load = async ()=>{
    setLoading(true)
    try {
      const r = await api.get('/api/admin/finance/plans')
      setPlans(r.data || [])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load fee plans', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() },[])

  React.useEffect(() => {
    const filtered = plans.filter(plan =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.academic_year.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredPlans(filtered)
  }, [searchTerm, plans])

  const create = async ()=>{
    try {
      await api.post('/api/admin/finance/plans', { name, academic_year: year, items })
      setItems([{ name:'Hostel Fee', amount:20000 }, { name:'Mess Advance', amount:10000 }])
      setName('Semester Fee')
      setOpen(false)
      load()
      setSnackbar({ open: true, message: 'Fee plan created successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create fee plan', severity: 'error' })
    }
  }

  const update = async ()=>{
    if (!editPlan) return
    try {
      const { id, ...payload } = editPlan
      await api.put(`/api/admin/finance/plans/${id}`, payload)
      setEditPlan(null)
      load()
      setSnackbar({ open: true, message: 'Fee plan updated successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update fee plan', severity: 'error' })
    }
  }

  const remove = async (id)=>{
    if (!confirm('Delete this fee plan? This action cannot be undone.')) return
    try {
      await api.delete(`/api/admin/finance/plans/${id}`)
      load()
      setSnackbar({ open: true, message: 'Fee plan deleted successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete fee plan', severity: 'error' })
    }
  }

  const getTotalAmount = (planItems) => {
    return planItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
  }

  const getFinanceStats = () => {
    const totalPlans = plans.length
    const totalRevenue = plans.reduce((sum, plan) => sum + getTotalAmount(plan.items), 0)
    const avgPlanValue = totalPlans > 0 ? totalRevenue / totalPlans : 0

    return { totalPlans, totalRevenue, avgPlanValue }
  }
  const stats = getFinanceStats()

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #ff6f00, #ff9800)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
            Financial Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage fee plans, track financial performance, and generate reports
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={() => {/* Export functionality */}}
          >
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Create Fee Plan
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Fee Plans</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.totalPlans}</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Revenue</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{stats.totalRevenue.toLocaleString()}</Typography>
                </Box>
                <AccountBalance sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Plan Value</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>₹{Math.round(stats.avgPlanValue).toLocaleString()}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search fee plans by name or academic year..."
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
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredPlans.length} of {plans.length} fee plans
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Fee Plans Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
              <Typography sx={{ mt: 2 }}>Loading fee plans...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>Plan Details</TableCell>
                  <TableCell>Fee Items</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {plan.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {plan.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(plan.items || []).map((item, index) => (
                          <Chip
                            key={index}
                            label={`${item.name}: ₹${item.amount?.toLocaleString()}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ₹{getTotalAmount(plan.items).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.academic_year}
                        size="small"
                        color="secondary"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit Plan">
                          <IconButton
                            size="small"
                            onClick={() => setEditPlan({ ...plan })}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Plan">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => remove(plan.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Fee Plan Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add />
          Create Fee Plan
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plan Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Fee Items</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Amount (₹)</TableCell>
                    <TableCell width={100}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={item.name}
                          onChange={(e) => {
                            const v = [...items]
                            v[i] = { ...v[i], name: e.target.value }
                            setItems(v)
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const v = [...items]
                            v[i] = { ...v[i], amount: Number(e.target.value) }
                            setItems(v)
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const v = [...items]
                            v.splice(i, 1)
                            setItems(v)
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setItems([...items, { name: '', amount: 0 }])}
                sx={{ mt: 1 }}
              >
                Add Fee Item
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={create}
            disabled={!name.trim() || !year.trim() || items.some(item => !item.name.trim())}
          >
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Fee Plan Dialog */}
      <Dialog open={!!editPlan} onClose={() => setEditPlan(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit />
          Edit Fee Plan
        </DialogTitle>
        {editPlan && (
          <>
            <DialogContent sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Plan Name"
                    value={editPlan.name || ''}
                    onChange={(e) => setEditPlan({ ...editPlan, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={editPlan.academic_year || ''}
                    onChange={(e) => setEditPlan({ ...editPlan, academic_year: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Fee Items</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>Item Name</TableCell>
                        <TableCell>Amount (₹)</TableCell>
                        <TableCell width={100}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(editPlan.items || []).map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.name}
                              onChange={(e) => {
                                const v = [...editPlan.items]
                                v[i] = { ...v[i], name: e.target.value }
                                setEditPlan({ ...editPlan, items: v })
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              type="number"
                              value={item.amount}
                              onChange={(e) => {
                                const v = [...editPlan.items]
                                v[i] = { ...v[i], amount: Number(e.target.value) }
                                setEditPlan({ ...editPlan, items: v })
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const v = [...editPlan.items]
                                v.splice(i, 1)
                                setEditPlan({ ...editPlan, items: v })
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setEditPlan({
                      ...editPlan,
                      items: [...(editPlan.items || []), { name: '', amount: 0 }]
                    })}
                    sx={{ mt: 1 }}
                  >
                    Add Fee Item
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditPlan(null)}>Cancel</Button>
              <Button variant="contained" onClick={update}>
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
