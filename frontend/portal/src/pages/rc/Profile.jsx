import React from 'react'
import { api } from '../../api'
import Page from '../../components/Page'
import { TextField, Box, Button, Typography, Grid, Alert, Avatar, Stack } from '@mui/material'
import { cropImageToSquare } from '../../utils/image'

export default function RCProfile(){
  const [me, setMe] = React.useState(null)
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [dob, setDob] = React.useState('')
  const [avatarUrl, setAvatarUrl] = React.useState('')
  const [curPwd, setCurPwd] = React.useState('')
  const [newPwd, setNewPwd] = React.useState('')
  const [confPwd, setConfPwd] = React.useState('')
  const [pwMsg, setPwMsg] = React.useState(null)
  const load = async ()=>{ const r = await api.get('/api/rc/profile/me'); setMe(r.data); setName(r.data.name||''); setPhone(r.data.phone||''); setDob(r.data.dob ? r.data.dob.slice(0,10): ''); setAvatarUrl(r.data.avatar_url || '') }
  React.useEffect(()=>{ load() },[])
  const save = async ()=>{ await api.put('/api/rc/profile/me', { name, phone, dob: dob||undefined, avatar_url: avatarUrl||undefined }); await load() }
  const onPickAvatar = async (e)=>{
    const f = e.target.files?.[0]
    if (!f) return
    const cropped = await cropImageToSquare(f, 256).catch(()=>f)
    const fd = new FormData(); fd.append('file', cropped)
    const r = await api.post('/api/uploads', fd, { headers: { 'Content-Type':'multipart/form-data' } })
    setAvatarUrl(r.data.url)
  }
  const changePassword = async ()=>{
    setPwMsg(null)
    if (!curPwd || !newPwd || !confPwd) { setPwMsg({ type: 'error', text: 'Fill all password fields' }); return }
    if (newPwd !== confPwd) { setPwMsg({ type:'error', text:'New passwords do not match' }); return }
    try { await api.post('/api/auth/change-password', { currentPassword: curPwd, newPassword: newPwd }); setPwMsg({ type:'success', text:'Password changed successfully' }); setCurPwd(''); setNewPwd(''); setConfPwd('') }
    catch(e){ setPwMsg({ type:'error', text: e?.response?.data?.error || 'Failed to change password' }) }
  }
  return (
    <Page title="My Profile">
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar src={avatarUrl||undefined} sx={{ width: 64, height: 64 }}>{(name||'').charAt(0)}</Avatar>
        <label>
          <input type="file" accept="image/*" hidden onChange={onPickAvatar} />
          <Button variant="outlined" component="span">Change Avatar</Button>
        </label>
      </Stack>
      <TextField margin="dense" label="Full Name" value={name} onChange={e=>setName(e.target.value)} />
      <TextField margin="dense" label="Mobile" value={phone} onChange={e=>setPhone(e.target.value)} />
      <TextField margin="dense" label="Date of Birth" type="date" InputLabelProps={{ shrink:true }} value={dob} onChange={e=>setDob(e.target.value)} />
      <Box mt={1}><Button variant="contained" onClick={save}>Save</Button></Box>
      <Box mt={4}>
        <Typography variant="h6">Change Password</Typography>
        {pwMsg && <Alert sx={{ mt:1, mb:1 }} severity={pwMsg.type}>{pwMsg.text}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField fullWidth type="password" label="Current Password" margin="dense" value={curPwd} onChange={e=>setCurPwd(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth type="password" label="New Password" margin="dense" value={newPwd} onChange={e=>setNewPwd(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth type="password" label="Confirm New Password" margin="dense" value={confPwd} onChange={e=>setConfPwd(e.target.value)} /></Grid>
        </Grid>
        <Button sx={{ mt:1 }} variant="outlined" onClick={changePassword}>Update Password</Button>
      </Box>
    </Page>
  )
}
