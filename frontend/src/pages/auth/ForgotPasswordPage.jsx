import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

// Styled primitives
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
  position: relative; z-index: 10; padding: 24px;
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

const Stepper = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 14px; margin: 14px 0 6px;
`

const Step = styled.div`
  display: flex; align-items: center; gap: 12px;
`

const Dot = styled.div`
  width: 44px; height: 44px; border-radius: 999px; display: grid; place-items: center; font-weight: 800; font-size: 14px;
  color: ${p => p.$active ? '#fff' : '#94a3b8'};
  border: 2px solid ${p => p.$active ? 'rgba(103,232,249,0.8)' : 'rgba(100,116,139,0.6)'};
  background: ${p => p.$active ? 'linear-gradient(135deg, #22d3ee, #3b82f6)' : 'rgba(15,23,42,0.6)'};
`

const Line = styled.div`
  width: 60px; height: 2px; border-radius: 2px; background: ${p => p.$done ? 'linear-gradient(90deg, #22d3ee, #3b82f6)' : 'rgba(100,116,139,0.5)'};
`

const Card = styled(motion.div)`
  background: rgba(2,6,23,0.55); border: 1px solid rgba(99,102,241,0.2);
  backdrop-filter: blur(14px); border-radius: 22px; padding: 28px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
`

const Label = styled.label`
  display: block; font-size: 13px; font-weight: 700; color: #e2e8f0; margin: 0 0 8px;
