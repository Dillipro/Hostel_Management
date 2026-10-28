import React from 'react'
import { Container, Typography, List, ListItem, ListItemText, Paper, Box } from '@mui/material'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function AdmissionsInfo(){
  return (
    <>
      <PublicTopNav />
      <Container maxWidth="md" sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Admissions Information</Typography>
        <Paper sx={{ p:2, mb:2 }}>
          <Typography sx={{ mb:1, fontWeight:700 }}>Eligibility & Documents</Typography>
          <List>
            <ListItem><ListItemText primary="Valid CEG registration number" /></ListItem>
            <ListItem><ListItemText primary="Department, program and year details" /></ListItem>
            <ListItem><ListItemText primary="Address proof (PDF)" /></ListItem>
            <ListItem><ListItemText primary="Parent/Guardian declaration" /></ListItem>
          </List>
        </Paper>
        <Paper sx={{ p:2 }}>
          <Typography sx={{ mb:1, fontWeight:700 }}>Process</Typography>
          <List>
            <ListItem><ListItemText primary="Login and fill application form" /></ListItem>
            <ListItem><ListItemText primary="Upload required documents" /></ListItem>
            <ListItem><ListItemText primary="Submit and await verification" /></ListItem>
            <ListItem><ListItemText primary="Pay fees upon approval" /></ListItem>
          </List>
        </Paper>
        <Box sx={{ mt:2, textAlign:'center' }}>
          <img className="anim-floatY" src="/assets/ceg-logo.png" width={120} alt="CEG" />
        </Box>
      </Container>
      <Footer />
    </>
  )
}
