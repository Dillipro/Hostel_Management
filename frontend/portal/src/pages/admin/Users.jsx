import React from 'react'
import { api } from '../../api'
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent,
  TextField, Select, MenuItem, LinearProgress, Alert, Checkbox, FormControlLabel, Chip, Avatar, InputAdornment,
  IconButton, Tooltip, Card, CardContent, Grid, Badge, Fab, DialogActions, Snackbar, Pagination, Stack,
  TableContainer, TableSortLabel, FormControl, InputLabel, CardActions
} from '@mui/material'
import {
  Search, FilterList, Download, Upload, Add, Edit, Delete, Refresh, Person, Email, Phone,
  AdminPanelSettings, School, Security, Engineering, CheckCircle, Cancel, MoreVert, GetApp,
  People, Group, PersonAdd, PersonOff, TableChart, FileDownload
} from '@mui/icons-material'

export default function AdminUsers(){
  const [items, setItems] = React.useState([])
  const [filteredItems, setFilteredItems] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState('')
  const [activeFilter, setActiveFilter] = React.useState('')
  const [sortConfig, setSortConfig] = React.useState({ key: 'created_at', direction: 'desc' })
  const [page, setPage] = React.useState(1)
  const [rowsPerPage] = React.useState(10)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  // Dialog states
  const [createDialog, setCreateDialog] = React.useState(false)
  const [editDialog, setEditDialog] = React.useState({ open: false, user: null })
  const [deleteDialog, setDeleteDialog] = React.useState({ open: false, user: null })

  // Form states
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    password: ''
  })

  // Bulk operations
  const [selected, setSelected] = React.useState([])
  const [uploading, setUploading] = React.useState(false)
  const [bulkResult, setBulkResult] = React.useState(null)

  // Enhanced metrics
  const [metrics, setMetrics] = React.useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    students: 0,
    staff: 0,
    admins: 0
  })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const r = await api.get('/api/admin/users', {
        params: {
          role: roleFilter || undefined,
          active: activeFilter === '' ? undefined : activeFilter
        }
      })
      const users = r.data || []
      setItems(users)
      setFilteredItems(users)

      // Calculate enhanced metrics
      const metrics = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.active).length,
        inactiveUsers: users.filter(u => !u.active).length,
        students: users.filter(u => u.role === 'student').length,
        staff: users.filter(u => ['admin', 'warden', 'rc'].includes(u.role)).length,
        admins: users.filter(u => u.role === 'admin').length
      }
      setMetrics(metrics)

      setSnackbar({ open: true, message: 'Users data loaded successfully', severity: 'success' })
    } catch (err) {
      setError('Failed to load users data')
      setSnackbar({ open: true, message: 'Failed to load users data', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => { load() }, [roleFilter, activeFilter])

  // Filter and sort data
  React.useEffect(() => {
    let filtered = items.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
    )

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (sortConfig.key === 'created_at') {
        const aDate = new Date(aValue)
        const bDate = new Date(bValue)
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    setFilteredItems(filtered)
    setPage(1)
  }, [searchTerm, items, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const create = async () => {
    try {
      await api.post('/api/admin/users', form)
      setCreateDialog(false)
      setForm({ name: '', email: '', phone: '', role: 'student', password: '' })
      load()
      setSnackbar({ open: true, message: 'User created successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create user', severity: 'error' })
    }
  }

  const handleEdit = (user) => {
    setEditDialog({ open: true, user: { ...user } })
  }

  const saveEdit = async () => {
    if (!editDialog.user) return
    try {
      const { id, ...rest } = editDialog.user
      await api.put(`/api/admin/users/${id}`, rest)
      setEditDialog({ open: false, user: null })
      load()
      setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' })
    }
  }

  const handleDelete = (user) => {
    setDeleteDialog({ open: true, user })
  }

  const confirmDelete = async () => {
    if (!deleteDialog.user) return
    try {
      await api.delete(`/api/admin/users/${deleteDialog.user.id}`)
      setDeleteDialog({ open: false, user: null })
      setSelected(selected.filter(id => id !== deleteDialog.user.id))
      load()
      setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete user', severity: 'error' })
    }
  }

  const resetPassword = async (id) => {
    const newPassword = prompt('Enter new password:')
    if (!newPassword) return
    try {
      await api.post(`/api/admin/users/${id}/reset-password`, { newPassword })
      setSnackbar({ open: true, message: 'Password reset successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to reset password', severity: 'error' })
    }
  }

  const downloadTemplate = () => {
    window.open('/api/admin/users/template.csv', '_blank')
  }

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    setBulkResult(null)
    try {
      const r = await api.post('/api/admin/users/bulk', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setBulkResult(r.data)
      await load()
      setSnackbar({ open: true, message: `Bulk upload completed: ${r.data.created} created, ${r.data.skipped} skipped`, severity: 'success' })
    } catch (err) {
      setBulkResult({ error: err?.response?.data?.error || 'Upload failed' })
      setSnackbar({ open: true, message: 'Bulk upload failed', severity: 'error' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const toggleSelect = (id, checked) => {
    setSelected(s => checked ? [...new Set([...s, id])] : s.filter(x => x !== id))
  }

  const toggleSelectAll = (checked) => {
    const currentPageItems = paginatedItems.map(u => u.id)
    setSelected(checked ? [...new Set([...selected, ...currentPageItems])] : selected.filter(id => !currentPageItems.includes(id)))
  }

  const bulkDisable = async (active) => {
    try {
      await Promise.all(selected.map(id => api.patch(`/api/admin/users/${id}/active`, { active })))
      setSelected([])
      load()
      setSnackbar({ open: true, message: `Users ${active ? 'enabled' : 'disabled'} successfully`, severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Bulk operation failed', severity: 'error' })
    }
  }

  const bulkDelete = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} users? This action cannot be undone.`)) return
    try {
      await api.delete('/api/admin/users', { data: { ids: selected } })
      setSelected([])
      load()
      setSnackbar({ open: true, message: 'Users deleted successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Bulk delete failed', severity: 'error' })
    }
  }

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'],
      ...filteredItems.map(u => [u.name, u.email, u.phone, u.role, u.active ? 'Active' : 'Inactive', u.created_at])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadErrors = () => {
    if (bulkResult?.errors_csv) {
      const blob = new Blob([bulkResult.errors_csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'user-upload-errors.csv'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />
      case 'warden': return <Security />
      case 'rc': return <Engineering />
      default: return <School />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error'
      case 'warden': return 'warning'
      case 'rc': return 'info'
      default: return 'success'
    }
  }

  const paginatedItems = filteredItems.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.ceil(filteredItems.length / rowsPerPage)
  return (
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
          👥 User Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Comprehensive user administration with role management, bulk operations, and advanced filtering
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
                    {metrics.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Users
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
                    {metrics.activeUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Users
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {metrics.students}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Students
                  </Typography>
                </Box>
                <School sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {metrics.staff}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Staff Members
                  </Typography>
                </Box>
                <AdminPanelSettings sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls Card */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              🔍 Search & Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialog(true)}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                Create User
              </Button>
              <Tooltip title="Refresh Data">
                <IconButton onClick={load} disabled={loading}>
                  <Refresh sx={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data">
                <IconButton onClick={exportUsers}>
                  <FileDownload />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, email, or phone..."
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
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Role Filter</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role Filter"
                >
                  <MenuItem value=""><em>All Roles</em></MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="rc">RC</MenuItem>
                  <MenuItem value="warden">Warden</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value=""><em>All Status</em></MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  component="label"
                  size="small"
                >
                  Bulk Upload
                  <input type="file" accept=".csv,.xlsx,.xls" hidden onChange={onUpload} />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadTemplate}
                  size="small"
                >
                  Template
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* CSV Template Help */}
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              CSV/XLSX columns supported: role, name, email, phone, password, reg_no, gender, dob (YYYY-MM-DD), community, father_name, mother_name, category, program_type, degree, branch, department, year, semester, lateral_entry, parent_contact, medical_info, active. For student imports, set role to "student" and include relevant academic fields.
            </Alert>
          </Box>

          {/* Bulk Actions */}
          {selected.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.selected', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                {selected.length} user{selected.length > 1 ? 's' : ''} selected
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" color="success" onClick={() => bulkDisable(true)}>
                  Enable
                </Button>
                <Button size="small" color="warning" onClick={() => bulkDisable(false)}>
                  Disable
                </Button>
                <Button size="small" color="error" onClick={bulkDelete}>
                  Delete
                </Button>
              </Stack>
            </Box>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>Uploading and processing file...</Typography>
            </Box>
          )}

          {/* Bulk Result */}
          {bulkResult && (
            <Box sx={{ mt: 2 }}>
              {bulkResult.error ? (
                <Alert severity="error">{bulkResult.error}</Alert>
              ) : (
                <Alert severity="success">
                  Upload completed: {bulkResult.created} created, {bulkResult.skipped} skipped
                  {bulkResult.errors_csv && (
                    <Button size="small" onClick={downloadErrors} sx={{ ml: 1 }}>
                      Download Errors
                    </Button>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <LinearProgress />
              <Typography sx={{ mt: 2 }}>Loading users...</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: 'grey.50' }}>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selected.length > 0 && selected.length < paginatedItems.length}
                          checked={paginatedItems.length > 0 && selected.length === paginatedItems.length}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'name'}
                          direction={sortConfig.direction}
                          onClick={() => handleSort('name')}
                        >
                          User
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'role'}
                          direction={sortConfig.direction}
                          onClick={() => handleSort('role')}
                        >
                          Role
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.key === 'created_at'}
                          direction={sortConfig.direction}
                          onClick={() => handleSort('created_at')}
                        >
                          Created
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedItems.map((user) => (
                      <TableRow key={user.id} hover sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selected.includes(user.id)}
                            onChange={(e) => toggleSelect(user.id, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: getRoleColor(user.role).main || 'primary.main' }}>
                              {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {user.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {user.id.slice(0, 8)}...
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{user.phone}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            color={getRoleColor(user.role)}
                            size="small"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={user.active ? <CheckCircle /> : <Cancel />}
                            label={user.active ? 'Active' : 'Inactive'}
                            color={user.active ? 'success' : 'error'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(user.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => handleEdit(user)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reset Password">
                            <IconButton size="small" onClick={() => resetPassword(user.id)}>
                              <Security />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton size="small" color="error" onClick={() => handleDelete(user)}>
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

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

              {paginatedItems.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No users found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or filter criteria
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          ➕ Create New User
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="rc">Resident Counselor</MenuItem>
                  <MenuItem value="warden">Warden</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={create}
            disabled={!form.name || !form.email || !form.phone || !form.password}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          ✏️ Edit User
        </DialogTitle>
        {editDialog.user && (
          <>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={editDialog.user.name}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      user: { ...editDialog.user, name: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={editDialog.user.email}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      user: { ...editDialog.user, email: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editDialog.user.phone}
                    onChange={(e) => setEditDialog({
                      ...editDialog,
                      user: { ...editDialog.user, phone: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={editDialog.user.role}
                      onChange={(e) => setEditDialog({
                        ...editDialog,
                        user: { ...editDialog.user, role: e.target.value }
                      })}
                      label="Role"
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="rc">Resident Counselor</MenuItem>
                      <MenuItem value="warden">Warden</MenuItem>
                      <MenuItem value="admin">Administrator</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
              <Button
                variant="contained"
                onClick={saveEdit}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle sx={{ color: 'error.main' }}>⚠️ Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.user?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone and will permanently remove the user account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
          >
            Delete User
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
  )
}
