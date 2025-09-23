import React from 'react'
import { Container, Typography, Box, Button, Paper, useTheme } from '@mui/material'
import axios from 'axios'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function CircularsPublic(){
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [items, setItems] = React.useState([])
  React.useEffect(()=>{ axios.get('/public/circulars').then(r=>setItems(r.data)) },[])
  return (
    <>
      <PublicTopNav />
      <Box sx={{
        py:8,
        background: isDark
          ? 'linear-gradient(180deg, #0f0d1a, #161326)'
          : 'linear-gradient(180deg,#efe6ff,#faf9ff)',
        mb:2
      }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: isDark ? '#ffffff' : 'inherit' }}
          >
            Public Circulars
          </Typography>
          <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'inherit' }}>
            Official communications from the hostel administration.
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="md" sx={{ pb:6 }}>
        {items.length===0 && (
          <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'inherit' }}>
            No circulars published yet.
          </Typography>
        )}
        <Box>
          {items.map(c => (
            <Paper
              key={c.id}
              className="anim-fadeUp"
              sx={{
                p:2,
                mb:2,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'inherit',
                color: isDark ? '#ffffff' : 'inherit'
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight:700 }}>{c.title}</Typography>
              <Typography variant="body2" sx={{ whiteSpace:'pre-line', mt:0.5 }}>{c.body}</Typography>
              {c.attachments && <Button size="small" sx={{ mt:1 }} component="a" href={c.attachments} target="_blank">Attachment</Button>}
            </Paper>
          ))}
        </Box>
      </Container>
      <Footer />
    </>
  )
}
