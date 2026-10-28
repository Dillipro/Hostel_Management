import React from 'react'
import { Box, Container, Typography, Link, useTheme } from '@mui/material'

export default function Footer(){
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box component="footer" sx={{
      mt:8, py:4,
      color: isDark? 'rgba(255,255,255,0.85)' : 'inherit',
      background: isDark
        ? 'linear-gradient(90deg, rgba(22,19,38,1), rgba(14,12,24,1))'
        : 'linear-gradient(90deg,#f7f7fb,#faf9ff)'
    }}>
      <Container maxWidth="lg" sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <Typography variant="body2">© {new Date().getFullYear()} HostelConnect • College of Engineering, Guindy</Typography>
        <Typography variant="body2">Support: <Link href="mailto:hostel@ceg.ac.in" color={isDark? 'inherit' : 'primary'}>hostel@ceg.ac.in</Link></Typography>
      </Container>
    </Box>
  )
}
