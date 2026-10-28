import React from 'react'
import { Container, Typography, Grid, Paper } from '@mui/material'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function Facilities(){
  const items = [
    { title:'Blocks', body:'Separate blocks for boys and girls with security.' },
    { title:'Mess', body:'Nutritious food with vegetarian and non-vegetarian options.' },
    { title:'Study Halls', body:'Quiet, air-conditioned study areas for residents.' },
    { title:'Wi-Fi', body:'High-speed internet connectivity throughout the campus.' },
  ]
  return (
    <>
      <PublicTopNav />
      <Container maxWidth="lg" sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Facilities</Typography>
        <Grid container spacing={2}>
          {items.map(x => (
            <Grid item xs={12} md={6} key={x.title}>
              <Paper sx={{ p:2 }}>
                <Typography variant="h6">{x.title}</Typography>
                <Typography variant="body2" sx={{ mt:1 }}>{x.body}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </>
  )
}
