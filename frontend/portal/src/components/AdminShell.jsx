import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, Box, IconButton, Tooltip, Button } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ThemeModeContext } from '../main'

const items = [
  { to: '/admin', label: 'Dashboard', match: /^\/admin\/?$/ },
  { to: '/admin/users', label: 'Users', match: /^\/admin\/users/ },
  { to: '/admin/blocks', label: 'Blocks', match: /^\/admin\/blocks/ },
  { to: '/admin/allotments', label: 'Allotments', match: /^\/admin\/allotments/ },
  { to: '/admin/rounds', label: 'Rounds', match: /^\/admin\/rounds/ },
  { to: '/admin/payments', label: 'Payments', match: /^\/admin\/payments/ },
  { to: '/admin/rooms', label: 'Rooms', match: /^\/admin\/rooms/ },
  { to: '/admin/room-planner', label: 'Room Planner', match: /^\/admin\/room-planner/ },
  { to: '/admin/appeals', label: 'Appeals', match: /^\/admin\/appeals/ },
  { to: '/admin/finance', label: 'Finance', match: /^\/admin\/finance/ },
  { to: '/admin/circulars', label: 'Circulars', match: /^\/admin\/circulars/ },
  { to: '/admin/docs', label: 'Docs', match: /^\/admin\/docs/ },
  { to: '/admin/analytics', label: 'Analytics', match: /^\/admin\/analytics/ },
  { to: '/admin/profile', label: 'My Profile', match: /^\/admin\/profile/ },
]

export default function AdminShell(){
  const { mode, toggle } = React.useContext(ThemeModeContext)
  const loc = useLocation()
  return (
    <Box sx={{ display:'flex' }}>
      <AppBar position="fixed"><Toolbar>
        <Typography variant="h6" sx={{ fontWeight:800, flexGrow:1 }}>Admin Portal</Typography>
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
