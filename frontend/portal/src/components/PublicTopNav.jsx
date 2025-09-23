import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ThemeModeContext } from '../main'
import { Link as RouterLink, useLocation } from 'react-router-dom'

export default function PublicTopNav(){
  const { mode, toggle } = React.useContext(ThemeModeContext)
  const loc = useLocation()
  const NavBtn = ({ to, label }) => {
    const active = loc.pathname === to
    return (
      <Button color="inherit" component={RouterLink} to={to} sx={{
        fontWeight: active?700:500,
        color: '#fff',
        textTransform: 'none',
        borderRadius: 999,
        px: 2,
        py: 0.5,
        transition: 'background-color 120ms ease, border-color 120ms ease, transform 120ms ease',
        border: active ? '1.5px solid rgba(255,255,255,0.65)' : '1px solid rgba(255,255,255,0.0)',
        backgroundColor: active ? 'rgba(179,136,255,0.28)' : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(255,255,255,0.08)' : 'none',
        '&:hover': {
          backgroundColor: active ? 'rgba(179,136,255,0.35)' : 'rgba(179,136,255,0.20)',
          borderColor: 'rgba(255,255,255,0.45)',
          transform: 'translateY(-1px)'
        },
        '&:focus-visible': {
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.45)'
        }
      }}>{label}</Button>
    )
  }
  return (
    <AppBar position="sticky" sx={{
      bgcolor: 'transparent',
      background: 'linear-gradient(90deg,#5e35b1,#7b3fe4,#9c27b0)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      color: '#fff'
    }}>
      <Toolbar sx={{ gap: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5} sx={{ flexGrow:1 }}>
          <img className="anim-floatY" src="/assets/anna-university-logo.png" alt="Anna University" width={34} height={34} style={{ borderRadius: 4 }} />
          <Typography variant="h6" sx={{ fontWeight:700, ml:1 }}>HostelConnect</Typography>
          <img className="anim-floatY" src="/assets/CEG_logo.png" alt="CEG" width={34} height={34} />
        </Box>
        <NavBtn to="/" label="Home" />
        <NavBtn to="/about" label="About" />
        <NavBtn to="/facilities" label="Facilities" />
        <NavBtn to="/rules" label="Rules" />
        <NavBtn to="/admissions-info" label="Admissions" />
        <NavBtn to="/fees-info" label="Fees" />
        <NavBtn to="/circulars" label="Circulars" />
        <NavBtn to="/contact" label="Contact" />
        <Tooltip title={mode==='dark'? 'Switch to light':'Switch to dark'}>
          <IconButton color="inherit" onClick={toggle} sx={{ mr:1 }}>
            {mode==='dark'? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
        <Button color="inherit" component={RouterLink} to="/login" sx={{
          ml:2,
          borderColor:'rgba(255,255,255,0.75)',
          color:'#fff',
          borderWidth: 1.5,
          textTransform:'none',
          borderRadius: 999,
          px: 2,
          py: 0.5,
          '&:hover': { borderColor:'#fff', backgroundColor:'rgba(179,136,255,0.20)' }
        }} variant="outlined">Login</Button>
      </Toolbar>
    </AppBar>
  )
}
