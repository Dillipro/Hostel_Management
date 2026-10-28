import React from 'react'
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function Contact(){
  return (
    <>
      <PublicTopNav />
      <Container maxWidth="md" sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Contact</Typography>
        <List>
          <ListItem><ListItemText primary="Hostel Office" secondary="+91-44-XXXX XXXX" /></ListItem>
          <ListItem><ListItemText primary="Email" secondary="hostel@ceg.ac.in" /></ListItem>
          <ListItem><ListItemText primary="Address" secondary="CEG Hostels, Anna University, Chennai" /></ListItem>
        </List>
      </Container>
      <Footer />
    </>
  )
}
