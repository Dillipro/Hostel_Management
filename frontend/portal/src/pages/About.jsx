import React from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Avatar,
  Divider,
  useTheme,
  Chip,
  Button
} from '@mui/material'
import {
  Business,
  Nature,
  Restaurant,
  Security,
  School,
  FitnessCenter,
  LibraryBooks,
  DirectionsWalk,
  LocationOn,
  Phone,
  Email,
  Home,
  People,
  Engineering,
  AccountBalance,
  LocalLaundryService,
  Print,
  SportsSoccer,
  Movie,
  LocalCafe,
  Shield,
  VerifiedUser,
  Group,
  Build,
  MenuBook,
  NaturePeople,
  LocationCity,
  Apartment,
  Fastfood,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import PublicTopNav from '../components/PublicTopNav'
import Footer from '../components/Footer'

export default function About(){
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <>
      <PublicTopNav />

      {/* Hero Section */}
      <Box sx={{
        py: 8,
        background: isDark
          ? 'linear-gradient(135deg, #0f0d1a 0%, #161326 50%, #1a1533 100%)'
          : 'linear-gradient(135deg, #f7f6ff 0%, #efe6ff 50%, #e8e0ff 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative elements */}
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.15)',
          filter: 'blur(30px)',
          animation: 'floatY 6s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: isDark ? 'rgba(255,106,162,0.08)' : 'rgba(255,106,162,0.12)',
          filter: 'blur(25px)',
          animation: 'floatY 8s ease-in-out infinite reverse'
        }} />

        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#1a1a1a',
                mb: 2,
                letterSpacing: '-0.5px'
              }}
            >
              Engineering College Hostels
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                fontWeight: 500,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              ECH In Focus
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
              maxWidth: '900px',
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: '1.1rem'
            }}
          >
            Engineering College Hostels, CEG campus with its 22 blocks named after Tamil flowers,
            provides more than just accommodation — it's a vibrant ecosystem fostering academic
            excellence and personal growth. Our green campus, surrounded by nature, offers a peaceful
            environment complemented by modern amenities.
          </Typography>
        </Container>
      </Box>

      {/* Key Features Grid */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={isDark ? 2 : 1}
              sx={{
                p: 3,
                height: '100%',
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <VerifiedUser sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Established Systems
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                Transparent administration with robust procedures ensuring student welfare and effective management.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={isDark ? 2 : 1}
              sx={{
                p: 3,
                height: '100%',
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <Nature sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Sustainable Campus
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                Pioneering green initiatives including biogas plants and strict pollution-free policies.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={isDark ? 2 : 1}
              sx={{
                p: 3,
                height: '100%',
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <Home sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Amenities
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                Separate hostel facilities for xerox, laundry, refreshments, sports and entertainment.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Paper
              elevation={isDark ? 2 : 1}
              sx={{
                p: 3,
                height: '100%',
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <Shield sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Safe Environment
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                Resident counsellors in each block ensuring student safety and well-being.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* By The Numbers */}
      <Box sx={{
        py: 6,
        background: isDark
          ? 'linear-gradient(135deg, #161326 0%, #1a1533 100%)'
          : 'linear-gradient(135deg, #efe6ff 0%, #e8e0ff 100%)'
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#1a1a1a',
              mb: 2
            }}
          >
            By The Numbers
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              textAlign: 'center',
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              mb: 4
            }}
          >
            Providing a safe and comfortable home for thousands of students
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  22
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    fontWeight: 600
                  }}
                >
                  Hostel Blocks
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  4300+
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    fontWeight: 600
                  }}
                >
                  Students
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  240+
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    fontWeight: 600
                  }}
                >
                  Staff Members
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 1
                  }}
                >
                  22
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: isDark ? '#ffffff' : '#1a1a1a',
                    fontWeight: 600
                  }}
                >
                  Buildings
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Buildings Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 800,
            color: isDark ? '#ffffff' : '#1a1a1a',
            mb: 2
          }}
        >
          Explore our diverse living accommodations designed for student comfort
        </Typography>

        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card
              elevation={isDark ? 2 : 1}
              sx={{
                height: '100%',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <People sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Boys Hostel
                </Typography>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  Hostels for Boys
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  Comfortable and secure accommodations for male students with all necessary amenities.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={isDark ? 2 : 1}
              sx={{
                height: '100%',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <School sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Girls Hostel
                </Typography>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  Hostels for Girls
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  Safe and nurturing environment for female students with round-the-clock security and four side compound wall.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              elevation={isDark ? 2 : 1}
              sx={{
                height: '100%',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Restaurant sx={{ fontSize: 64, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Mess Facility
                </Typography>
                <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, mb: 2 }}>
                  Mess
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  Nutritious and hygienic meals prepared to cater to diverse dietary needs with dynamic menu.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Messages Section */}
      <Box sx={{
        py: 6,
        background: isDark
          ? 'linear-gradient(135deg, #0f0d1a 0%, #161326 100%)'
          : 'linear-gradient(135deg, #f7f6ff 0%, #efe6ff 100%)'
      }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#1a1a1a',
              mb: 4
            }}
          >
            Messages
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                elevation={isDark ? 2 : 1}
                sx={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: theme.palette.primary.main,
                        mr: 3
                      }}
                    >
                      <Engineering sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Dr. P. Hariharan
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
                        Dean & Warden
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
                    Greetings! Engineering College Hostels (ECH) provide the best facilities and homely environment for the students throughout their stay at the Hostels. We strive to nurture and rebuild an atmosphere where every student feels welcome home vibe at the hostel. In a day, a student spends only two fold times more occasional stay at the hostel than the classroom premises, for which we ensure a worry-free environment to enable them on concentrating in their studies to attain a successful career.
                  </Typography>
                  <Button
                    variant="text"
                    sx={{
                      color: theme.palette.primary.main,
                      p: 0,
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                elevation={isDark ? 2 : 1}
                sx={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: theme.palette.primary.main,
                        mr: 3
                      }}
                    >
                      <Security sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Dr. A. Suresh Babu
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main }}>
                        Professor & Executive Warden
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
                    Warm Greetings to All CEG Hostel Students, It gives me immense pleasure to welcome each of you to the vibrant and prestigious CEG family. As you begin this new chapter of your academic journey, I extend my heartfelt wishes for a fulfilling and enriching experience both intellectually and personally. At CEG, we are committed to providing a safe, healthy, green, and homely environment where students can live, learn, and thrive. Inspired by my NCC Army background, we place discipline above all priorities.
                  </Typography>
                  <Button
                    variant="text"
                    sx={{
                      color: theme.palette.primary.main,
                      p: 0,
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Unique Facilities */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 800,
            color: isDark ? '#ffffff' : '#1a1a1a',
            mb: 2
          }}
        >
          Unique Facilities
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            textAlign: 'center',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            mb: 4
          }}
        >
          Providing the best facilities for a comfortable and enriching hostel experience
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              elevation={isDark ? 2 : 1}
              sx={{
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Business sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Hostel Office
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              elevation={isDark ? 2 : 1}
              sx={{
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <FitnessCenter sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Gymnasium
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              elevation={isDark ? 2 : 1}
              sx={{
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <LibraryBooks sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Hostel Library
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <Card
              elevation={isDark ? 2 : 1}
              sx={{
                textAlign: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                transition: 'transform 200ms ease',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <DirectionsWalk sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Protected Walkway
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Location Footer */}
      <Box sx={{
        py: 4,
        background: isDark ? '#0f0d1a' : '#1a1a1a',
        color: '#ffffff'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Engineering College Hostels
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                12, Sardar Patel Road, Anna University, Guindy<br />
                Chennai - 600025
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2">044-22352257</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ mr: 1, fontSize: 18 }} />
                <Typography variant="body2">echchennai@yahoo.in</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Useful Links
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {[
                  'CEG Campus', 'e-Governance', 'ACOE', 'UMIS',
                  'University Library', 'Centre for Academic Courses',
                  'Students Affairs', 'Distance Education',
                  'Centre for Admissions', 'Internal Quality Assurance Cell'
                ].map((link) => (
                  <Typography
                    key={link}
                    variant="body2"
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              ©2025 Copyright Engineering College Hostels. All Rights Reserved
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Designed & Developed by ECH Software Team
            </Typography>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  )
}
