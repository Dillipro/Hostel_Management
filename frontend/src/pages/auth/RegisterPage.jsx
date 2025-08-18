import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { 
  AcademicCapIcon, 
  ArrowLeftIcon, 
  UserPlusIcon,
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
  position: relative;
  z-index: 10;
  padding: 24px;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.85);
  text-decoration: none;
  border: 1px solid rgba(148,163,184,0.25);
  background: rgba(15,23,42,0.5);
  padding: 10px 14px;
  border-radius: 12px;
  transition: all .2s ease;
  &:hover { color: #67e8f9; border-color: rgba(103,232,249,0.4); background: rgba(15,23,42,0.7); }
  svg { width: 18px; height: 18px; }
`

const Grid = styled.div`
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
`

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 28px;
`

const LogoWrap = styled(motion.div)`
  width: 68px; height: 68px; margin: 0 auto 16px; position: relative;
  border-radius: 16px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #22d3ee, #3b82f6, #7c3aed);
  box-shadow: 0 10px 40px rgba(59,130,246,0.35);
  &::after { content: ''; position: absolute; inset: 0; filter: blur(24px); opacity: .5; border-radius: 16px; background: inherit; z-index: -1; }
  svg { width: 30px; height: 30px; color: #fff; }
`

const Title = styled.h1`
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 900;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #a5f3fc, #93c5fd, #c4b5fd);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`

const Subtitle = styled.p`
  color: #cbd5e1; font-size: 18px; max-width: 680px; margin: 0 auto;
`

const StepsWrap = styled(motion.div)`
  margin: 28px 0 20px;
`

const StepsBar = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap;
`

const StepItem = styled.div`
  display: flex; align-items: center; gap: 14px;
`

const StepCircle = styled.div`
  width: 46px; height: 46px; border-radius: 999px; display: grid; place-items: center;
  font-weight: 800; font-size: 14px;
  border: 2px solid ${p => p.$active ? 'rgba(103,232,249,0.8)' : 'rgba(100,116,139,0.6)'};
  color: ${p => p.$active ? '#fff' : '#94a3b8'};
  background: ${p => p.$active ? 'linear-gradient(135deg, #22d3ee, #3b82f6)' : 'rgba(15,23,42,0.6)'};
  box-shadow: ${p => p.$active ? '0 8px 24px rgba(59,130,246,0.35)' : 'none'};
`

const StepConnector = styled.div`
  width: 80px; height: 2px; border-radius: 2px;
  background: ${p => p.$done ? 'linear-gradient(90deg, #22d3ee, #3b82f6)' : 'rgba(100,116,139,0.5)'};
`

const SectionHeading = styled.h2`
  text-align: center; font-size: 22px; font-weight: 800; color: #fff; margin: 18px 0 6px;
`

const SectionSub = styled.p`
  text-align: center; color: #cbd5e1; margin: 0 0 8px;
`

const Card = styled(motion.div)`
  max-width: 760px; margin: 0 auto; border-radius: 22px; padding: 28px;
  background: rgba(2,6,23,0.55);
  border: 1px solid rgba(99,102,241,0.2);
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
`

const FormGrid = styled.div`
  display: grid; gap: 18px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
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
const Select = styled.select`${baseField}`
const Textarea = styled.textarea`${baseField}; resize: vertical; min-height: 120px;`

const Actions = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 22px; padding-top: 18px; border-top: 1px solid rgba(100,116,139,0.35);
`

const Button = styled(motion.button)`
  border: 0; outline: 0; cursor: pointer; border-radius: 12px; font-weight: 700;
  padding: 12px 22px; display: inline-flex; align-items: center; gap: 8px; color: #fff;
  background: ${p => p.$variant === 'primary' ? 'linear-gradient(135deg,#22d3ee,#3b82f6)' : 'rgba(30,41,59,0.7)'};
  border: 1px solid ${p => p.$variant === 'primary' ? 'rgba(59,130,246,0.45)' : 'rgba(100,116,139,0.4)'};
  &:hover { filter: brightness(1.05); }
`

const Hint = styled.div`
  background: rgba(2,6,23,0.6); border: 1px solid rgba(148,163,184,0.2);
  padding: 18px; border-radius: 14px; color: #e5e7eb;
  li { display: flex; align-items: center; gap: 8px; }
  ul { margin: 10px 0 0; padding-left: 0; list-style: none; display: grid; gap: 8px; }
  h3 { font-size: 16px; font-weight: 800; margin: 0 0 8px; color: #fff; display: flex; align-items: center; gap: 8px; }
  .dot { width: 8px; height: 8px; border-radius: 999px; background: #22d3ee; }
`

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: ''
    },
    academicInfo: {
      studentId: '',
      department: '',
      year: '',
      course: ''
    },
    hostelInfo: {
      preferredHostel: '',
      roomType: '',
      specialRequirements: ''
    },
    credentials: {
      password: '',
      confirmPassword: ''
    }
  })

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Basic details about you' },
    { number: 2, title: 'Academic Details', description: 'Your academic information' },
    { number: 3, title: 'Hostel Preferences', description: 'Accommodation preferences' },
    { number: 4, title: 'Account Security', description: 'Set up your credentials' }
  ]

  const departments = [
    'Computer Science Engineering',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biomedical Engineering',
    'Information Technology'
  ]

  const hostels = [
    'Himalaya Hostel',
    'Vindhya Hostel',
    'Sahyadri Hostel',
    'Nilgiri Hostel',
    'Aravalli Hostel',
    'Satpura Hostel'
  ]

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Registration data:', formData)
    // Handle registration logic here
  }

  return (
    <Shell>
      {/* Subtle floating particles */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.08, 0.2, 0.08],
            x: [0, (Math.random() * 120 - 60), 0],
            y: [0, (Math.random() * 120 - 60), 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 18 + Math.random() * 12, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 4 }}
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
        <BackLink to="/">
          <motion.span whileHover={{ x: -4 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeftIcon />
            Back to Home
          </motion.span>
        </BackLink>
      </TopBar>

      <Grid>
        <Header initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <LogoWrap animate={{ rotate: [0, 360] }} transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}>
            <AcademicCapIcon />
          </LogoWrap>
          <Title>Join CEG Digital Hostel</Title>
          <Subtitle>Create your account to access the next‑generation hostel management platform</Subtitle>
        </Header>

        <StepsWrap initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <div style={{ display: 'grid', justifyContent: 'center' }}>
            <StepsBar>
              {steps.map((step, index) => (
                <StepItem key={step.number}>
                  <StepCircle $active={currentStep >= step.number}>
                    {currentStep > step.number ? (
                      <CheckCircleIcon style={{ width: 20, height: 20 }} />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </StepCircle>
                  {index < steps.length - 1 && (
                    <StepConnector $done={currentStep > step.number} />
                  )}
                </StepItem>
              ))}
            </StepsBar>
            <div>
              <SectionHeading>{steps[currentStep - 1].title}</SectionHeading>
              <SectionSub>{steps[currentStep - 1].description}</SectionSub>
            </div>
          </div>
        </StepsWrap>

        <Card initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  style={{ display: 'grid', gap: 18 }}
                >
                  <FormGrid>
                    <div>
                      <Label>First Name *</Label>
                      <Input
                        type="text"
                        required
                        value={formData.personalInfo.firstName}
                        onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input
                        type="text"
                        required
                        value={formData.personalInfo.lastName}
                        onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </FormGrid>
                  
                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <FormGrid>
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        type="tel"
                        required
                        value={formData.personalInfo.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input
                        type="date"
                        required
                        value={formData.personalInfo.dateOfBirth}
                        onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                      />
                    </div>
                  </FormGrid>
                </motion.div>
              )}

              {/* Step 2: Academic Information */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  style={{ display: 'grid', gap: 18 }}
                >
                  <FormGrid>
                    <div>
                      <Label>Student ID *</Label>
                      <Input
                        type="text"
                        required
                        value={formData.academicInfo.studentId}
                        onChange={(e) => handleInputChange('academicInfo', 'studentId', e.target.value)}
                        placeholder="Enter your student ID"
                      />
                    </div>
                    <div>
                      <Label>Year of Study *</Label>
                      <Select
                        required
                        value={formData.academicInfo.year}
                        onChange={(e) => handleInputChange('academicInfo', 'year', e.target.value)}
                      >
                        <option value="">Select Year</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                        <option value="pg">Post Graduate</option>
                      </Select>
                    </div>
                  </FormGrid>
                  
                  <div>
                    <Label>Department *</Label>
                    <Select
                      required
                      value={formData.academicInfo.department}
                      onChange={(e) => handleInputChange('academicInfo', 'department', e.target.value)}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Course *</Label>
                    <Select
                      required
                      value={formData.academicInfo.course}
                      onChange={(e) => handleInputChange('academicInfo', 'course', e.target.value)}
                    >
                      <option value="">Select Course</option>
                      <option value="btech">B.Tech</option>
                      <option value="mtech">M.Tech</option>
                      <option value="phd">Ph.D</option>
                      <option value="mba">MBA</option>
                    </Select>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Hostel Preferences */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  style={{ display: 'grid', gap: 18 }}
                >
                  <div>
                    <Label>Preferred Hostel *</Label>
                    <Select
                      required
                      value={formData.hostelInfo.preferredHostel}
                      onChange={(e) => handleInputChange('hostelInfo', 'preferredHostel', e.target.value)}
                    >
                      <option value="">Select Hostel</option>
                      {hostels.map(hostel => (
                        <option key={hostel} value={hostel}>{hostel}</option>
                      ))}
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Room Type *</Label>
                    <Select
                      required
                      value={formData.hostelInfo.roomType}
                      onChange={(e) => handleInputChange('hostelInfo', 'roomType', e.target.value)}
                    >
                      <option value="">Select Room Type</option>
                      <option value="single">Single Occupancy</option>
                      <option value="double">Double Occupancy</option>
                      <option value="triple">Triple Occupancy</option>
                      <option value="quad">Quad Occupancy</option>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Special Requirements (Optional)</Label>
                    <Textarea
                      value={formData.hostelInfo.specialRequirements}
                      onChange={(e) => handleInputChange('hostelInfo', 'specialRequirements', e.target.value)}
                      placeholder="Any special requirements or medical conditions..."
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 4: Account Security */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  style={{ display: 'grid', gap: 18 }}
                >
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      required
                      value={formData.credentials.password}
                      onChange={(e) => handleInputChange('credentials', 'password', e.target.value)}
                      placeholder="Create a strong password"
                    />
                  </div>
                  
                  <div>
                    <Label>Confirm Password *</Label>
                    <Input
                      type="password"
                      required
                      value={formData.credentials.confirmPassword}
                      onChange={(e) => handleInputChange('credentials', 'confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>

                  <Hint>
                    <h3>
                      <ShieldCheckIcon style={{ width: 18, height: 18, color: '#67e8f9' }} />
                      Password Requirements
                    </h3>
                    <ul>
                      <li><span className="dot" /> At least 8 characters long</li>
                      <li><span className="dot" /> Include uppercase and lowercase letters</li>
                      <li><span className="dot" /> Include at least one number</li>
                      <li><span className="dot" /> Include at least one special character</li>
                    </ul>
                  </Hint>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <Actions>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    $variant="secondary"
                  >
                    Previous
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ marginLeft: 'auto' }}
                    $variant="primary"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ marginLeft: 'auto' }}
                    $variant="primary"
                  >
                    <UserPlusIcon style={{ width: 18, height: 18 }} />
                    Create Account
                  </Button>
                )}
              </Actions>
            </form>
        </Card>

        {/* Login Link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ textAlign: 'center', marginTop: 18 }}>
          <p style={{ color: '#cbd5e1' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#67e8f9', fontWeight: 700, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </motion.div>
      </Grid>
    </Shell>
  )
}

export default RegisterPage
