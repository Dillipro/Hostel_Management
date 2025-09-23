import React from 'react'
import { api } from '../../api'
import {
  Box, Button, Select, MenuItem, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, TextField,
  Card, CardContent, Grid, Chip, Stack, LinearProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, IconButton, Tooltip, InputAdornment, Fab, Accordion, AccordionSummary, AccordionDetails,
  FormControl, InputLabel, TableContainer
} from '@mui/material'
import {
  PlayArrow, CheckCircle, Save, Compare, GetApp, PictureAsPdf, ExpandMore, Settings,
  Assignment, Timeline, People, Business, Warning, Error, Info, Refresh,
  Analytics, AssignmentTurnedIn, CompareArrows, History, PlayCircleOutline, CheckCircle as CheckCircleIcon,
  FileDownload, Visibility, Forward, Restore, Add, Delete
} from '@mui/icons-material'

export default function AdminAllotments(){
  const [method, setMethod] = React.useState('majority')
  const [preview, setPreview] = React.useState(null)
  const [tiebreaker, setTiebreaker] = React.useState('year')
  const [blocks, setBlocks] = React.useState([])
  const [selectedBlock, setSelectedBlock] = React.useState('')
  const [quotas, setQuotas] = React.useState([])
  const [rounds, setRounds] = React.useState([])
  const [roundId, setRoundId] = React.useState('')
  const [deptFilter, setDeptFilter] = React.useState('')
  const [snapshots, setSnapshots] = React.useState([])
  const [leftSnap, setLeftSnap] = React.useState('')
  const [rightSnap, setRightSnap] = React.useState('')
  const [constraintsText, setConstraintsText] = React.useState('{"waitlistBoost":50,"soft":{"penaltyOverCap":100},"hard":{"blocks":{}}}')
  const [constraintsError, setConstraintsError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [finalizing, setFinalizing] = React.useState(false)
  const [tabValue, setTabValue] = React.useState(0)
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' })

  React.useEffect(()=>{ (async()=>{ const r = await api.get('/api/admin/blocks'); setBlocks(r.data||[]) })() },[])
  React.useEffect(()=>{ (async()=>{ const r = await api.get('/api/admin/rounds'); setRounds(r.data||[]); const open = (r.data||[]).find(x=>x.status==='open'); if(open) setRoundId(open.id) })() },[])
  const [fromRoundId, setFromRoundId] = React.useState('')
  const openRound = React.useMemo(()=> rounds.find(r=>r.id===roundId), [rounds, roundId])
  const isApplyLocked = React.useMemo(()=>{
    if (!openRound) return true;
    if (openRound.status !== 'open') return true;
    if (openRound.close_date) { try { const d=new Date(openRound.close_date); if(!isNaN(+d) && d < new Date()) return true } catch {}
    }
    return false;
  }, [openRound])
  const loadSnaps = async ()=>{ const r = await api.get('/api/admin/allotments/snapshots'); setSnapshots(r.data||[]) }
  React.useEffect(()=>{ loadSnaps() },[])
  const run = async ()=>{
    let constraints = null;
    setConstraintsError('')
    try {
      if (constraintsText?.trim()) constraints = JSON.parse(constraintsText)
    } catch (e) {
      setConstraintsError('Invalid JSON')
      return
    }

    setRunning(true)
    try {
      const r = await api.post('/api/admin/allotments/dry-run', { method, round_id: roundId||undefined, tiebreaker, constraints })
      setPreview(r.data)
      setSnackbar({ open: true, message: 'Dry run completed successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Dry run failed', severity: 'error' })
    } finally {
      setRunning(false)
    }
  }

  const finalize = async ()=>{
    if(!preview || !roundId) return

    setFinalizing(true)
    try {
      await api.post('/api/admin/allotments/finalize', { assignments: preview.assignments, round_id: roundId })
      setSnackbar({ open: true, message: 'Allotment finalized successfully', severity: 'success' })
      // Refresh data
      const r = await api.get('/api/admin/rounds')
      setRounds(r.data||[])
    } catch (error) {
      setSnackbar({ open: true, message: 'Finalization failed', severity: 'error' })
    } finally {
      setFinalizing(false)
    }
  }

  const loadQuotas = async (bid)=>{
    if(!bid) return
    setLoading(true)
    try {
      const r = await api.get(`/api/admin/blocks/${bid}/quotas`)
      setQuotas(r.data||[])
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to load quotas', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const saveQuotas = async ()=>{
    if(!selectedBlock) return
    try {
      await api.post(`/api/admin/blocks/${selectedBlock}/quotas`, { quotas })
      setSnackbar({ open: true, message: 'Quotas saved successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save quotas', severity: 'error' })
    }
  }

  const saveSnapshot = async ()=>{
    if(!preview) return
    try {
      await api.post('/api/admin/allotments/snapshots', { round_id: roundId||null, assignments: preview.assignments, meta: { method } })
      await loadSnaps()
      setSnackbar({ open: true, message: 'Snapshot saved successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save snapshot', severity: 'error' })
    }
  }

  const [diff, setDiff] = React.useState([])
  const compare = async ()=>{
    if(leftSnap && rightSnap){
      try {
        const r = await api.get('/api/admin/allotments/diff', { params: { left: leftSnap, right: rightSnap } })
        setDiff(r.data?.changes||[])
        setSnackbar({ open: true, message: 'Comparison completed', severity: 'success' })
      } catch (error) {
        setSnackbar({ open: true, message: 'Comparison failed', severity: 'error' })
      }
    }
  }

  const exportCsv = ()=>{
    if(!roundId) {
      setSnackbar({ open: true, message: 'Please select a round', severity: 'warning' })
      return
    }
    window.open(`/api/admin/allotments/export.csv?round_id=${encodeURIComponent(roundId)}`, '_blank')
  }

  const exportPdf = ()=>{
    if(!roundId) {
      setSnackbar({ open: true, message: 'Please select a round', severity: 'warning' })
      return
    }
    window.open(`/api/admin/allotments/summary.pdf?round_id=${encodeURIComponent(roundId)}`, '_blank')
  }
  const [rfMaxReassign, setRfMaxReassign] = React.useState(0)
  const [rfPreview, setRfPreview] = React.useState(null)
  const [revertSnapId, setRevertSnapId] = React.useState('')

  const revertToSnapshot = async ()=>{
    if (!revertSnapId || !roundId) return
    try {
      await api.post('/api/admin/allotments/roll-forward/revert', { snapshot_id: revertSnapId, round_id: roundId })
      setSnackbar({ open: true, message: 'Reverted to snapshot successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Revert failed', severity: 'error' })
    }
  }

  const rollForwardPreview = async ()=>{
    let constraints = null
    setConstraintsError('')
    try {
      if (constraintsText?.trim()) constraints = JSON.parse(constraintsText)
    } catch (e) {
      setConstraintsError('Invalid JSON')
      return
    }

    try {
      const r = await api.post('/api/admin/allotments/roll-forward/preview', {
        from_round_id: fromRoundId||undefined,
        to_round_id: roundId||undefined,
        maxReassign: Number(rfMaxReassign)||0,
        constraints
      })
      setRfPreview(r.data)
      setSnackbar({ open: true, message: 'Roll-forward preview generated', severity: 'success' })
    } catch (error) {
      setSnackbar({ open: true, message: 'Roll-forward preview failed', severity: 'error' })
    }
  }

  const rollForwardApply = async ()=>{
    if (!rfPreview) return
    try {
      await api.post('/api/admin/allotments/roll-forward/apply', { to_round_id: roundId||undefined, preview: rfPreview })
      setSnackbar({ open: true, message: 'Roll-forward applied successfully', severity: 'success' })
      setRfPreview(null)
    } catch (error) {
      setSnackbar({ open: true, message: 'Roll-forward application failed', severity: 'error' })
    }
  }

  const getRoundStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success'
      case 'finalized': return 'primary'
      case 'closed': return 'default'
      default: return 'warning'
    }
  }

  const getRoundStatusIcon = (status) => {
    switch (status) {
      case 'open': return <CheckCircle />
      case 'finalized': return <AssignmentTurnedIn />
      case 'closed': return <History />
      default: return <Info />
    }
  }
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
          🏠 Allotments Management
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Manage hostel room allotments with advanced algorithms and constraints
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {rounds.filter(r => r.status === 'open').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Open Rounds
                  </Typography>
                </Box>
                <PlayCircleOutline sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {rounds.filter(r => r.status === 'finalized').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Finalized Rounds
                  </Typography>
                </Box>
                <AssignmentTurnedIn sx={{ fontSize: 40, opacity: 0.8 }} />
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
                    {snapshots.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Saved Snapshots
                  </Typography>
                </Box>
                <History sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {blocks.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Available Blocks
                  </Typography>
                </Box>
                <Business sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Controls */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🎯 Allotment Controls
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Round</InputLabel>
                <Select value={roundId} onChange={e=>setRoundId(e.target.value)} label="Round">
                  <MenuItem value=""><em>Auto (latest open)</em></MenuItem>
                  {rounds.map(r=> (
                    <MenuItem key={r.id} value={r.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoundStatusIcon(r.status)}
                        <Typography>{r.academic_year} – {r.round_type}</Typography>
                        <Chip
                          size="small"
                          label={r.status}
                          color={getRoundStatusColor(r.status)}
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Method</InputLabel>
                <Select value={method} onChange={e=>setMethod(e.target.value)} label="Method">
                  <MenuItem value="majority">Majority-choice</MenuItem>
                  <MenuItem value="priority">Priority-based</MenuItem>
                  <MenuItem value="weighted">Weighted preferences</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Tiebreaker</InputLabel>
                <Select value={tiebreaker} onChange={e=>setTiebreaker(e.target.value)} label="Tiebreaker">
                  <MenuItem value="year">Year</MenuItem>
                  <MenuItem value="distance">Distance</MenuItem>
                  <MenuItem value="cgpa">CGPA</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={run}
                  disabled={!roundId && !(rounds.find(r=>r.status==='open'))}
                  startIcon={<PlayArrow />}
                  sx={{ minWidth: 120 }}
                >
                  Dry Run
                </Button>
                <Button
                  variant="outlined"
                  disabled={!preview || !roundId}
                  onClick={finalize}
                  startIcon={<CheckCircle />}
                >
                  Finalize
                </Button>
                <Button
                  variant="outlined"
                  disabled={!preview}
                  onClick={saveSnapshot}
                  startIcon={<Save />}
                >
                  Save Snapshot
                </Button>
                <Button
                  size="small"
                  onClick={exportCsv}
                  disabled={!roundId}
                  startIcon={<FileDownload />}
                >
                  Export CSV
                </Button>
                <Button
                  size="small"
                  onClick={exportPdf}
                  disabled={!roundId}
                  startIcon={<PictureAsPdf />}
                >
                  Summary PDF
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Snapshot Comparison */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            📊 Snapshot Comparison
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Left Snapshot</InputLabel>
                <Select value={leftSnap} onChange={e=>setLeftSnap(e.target.value)} label="Left Snapshot" displayEmpty>
                  <MenuItem value=""><em>Select snapshot</em></MenuItem>
                  {snapshots.map(s=> (
                    <MenuItem key={s.id} value={s.id}>
                      {new Date(s.created_at).toLocaleString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Right Snapshot</InputLabel>
                <Select value={rightSnap} onChange={e=>setRightSnap(e.target.value)} label="Right Snapshot" displayEmpty>
                  <MenuItem value=""><em>Select snapshot</em></MenuItem>
                  {snapshots.map(s=> (
                    <MenuItem key={s.id} value={s.id}>
                      {new Date(s.created_at).toLocaleString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={compare}
                disabled={!leftSnap || !rightSnap}
                startIcon={<CompareArrows />}
                fullWidth
              >
                Compare
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Roll-forward Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            🔄 Roll-forward Management
          </Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max Reassign"
                value={rfMaxReassign}
                onChange={e=>setRfMaxReassign(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Source Round</InputLabel>
                <Select value={fromRoundId} onChange={e=>setFromRoundId(e.target.value)} label="Source Round" displayEmpty>
                  <MenuItem value=""><em>Latest finalized as source</em></MenuItem>
                  {rounds.filter(r=>r.status==='finalized').map(r=> (
                    <MenuItem key={r.id} value={r.id}>
                      {r.academic_year} – {r.round_type} (finalized)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={rollForwardPreview}
                  disabled={!roundId}
                  startIcon={<Visibility />}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  onClick={rollForwardApply}
                  disabled={!rfPreview || !roundId || isApplyLocked}
                  startIcon={<Forward />}
                  color="success"
                >
                  Apply
                </Button>
              </Box>
            </Grid>
          </Grid>

          {rfPreview && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>From:</strong> {rfPreview.from_round?.academic_year} – {rfPreview.from_round?.round_type} |
                  <strong> To:</strong> {rfPreview.to_round?.academic_year} – {rfPreview.to_round?.round_type}
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                        ✅ Promotions ({(rfPreview.promotions||[]).length})
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Student</strong></TableCell>
                              <TableCell><strong>To Block</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(rfPreview.promotions||[]).map((p,i)=> (
                              <TableRow key={i}>
                                <TableCell>{p.student_id}</TableCell>
                                <TableCell>
                                  <Chip label={p.block_id} size="small" color="success" />
                                </TableCell>
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
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'warning.main' }}>
                        🔄 Reassignments ({(rfPreview.reassignments||[]).length})
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Student</strong></TableCell>
                              <TableCell><strong>From</strong></TableCell>
                              <TableCell><strong>To</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(rfPreview.reassignments||[]).map((r,i)=> (
                              <TableRow key={i}>
                                <TableCell>{r.student_id}</TableCell>
                                <TableCell>
                                  <Chip label={r.from_block_id} size="small" color="warning" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                  <Chip label={r.to_block_id} size="small" color="success" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {(rfPreview.nonPromoted||[]).length>0 && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>
                          ❌ Non-Promoted ({rfPreview.nonPromoted.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Student</strong></TableCell>
                                <TableCell><strong>Reason</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rfPreview.nonPromoted.map((np,i)=> (
                                <TableRow key={i}>
                                  <TableCell>{np.student_id}</TableCell>
                                  <TableCell>
                                    <Chip label={np.reason} size="small" color="error" variant="outlined" />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {rfPreview.stats && (
                  <Grid item xs={12}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              📊 Promotions by Department
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Department</strong></TableCell>
                                    <TableCell><strong>Count</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(rfPreview.stats.promotionsByDept||{}).map(([d,c])=> (
                                    <TableRow key={d}>
                                      <TableCell>{d}</TableCell>
                                      <TableCell>
                                        <Chip label={c} size="small" color="primary" />
                                      </TableCell>
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
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                              📋 Non-Promoted by Reason
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Reason</strong></TableCell>
                                    <TableCell><strong>Count</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {Object.entries(rfPreview.stats.nonPromotedByReason||{}).map(([d,c])=> (
                                    <TableRow key={d}>
                                      <TableCell>{d}</TableCell>
                                      <TableCell>
                                        <Chip label={c} size="small" color="error" />
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
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
      {/* Snapshot Revert Section */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ⏪ Snapshot Revert
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Snapshot</InputLabel>
                <Select value={revertSnapId} onChange={e=>setRevertSnapId(e.target.value)} label="Select Snapshot" displayEmpty>
                  <MenuItem value=""><em>Select snapshot to revert to</em></MenuItem>
                  {snapshots.map(s=> (
                    <MenuItem key={s.id} value={s.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History sx={{ fontSize: 18 }} />
                        <Typography>{new Date(s.created_at).toLocaleString()}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="error"
                onClick={revertToSnapshot}
                disabled={!revertSnapId || !roundId}
                startIcon={<Restore />}
                fullWidth
              >
                Revert to Snapshot
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Constraints Configuration */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            ⚙️ Constraints Configuration
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Constraints JSON"
            value={constraintsText}
            onChange={e=>setConstraintsText(e.target.value)}
            error={!!constraintsError}
            helperText={constraintsError || 'Configure allotment constraints in JSON format. Example: { "waitlistBoost": 50, "soft": { "penaltyOverCap": 100, "deptCaps": {"CSE": 10} }, "hard": { "blocks": { "<blockId>": { "denyDepartments": ["EEE"], "allowYears": [3,4] } } } }'}
            sx={{
              '& .MuiInputBase-root': {
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }
            }}
          />
        </CardContent>
      </Card>
      {/* Block Quotas Management */}
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            📊 Block Quotas Management
          </Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Block</InputLabel>
                <Select value={selectedBlock} onChange={e=>{ setSelectedBlock(e.target.value); loadQuotas(e.target.value) }} label="Select Block">
                  <MenuItem value=""><em>Select block</em></MenuItem>
                  {blocks.map(b=> (
                    <MenuItem key={b.id} value={b.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ fontSize: 18 }} />
                        <Typography>{b.name||b.id}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={()=>selectedBlock && loadQuotas(selectedBlock)}
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  onClick={saveQuotas}
                  disabled={!selectedBlock}
                  startIcon={<Save />}
                  color="success"
                >
                  Save Quotas
                </Button>
              </Box>
            </Grid>
          </Grid>

          {selectedBlock && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell><strong>Department</strong></TableCell>
                    <TableCell><strong>Quota</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotas.map((q,i)=> (
                    <TableRow key={i} hover>
                      <TableCell>
                        <TextField
                          size="small"
                          value={q.department}
                          onChange={e=>{ const v=[...quotas]; v[i]={...v[i], department:e.target.value}; setQuotas(v) }}
                          placeholder="Department code"
                          sx={{ minWidth: 120 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={q.quota_number}
                          onChange={e=>{ const v=[...quotas]; v[i]={...v[i], quota_number: Number(e.target.value)}; setQuotas(v) }}
                          sx={{ minWidth: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={()=>{ const v=[...quotas]; v.splice(i,1); setQuotas(v) }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={()=> setQuotas([...quotas, { department:'', quota_number:0 }])}
                        startIcon={<Add />}
                      >
                        Add Department
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      {/* Warning Message */}
      {(!roundId && !(rounds.find(r=>r.status==='open'))) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography>Select a round or create an open round to run allotments.</Typography>
        </Alert>
      )}

      {/* Allotment Preview Results */}
      {preview && (
        <>
          {/* Metrics Overview */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                📈 Allotment Results Overview
              </Typography>
              {preview.round && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography>
                    <strong>Round:</strong> {preview.round.academic_year} – {preview.round.round_type} ({preview.round.status})
                  </Typography>
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {(preview.metrics.top1_rate*100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Top-1 Preference Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {(preview.metrics.top2_rate*100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Top-2 Preference Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {(preview.metrics.with_pref_rate*100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        With Any Preference
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Fairness Analysis */}
          {preview.fairness && (
            <Card sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ⚖️ Department Fairness Analysis
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter Department</InputLabel>
                    <Select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} label="Filter Department" displayEmpty>
                      <MenuItem value=""><em>All departments</em></MenuItem>
                      {Object.keys(preview.fairness.per_dept||{}).map(d=> (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          📊 Assigned by Department
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell><strong>Department</strong></TableCell>
                                <TableCell><strong>Assigned Count</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(preview.fairness.per_dept||{}).filter(([d]) => !deptFilter || d===deptFilter).map(([d,c])=> (
                                <TableRow key={d} hover>
                                  <TableCell>{d}</TableCell>
                                  <TableCell>
                                    <Chip label={c} size="small" color="primary" />
                                  </TableCell>
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
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                          🏢 Distribution by Block & Department
                        </Typography>
                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                          <Table size="small" stickyHeader>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                                <TableCell><strong>Block</strong></TableCell>
                                <TableCell><strong>Department</strong></TableCell>
                                <TableCell><strong>Count</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(preview.fairness.by_block_dept||{}).flatMap(([bid,deptMap]) => (
                                Object.entries(deptMap).filter(([dept])=> !deptFilter || dept===deptFilter).map(([dept,count]) => (
                                  <TableRow key={`${bid}-${dept}`} hover>
                                    <TableCell>
                                      <Chip label={bid} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{dept}</TableCell>
                                    <TableCell>
                                      <Chip label={count} size="small" color="secondary" />
                                    </TableCell>
                                  </TableRow>
                                ))
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Waitlist Preview */}
          {preview.waitlist && preview.waitlist.length>0 && (
            <Card sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'warning.main' }}>
                  ⏳ Waitlist Preview ({preview.waitlist.filter(w=> !deptFilter || w.department===deptFilter).length} students)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell><strong>Student ID</strong></TableCell>
                        <TableCell><strong>Department</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.waitlist.filter(w=> !deptFilter || w.department===deptFilter).map((w,i)=> (
                        <TableRow key={i} hover>
                          <TableCell>{w.student_id}</TableCell>
                          <TableCell>
                            <Chip label={w.department} size="small" color="warning" variant="outlined" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Assignments Table */}
          <Card sx={{ mb: 3, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                📋 Allotment Assignments ({preview.assignments.length} students)
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell><strong>Student ID</strong></TableCell>
                      <TableCell><strong>Assigned Block</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.assignments.map((a,i)=> (
                      <TableRow key={i} hover>
                        <TableCell>{a.student_id}</TableCell>
                        <TableCell>
                          <Chip label={a.block_id} size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Snapshot Comparison Diff */}
          {diff.length>0 && (
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  🔄 Snapshot Comparison Differences ({diff.length} changes)
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell><strong>Student ID</strong></TableCell>
                        <TableCell><strong>From Block</strong></TableCell>
                        <TableCell><strong>To Block</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {diff.map((d,i)=> (
                        <TableRow key={i} hover>
                          <TableCell>{d.student_id}</TableCell>
                          <TableCell>
                            <Chip label={d.from} size="small" color="error" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip label={d.to} size="small" color="success" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  )
}
