import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Box, IconButton, Tooltip, Button } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ThemeModeContext } from '../main'

const items = [
  { to: '/warden', label: 'Dashboard', match: /^\/warden\/?$/ },
  { to: '/warden/blocks', label: 'Blocks', match: /^\/warden\/blocks/ },
  { to: '/warden/students', label: 'Students', match: /^\/warden\/students/ },
  { to: '/warden/reallocations', label: 'Reallocations', match: /^\/warden\/reallocations/ },
  { to: '/warden/complaints', label: 'Complaints', match: /^\/warden\/complaints/ },
  { to: '/warden/applications', label: 'Applications', match: /^\/warden\/applications/ },
  { to: '/warden/admissions', label: 'Admissions', match: /^\/warden\/admissions/ },
  { to: '/warden/fees', label: 'Fees', match: /^\/warden\/fees/ },
  { to: '/warden/feedback', label: 'Feedback', match: /^\/warden\/feedback/ },
  { to: '/warden/discipline', label: 'Discipline', match: /^\/warden\/discipline/ },
  { to: '/warden/circulars', label: 'Circulars', match: /^\/warden\/circulars/ },
  { to: '/warden/reports', label: 'Reports', match: /^\/warden\/reports/ },
  { to: '/warden/rc-supervision', label: 'RC Supervision', match: /^\/warden\/rc-supervision/ },
  { to: '/warden/security', label: 'Security', match: /^\/warden\/security/ },
  { to: '/warden/profile', label: 'My Profile', match: /^\/warden\/profile/ },
]

export default function WardenShell(){
  const { mode, toggle } = React.useContext(ThemeModeContext)
  const loc = useLocation()
  return (
    <Box sx={{ display:'flex' }}>
      <AppBar position="fixed"><Toolbar>
        <Typography variant="h6" sx={{ fontWeight:800, flexGrow:1 }}>Warden Portal</Typography>
        <Tooltip title={mode==='dark'? 'Switch to light':'Switch to dark'}><IconButton color="inherit" onClick={toggle} sx={{ mr:1 }}>{mode==='dark'? <LightModeIcon /> : <DarkModeIcon />}</IconButton></Tooltip>
        <Button color="inherit" onClick={()=>{ localStorage.removeItem('access'); location.href='/login' }} sx={{
          color:'#fff', borderColor:'rgba(255,255,255,0.75)', borderWidth:1.5, borderStyle:'solid', textTransform:'none', borderRadius:999, px:2, py:0.5,
          '&:hover': { borderColor:'#fff', backgroundColor:'rgba(179,136,255,0.20)' }
        }}>Logout</Button>
      </Toolbar></AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: 220,
          [`& .MuiDrawer-paper`]: {
            width: 220,
            top: 64,
            backgroundColor: (theme)=> theme.palette.background.paper,
            color: (theme)=> theme.palette.text.primary,
            boxShadow: (theme)=> `inset -1px 0 0 ${theme.palette.divider}`,
          }
        }}
      >
        <List>
          {items.map(it => {
            const selected = it.match.test(loc.pathname)
            return (
              <ListItemButton
                key={it.to}
                component={Link}
                to={it.to}
                selected={selected}
                sx={{
                  borderRadius: 1,
                  position:'relative',
                  '&.Mui-selected': {
                    backgroundColor: (t)=> (t.palette.mode==='dark' ? 'rgba(179,136,255,0.18)' : 'rgba(103,58,183,0.10)')
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: (t)=> (t.palette.mode==='dark' ? 'rgba(179,136,255,0.24)' : 'rgba(103,58,183,0.16)')
                  },
                  '&::before': selected ? {
                    content:'""', position:'absolute', left:0, top:8, bottom:8, width:4,
                    borderRadius:2,
                    backgroundColor:(t)=> t.palette.mode==='dark' ? '#B388FF' : '#673AB7'
                  } : {}
                }}
              >
                <ListItemText primary={it.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow:1, p:3, mt:8, ml:'220px' }}>
        <Outlet />
      </Box>
    </Box>
  )
}