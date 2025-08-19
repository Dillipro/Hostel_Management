import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import cegLogo from '../../assets/CEG_logo.png';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  ArrowLeftIcon,
  UserIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { theme, Container, Flex, GlassCard, GradientText, AnimatedButton } from '../../styles/GlobalStyles';
import { useAuthStore } from '../../stores/useAuthStore'

// Advanced Styled Components
const LoginPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    radial-gradient(ellipse at top left, rgba(79, 70, 229, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  padding: ${theme.spacing.lg};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 119, 198, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
`;

const FloatingParticle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.color || 'rgba(99, 102, 241, 0.4)'};
  filter: blur(1px);
`;

const LoginContainer = styled(motion.div)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const LoginCard = styled(GlassCard)`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing['3xl']};
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(99, 102, 241, 0.8) 50%, 
      transparent 100%);
  }
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: ${theme.spacing.lg};
  left: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.md};
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: translateX(-2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing['3xl']};
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Logo = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: ${theme.borderRadius['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 
    0 10px 30px rgba(102, 126, 234, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: ${theme.borderRadius['2xl']};
    z-index: -1;
    filter: blur(8px);
    opacity: 0.6;
  }
`;

const LogoImg = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
`;

const Title = styled(motion.h1)`
  font-size: ${theme.typography.fontSizes['4xl']};
  font-weight: ${theme.typography.fontWeights.black};
  color: white;
  margin-bottom: ${theme.spacing.md};
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
`;

const Subtitle = styled(motion.p)`
  color: rgba(255, 255, 255, 0.7);
  font-size: ${theme.typography.fontSizes.lg};
  line-height: ${theme.typography.lineHeights.relaxed};
  margin-bottom: ${theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const InputGroup = styled(motion.div)`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  margin-bottom: ${theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.lg} ${theme.spacing.xl} ${theme.spacing.lg} 3.5rem;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.xl};
  color: white;
  font-size: ${theme.typography.fontSizes.base};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    border-color: #667eea;
    box-shadow: 
      0 0 0 3px rgba(102, 126, 234, 0.1),
      0 10px 30px rgba(102, 126, 234, 0.2);
    background: rgba(15, 23, 42, 0.8);
  }
  
  &.error {
    border-color: #ef4444;
    box-shadow: 
      0 0 0 3px rgba(239, 68, 68, 0.1),
      0 10px 30px rgba(239, 68, 68, 0.2);
  }
  
  &.success {
    border-color: #10b981;
    box-shadow: 
      0 0 0 3px rgba(16, 185, 129, 0.1),
      0 10px 30px rgba(16, 185, 129, 0.2);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.lg};
  color: rgba(255, 255, 255, 0.5);
  z-index: 1;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${theme.spacing.lg};
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: #ef4444;
  font-size: ${theme.typography.fontSizes.sm};
  margin-top: ${theme.spacing.sm};
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: #10b981;
  font-size: ${theme.typography.fontSizes.sm};
  margin-top: ${theme.spacing.sm};
  
  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${theme.spacing.lg} 0;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: ${theme.typography.fontSizes.sm};
  
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: #667eea;
  }
`;

const ForgotLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-size: ${theme.typography.fontSizes.sm};
  font-weight: ${theme.typography.fontWeights.medium};
  transition: all 0.2s ease;
  
  &:hover {
    color: #5b21b6;
    text-decoration: underline;
  }
`;

const LoginButton = styled(AnimatedButton)`
  width: 100%;
  margin: ${theme.spacing.lg} 0;
  padding: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSizes.lg};
  font-weight: ${theme.typography.fontWeights.semibold};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing.xl} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      transparent 100%);
  }
  
  span {
    color: rgba(255, 255, 255, 0.6);
    font-size: ${theme.typography.fontSizes.sm};
    padding: 0 ${theme.spacing.lg};
    background: rgba(15, 23, 42, 0.8);
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.xl};
  
  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: ${theme.typography.fontSizes.base};
  }
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: ${theme.typography.fontWeights.semibold};
    margin-left: ${theme.spacing.sm};
    transition: all 0.2s ease;
    
    &:hover {
      color: #5b21b6;
      text-decoration: underline;
    }
  }
