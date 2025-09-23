import React from 'react'
import { Container, Typography } from '@mui/material'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function FeesInfo(){
  return (
    <>
      <PublicTopNav />
      <Container maxWidth="md" sx={{ py:4 }}>
        <Typography variant="h4" gutterBottom>Fees & Payments</Typography>
        <Typography>
          Fee details are published by hostel administration. Use the portal to initiate payments and download receipts.
        </Typography>
      </Container>
      <Footer />
    </>
  )
}
