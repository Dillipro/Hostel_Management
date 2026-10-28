import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge, Menu, MenuItem, ListItemText, Tooltip } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { api } from '../api'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ThemeModeContext } from '../main'

export default function TopNav(){
  const { mode, toggle } = React.useContext(ThemeModeContext)
  const logout = () => { localStorage.removeItem('access'); location.href = '/login' }
  const [anchor, setAnchor] = React.useState(null)
  const [notifs, setNotifs] = React.useState({ unread: 0, items: [] })
  const openMenu = (e)=>{ setAnchor(e.currentTarget) }
  const closeMenu = ()=> setAnchor(null)
  const load = async ()=>{ try { const r = await api.get('/api/notifications'); setNotifs(r.data||{unread:0,items:[]}) } catch {} }
  React.useEffect(()=>{ load(); const t=setInterval(load, 30000); return ()=>clearInterval(t) },[])
  const markRead = async (id)=>{ await api.post(`/api/notifications/${id}/read`); await load() }
  return (
    <AppBar position="static" sx={{
      bgcolor: 'transparent',
      background: 'linear-gradient(90deg,#5e35b1,#7b3fe4,#9c27b0)',
      color: '#fff'
    }}>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1.5} sx={{ flexGrow:1 }}>
          <img src="/assets/CEG_logo.png" width={28} height={28} alt="CEG" />
          <Typography sx={{ fontWeight:700, color:'#fff' }}>HostelConnect</Typography>
        </Box>
        <IconButton color="inherit" onClick={openMenu} sx={{ mr:1 }}>
          <Badge badgeContent={notifs.unread||0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu} transformOrigin={{vertical:'top',horizontal:'right'}} anchorOrigin={{vertical:'bottom',horizontal:'right'}}>
          {(notifs.items||[]).length===0 && <MenuItem disabled>No notifications</MenuItem>}
          {(notifs.items||[]).map(n=> (
            <MenuItem key={n.id} onClick={()=>{ markRead(n.id); }} sx={{ opacity: n.read_at?0.6:1 }}>
              <ListItemText primary={n.title} secondary={n.body||new Date(n.created_at).toLocaleString()} />
            </MenuItem>
          ))}
        </Menu>
        <Tooltip title={mode==='dark'? 'Switch to light':'Switch to dark'}>
          <IconButton color="inherit" onClick={toggle} sx={{ mr:1 }}>
            {mode==='dark'? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        <Button color="inherit" onClick={logout} sx={{
          color:'#fff',
          borderColor:'rgba(255,255,255,0.75)',
          borderWidth: 1.5,
          borderStyle:'solid',
          textTransform:'none',
          borderRadius: 999,
          px: 2,
          py: 0.5,
          '&:hover': { borderColor:'#fff', backgroundColor:'rgba(179,136,255,0.20)' }
        }}>Logout</Button>
      </Toolbar>
    </AppBar>
  )
}
