import React from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import ArticleIcon from '@mui/icons-material/Article'
import QrCodeIcon from '@mui/icons-material/QrCode'
import EventNoteIcon from '@mui/icons-material/EventNote'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { Toolbar as MuiToolbar } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { ThemeModeContext } from '../main'

export default function StudentShell(){
  const { mode, toggle } = React.useContext(ThemeModeContext)
  const [open, setOpen] = React.useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const items = [
    { label:'Home', icon:<DashboardIcon />, to:'/student' },
    { label:'Admission', icon:<AssignmentIcon />, to:'/student/admission' },
    { label:'Fees', icon:<ReceiptLongIcon />, to:'/student/fees' },
    { label:'Complaints', icon:<ReportProblemIcon />, to:'/student/complaints' },
    { label:'Applications', icon:<ArticleIcon />, to:'/student/applications' },
    { label:'Attendance', icon:<EventNoteIcon />, to:'/student/attendance' },
    { label:'ID Card', icon:<QrCodeIcon />, to:'/student/idcard' },
  { label:'Appeals', icon:<ArticleIcon />, to:'/student/appeals' },
  { label:'Circulars', icon:<NotificationsIcon />, to:'/student/circulars' },
  { label:'Notices', icon:<NotificationsIcon />, to:'/student/notices' },
    { label:'Profile', icon:<AccountCircleIcon />, to:'/student/profile' },
  ]
  return (
    <Box sx={{ display:'flex' }}>
      <AppBar position="fixed" sx={{ zIndex:(t)=>t.zIndex.drawer+1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={()=>setOpen(true)} sx={{ mr:2 }}><MenuIcon /></IconButton>
          <Typography variant="h6" sx={{ flexGrow:1, fontWeight:800 }}>Student Portal</Typography>
          <Tooltip title={mode==='dark'? 'Switch to light':'Switch to dark'}>
            <IconButton color="inherit" onClick={toggle} sx={{ mr:1 }}>
              {mode==='dark'? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button color="inherit" onClick={()=>{ localStorage.removeItem('access'); nav('/login') }} sx={{
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
      <Drawer open={open} onClose={()=>setOpen(false)}
        PaperProps={{ sx: { backgroundColor: (t)=>t.palette.background.paper, color:(t)=>t.palette.text.primary } }}
      >
        <Box sx={{ width: 270 }} role="presentation" onClick={()=>setOpen(false)}>
          <List>
            {items.map(it => {
              const selected = it.to === '/student' ? (loc.pathname === '/student') : loc.pathname.startsWith(it.to)
              return (
                <ListItem key={it.to} disablePadding>
                  <ListItemButton
                    component={RouterLink}
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
                    <ListItemIcon>{it.icon}</ListItemIcon>
                    <ListItemText primary={it.label} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/">
                <ListItemText primary="Public Site" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow:1, p:3 }}>
        <MuiToolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
