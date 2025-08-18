import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  UserIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CogIcon,
  CalendarDaysIcon,
  ClockIcon,
  WifiIcon,
  LightBulbIcon,
  AcademicCapIcon,
  HeartIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  MapPinIcon,
  PhoneIcon,
  KeyIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { theme, Container, Flex, Grid, GlassCard, GradientText, AnimatedButton } from '../../styles/GlobalStyles';
import { useAuthStore } from '../../stores/useAuthStore';
import cegLogo from '../../assets/CEG_logo.png';
import axios from 'axios';

// Advanced Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at top left, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  position: relative;
  overflow-x: hidden;
`;

const FloatingParticles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  border-radius: 50%;
  filter: blur(1px);
  box-shadow: 0 0 20px ${props => props.color};
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(30px);
  border-bottom: 1px solid rgba(168, 85, 247, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const HeaderContent = styled(Container)`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
`;

const HeaderFlex = styled(Flex)`
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const LogoIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.4);
  position: relative;
  
  svg {
    width: 28px;
    height: 28px;
    color: white;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #a855f7, #3b82f6);
    border-radius: ${theme.borderRadius.xl};
    z-index: -1;
    filter: blur(6px);
    opacity: 0.7;
  }
`;

const LogoImg = styled.img`
  width: 28px;
  height: 28px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
`;

const LogoText = styled.div`
  h1 {
    font-size: ${theme.typography.fontSizes['2xl']};
    font-weight: ${theme.typography.fontWeights.black};
    background: linear-gradient(135deg, #ffffff 0%, #a855f7 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
  
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: ${theme.typography.fontSizes.sm};
    margin: 0;
    font-weight: ${theme.typography.fontWeights.medium};
  }
`;

const HeaderActions = styled(Flex)`
  gap: ${theme.spacing.lg};
`;

const NotificationButton = styled(motion.button)`
  position: relative;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  svg {
    width: 20px;
    height: 20px;
    color: rgba(255, 255, 255, 0.8);
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(168, 85, 247, 0.5);
    transform: translateY(-1px);
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSizes.xs};
  font-weight: ${theme.typography.fontWeights.bold};
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
`;

const UserProfile = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(168, 85, 247, 0.3);
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeights.bold};
  color: white;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
`;

const UserInfo = styled.div`
  h3 {
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.semibold};
    color: white;
    margin: 0 0 2px 0;
  }
  
  p {
    font-size: ${theme.typography.fontSizes.xs};
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }
`;

const MainContent = styled.main`
  position: relative;
  z-index: 1;
  padding: ${theme.spacing['2xl']} 0;
`;

const WelcomeSection = styled(motion.section)`
  margin-bottom: ${theme.spacing['3xl']};
`;

const WelcomeCard = styled(GlassCard)`
  background: linear-gradient(135deg, 
    rgba(168, 85, 247, 0.1) 0%, 
    rgba(59, 130, 246, 0.1) 100%);
  border: 1px solid rgba(168, 85, 247, 0.2);
  padding: ${theme.spacing['3xl']};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      #a855f7 50%, 
      transparent 100%);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20px;
    right: 20px;
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const WelcomeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.lg};
`;

const WelcomeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const WelcomeIcon = styled.div`
  width: 24px;
  height: 24px;
  color: #fbbf24;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const TimeInfo = styled.div`
  text-align: right;
  
  .time {
    font-size: ${theme.typography.fontSizes.xl};
    font-weight: ${theme.typography.fontWeights.bold};
    color: white;
    margin: 0;
  }
  
  .date {
    font-size: ${theme.typography.fontSizes.sm};
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }
`;

const WelcomeTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: ${theme.typography.fontWeights.black};
  background: linear-gradient(135deg, #ffffff 0%, #a855f7 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 ${theme.spacing.lg} 0;
  line-height: ${theme.typography.lineHeights.tight};
`;

const WelcomeDescription = styled.p`
  font-size: ${theme.typography.fontSizes.lg};
  color: rgba(255, 255, 255, 0.8);
  line-height: ${theme.typography.lineHeights.relaxed};
  margin: 0 0 ${theme.spacing.xl} 0;
  max-width: 700px;
`;

const StatusIndicators = styled(Flex)`
  gap: ${theme.spacing.xl};
  margin-top: ${theme.spacing.xl};
  flex-wrap: wrap;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.color || '#10b981'};
    box-shadow: 0 0 20px ${props => props.color || '#10b981'};
    animation: pulse 2s ease-in-out infinite;
  }
  
  span {
    color: rgba(255, 255, 255, 0.9);
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.medium};
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const DashboardGrid = styled(Grid)`
  grid-template-columns: 1fr 350px;
  gap: ${theme.spacing['2xl']};
  margin-bottom: ${theme.spacing['3xl']};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const MainDashboard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing['2xl']};
