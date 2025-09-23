import React from 'react'
import axios from 'axios'
import { 
  Container, Box, TextField, Button, Typography, Link, Paper, useTheme,
  Grid, MenuItem, FormControl, InputLabel, Select, FormHelperText,
  Stepper, Step, StepLabel, StepContent, Chip, Alert, LinearProgress
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

export default function Signup(){
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const nav = useNavigate()
  
  // Form state
  const [activeStep, setActiveStep] = React.useState(0)
  const [errors, setErrors] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  
  // Personal Details
  const [name, setName] = React.useState('')
  const [regNo, setRegNo] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [dob, setDob] = React.useState(null)
  const [community, setCommunity] = React.useState('')
  const [gender, setGender] = React.useState('')
  const [fatherName, setFatherName] = React.useState('')
  const [motherName, setMotherName] = React.useState('')
  const [distanceFromHome, setDistanceFromHome] = React.useState('')
  const [addressProof, setAddressProof] = React.useState(null)
  const [category, setCategory] = React.useState('')
  const [admissionSlip, setAdmissionSlip] = React.useState(null)
  const [medicalInfo, setMedicalInfo] = React.useState('')
  const [lateralEntry, setLateralEntry] = React.useState('')
  
  // Academic Details  
  const [semester, setSemester] = React.useState('')
  const [year, setYear] = React.useState('')
  const [programType, setProgramType] = React.useState('')
  const [degree, setDegree] = React.useState('')
  const [branch, setBranch] = React.useState('')
  
  // Auth details
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [captcha, setCaptcha] = React.useState(null)
  const [captchaText, setCaptchaText] = React.useState('')

  const loadCaptcha = async () => { 
    try {
      const r = await axios.get('/security/captcha')
      setCaptcha(r.data)
    } catch (error) {
      console.error('Failed to load captcha:', error)
    }
  }
  
  React.useEffect(() => { loadCaptcha() }, [])

  // Form validation
  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 0) { // Personal Details
      if (!name.trim()) newErrors.name = 'Name is required'
      if (!regNo.trim()) newErrors.regNo = 'Register number is required'
      if (!phone.trim()) newErrors.phone = 'Mobile number is required'
      if (!dob) newErrors.dob = 'Date of birth is required'
      if (!gender) newErrors.gender = 'Gender is required'
      if (!community) newErrors.community = 'Community is required'
      if (!fatherName.trim()) newErrors.fatherName = 'Father name is required'
      if (!motherName.trim()) newErrors.motherName = 'Mother name is required'
      if (!distanceFromHome.trim()) newErrors.distanceFromHome = 'Distance is required'
      if (!category) newErrors.category = 'Category is required'
      if (!lateralEntry) newErrors.lateralEntry = 'Lateral entry selection is required'
    }
    
    if (step === 1) { // Academic Details
      if (!semester.trim()) newErrors.semester = 'Semester is required'
      if (!year.trim()) newErrors.year = 'Year is required'
      if (!programType) newErrors.programType = 'Program type is required'
      if (!degree) newErrors.degree = 'Degree is required'
      if (!branch) newErrors.branch = 'Branch is required'
    }
    
    if (step === 2) { // Authentication
      if (!email.trim()) newErrors.email = 'Email is required'
      if (!password.trim()) newErrors.password = 'Password is required'
      if (!captchaText.trim()) newErrors.captchaText = 'CAPTCHA is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleFileUpload = (file, type) => {
    if (file && file.size > 100 * 1024) { // 100KB limit
      setErrors(prev => ({ ...prev, [type]: 'File size must be less than 100KB' }))
      return
    }
    if (file && file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, [type]: 'Only PDF files are allowed' }))
      return
    }
    if (type === 'addressProof') setAddressProof(file)
    if (type === 'admissionSlip') setAdmissionSlip(file)
    setErrors(prev => ({ ...prev, [type]: undefined }))
  }

  const submit = async () => {
    if (!validateStep(2)) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      
      // Personal details
      formData.append('name', name)
      formData.append('reg_no', regNo)
      formData.append('phone', phone)
      formData.append('dob', dob.format('YYYY-MM-DD'))
      formData.append('community', community)
      formData.append('gender', gender)
      formData.append('father_name', fatherName)
      formData.append('mother_name', motherName)
      formData.append('distance_from_home', distanceFromHome)
      formData.append('category', category)
      formData.append('medical_info', medicalInfo)
      formData.append('lateral_entry', lateralEntry)
      
      // Academic details
      formData.append('semester', semester)
      formData.append('year', year)
      formData.append('program_type', programType)
      formData.append('degree', degree)
      formData.append('branch', branch)
      
      // Auth details
      formData.append('email', email)
      formData.append('password', password)
      formData.append('captchaId', captcha.id)
      formData.append('captchaText', captchaText)
      
      // Files
      if (addressProof) formData.append('address_proof', addressProof)
      if (admissionSlip) formData.append('admission_slip', admissionSlip)
      
      const r = await axios.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (r.data?.access) { 
        localStorage.setItem('access', r.data.access)
        nav('/student')
      }
    } catch(e) { 
      setErrors({ submit: e?.response?.data?.error || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }
  
  const fieldStyle = {
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
    },
    mb: 2
  }

  const steps = [
    {
      label: 'Personal Details',
      description: 'Basic information and documents'
    },
    {
      label: 'Academic Details', 
      description: 'Education and program information'
    },
    {
      label: 'Account Setup',
      description: 'Create your login credentials'
    }
  ]

  const renderPersonalDetails = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" color="primary" gutterBottom>
          Personal Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Full Name*"
          value={name}
          onChange={e => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Register Number*"
          value={regNo}
          onChange={e => setRegNo(e.target.value)}
          error={!!errors.regNo}
          helperText={errors.regNo}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Mobile Number*"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          error={!!errors.phone}
          helperText={errors.phone}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date of Birth*"
            value={dob}
            onChange={setDob}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                error={!!errors.dob}
                helperText={errors.dob}
                sx={fieldStyle}
              />
            )}
            maxDate={dayjs().subtract(16, 'year')}
          />
        </LocalizationProvider>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.community} sx={fieldStyle}>
          <InputLabel>Community*</InputLabel>
          <Select value={community} onChange={e => setCommunity(e.target.value)} label="Community*">
            <MenuItem value="OC">OC - Open Category</MenuItem>
            <MenuItem value="BC">BC - Backward Class</MenuItem>
            <MenuItem value="MBC">MBC - Most Backward Class</MenuItem>
            <MenuItem value="SC">SC - Scheduled Caste</MenuItem>
            <MenuItem value="ST">ST - Scheduled Tribe</MenuItem>
          </Select>
          {errors.community && <FormHelperText>{errors.community}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.gender} sx={fieldStyle}>
          <InputLabel>Gender*</InputLabel>
          <Select value={gender} onChange={e => setGender(e.target.value)} label="Gender*">
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Father's Name*"
          value={fatherName}
          onChange={e => setFatherName(e.target.value)}
          error={!!errors.fatherName}
          helperText={errors.fatherName}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Mother's Name*"
          value={motherName}
          onChange={e => setMotherName(e.target.value)}
          error={!!errors.motherName}
          helperText={errors.motherName}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Distance From Home to University (KM)*"
          value={distanceFromHome}
          onChange={e => setDistanceFromHome(e.target.value)}
          error={!!errors.distanceFromHome}
          helperText={errors.distanceFromHome || 'e.g: 500'}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.category} sx={fieldStyle}>
          <InputLabel>Category*</InputLabel>
          <Select value={category} onChange={e => setCategory(e.target.value)} label="Category*">
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="sports">Sports Quota</MenuItem>
            <MenuItem value="arts">Arts/Cultural</MenuItem>
            <MenuItem value="ncc">NCC</MenuItem>
            <MenuItem value="nss">NSS</MenuItem>
            <MenuItem value="pwd">Physically Challenged</MenuItem>
          </Select>
          {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Box>
          <Typography variant="body2" gutterBottom>Address Proof*</Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 1, textAlign: 'left', justifyContent: 'flex-start' }}
          >
            {addressProof ? addressProof.name : 'Choose PDF file (50-100KB)'}
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files[0], 'addressProof')}
            />
          </Button>
          {errors.addressProof && (
            <Typography color="error" variant="caption">{errors.addressProof}</Typography>
          )}
        </Box>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Box>
          <Typography variant="body2" gutterBottom>Admission Slip*</Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mb: 1, textAlign: 'left', justifyContent: 'flex-start' }}
          >
            {admissionSlip ? admissionSlip.name : 'Choose PDF file (50-100KB)'}
            <input
              type="file"
              hidden
              accept=".pdf"
              onChange={(e) => handleFileUpload(e.target.files[0], 'admissionSlip')}
            />
          </Button>
          {errors.admissionSlip && (
            <Typography color="error" variant="caption">{errors.admissionSlip}</Typography>
          )}
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Medical complaints / Allergies / Physically challenged"
          value={medicalInfo}
          onChange={e => setMedicalInfo(e.target.value)}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.lateralEntry} sx={fieldStyle}>
          <InputLabel>Lateral Entry*</InputLabel>
          <Select value={lateralEntry} onChange={e => setLateralEntry(e.target.value)} label="Lateral Entry*">
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
          {errors.lateralEntry && <FormHelperText>{errors.lateralEntry}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  )

  const renderAcademicDetails = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" color="primary" gutterBottom>
          Academic Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Semester*"
          value={semester}
          onChange={e => setSemester(e.target.value)}
          error={!!errors.semester}
          helperText={errors.semester || 'e.g: 1'}
          inputProps={{ min: 1, max: 8 }}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label="Year*"
          value={year}
          onChange={e => setYear(e.target.value)}
          error={!!errors.year}
          helperText={errors.year || 'e.g: 1'}
          inputProps={{ min: 1, max: 4 }}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.programType} sx={fieldStyle}>
          <InputLabel>Program Type*</InputLabel>
          <Select value={programType} onChange={e => setProgramType(e.target.value)} label="Program Type*">
            <MenuItem value="ug">Undergraduate (UG)</MenuItem>
            <MenuItem value="pg">Postgraduate (PG)</MenuItem>
            <MenuItem value="phd">PhD</MenuItem>
          </Select>
          {errors.programType && <FormHelperText>{errors.programType}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth error={!!errors.degree} sx={fieldStyle}>
          <InputLabel>Degree*</InputLabel>
          <Select value={degree} onChange={e => setDegree(e.target.value)} label="Degree*">
            <MenuItem value="BE">BE - Bachelor of Engineering</MenuItem>
            <MenuItem value="BTech">B.Tech - Bachelor of Technology</MenuItem>
            <MenuItem value="ME">ME - Master of Engineering</MenuItem>
            <MenuItem value="MTech">M.Tech - Master of Technology</MenuItem>
            <MenuItem value="MBA">MBA - Master of Business Administration</MenuItem>
            <MenuItem value="MCA">MCA - Master of Computer Applications</MenuItem>
            <MenuItem value="MSc">M.Sc - Master of Science</MenuItem>
            <MenuItem value="PhD">PhD - Doctor of Philosophy</MenuItem>
          </Select>
          {errors.degree && <FormHelperText>{errors.degree}</FormHelperText>}
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.branch} sx={fieldStyle}>
          <InputLabel>Branch*</InputLabel>
          <Select value={branch} onChange={e => setBranch(e.target.value)} label="Branch*">
            <MenuItem value="CSE">Computer Science and Engineering</MenuItem>
            <MenuItem value="IT">Information Technology</MenuItem>
            <MenuItem value="ECE">Electronics and Communication Engineering</MenuItem>
            <MenuItem value="EEE">Electrical and Electronics Engineering</MenuItem>
            <MenuItem value="MECH">Mechanical Engineering</MenuItem>
            <MenuItem value="CIVIL">Civil Engineering</MenuItem>
            <MenuItem value="CHEM">Chemical Engineering</MenuItem>
            <MenuItem value="AERO">Aeronautical Engineering</MenuItem>
            <MenuItem value="AUTO">Automobile Engineering</MenuItem>
            <MenuItem value="PROD">Production Engineering</MenuItem>
            <MenuItem value="GEO">Geological Engineering</MenuItem>
            <MenuItem value="MINING">Mining Engineering</MenuItem>
          </Select>
          {errors.branch && <FormHelperText>{errors.branch}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  )

  const renderAccountSetup = () => (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6" color="primary" gutterBottom>
          Account Credentials
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="email"
          label="Email*"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="password"
          label="Password*"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          sx={fieldStyle}
        />
      </Grid>
      
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" gap={2} sx={{ mt: 2 }}>
          <Box
            sx={{
              flex: 1,
              p: 2,
              borderRadius: 1,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
            dangerouslySetInnerHTML={{ __html: captcha?.data || '' }}
          />
          <TextField
            label="Enter CAPTCHA*"
            value={captchaText}
            onChange={e => setCaptchaText(e.target.value)}
            error={!!errors.captchaText}
            helperText={errors.captchaText}
            sx={{ ...fieldStyle, flex: 1 }}
          />
          <Button
            onClick={loadCaptcha}
            variant="outlined"
            sx={{ minWidth: 'auto', px: 3 }}
          >
            Refresh
          </Button>
        </Box>
      </Grid>
      
      {errors.submit && (
        <Grid item xs={12}>
          <Alert severity="error">{errors.submit}</Alert>
        </Grid>
      )}
    </Grid>
  )

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
        top: '15%',
        right: '10%',
        width: '180px',
        height: '180px',
        borderRadius: '50%',
        background: isDark ? 'rgba(106,76,255,0.1)' : 'rgba(106,76,255,0.15)',
        filter: 'blur(35px)',
        animation: 'floatY 7s ease-in-out infinite'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        left: '12%',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        background: isDark ? 'rgba(255,106,162,0.08)' : 'rgba(255,106,162,0.12)',
        filter: 'blur(25px)',
        animation: 'floatY 9s ease-in-out infinite reverse'
      }} />

      <Container maxWidth="md">
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
            Join HostelConnect
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              fontWeight: 500
            }}
          >
            Create your student account
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
            Student Registration
          </Typography>

          <Box component="form" noValidate>
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              value={name}
              onChange={e=>setName(e.target.value)}
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

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                sx={{
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
                label="Mobile"
                value={phone}
                onChange={e=>setPhone(e.target.value)}
                sx={{
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
            </Box>

            <Box display="flex" gap={2} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Register Number"
                value={regNo}
                onChange={e=>setRegNo(e.target.value)}
                sx={{
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
                label="Password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                sx={{
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
            </Box>

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
              onClick={submit}
            >
              Create Account
            </Button>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Link
                href="/login"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Already have an account? Login
              </Link>
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
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
