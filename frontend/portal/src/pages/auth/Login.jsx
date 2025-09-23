import React from 'react'
import axios from 'axios'
import { Container, Box, TextField, Button, Typography, Link, Paper, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { getRole, roleHome } from '../../utils/auth'

export default function Login(){
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const isProd = import.meta.env.MODE === 'production'
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [captcha, setCaptcha] = React.useState(null)
  const [captchaText, setCaptchaText] = React.useState('')
  const [temp, setTemp] = React.useState('')
  const [otp, setOtp] = React.useState('')
  const [needsOtp, setNeedsOtp] = React.useState(false)
  const [errors, setErrors] = React.useState({ email:'', password:'', captcha:'' })
  const [submitting, setSubmitting] = React.useState(false)
  const nav = useNavigate()

  const loadCaptcha = async () => { const r = await axios.get('/security/captcha'); setCaptcha(r.data) }
  React.useEffect(() => { loadCaptcha() }, [])

  const step1 = async () => {
    const e = { email:'', password:'', captcha:'' }
    if (!email) e.email = 'Required'
    if (!password) e.password = 'Required'
    if (!captchaText) e.captcha = 'Required'
    setErrors(e)
    if (e.email || e.password || e.captcha) return
    setSubmitting(true)
    try {
      const r = await axios.post('/api/auth/login', { email, password, captchaId: captcha.id, captchaText })
      if (r.data.access) {
        localStorage.setItem('access', r.data.access)
        const role = getRole()
        nav(roleHome(role))
        return
      }
      if (isProd && r.data.next === 'otp') {
        setNeedsOtp(true)
        setTemp(r.data.temp)
        await axios.post('/api/security/otp/request', { to: email })
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Login failed'
      setErrors({ email:'', password:'', captcha: msg.includes('Captcha')? msg : '' })
      alert(msg)
    } finally { setSubmitting(false) }
  }

  const step2 = async () => {
    const r = await axios.post('/api/auth/verify-otp', { temp, to: email, code: otp })
  if (r.data.access) { localStorage.setItem('access', r.data.access); const role = getRole(); nav(roleHome(role)) }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, #0f0d1a 0%, #161326 50%, #1a1533 100%)'
        : 'linear-gradient(135deg, #f7f6ff 0%, #efe6ff 50%, #e8e0ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.15)',
        filter: 'blur(40px)',
        animation: 'floatY 6s ease-in-out infinite'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: isDark ? 'rgba(255,106,162,0.08)' : 'rgba(255,106,162,0.12)',
        filter: 'blur(30px)',
        animation: 'floatY 8s ease-in-out infinite reverse'
      }} />

      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {/* CEG Logo with animation */}
          <Box sx={{
            display: 'inline-block',
            mb: 2,
            animation: 'floatY 5s ease-in-out infinite'
          }}>
            <img
              src="/assets/CEG_logo.png"
              alt="CEG Logo"
              style={{
                width: '120px',
                height: 'auto',
                filter: isDark ? 'brightness(1.1) contrast(1.1)' : 'none'
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#1a1a1a',
              mb: 1,
              letterSpacing: '-0.5px'
            }}
          >
            HostelConnect
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              fontWeight: 500
            }}
          >
            CEG Hostel Management System
          </Typography>
        </Box>

        <Paper
          elevation={isDark ? 2 : 1}
          sx={{
            p: 4,
            borderRadius: 3,
            background: isDark
              ? 'rgba(22,19,38,0.95)'
              : 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.08)'
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              color: isDark ? '#ffffff' : '#1a1a1a',
              mb: 3
            }}
          >
            Welcome Back
          </Typography>

          <Box component="form" noValidate>
            <TextField
              label="Email or Register Number"
              fullWidth
              margin="normal"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': {
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputBase-input': {
                  color: isDark ? '#ffffff' : '#1a1a1a'
                }
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              sx={{
                mb: 2,
                '& .MuiInputLabel-root': {
                  color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main
                  }
                },
                '& .MuiInputBase-input': {
                  color: isDark ? '#ffffff' : '#1a1a1a'
                }
              }}
            />

            <Box display="flex" alignItems="center" gap={2} sx={{ mt: 2, mb: 3 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
                dangerouslySetInnerHTML={{ __html: captcha?.data || '' }}
              />
              <TextField
                label="CAPTCHA"
                value={captchaText}
                onChange={e=>setCaptchaText(e.target.value)}
                error={!!errors.captcha}
                helperText={errors.captcha}
                sx={{
                  flex: 1,
                  '& .MuiInputLabel-root': {
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                  },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main
                    }
                  },
                  '& .MuiInputBase-input': {
                    color: isDark ? '#ffffff' : '#1a1a1a'
                  }
                }}
              />
              <Button
                onClick={loadCaptcha}
                variant="outlined"
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.05)'
                  }
                }}
              >
                ↻
              </Button>
            </Box>

            <Button
              fullWidth
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                color: '#ffffff',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(106,76,255,0.3)'
                },
                transition: 'all 200ms ease'
              }}
              variant="contained"
              onClick={step1}
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Continue'}
            </Button>

            {isProd && needsOtp && (
              <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                <TextField
                  label="OTP Code"
                  fullWidth
                  value={otp}
                  onChange={e=>setOtp(e.target.value)}
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root': {
                      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                    },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      '& fieldset': {
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'
                      }
                    },
                    '& .MuiInputBase-input': {
                      color: isDark ? '#ffffff' : '#1a1a1a'
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={step2}
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.05)'
                    }
                  }}
                >
                  Verify OTP
                </Button>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Link
                href="/"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                ← Back to home
              </Link>
              <Link
                href="/signup"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                New student? Sign up
              </Link>
            </Box>
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Link
                href="/forgot"
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot password?
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