`;

const QuickStatsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
`;

const QuickStatCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.03) 100%);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing.xl};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
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
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const QuickStatHeader = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const QuickStatIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.gradient || theme.colors.gradients.primary};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const QuickStatContent = styled.div`
  h3 {
    color: rgba(255, 255, 255, 0.7);
    font-size: ${theme.typography.fontSizes.xs};
    font-weight: ${theme.typography.fontWeights.semibold};
    margin: 0 0 ${theme.spacing.xs} 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .value {
    font-size: ${theme.typography.fontSizes.xl};
    font-weight: ${theme.typography.fontWeights.black};
    color: white;
    margin: 0;
    line-height: 1;
  }
`;

const MyRoomSection = styled(GlassCard)`
  h3 {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    color: white;
    font-size: ${theme.typography.fontSizes.xl};
    font-weight: ${theme.typography.fontWeights.bold};
    margin: 0 0 ${theme.spacing.xl} 0;
    
    svg {
      width: 24px;
      height: 24px;
      color: #a855f7;
    }
  }
`;

const RoomDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.lg};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const RoomInfo = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  
  .label {
    color: rgba(255, 255, 255, 0.6);
    font-size: ${theme.typography.fontSizes.sm};
    margin: 0 0 ${theme.spacing.xs} 0;
  }
  
  .value {
    color: white;
    font-size: ${theme.typography.fontSizes.lg};
    font-weight: ${theme.typography.fontWeights.semibold};
    margin: 0;
  }
`;

const ServicesStatus = styled.div`
  margin-top: ${theme.spacing.xl};
`;

const ServicesGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const ServiceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const ServiceIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
`;

const ServiceLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: ${theme.typography.fontSizes.xs};
  font-weight: ${theme.typography.fontWeights.medium};
  text-align: center;
`;

const ServiceStatus = styled.div`
  color: ${props => props.active ? '#10b981' : '#ef4444'};
  font-size: ${theme.typography.fontSizes.xs};
  font-weight: ${theme.typography.fontWeights.semibold};
  text-transform: uppercase;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const NotificationsCard = styled(GlassCard)`
  h3 {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    color: white;
    font-size: ${theme.typography.fontSizes.lg};
    font-weight: ${theme.typography.fontWeights.bold};
    margin: 0 0 ${theme.spacing.lg} 0;
    
    svg {
      width: 20px;
      height: 20px;
      color: #fbbf24;
    }
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const NotificationItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid ${props => props.borderColor || '#3b82f6'};
  border-radius: ${theme.borderRadius.lg};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
    border-left-color: ${props => props.borderColor || '#3b82f6'};
  }
`;

const NotificationIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.bgColor || 'rgba(59, 130, 246, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: ${props => props.iconColor || '#3b82f6'};
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  
  h4 {
    color: white;
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.semibold};
    margin: 0 0 ${theme.spacing.xs} 0;
  }
  
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: ${theme.typography.fontSizes.xs};
    margin: 0 0 ${theme.spacing.xs} 0;
  }
  
  .time {
    color: rgba(255, 255, 255, 0.4);
    font-size: ${theme.typography.fontSizes.xs};
    margin: 0;
  }
`;

const QuickActionsCard = styled(GlassCard)`
  h3 {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};
    color: white;
    font-size: ${theme.typography.fontSizes.lg};
    font-weight: ${theme.typography.fontWeights.bold};
    margin: 0 0 ${theme.spacing.lg} 0;
    
    svg {
      width: 20px;
      height: 20px;
      color: #a855f7;
    }
  }
`;

const ActionsGrid = styled(Grid)`
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const ActionButton = styled(motion.button)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.xl};
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(168, 85, 247, 0.1) 0%, 
      rgba(59, 130, 246, 0.1) 100%);
    border-color: rgba(168, 85, 247, 0.3);
    transform: translateY(-2px);
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #a855f7;
  }
  
  span {
    font-size: ${theme.typography.fontSizes.xs};
    font-weight: ${theme.typography.fontWeights.medium};
    text-align: center;
  }