`;

const DeviceInfo = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.05);
  border-radius: ${theme.borderRadius.lg};
  color: rgba(255, 255, 255, 0.6);
  font-size: ${theme.typography.fontSizes.sm};
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoginPageStyled = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  const doLogin = useAuthStore(s => s.login)
  const getDashboardRoute = useAuthStore(s => s.getDashboardRoute)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess('');
    
    try {
      const res = await doLogin(formData.identifier, formData.password, formData.rememberMe)
      if (res.success) {
        navigate(getDashboardRoute())
      } else if (res.requiresVerification) {
        navigate('/verify-otp', { state: { userId: res.userId } })
      } else {
        setErrors({ general: res.message || 'Invalid credentials' })
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    color: [
      'rgba(99, 102, 241, 0.4)',
      'rgba(168, 85, 247, 0.4)',
      'rgba(236, 72, 153, 0.4)',
      'rgba(59, 130, 246, 0.4)',
    ][Math.floor(Math.random() * 4)],
    duration: Math.random() * 10 + 5,
  }));

  return (
    <LoginPageContainer>
      {/* Animated Background */}
      <AnimatedBackground>
        {particles.map((particle) => (
          <FloatingParticle
            key={particle.id}
            color={particle.color}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatedBackground>

      {/* Back Button */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }} style={{ all:'unset' }}>
        <BackButton onClick={() => navigate('/') }>
          <ArrowLeftIcon />
          Back to Home
        </BackButton>
      </motion.button>

      {/* Main Login Container */}
      <LoginContainer
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.4, 0, 0.2, 1],
          delay: 0.2 
        }}
      >
        <LoginCard>
          <Header>
            <LogoContainer>
              <Logo
                animate={{ 
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <LogoImg src={cegLogo} alt="CEG" />
              </Logo>
            </LogoContainer>
            
            <Title
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Welcome Back
            </Title>
            
            <Subtitle
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Sign in to your <GradientText variant="primary">CEG Digital Hostel</GradientText> account
            </Subtitle>
          </Header>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <SuccessMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircleIcon />
                {success}
              </SuccessMessage>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {errors.general && (
              <ErrorMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ExclamationTriangleIcon />
                {errors.general}
              </ErrorMessage>
            )}
          </AnimatePresence>

          <Form onSubmit={handleSubmit}>
            {/* Identifier Input (Email or User ID) */}
            <InputGroup
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <InputLabel>Email or User ID</InputLabel>
              <InputContainer>
                <InputIcon>
                  <UserIcon />
                </InputIcon>
                <Input
                  type="text"
                  placeholder="Enter your email or user ID"
                  value={formData.identifier}
                  onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                  className={errors.identifier ? 'error' : formData.identifier ? 'success' : ''}
                  required
                />
              </InputContainer>
            </InputGroup>

            {/* Password Input */}
            <InputGroup
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <InputLabel>Password</InputLabel>
              <InputContainer>
                <InputIcon>
                  <LockClosedIcon />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className={errors.password ? 'error' : formData.password ? 'success' : ''}
                  required
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </PasswordToggle>
              </InputContainer>
            </InputGroup>

            {/* Remember Me & Forgot Password */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <RememberForgot>
                <CheckboxContainer>
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  />
                  Remember me
                </CheckboxContainer>
                <ForgotLink to="/forgot-password">
                  Forgot your password?
                </ForgotLink>
              </RememberForgot>
            </motion.div>

            {/* Login Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width:'100%', border:'none', background:'transparent', padding:0 }}>
              <LoginButton type="submit" disabled={isLoading}>
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ 
                      width: 20, 
                      height: 20, 
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <>
                    <SparklesIcon style={{ width: 20, height: 20, marginRight: theme.spacing.sm }} />
                    Sign In
                  </>
                )}
              </LoginButton>
              </motion.button>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Divider>
                <span>or continue with</span>
              </Divider>
            </motion.div>

            {/* Register Link */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <RegisterLink>
                <span>Don't have an account?</span>
                <Link to="/register">Create an account</Link>
              </RegisterLink>
            </motion.div>

            {/* Device Info */}
            <DeviceInfo
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <ComputerDesktopIcon />
              Secure login from {navigator.platform}
            </DeviceInfo>
          </Form>
        </LoginCard>
      </LoginContainer>
    </LoginPageContainer>
  );
};

export default LoginPageStyled;
