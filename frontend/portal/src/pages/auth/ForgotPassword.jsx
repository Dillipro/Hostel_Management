import React from 'react'
import axios from 'axios'
import { Container, Box, TextField, Button, Typography, Link, Paper, useTheme } from '@mui/material'

export default function ForgotPassword(){
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [identifier, setIdentifier] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [captcha, setCaptcha] = React.useState(null)
  const [captchaText, setCaptchaText] = React.useState('')
  const [sentCode, setSentCode] = React.useState('')
  const loadCaptcha = async () => { const r = await axios.get('/security/captcha'); setCaptcha(r.data) }
  React.useEffect(()=>{ loadCaptcha() },[])
  const request = async () => {
    try { const r = await axios.post('/api/auth/forgot/request', { identifier, captchaId: captcha.id, captchaText }); setEmail(r.data.to); setSentCode(r.data.demo_code || '') }
    catch(e){ alert(e?.response?.data?.error || 'Request failed') }
  }
  const reset = async () => {
    try { await axios.post('/api/auth/forgot/reset', { email, code, newPassword }); alert('Password reset. Please login.'); window.location.href = '/login' }
    catch(e){ alert(e?.response?.data?.error || 'Reset failed') }
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
        top: '20%',
        left: '15%',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.15)',
        filter: 'blur(30px)',
        animation: 'floatY 8s ease-in-out infinite'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: isDark ? 'rgba(255,106,162,0.08)' : 'rgba(255,106,162,0.12)',
        filter: 'blur(20px)',
        animation: 'floatY 10s ease-in-out infinite reverse'
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
                width: '100px',
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
            Reset Password
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              fontWeight: 500
            }}
          >
            Recover your HostelConnect account
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
            Forgot Password
          </Typography>

          <Box component="form" noValidate>
            <TextField
              fullWidth
              margin="normal"
              label="Email or Register Number"
              value={identifier}
              onChange={e=>setIdentifier(e.target.value)}
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
              sx={{
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
              onClick={request}
            >
              Send OTP
            </Button>

            {sentCode && (
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.1)',
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  textAlign: 'center'
                }}
              >
                Demo OTP: {sentCode}
              </Typography>
            )}

            <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
              <TextField
                fullWidth
                margin="normal"
                label="Registered Email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
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
                fullWidth
                margin="normal"
                label="OTP Code"
                value={code}
                onChange={e=>setCode(e.target.value)}
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
                fullWidth
                margin="normal"
                type="password"
                label="New Password"
                value={newPassword}
                onChange={e=>setNewPassword(e.target.value)}
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
              <Button
                sx={{
                  mt: 1,
                  color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.05)'
                  }
                }}
                variant="outlined"
                onClick={reset}
              >
                Reset Password
              </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link
                href="/login"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                ← Back to login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