`

const baseField = `
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  color: #fff;
  background: rgba(15,23,42,0.6);
  border: 1px solid rgba(100,116,139,0.4);
  outline: none;
  transition: .2s ease;
  &::placeholder { color: #94a3b8; }
  &:focus { border-color: rgba(103,232,249,0.8); box-shadow: 0 0 0 4px rgba(103,232,249,0.15); }
`

const Input = styled.input`${baseField}`
const OtpInput = styled(motion.input)`
  ${baseField}; width: 48px; text-align: center; font-weight: 900; font-size: 20px; padding: 10px 0;
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
  a { color: #67e8f9; text-decoration: none; font-weight: 700; }
`

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1) // 1: Contact method, 2: Verification, 3: New password
  const [contactMethod, setContactMethod] = useState('email') // email or phone
  const [formData, setFormData] = useState({
    contact: '',
    otp: ['', '', '', '', '', ''],
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log(`Sending reset code to ${contactMethod}:`, formData.contact)
      
      setStep(2)
    } catch (error) {
      console.error('Failed to send reset code:', error)
      alert('Failed to send reset code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...formData.otp]
    newOtp[index] = value
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }))
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    const otpCode = formData.otp.join('')
    if (otpCode.length !== 6) {
      alert('Please enter complete OTP')
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Verifying reset OTP:', otpCode)
      
      setStep(3)
    } catch (error) {
      console.error('OTP verification failed:', error)
      alert('Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Password reset successfully')
      
      navigate('/login', { 
        state: { 
          message: 'Password reset successfully! Please login with your new password.' 
        }
      })
    } catch (error) {
      console.error('Password reset failed:', error)
      alert('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <Stepper>
      {[1, 2, 3].map(stepNumber => (
        <Step key={stepNumber}>
          <Dot $active={step >= stepNumber}>
            {step > stepNumber ? (
              <CheckCircleIcon style={{ width: 18, height: 18 }} />
            ) : (
              <span>{stepNumber}</span>
            )}
          </Dot>
          {stepNumber < 3 && <Line $done={step > stepNumber} />}
        </Step>
      ))}
    </Stepper>
  )

  return (
    <Shell>
      {[...Array(16)].map((_, i) => (
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
          style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: i % 3 === 0 ? 18 : 14, height: i % 3 === 0 ? 18 : 14, borderRadius: 12, background: i % 2 === 0 ? 'linear-gradient(135deg, rgba(34,211,238,.18), rgba(59,130,246,.18))' : 'linear-gradient(135deg, rgba(99,102,241,.18), rgba(168,85,247,.18))', filter: 'blur(1px)' }}
        />
      ))}

      <TopBar>
        <BackLink to="/login">
          <motion.span whileHover={{ x: -4 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeftIcon />
            Back to Login
          </motion.span>
        </BackLink>
      </TopBar>

      <Grid>
        <Header initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <LogoWrap animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}>
            <KeyIcon />
          </LogoWrap>
          <Title>Reset Password</Title>
          <Subtitle>
            {step === 1 && 'Enter your contact information to reset your password'}
            {step === 2 && 'Enter the verification code sent to you'}
            {step === 3 && 'Create a new secure password'}
          </Subtitle>
        </Header>

        {renderStepIndicator()}

        <Card initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          {step === 1 && (
            <form onSubmit={handleContactSubmit} style={{ display: 'grid', gap: 16 }}>
              <div>
                <Label>Choose recovery method:</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <Button type="button" onClick={() => setContactMethod('email')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', justifyContent: 'flex-start', gap: 10, padding: 16, background: contactMethod === 'email' ? 'rgba(34,211,238,0.12)' : 'rgba(30,41,59,0.7)', border: `2px solid ${contactMethod === 'email' ? 'rgba(103,232,249,0.8)' : 'rgba(100,116,139,0.4)'}` }}>
                    <EnvelopeIcon style={{ width: 20, height: 20, color: '#67e8f9' }} />
                    <span style={{ fontWeight: 700 }}>Email</span>
                  </Button>
                  <Button type="button" onClick={() => setContactMethod('phone')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%', justifyContent: 'flex-start', gap: 10, padding: 16, background: contactMethod === 'phone' ? 'rgba(34,211,238,0.12)' : 'rgba(30,41,59,0.7)', border: `2px solid ${contactMethod === 'phone' ? 'rgba(103,232,249,0.8)' : 'rgba(100,116,139,0.4)'}` }}>
                    <PhoneIcon style={{ width: 20, height: 20, color: '#67e8f9' }} />
                    <span style={{ fontWeight: 700 }}>Phone</span>
                  </Button>
                </div>
              </div>

              <div>
                <Label>{contactMethod === 'email' ? 'Email Address' : 'Phone Number'} *</Label>
                <Input
                  type={contactMethod === 'email' ? 'email' : 'tel'}
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder={contactMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
                />
              </div>

              <Button type="submit" disabled={isLoading} $variant="primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '999px' }} />
                ) : (
                  <span>Send Reset Code</span>
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} style={{ display: 'grid', gap: 16 }}>
              <p style={{ textAlign: 'center', color: '#cbd5e1' }}>Enter the 6-digit code sent to your {contactMethod}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                {formData.otp.map((digit, index) => (
                  <OtpInput
                    key={index}
                    id={`reset-otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    whileFocus={{ scale: 1.05 }}
                  />
                ))}
              </div>

              <Button type="submit" disabled={isLoading || formData.otp.join('').length !== 6} $variant="primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '999px' }} />
                ) : (
                  <>
                    <CheckCircleIcon style={{ width: 20, height: 20 }} />
                    <span>Verify Code</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 16 }}>
              <div>
                <Label>New Password *</Label>
                <Input type="password" required value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} placeholder="Enter your new password" />
              </div>
              <div>
                <Label>Confirm New Password *</Label>
                <Input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirm your new password" />
              </div>
              <div style={{ background: 'rgba(2,6,23,0.6)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 14, padding: 16 }}>
                <h3 style={{ color: '#fff', fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheckIcon style={{ width: 18, height: 18, color: '#67e8f9' }} /> Password Requirements
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8, color: '#cbd5e1' }}>
                  <li>• At least 8 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>
              <Button type="submit" disabled={isLoading || formData.password !== formData.confirmPassword || !formData.password} $variant="primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '999px' }} />
                ) : (
                  <>
                    <KeyIcon style={{ width: 20, height: 20 }} />
                    <span>Reset Password</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>

        <HelpCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h3>Need Help?</h3>
          <p>If you're having trouble resetting your password, please contact our support team.</p>
          <Link to="/contact">Contact Support →</Link>
        </HelpCard>
      </Grid>
    </Shell>
  )
}

export default ForgotPasswordPage
