import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import cegLogo from '../assets/CEG_logo.png';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  StarIcon, 
  ArrowRightIcon,
  UserGroupIcon,
  HomeIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  WifiIcon,
  AcademicCapIcon,
  HeartIcon,
  SparklesIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { theme, Container, Flex, Grid, GlassCard, GradientText, AnimatedButton } from '../styles/GlobalStyles';

// Advanced Styled Components
const LandingPageContainer = styled.div`
  min-height: 100vh;
  background: radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 50%, #000000 100%);
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
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

const FloatingElement = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: ${props => props.gradient || 'linear-gradient(45deg, #667eea, #764ba2)'};
  filter: blur(1px);
  opacity: 0.6;
`;

const NavigationBar = styled(motion.nav)`
  position: fixed;
  top: ${theme.spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  box-shadow: ${theme.shadows['2xl']};
  
  @media (max-width: ${theme.breakpoints.md}) {
    top: ${theme.spacing.md};
    left: ${theme.spacing.md};
    right: ${theme.spacing.md};
    transform: none;
  }
`;

const NavMenu = styled.ul`
  display: flex;
  list-style: none;
  gap: ${theme.spacing.lg};
  margin: 0;
  padding: 0;
  
  @media (max-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing.md};
  }
`;

const NavItem = styled(motion.li)`
  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-weight: ${theme.typography.fontWeights.medium};
    font-size: ${theme.typography.fontSizes.sm};
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    border-radius: ${theme.borderRadius.lg};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    
    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding: ${theme.spacing['5xl']} 0;
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 8vw, 6rem);
  font-weight: ${theme.typography.fontWeights.black};
  line-height: ${theme.typography.lineHeights.tight};
  margin-bottom: ${theme.spacing.xl};
  background: linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 40px rgba(168, 85, 247, 0.3);
`;

const HeroSubtitle = styled(motion.p)`
  font-size: ${theme.typography.fontSizes['2xl']};
  color: rgba(255, 255, 255, 0.8);
  line-height: ${theme.typography.lineHeights.relaxed};
  margin-bottom: ${theme.spacing['3xl']};
  font-weight: ${theme.typography.fontWeights.light};
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const HeroActions = styled(motion.div)`
  display: flex;
  gap: ${theme.spacing.lg};
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: ${theme.spacing['4xl']};
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing['4xl']};
`;

const StatCard = styled(GlassCard)`
  text-align: center;
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  h3 {
    font-size: ${theme.typography.fontSizes['3xl']};
    font-weight: ${theme.typography.fontWeights.bold};
    color: #60a5fa;
    margin-bottom: ${theme.spacing.sm};
  }
  
  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.medium};
  }
