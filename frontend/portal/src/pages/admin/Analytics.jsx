import React from 'react'
import { api } from '../../api'
import {
  Box, Paper, Typography, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Stack,
  Card, CardContent, Grid, Chip, Alert, Snackbar, FormControl, InputLabel, TableContainer,
  Tabs, Tab, IconButton, Tooltip, Fab, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import {
  Analytics, TrendingUp, People, AttachMoney, Schedule, Assessment, FileDownload,
  Refresh, FilterList, DateRange, BarChart as BarChartIcon, PieChart as PieChartIcon,
  ShowChart, TableChart, PictureAsPdf, GetApp, Timeline, Insights, Business
} from '@mui/icons-material'

function toCSV(rows, headers){
  const head = headers.join(',')
  const body = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')).join('\n')
  return head+'\n'+body
}

export default function AdminAnalytics(){
  const [data, setData] = React.useState({
    occupancy: [],
    revenueByMonth: {},
    sla: [],
    complaints: [],
    payments: [],
    appeals: []
  })
  const [range, setRange] = React.useState('6m')
  const [fromDate, setFromDate] = React.useState(dayjs().subtract(6, 'month'))
  const [toDate, setToDate] = React.useState(dayjs())
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })
  const [activeTab, setActiveTab] = React.useState(0)
  const [chartType, setChartType] = React.useState('bar')
  const [exportDialog, setExportDialog] = React.useState({ open: false, type: '', format: 'csv' })

  // Calculated metrics
  const metrics = React.useMemo(() => {
    const totalOccupancy = data.occupancy.reduce((sum, block) => sum + (block.occupancy_rate || 0), 0) / Math.max(data.occupancy.length, 1)
    const totalRevenue = Object.values(data.revenueByMonth).reduce((sum, month) =>
      sum + Object.values(month).reduce((mSum, val) => mSum + Number(val), 0), 0
    )
    const avgSLA = data.sla.reduce((sum, sla) => sum + (sla.avg_hours || 0), 0) / Math.max(data.sla.length, 1)

    return {
      totalOccupancy: (totalOccupancy * 100).toFixed(1),
      totalRevenue: totalRevenue.toFixed(2),
      avgSLA: avgSLA.toFixed(1),
      totalBlocks: data.occupancy?.length || 0,
      totalComplaints: data.complaints?.length || 0,
      resolvedComplaints: data.complaints?.filter(c => c.status === 'resolved').length || 0
    }
  }, [data])
  const load = async ()=>{
    try {
      setLoading(true)
      setError('')
      const now = new Date()
      const params = {}
      if (range==='12m') { params.from = new Date(Date.UTC(now.getUTCFullYear()-1, now.getUTCMonth(), 1)).toISOString() }
      if (range==='6m') { params.from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-6, 1)).toISOString() }
      if (range==='3m') { params.from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()-3, 1)).toISOString() }
      if (range==='custom') {
        if (fromDate) params.from = fromDate.toDate().toISOString()
        if (toDate) params.to = toDate.toDate().toISOString()
      }
      const r = await api.get('/api/admin/analytics', { params })
      setData(prevData => ({
        ...prevData,
        ...r.data,
        complaints: prevData.complaints || [],
        payments: prevData.payments || [],
        appeals: prevData.appeals || []
      }))
      setSnackbar({ open: true, message: 'Analytics data loaded successfully', severity: 'success' })
    } catch (err) {
      setError('Failed to load analytics data')
      setSnackbar({ open: true, message: 'Failed to load analytics data', severity: 'error' })
      console.error('Load analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() },[])
  React.useEffect(()=>{ if (range !== 'custom') load() },[range])

  const exportData = (rows, headers, filename) => {
    const csv = toCSV(rows, headers)
    const blob = new Blob([csv], { type:'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setSnackbar({ open: true, message: `${filename} exported successfully`, severity: 'success' })
  }

  const exportOccupancy = () => exportData(data.occupancy, ['block_id','block_name','capacity','occupied','occupancy_rate'], 'occupancy_report.csv')
  const exportRevenue = () => exportData(revRows, ['month','fee_type','amount'], 'revenue_report.csv')
  const exportSLA = () => exportData(data.sla, ['type','priority','avg_hours'], 'sla_report.csv')

  const revRows = Object.entries(data.revenueByMonth).flatMap(([month, byType]) =>
    Object.entries(byType).map(([fee_type, amount]) => ({ month, fee_type, amount: Number(amount) }))
  )
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Modern Gradient Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 3,
            mb: 3,
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            📊 Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Comprehensive insights into hostel operations, occupancy, revenue, and performance metrics
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {metrics.totalOccupancy}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Avg Occupancy Rate
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      ₹{metrics.totalRevenue}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Revenue
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {metrics.avgSLA}h
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Avg SLA Hours
                    </Typography>
                  </Box>
                  <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {metrics.totalBlocks}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Blocks
                    </Typography>
                  </Box>
                  <Business sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls Card */}
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              📅 Date Range & Controls
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select value={range} onChange={e=>setRange(e.target.value)} label="Time Range">
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="12m">Last 12 Months</MenuItem>
                    <MenuItem value="6m">Last 6 Months</MenuItem>
                    <MenuItem value="3m">Last 3 Months</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {range === 'custom' && (
                <>
                  <Grid item xs={12} md={2}>
                    <DatePicker
                      label="From Date"
                      value={fromDate}
                      onChange={setFromDate}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <DatePicker
                      label="To Date"
                      value={toDate}
                      onChange={setToDate}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      onClick={load}
                      disabled={loading}
                      startIcon={loading ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Refresh />}
                      fullWidth
                    >
                      {loading ? 'Loading...' : 'Apply Filter'}
                    </Button>
                  </Grid>
                </>
              )}
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setExportDialog({ open: true, type: 'all' })}
                    startIcon={<FileDownload />}
                  >
                    Export All
                  </Button>
                  <Tooltip title="Refresh Data">
                    <IconButton onClick={load} disabled={loading}>
                      <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Card sx={{ boxShadow: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<BarChartIcon />} label="Occupancy" />
            <Tab icon={<AttachMoney />} label="Revenue" />
            <Tab icon={<Schedule />} label="SLA Performance" />
            <Tab icon={<TableChart />} label="Data Tables" />
          </Tabs>

          <CardContent>
            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {/* Occupancy Tab */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  🏠 Occupancy Analysis by Block
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1">Occupancy Rates</Typography>
                          <FormControl size="small">
                            <Select value={chartType} onChange={e=>setChartType(e.target.value)}>
                              <MenuItem value="bar">Bar Chart</MenuItem>
                              <MenuItem value="area">Area Chart</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                          {chartType === 'bar' ? (
                            <BarChart data={data.occupancy}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="block_name" />
                              <YAxis />
                              <RechartsTooltip formatter={(value, name) => [name === 'occupancy_rate' ? `${(value * 100).toFixed(1)}%` : value, name]} />
                              <Legend />
                              <Bar dataKey="capacity" fill="#e0e0e0" name="Capacity" />
                              <Bar dataKey="occupied" fill="#1976d2" name="Occupied" />
                            </BarChart>
                          ) : (
                            <AreaChart data={data.occupancy}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="block_name" />
                              <YAxis />
                              <RechartsTooltip formatter={(value, name) => [name === 'occupancy_rate' ? `${(value * 100).toFixed(1)}%` : value, name]} />
                              <Legend />
                              <Area type="monotone" dataKey="capacity" stackId="1" stroke="#e0e0e0" fill="#e0e0e0" name="Capacity" />
                              <Area type="monotone" dataKey="occupied" stackId="2" stroke="#1976d2" fill="#1976d2" name="Occupied" />
                            </AreaChart>
                          )}
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Block Summary</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Block</strong></TableCell>
                                <TableCell align="right"><strong>Rate</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.occupancy.map(block => (
                                <TableRow key={block.block_id} hover>
                                  <TableCell>{block.block_name}</TableCell>
                                  <TableCell align="right">
                                    <Chip
                                      label={`${(block.occupancy_rate * 100).toFixed(1)}%`}
                                      size="small"
                                      color={block.occupancy_rate > 0.8 ? 'success' : block.occupancy_rate > 0.6 ? 'warning' : 'error'}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={exportOccupancy} startIcon={<FileDownload />}>
                    Export Occupancy Data
                  </Button>
                </Box>
              </Box>
            )}

            {/* Revenue Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  💰 Revenue Analysis by Month
                </Typography>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={revRows.reduce((acc, row) => {
                        const existing = acc.find(item => item.month === row.month)
                        if (existing) {
                          existing[row.fee_type] = row.amount
                        } else {
                          acc.push({ month: row.month, [row.fee_type]: row.amount })
                        }
                        return acc
                      }, [])}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [`₹${Number(value).toFixed(2)}`, '']} />
                        <Legend />
                        <Bar dataKey="hostel_fee" stackId="a" fill="#1976d2" name="Hostel Fee" />
                        <Bar dataKey="mess_fee" stackId="a" fill="#9c27b0" name="Mess Fee" />
                        <Bar dataKey="maintenance_fee" stackId="a" fill="#2e7d32" name="Maintenance Fee" />
                        <Bar dataKey="other" stackId="a" fill="#ef6c00" name="Other" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={exportRevenue} startIcon={<FileDownload />}>
                    Export Revenue Data
                  </Button>
                </Box>
              </Box>
            )}

            {/* SLA Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  ⏱️ SLA Performance Analysis
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data.sla}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" />
                            <YAxis />
                            <RechartsTooltip formatter={(value) => [`${Number(value).toFixed(1)} hours`, 'Avg Resolution Time']} />
                            <Legend />
                            <Bar dataKey="avg_hours" fill="#9c27b0" name="Avg Hours" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>SLA by Priority</Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Type</strong></TableCell>
                                <TableCell><strong>Priority</strong></TableCell>
                                <TableCell align="right"><strong>Hours</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.sla.map((sla, idx) => (
                                <TableRow key={idx} hover>
                                  <TableCell>{sla.type}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={sla.priority}
                                      size="small"
                                      color={
                                        sla.priority === 'high' ? 'error' :
                                        sla.priority === 'medium' ? 'warning' : 'success'
                                      }
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell align="right">{sla.avg_hours.toFixed(1)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={exportSLA} startIcon={<FileDownload />}>
                    Export SLA Data
                  </Button>
                </Box>
              </Box>
            )}

            {/* Data Tables Tab */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  📋 Detailed Data Tables
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Occupancy Details</Typography>
                        <TableContainer sx={{ maxHeight: 300 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Block</TableCell>
                                <TableCell align="right">Capacity</TableCell>
                                <TableCell align="right">Occupied</TableCell>
                                <TableCell align="right">Rate</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {data.occupancy.map(block => (
                                <TableRow key={block.block_id} hover>
                                  <TableCell>{block.block_name}</TableCell>
                                  <TableCell align="right">{block.capacity}</TableCell>
                                  <TableCell align="right">{block.occupied}</TableCell>
                                  <TableCell align="right">{(block.occupancy_rate * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Revenue Breakdown</Typography>
                        <TableContainer sx={{ maxHeight: 300 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {revRows.map((row, idx) => (
                                <TableRow key={idx} hover>
                                  <TableCell>{row.month}</TableCell>
                                  <TableCell>{row.fee_type}</TableCell>
                                  <TableCell align="right">₹{row.amount.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Export Dialog */}
        <Dialog open={exportDialog.open} onClose={() => setExportDialog({ open: false, type: '', format: 'csv' })}>
          <DialogTitle>Export Analytics Data</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportDialog.format}
                onChange={(e) => setExportDialog(prev => ({ ...prev, format: e.target.value }))}
                label="Export Format"
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="pdf">PDF (Coming Soon)</MenuItem>
                <MenuItem value="excel">Excel (Coming Soon)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExportDialog({ open: false, type: '', format: 'csv' })}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (exportDialog.format === 'csv') {
                  exportOccupancy()
                  exportRevenue()
                  exportSLA()
                }
                setExportDialog({ open: false, type: '', format: 'csv' })
              }}
              startIcon={<FileDownload />}
            >
              Export All Data
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
      </Box>
    </LocalizationProvider>
  )
}
