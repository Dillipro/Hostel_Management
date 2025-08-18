import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { 
  ArrowLeftIcon, 
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

// Styled primitives aligned with Register page
const Shell = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(1200px 600px at -10% -10%, rgba(59,130,246,0.12), transparent),
    radial-gradient(1200px 600px at 110% 110%, rgba(147,51,234,0.12), transparent),
    linear-gradient(135deg, #0b1220 0%, #0f172a 60%, #0b1220 100%);
  color: #e5e7eb;
  position: relative;
  overflow: hidden;
`

const TopBar = styled.div`
  position: relative;
  z-index: 10;
  padding: 24px;
`

const BackLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 8px;
  color: rgba(255,255,255,0.85); text-decoration: none;
  border: 1px solid rgba(148,163,184,0.25);
  background: rgba(15,23,42,0.5);
  padding: 10px 14px; border-radius: 12px; transition: .2s ease;
  &:hover { color: #67e8f9; border-color: rgba(103,232,249,0.4); background: rgba(15,23,42,0.7); }
  svg { width: 18px; height: 18px; }
`

const Grid = styled.div`
  position: relative; z-index: 10; max-width: 900px; margin: 0 auto; padding: 24px;
`

const Header = styled(motion.div)`
  text-align: center; margin-bottom: 24px;
`

const LogoWrap = styled(motion.div)`
  width: 80px; height: 80px; margin: 0 auto 16px; position: relative; border-radius: 20px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #22d3ee, #3b82f6, #7c3aed);
  box-shadow: 0 10px 40px rgba(59,130,246,0.35);
  &::after { content: ''; position: absolute; inset: 0; filter: blur(24px); opacity: .5; border-radius: 20px; background: inherit; z-index: -1; }
  svg { width: 36px; height: 36px; color: #fff; }
`

const Title = styled.h1`
  font-size: clamp(28px, 4vw, 42px); font-weight: 900; margin: 0 0 8px;
  background: linear-gradient(135deg, #a5f3fc, #93c5fd, #c4b5fd);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`

const Subtitle = styled.p`
  color: #cbd5e1; font-size: 18px; margin: 0 0 12px;
`

const InfoChip = styled.div`
  display: inline-flex; align-items: center; gap: 10px;
  background: rgba(2,6,23,0.4); border: 1px solid rgba(148,163,184,0.25);
  border-radius: 14px; padding: 14px 18px;
  span { color: #fff; font-weight: 700; }
  svg { width: 22px; height: 22px; color: #67e8f9; }
`

const Card = styled(motion.div)`
  background: rgba(2,6,23,0.55); border: 1px solid rgba(99,102,241,0.2);
  backdrop-filter: blur(14px); border-radius: 22px; padding: 28px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
`

const Label = styled.label`
  display: block; text-align: center; font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 16px;
`

const OtpWrap = styled.div`
  display: flex; justify-content: center; gap: 12px; margin-bottom: 18px;
`

const OtpInput = styled(motion.input)`
  width: 56px; height: 56px; border-radius: 12px; text-align: center; font-weight: 900; font-size: 22px; color: #fff;
  background: rgba(15,23,42,0.6); border: 1px solid rgba(100,116,139,0.4);
  outline: none; transition: .2s ease;
  &:focus { border-color: rgba(103,232,249,0.8); box-shadow: 0 0 0 4px rgba(103,232,249,0.15); }
`

const Actions = styled.div`
  margin-top: 10px;
`

const Button = styled(motion.button)`
  width: 100%; border: 0; outline: 0; cursor: pointer; border-radius: 12px; font-weight: 800; font-size: 16px;
  padding: 14px 18px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; color: #fff;
  background: ${p => p.$variant === 'primary' ? 'linear-gradient(135deg,#22d3ee,#3b82f6)' : 'rgba(30,41,59,0.7)'};
  border: 1px solid ${p => p.$variant === 'primary' ? 'rgba(59,130,246,0.45)' : 'rgba(100,116,139,0.4)'};
  &:disabled { opacity: .6; cursor: not-allowed; }
`

const HelpCard = styled(motion.div)`
  text-align: center; margin-top: 18px; background: rgba(2,6,23,0.4); border: 1px solid rgba(148,163,184,0.25);
  border-radius: 18px; padding: 18px;
  h3 { color: #fff; font-weight: 800; margin: 0 0 8px; }
  p, li { color: #cbd5e1; }
  ul { list-style: none; padding-left: 0; display: grid; gap: 6px; }
  a { color: #67e8f9; text-decoration: none; font-weight: 700; }
`

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const email = location.state?.email || 'user@example.com'
  const phone = location.state?.phone || '+91 XXXXX XXXXX'
  const verificationType = location.state?.type || 'email'

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsVerifying(true)
    
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      alert('Please enter complete OTP')
      setIsVerifying(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Verifying OTP:', otpCode)
      
      // Success - redirect to dashboard or next step
      navigate('/login', { 
        state: { 
          message: 'Account verified successfully! Please login.' 
        }
      })
    } catch (error) {
      console.error('OTP verification failed:', error)
      alert('Invalid OTP. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Resending OTP to:', verificationType === 'email' ? email : phone)
      
      setTimeLeft(300) // Reset timer
      setOtp(['', '', '', '', '', '']) // Clear OTP fields
      alert('OTP resent successfully!')
    } catch (error) {
      console.error('Failed to resend OTP:', error)
      alert('Failed to resend OTP. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Shell>
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: [0.08, 0.2, 0.08],
            x: [0, (Math.random() * 120 - 60), 0],
            y: [0, (Math.random() * 120 - 60), 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 16 + Math.random() * 10, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 4 }}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: i % 3 === 0 ? 18 : 14,
            height: i % 3 === 0 ? 18 : 14,
            borderRadius: 12,
            background: i % 2 === 0 ? 'linear-gradient(135deg, rgba(34,211,238,.18), rgba(59,130,246,.18))' : 'linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.18))',
            filter: 'blur(1px)',
          }}
        />
      ))}

      <TopBar>
        <BackLink to="/register">
          <motion.span whileHover={{ x: -4 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeftIcon />
            Back to Registration
          </motion.span>
        </BackLink>
      </TopBar>

      <Grid>
        <Header initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <LogoWrap animate={{ scale: [1, 1.06, 1], rotate: [0, 4, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
            <ShieldCheckIcon />
          </LogoWrap>
          <Title>Verify Your Account</Title>
          <Subtitle>We've sent a verification code to your {verificationType}</Subtitle>
          <InfoChip>
            {verificationType === 'email' ? <EnvelopeIcon /> : <PhoneIcon />}
            <span>{verificationType === 'email' ? email : phone}</span>
          </InfoChip>
        </Header>

        <Card initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <Label>Enter 6-digit verification code</Label>
              <OtpWrap>
                {otp.map((digit, index) => (
                  <OtpInput
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    whileFocus={{ scale: 1.05 }}
                  />
                ))}
              </OtpWrap>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {timeLeft > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#cbd5e1' }}>
                  <ClockIcon style={{ width: 18, height: 18 }} />
                  <span>Code expires in {formatTime(timeLeft)}</span>
                </div>
              ) : (
                <div style={{ color: '#f87171' }}>Code expired. Please request a new one.</div>
              )}
            </div>

            <Actions>
              <Button type="submit" disabled={isVerifying || otp.join('').length !== 6} $variant="primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isVerifying ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '999px' }} />
                ) : (
                  <>
                    <CheckCircleIcon style={{ width: 20, height: 20 }} />
                    Verify Account
                  </>
                )}
              </Button>
            </Actions>
          </form>

          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <p style={{ color: '#cbd5e1', marginBottom: 10 }}>Didn't receive the code?</p>
            <Button onClick={handleResendOTP} disabled={isResending || timeLeft > 0} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {isResending ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 20, height: 20, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '999px' }} />
              ) : (
                <span>Resend Code</span>
              )}
            </Button>
          </div>
        </Card>

        <HelpCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3>Need Help?</h3>
          <ul>
            <li>• Check your spam/junk folder if using email verification</li>
            <li>• Make sure your phone has good network coverage</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
          <Link to="/contact">Contact Support →</Link>
        </HelpCard>
      </Grid>
    </Shell>
  )
}

export default VerifyOTPPage