`;

const FeaturesSection = styled.section`
  padding: ${theme.spacing['5xl']} 0;
  position: relative;
  z-index: 1;
  background: linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.5) 100%);
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: ${theme.typography.fontWeights.black};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  background: linear-gradient(135deg, #ffffff 0%, #60a5fa 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const SectionSubtitle = styled(motion.p)`
  font-size: ${theme.typography.fontSizes.xl};
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: ${theme.spacing['4xl']};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: ${theme.typography.lineHeights.relaxed};
`;

const FeatureCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing['2xl']};
  text-align: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.gradient || theme.colors.gradients.primary};
    transform: scaleX(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    transform: translateY(-8px);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(96, 165, 250, 0.2);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${theme.spacing.lg};
  background: ${props => props.gradient || theme.colors.gradients.primary};
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.glow};
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${theme.typography.fontSizes['2xl']};
  font-weight: ${theme.typography.fontWeights.bold};
  color: white;
  margin-bottom: ${theme.spacing.lg};
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  line-height: ${theme.typography.lineHeights.relaxed};
  font-size: ${theme.typography.fontSizes.base};
`;

const CallToActionSection = styled.section`
  padding: ${theme.spacing['5xl']} 0;
  text-align: center;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingElements = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    gradient: [
      'linear-gradient(45deg, #667eea, #764ba2)',
      'linear-gradient(45deg, #f093fb, #f5576c)',
      'linear-gradient(45deg, #4facfe, #00f2fe)',
      'linear-gradient(45deg, #43e97b, #38f9d7)',
      'linear-gradient(45deg, #fa709a, #fee140)',
    ][Math.floor(Math.random() * 5)],
    duration: Math.random() * 20 + 10,
  }));

  const features = [
    {
      icon: <HomeIcon />,
      title: 'Smart Room Management',
      description: 'AI-powered room allocation system with real-time availability tracking and automated assignments based on preferences and compatibility.',
      gradient: theme.colors.gradients.primary,
    },
    {
      icon: <UserGroupIcon />,
      title: 'Student Portal',
      description: 'Comprehensive dashboard for students to manage their hostel life, from room bookings to complaint submissions and fee payments.',
      gradient: theme.colors.gradients.secondary,
    },
    {
      icon: <CreditCardIcon />,
      title: 'Digital Payments',
      description: 'Secure online payment gateway with automated billing, fee tracking, and instant payment confirmations for all hostel services.',
      gradient: theme.colors.gradients.success,
    },
    {
      icon: <WifiIcon />,
      title: 'IoT Integration',
      description: 'Smart sensors for monitoring room conditions, security systems, and automated resource management with real-time alerts.',
      gradient: theme.colors.gradients.warning,
    },
    {
      icon: <ClipboardDocumentListIcon />,
      title: 'Digital Documentation',
      description: 'Paperless documentation system with digital forms, automated approvals, and secure document storage and retrieval.',
      gradient: theme.colors.gradients.danger,
    },
    {
      icon: <ChartBarIcon />,
      title: 'Analytics Dashboard',
      description: 'Advanced analytics and reporting tools for administrators to track occupancy, revenue, and operational efficiency metrics.',
      gradient: theme.colors.gradients.primary,
    },
  ];

  return (
    <LandingPageContainer>
      {/* Animated Background */}
      <AnimatedBackground>
        {floatingElements.map((element) => (
          <FloatingElement
            key={element.id}
            gradient={element.gradient}
            style={{
              width: element.size,
              height: element.size,
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={{
              x: [0, 50, -30, 0],
              y: [0, -30, 20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatedBackground>

      {/* Navigation */}
      <NavigationBar
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Flex justify="space-between" align="center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}
          >
            <img src={cegLogo} alt="CEG" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <GradientText variant="primary" style={{ fontSize: theme.typography.fontSizes.xl, fontWeight: theme.typography.fontWeights.bold }}>
              CEG Digital Hostel
            </GradientText>
          </motion.div>
          
          <NavMenu>
            <NavItem whileHover={{ y: -2 }}>
              <Link to="#features">
                <SparklesIcon />
                Features
              </Link>
            </NavItem>
            <NavItem whileHover={{ y: -2 }}>
              <Link to="#about">
                <HeartIcon />
                About
              </Link>
            </NavItem>
            <NavItem whileHover={{ y: -2 }}>
              <Link to="/login">
                <UserGroupIcon />
                Sign In
              </Link>
            </NavItem>
          </NavMenu>
        </Flex>
      </NavigationBar>

      {/* Hero Section */}
      <HeroSection>
        <motion.div style={{ opacity, scale }}>
          <HeroContent>
            <HeroTitle
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              The Future of
              <br />
              <GradientText variant="primary">Digital Hostel</GradientText>
              <br />
              Management
            </HeroTitle>
            
            <HeroSubtitle
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Experience revolutionary hostel management with AI-powered room allocation, 
              IoT integration, and seamless digital services designed for the modern student experience.
            </HeroSubtitle>
            
            <HeroActions
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <AnimatedButton
                variant="primary"
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
                <ArrowRightIcon style={{ width: 20, height: 20, marginLeft: theme.spacing.sm }} />
              </AnimatedButton>
              
              <AnimatedButton
                variant="secondary"
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <UserGroupIcon style={{ width: 20, height: 20, marginRight: theme.spacing.sm }} />
                Sign In
              </AnimatedButton>
            </HeroActions>
            
            <StatsGrid
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <StatCard>
                <h3>1500+</h3>
                <p>Students Served</p>
              </StatCard>
              <StatCard>
                <h3>98%</h3>
                <p>Satisfaction Rate</p>
              </StatCard>
              <StatCard>
                <h3>24/7</h3>
                <p>Smart Monitoring</p>
              </StatCard>
              <StatCard>
                <h3>100%</h3>
                <p>Digital Operations</p>
              </StatCard>
            </StatsGrid>
          </HeroContent>
        </motion.div>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection id="features">
        <Container>
          <SectionTitle
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            Revolutionary Features
          </SectionTitle>
          
          <SectionSubtitle
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Discover the cutting-edge technologies that make our hostel management system 
            the most advanced solution for modern educational institutions.
          </SectionSubtitle>
          
          <Grid columns="repeat(auto-fit, minmax(350px, 1fr))" gap={theme.spacing['2xl']}>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                gradient={feature.gradient}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <FeatureIcon gradient={feature.gradient}>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </Grid>
        </Container>
      </FeaturesSection>

      {/* Call to Action */}
      <CallToActionSection>
        <Container>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <SectionTitle>Ready to Transform Your Hostel Experience?</SectionTitle>
            <SectionSubtitle>
              Join thousands of students already enjoying the benefits of smart hostel management.
            </SectionSubtitle>
            
            <Flex justify="center" gap={theme.spacing.xl} style={{ marginTop: theme.spacing['3xl'] }}>
              <AnimatedButton
                variant="primary"
                onClick={() => navigate('/register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AcademicCapIcon style={{ width: 20, height: 20, marginRight: theme.spacing.sm }} />
                Start Your Journey
              </AnimatedButton>
              
              <AnimatedButton
                variant="secondary"
                onClick={() => navigate('/contact')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <BellIcon style={{ width: 20, height: 20, marginRight: theme.spacing.sm }} />
                Contact Us
              </AnimatedButton>
            </Flex>
          </motion.div>
        </Container>
      </CallToActionSection>
    </LandingPageContainer>
  );
};

export default LandingPage;
