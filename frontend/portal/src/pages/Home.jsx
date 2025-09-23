import React from 'react'
import { Box, Button, Container, Grid, Paper, Typography, Chip, useTheme } from '@mui/material'
import axios from 'axios'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function Home(){
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const [circulars, setCirculars] = React.useState([])
    React.useEffect(()=>{
        axios.get('/public/circulars').then(r=>{
            const items = Array.isArray(r.data) ? r.data : []
            setCirculars(items.slice(0,3))
        }).catch(()=>setCirculars([]))
    }, []) // get latest 3
return (
    <>
        <PublicTopNav />
        <Box sx={{
            py: 12,
            backgroundImage: 'linear-gradient(rgba(20,0,40,0.45), rgba(20,0,40,0.55)), url(/assets/AnnaUniversityAIIMG.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <Container maxWidth="lg">
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <Box textAlign="center" sx={{ display:'flex', justifyContent:'center', gap:3 }}>
                            <img className="anim-floatY" src="/assets/CEG_logo.png" width={140} alt="CEG" />
                           {/* <img className="anim-floatY" src="/assets/anna-university-logo.png" width={140} alt="Anna University" /> */}
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Chip
                            color="secondary"
                            label="CEG Hostels"
                            sx={{
                                mb: 2,
                                bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                                color: isDark ? '#ffffff' : '#000000'
                            }}
                        />
                        <Typography
                            variant="h3"
                            className="anim-fadeUp"
                            sx={{
                                fontWeight: 700,
                                mb: 2,
                                color: isDark ? '#ffffff' : '#ffffff'
                            }}
                        >
                            Welcome to HostelConnect
                        </Typography>
                        <Typography
                            variant="h6"
                            className="anim-fadeUp"
                            sx={{
                                color: isDark ? '#ffffff' : '#ffffff',
                                mb: 3
                            }}
                        >
                            Online hostel admissions, fee payments, attendance and complaints management for CEG hostels.
                        </Typography>
                        <Box sx={{ display:'flex', gap:2 }}>
                            <Button href="/login" variant="contained" size="large">Login to Portal</Button>
                            <Button href="/admissions-info" variant="outlined" color="inherit" size="large">New Admission</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>

        <Container maxWidth="lg">
            <Typography variant="h5" sx={{ mt:5, mb:2, fontWeight:700 }}>What you can do</Typography>
            <Grid container spacing={3}>
                {[
                    { title:'Admissions', desc:'Submit hostel applications and track status.' },
                    { title:'Fees & Receipts', desc:'Pay fees and download receipts securely.' },
                    { title:'Attendance', desc:'Seamless entry/exit logging for residents.' },
                    { title:'Complaints', desc:'Raise and track maintenance complaints.' },
                ].map(card => (
                    <Grid item xs={12} md={3} key={card.title}>
                        <Paper className="anim-fadeUp" sx={{ p:2, height:'100%', transition:'transform 200ms', '&:hover':{ transform:'translateY(-4px)' } }}>
                            <Typography variant="h6">{card.title}</Typography>
                            <Typography variant="body2" sx={{ mt:1 }}>{card.desc}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>

        <Container maxWidth="lg">
            <Grid container spacing={3} sx={{ mt:6 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p:3 }}>
                        <Typography variant="h6" sx={{ fontWeight:700 }}>How it works</Typography>
                        <Box sx={{ mt:2 }}>
                            {['Login with your credentials','Submit admission application','Receive approvals and pay fees','Download receipts and ID card'].map((step, i) => (
                                <Box key={step} sx={{ display:'flex', alignItems:'center', gap:2, mb:1 }}>
                                    <Box sx={{
                                        width:28,
                                        height:28,
                                        borderRadius:'50%',
                                        bgcolor: theme.palette.primary.main,
                                        color: '#ffffff',
                                        display:'grid',
                                        placeItems:'center'
                                    }}>
                                        {i+1}
                                    </Box>
                                    <Typography sx={{ color: isDark ? 'rgba(255,255,255,0.9)' : 'inherit' }}>{step}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p:3 }}>
                        <Typography variant="h6" sx={{ fontWeight:700, mb:1 }}>Why HostelConnect</Typography>
                        <Typography variant="body2">Digitized workflows, transparent tracking, secure payments, and unified communication for residents and admins.</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>

        {circulars.length > 0 && (
          <Container maxWidth="lg">
            <Typography variant="h5" sx={{ mt:6, mb:2, fontWeight:700 }}>Latest Circulars</Typography>
            <Grid container spacing={3}>
                            {circulars.map(c => (
                <Grid item xs={12} md={4} key={c.id}>
                  <Paper className="anim-fadeUp" sx={{ p:2, height:'100%' }}>
                    <Typography variant="h6" sx={{ fontWeight:700 }}>{c.title}</Typography>
                                        <Typography variant="body2" sx={{ mt:1, mb:2 }}>{(c.body||'').substring(0, 100)}...</Typography>
                    {c.attachments && <Button size="small" component="a" href={c.attachments} target="_blank">View PDF</Button>}
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt:2, textAlign:'center' }}>
              <Button href="/circulars" variant="outlined">View All Circulars</Button>
            </Box>
          </Container>
        )}

        <Footer />
    </>
)
}
