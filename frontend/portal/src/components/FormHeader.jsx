import React from 'react'
import { Box, Typography, Divider } from '@mui/material'
import { School } from '@mui/icons-material'

export default function FormHeader({ title, logoUrl = null }) {
  return (
    <>
      {/* Professional Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 3,
        p: 2,
        border: '2px solid #1976d2',
        borderRadius: 2,
        backgroundColor: '#f8f9fa'
      }}>
        {/* Logo Placeholder */}
        <Box sx={{
          width: 80,
          height: 80,
          border: '2px dashed #ccc',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 3,
          backgroundColor: 'white'
        }}>
          {logoUrl ? (
            <img src={logoUrl} alt="College Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <School sx={{ fontSize: 40, color: '#ccc' }} />
          )}
        </Box>

        {/* College Details - Centered */}
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
            ENGINEERING COLLEGE HOSTELS
          </Typography>
          <Typography variant="h6" sx={{ color: '#424242', mb: 0.5 }}>
            College of Engineering, Guindy
          </Typography>
          <Typography variant="body1" sx={{ color: '#616161' }}>
            ANNA UNIVERSITY, CHENNAI – 600025
          </Typography>
        </Box>
      </Box>

      {/* Form Title */}
      <Typography variant="h4" sx={{
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1976d2',
        mb: 2,
        textTransform: 'uppercase',
        letterSpacing: 1
      }}>
        {title}
      </Typography>

      <Divider sx={{ mb: 3, borderColor: '#1976d2', borderWidth: 2 }} />
    </>
  )
}