`;

const StudentDashboardStyled = () => {
  const { user, logout } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchDashboardData();
    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from backend student dashboard
  const res = await axios.get('/api/student-portal/dashboard');
      if (res.data?.success) {
        const d = res.data.data;
        setDashboardData({
          room: d.accommodation ? {
            number: d.accommodation.roomNumber,
            block: d.accommodation.blockName,
            floor: d.accommodation.floorNumber ? `${d.accommodation.floorNumber} Floor` : '—',
            roommates: d.accommodation.roommates?.length || 0,
            services: {
              wifi: true,
              electricity: true,
              water: true,
              ac: true,
            },
          } : null,
          stats: {
            duesAmount: (d.feeStatus?.hostelFee?.paid ? 0 : d.feeStatus?.hostelFee?.amount) || 0,
            complaintsOpen: d.recentComplaints?.filter(c => c.status !== 'resolved')?.length || 0,
            messBalance: (d.feeStatus?.messFee?.paid ? 0 : d.feeStatus?.messFee?.amount) || 0,
            attendanceRate: d.attendanceStats ? Math.min(100, Math.round((d.attendanceStats.hostelEntry / d.attendanceStats.totalDays) * 100)) : 0,
          },
          notifications: (d.announcements || []).map((a, i) => ({
            id: a.id || i,
            type: a.type || 'info',
            title: a.title,
            message: a.message,
            time: new Date(a.date).toLocaleString(),
            icon: a.type === 'maintenance' ? ExclamationTriangleIcon : InformationCircleIcon,
            bgColor: a.type === 'maintenance' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59,130,246,0.2)',
            iconColor: a.type === 'maintenance' ? '#f59e0b' : '#3b82f6',
            borderColor: a.type === 'maintenance' ? '#f59e0b' : '#3b82f6'
          }))
        });
      } else {
        setDashboardData(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate floating particles
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    color: `rgba(${Math.random() > 0.5 ? '168, 85, 247' : '59, 130, 246'}, ${Math.random() * 0.3 + 0.1})`,
    duration: Math.random() * 20 + 10
  }));

  if (loading) {
    return (
      <DashboardContainer>
        <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ 
              width: 60, 
              height: 60, 
              border: '4px solid rgba(168, 85, 247, 0.2)',
              borderTop: '4px solid #a855f7',
              borderRadius: '50%'
            }}
          />
        </Flex>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Floating Particles */}
      <FloatingParticles>
        {particles.map(particle => (
          <Particle
            key={particle.id}
            size={particle.size}
            color={particle.color}
            initial={{ x: `${particle.x}vw`, y: `${particle.y}vh` }}
            animate={{ 
              y: [`${particle.y}vh`, `${particle.y - 20}vh`, `${particle.y}vh`],
              x: [`${particle.x}vw`, `${particle.x + 10}vw`, `${particle.x}vw`]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`
            }}
          />
        ))}
      </FloatingParticles>

      {/* Header */}
      <Header>
        <HeaderContent>
          <HeaderFlex>
            <Logo
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <LogoIcon aria-label="CEG logo">
                <LogoImg src={cegLogo} alt="CEG" />
              </LogoIcon>
              <LogoText>
                <h1>Student Portal</h1>
                <p>CEG Digital Hostel</p>
              </LogoText>
            </Logo>
            
            <HeaderActions>
              <NotificationButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BellIcon />
                <NotificationBadge>3</NotificationBadge>
              </NotificationButton>
              
              <UserProfile
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar>
                  {user?.name?.charAt(0) || 'S'}
                </Avatar>
                <UserInfo>
                  <h3>{user?.name || 'Student'}</h3>
                  <p>{dashboardData?.room?.number ? `Room ${dashboardData.room.number}` : 'No allocation'}</p>
                </UserInfo>
              </UserProfile>
            </HeaderActions>
          </HeaderFlex>
        </HeaderContent>
      </Header>

      {/* Main Content */}
      <MainContent>
        <Container>
          {/* Welcome Section */}
          <WelcomeSection
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <WelcomeCard>
              <WelcomeHeader>
                <WelcomeLeft>
                  <WelcomeIcon>
                    <HeartIcon />
                  </WelcomeIcon>
                  <GradientText variant="purple" style={{ 
                    fontSize: theme.typography.fontSizes.sm, 
                    fontWeight: theme.typography.fontWeights.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    Personal Dashboard
                  </GradientText>
                </WelcomeLeft>
                
                <TimeInfo>
                  <p className="time">{formatTime(currentTime)}</p>
                  <p className="date">{formatDate(currentTime)}</p>
                </TimeInfo>
              </WelcomeHeader>
              
              <WelcomeTitle>
                Welcome Home! 🏠
              </WelcomeTitle>
              
              <WelcomeDescription>
                Your personalized student dashboard provides everything you need to manage your hostel life. 
                Check your room status, track payments, submit complaints, and stay updated with the latest 
                announcements - all designed to make your stay comfortable and convenient.
              </WelcomeDescription>
              
              <StatusIndicators>
                <StatusItem color="#10b981">
                  <div className="dot"></div>
                  <span>Room Services Active</span>
                </StatusItem>
                <StatusItem color="#3b82f6">
                  <div className="dot"></div>
                  <span>Account in Good Standing</span>
                </StatusItem>
                <StatusItem color={dashboardData?.stats?.complaintsOpen > 0 ? '#f59e0b' : '#10b981'}>
                  <div className="dot"></div>
                  <span>{dashboardData?.stats?.complaintsOpen > 0 ? 'Pending Issues' : 'All Good'}</span>
                </StatusItem>
              </StatusIndicators>
            </WelcomeCard>
          </WelcomeSection>

          {/* Dashboard Grid */}
          <DashboardGrid>
            <MainDashboard>
              {/* Quick Stats */}
              <QuickStatsGrid>
                <QuickStatCard
                  gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <QuickStatHeader>
                    <QuickStatIcon gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)">
                      <CreditCardIcon />
                    </QuickStatIcon>
                  </QuickStatHeader>
                  <QuickStatContent>
                    <h3>Dues Amount</h3>
                    <div className="value">₹{dashboardData?.stats?.duesAmount?.toLocaleString() || '0'}</div>
                  </QuickStatContent>
                </QuickStatCard>

                <QuickStatCard
                  gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ y: -4 }}
                >
                  <QuickStatHeader>
                    <QuickStatIcon gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                      <ExclamationTriangleIcon />
                    </QuickStatIcon>
                  </QuickStatHeader>
                  <QuickStatContent>
                    <h3>Open Issues</h3>
                    <div className="value">{dashboardData?.stats?.complaintsOpen || '0'}</div>
                  </QuickStatContent>
                </QuickStatCard>

                <QuickStatCard
                  gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  whileHover={{ y: -4 }}
                >
                  <QuickStatHeader>
                    <QuickStatIcon gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                      <CreditCardIcon />
                    </QuickStatIcon>
                  </QuickStatHeader>
                  <QuickStatContent>
                    <h3>Mess Balance</h3>
                    <div className="value">₹{dashboardData?.stats?.messBalance?.toLocaleString() || '0'}</div>
                  </QuickStatContent>
                </QuickStatCard>

                <QuickStatCard
                  gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ y: -4 }}
                >
                  <QuickStatHeader>
                    <QuickStatIcon gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)">
                      <CheckCircleIcon />
                    </QuickStatIcon>
                  </QuickStatHeader>
                  <QuickStatContent>
                    <h3>Attendance</h3>
                    <div className="value">{dashboardData?.stats?.attendanceRate || '0'}%</div>
                  </QuickStatContent>
                </QuickStatCard>
              </QuickStatsGrid>

              {/* My Room Section */}
              <MyRoomSection
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <h3>
                  <HomeIcon />
                  My Room Details
                </h3>
                
                <RoomDetails>
                  <RoomInfo>
                    <p className="label">Room Number</p>
                    <h4 className="value">{dashboardData?.room?.number || '—'}</h4>
                  </RoomInfo>
                  
                  <RoomInfo>
                    <p className="label">Block & Floor</p>
                    <h4 className="value">{dashboardData?.room ? `${dashboardData.room.block}, ${dashboardData.room.floor}` : '—'}</h4>
                  </RoomInfo>
                  
                  <RoomInfo>
                    <p className="label">Roommates</p>
                    <h4 className="value">{dashboardData?.room?.roommates ?? 0} Others</h4>
                  </RoomInfo>
                  
                  <RoomInfo>
                    <p className="label">Rent Status</p>
                    <h4 className="value" style={{ color: dashboardData?.stats?.duesAmount > 0 ? '#f59e0b' : '#10b981' }}>
                      {dashboardData?.stats?.duesAmount > 0 ? 'Due' : 'Paid'}
                    </h4>
                  </RoomInfo>
                </RoomDetails>

                <ServicesStatus>
                  <h4 style={{ 
                    color: 'white',
                    fontSize: theme.typography.fontSizes.lg,
                    fontWeight: theme.typography.fontWeights.semibold,
                    margin: `0 0 ${theme.spacing.lg} 0`
                  }}>
                    Room Services Status
                  </h4>
                  
                  <ServicesGrid>
                    <ServiceItem>
                      <ServiceIcon active={dashboardData?.room?.services?.wifi}>
                        <WifiIcon />
                      </ServiceIcon>
                      <ServiceLabel>WiFi</ServiceLabel>
                      <ServiceStatus active={dashboardData?.room?.services?.wifi}>
                        {dashboardData?.room?.services?.wifi ? 'Active' : 'Down'}
                      </ServiceStatus>
                    </ServiceItem>
                    
                    <ServiceItem>
                      <ServiceIcon active={dashboardData?.room?.services?.electricity}>
                        <LightBulbIcon />
                      </ServiceIcon>
                      <ServiceLabel>Power</ServiceLabel>
                      <ServiceStatus active={dashboardData?.room?.services?.electricity}>
                        {dashboardData?.room?.services?.electricity ? 'Active' : 'Down'}
                      </ServiceStatus>
                    </ServiceItem>
                    
                    <ServiceItem>
                      <ServiceIcon active={dashboardData?.room?.services?.water}>
                        <FireIcon />
                      </ServiceIcon>
                      <ServiceLabel>Water</ServiceLabel>
                      <ServiceStatus active={dashboardData?.room?.services?.water}>
                        {dashboardData?.room?.services?.water ? 'Active' : 'Issue'}
                      </ServiceStatus>
                    </ServiceItem>
                    
                    <ServiceItem>
                      <ServiceIcon active={dashboardData?.room?.services?.ac}>
                        <CogIcon />
                      </ServiceIcon>
                      <ServiceLabel>AC</ServiceLabel>
                      <ServiceStatus active={dashboardData?.room?.services?.ac}>
                        {dashboardData?.room?.services?.ac ? 'Working' : 'Issue'}
                      </ServiceStatus>
                    </ServiceItem>
                  </ServicesGrid>
                </ServicesStatus>
              </MyRoomSection>
            </MainDashboard>

            {/* Sidebar */}
            <Sidebar>
              {/* Notifications */}
              <NotificationsCard
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <h3>
                  <BellIcon />
                  Recent Updates
                </h3>
                
                <NotificationsList>
                  {dashboardData?.notifications?.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      bgColor={notification.bgColor}
                      iconColor={notification.iconColor}
                      borderColor={notification.borderColor}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: -2 }}
                    >
                      <NotificationIcon 
                        bgColor={notification.bgColor} 
                        iconColor={notification.iconColor}
                      >
                        <notification.icon />
                      </NotificationIcon>
                      <NotificationContent>
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <p className="time">{notification.time}</p>
                      </NotificationContent>
                    </NotificationItem>
                  ))}
                </NotificationsList>
              </NotificationsCard>

              {/* Quick Actions */}
              <QuickActionsCard
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                <h3>
                  <SparklesIcon />
                  Quick Actions
                </h3>
                
                <ActionsGrid>
                  <ActionButton
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CreditCardIcon />
                    <span>Pay Fees</span>
                  </ActionButton>
                  
                  <ActionButton
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExclamationTriangleIcon />
                    <span>Report Issue</span>
                  </ActionButton>
                  
                  <ActionButton
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <DocumentTextIcon />
                    <span>View Bills</span>
                  </ActionButton>
                  
                  <ActionButton
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ChatBubbleLeftIcon />
                    <span>Contact</span>
                  </ActionButton>
                </ActionsGrid>
              </QuickActionsCard>
            </Sidebar>
          </DashboardGrid>
        </Container>
      </MainContent>
    </DashboardContainer>
  );
};

export default StudentDashboardStyled;
