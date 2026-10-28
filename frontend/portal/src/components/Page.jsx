import React from 'react'
import { useLocation } from 'react-router-dom'
import { Container, Box, Typography } from '@mui/material'
import TopNav from './TopNav.jsx'

export default function Page({ title, children }){
  const loc = useLocation()
  const inStudent = loc.pathname.startsWith('/student')
  return (
    <Container maxWidth="md" className="anim-fadeUp">
      {!inStudent && <TopNav />}
      <Box mt={4} p={3} sx={{ bgcolor:'background.paper', borderRadius:3, boxShadow:1 }}>
        {title && <Typography variant="h5" gutterBottom className="section-title">{title}</Typography>}
        {children}
      </Box>
    </Container>
  )
}
