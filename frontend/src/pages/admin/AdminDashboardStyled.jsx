import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CubeIcon,
  CalendarDaysIcon,
  SparklesIcon,
  StarIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { theme, Container, Flex, Grid, GlassCard, GradientText, AnimatedButton } from '../../styles/GlobalStyles';
import cegLogo from '../../assets/CEG_logo.png';
import { useAuthStore } from '../../stores/useAuthStore';
import axios from 'axios';

// Advanced Styled Components
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: 
    radial-gradient(ellipse at top, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
    linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  position: relative;
  overflow-x: hidden;
`;

const AnimatedGrid = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
  animation: gridMove 20s linear infinite;
  
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(30px);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
`;

const HeaderContent = styled(Container)`
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    padding: ${theme.spacing.md};
  }
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
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
    background: linear-gradient(135deg, #667eea, #764ba2);
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
    background: linear-gradient(135deg, #ffffff 0%, #667eea 100%);
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
    border-color: rgba(99, 102, 241, 0.5);
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
    border-color: rgba(99, 102, 241, 0.3);
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeights.bold};
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
    rgba(99, 102, 241, 0.1) 0%, 
    rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  padding: ${theme.spacing['3xl']};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      #667eea 50%, 
      transparent 100%);
  }
`;

const WelcomeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
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

const WelcomeTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: ${theme.typography.fontWeights.black};
  background: linear-gradient(135deg, #ffffff 0%, #667eea 100%);
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
  max-width: 800px;
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

const StatsGrid = styled(Grid)`
  margin-bottom: ${theme.spacing['3xl']};
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`;

const StatCard = styled(motion.div)`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.03) 100%);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing['2xl']};
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
    transform: translateY(-8px);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const StatHeader = styled(Flex)`
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.lg};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.gradient || theme.colors.gradients.primary};
  border-radius: ${theme.borderRadius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.glow};
  
  svg {
    width: 24px;
    height: 24px;
    color: white;
  }
`;

const StatBadge = styled.div`
  background: ${props => props.bgColor || 'rgba(99, 102, 241, 0.2)'};
  color: ${props => props.textColor || '#667eea'};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSizes.xs};
  font-weight: ${theme.typography.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatContent = styled.div`
  h3 {
    color: rgba(255, 255, 255, 0.7);
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.semibold};
    margin: 0 0 ${theme.spacing.sm} 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .value {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
    font-weight: ${theme.typography.fontWeights.black};
    color: white;
    margin: 0 0 ${theme.spacing.sm} 0;
    line-height: 1;
  }
  
  .trend {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.xs};
    font-size: ${theme.typography.fontSizes.sm};
    color: ${props => props.trendColor || '#10b981'};
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ContentGrid = styled(Grid)`
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing['2xl']};
  margin-bottom: ${theme.spacing['3xl']};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const RecentActivity = styled(GlassCard)`
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
      color: #667eea;
    }
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const ActivityItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
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

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.bgColor || 'rgba(99, 102, 241, 0.2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.iconColor || '#667eea'};
  }
`;

const ActivityContent = styled.div`
  flex: 1;
  
  h4 {
    color: white;
    font-size: ${theme.typography.fontSizes.sm};
    font-weight: ${theme.typography.fontWeights.semibold};
    margin: 0 0 ${theme.spacing.xs} 0;
  }
  
  p {
    color: rgba(255, 255, 255, 0.6);
    font-size: ${theme.typography.fontSizes.sm};
    margin: 0 0 ${theme.spacing.xs} 0;
  }
  
  .time {
    color: rgba(255, 255, 255, 0.4);
    font-size: ${theme.typography.fontSizes.xs};
    margin: 0;
  }
`;

const QuickActions = styled(GlassCard)`
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
      color: #667eea;
    }
  }
`;

const ActionsGrid = styled(Grid)`
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};
`;

const ActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.05) 0%, 
    rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.xl};
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(99, 102, 241, 0.1) 0%, 
      rgba(168, 85, 247, 0.1) 100%);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateX(4px);
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #667eea;
  }
  
  .content {
    h4 {
      font-size: ${theme.typography.fontSizes.sm};
      font-weight: ${theme.typography.fontWeights.semibold};
      margin: 0 0 ${theme.spacing.xs} 0;
    }
    
    p {
      font-size: ${theme.typography.fontSizes.xs};
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }
  }
`;

const AdminDashboardStyled = () => {
  const { user, logout } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Build time window (last 30 days)
      const now = new Date();
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const params = { fromDate: from.toISOString(), toDate: now.toISOString() };

      // 1) Hostels overview (rooms occupancy)
      const hostelsRes = await axios.get('/api/hostel-management/hostels');
      const hostels = hostelsRes.data?.data || [];

      let totalRooms = 0;
      let occupiedRooms = 0;
      for (const h of hostels) {
        totalRooms += h.totalRooms || 0;
        occupiedRooms += h.occupiedRooms || 0;
      }

      // 2) Compute current students occupancy via blocks per hostel
      let totalStudents = 0;
      for (const h of hostels) {
        try {
          const blocksRes = await axios.get(`/api/hostel-management/hostels/${h._id}/blocks`);
          const blocks = blocksRes.data?.data || [];
          for (const b of blocks) {
            totalStudents += b?.roomStats?.currentOccupancy || 0;
          }
        } catch (e) {
          // ignore per-hostel failures to keep dashboard resilient
        }
      }

      // 3) Fees report (sum totals)
      let totalRevenue = 0;
      try {
        const feesRes = await axios.get('/api/reports/fees', { params });
        const rows = feesRes.data?.data || [];
        totalRevenue = rows.reduce((sum, r) => sum + (r.total || 0), 0);
      } catch (e) {}

      // 4) Complaints trends (pending-ish)
      let pendingComplaints = 0;
      try {
        const compRes = await axios.get('/api/reports/complaints', { params });
        const groups = compRes.data?.data || [];
        pendingComplaints = groups
          .filter(g => ['submitted', 'acknowledged', 'in_progress'].includes(g._id?.status))
          .reduce((sum, g) => sum + (g.count || 0), 0);
      } catch (e) {}

      setDashboardData({
        stats: {
          totalStudents,
          occupiedRooms,
          totalRooms,
          pendingComplaints,
          totalRevenue,
          activeStaff: 0,
        },
        recentActivities: [
          {
            id: 'fees',
            type: 'payment',
            title: 'Revenue Update',
            message: `₹${(totalRevenue / 100000).toFixed(2)}L collected in last 30 days`,
            time: 'Just now',
            icon: CreditCardIcon,
            bgColor: 'rgba(16, 185, 129, 0.2)',
            iconColor: '#10b981',
          },
          {
            id: 'complaints',
            type: 'complaint',
            title: 'Complaints Overview',
            message: `${pendingComplaints} complaints pending/in progress`,
            time: 'Just now',
            icon: ExclamationTriangleIcon,
            bgColor: 'rgba(245, 158, 11, 0.2)',
            iconColor: '#f59e0b',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
              border: '4px solid rgba(99, 102, 241, 0.2)',
              borderTop: '4px solid #667eea',
              borderRadius: '50%'
            }}
          />
        </Flex>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <AnimatedGrid />
      
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
                <h1>Admin Dashboard</h1>
                <p>CEG Digital Hostel Management</p>
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
                onClick={logout}
              >
                <Avatar>
                  {user?.name?.charAt(0) || 'A'}
                </Avatar>
                <UserInfo>
                  <h3>{user?.name || 'Administrator'}</h3>
                  <p>System Administrator</p>
                </UserInfo>
                <ArrowRightOnRectangleIcon style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }} />
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
                <WelcomeIcon>
                  <StarIcon />
                </WelcomeIcon>
                <GradientText variant="primary" style={{ 
                  fontSize: theme.typography.fontSizes.sm, 
                  fontWeight: theme.typography.fontWeights.semibold,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  System Overview
                </GradientText>
              </WelcomeHeader>
              
              <WelcomeTitle>
                Welcome back, Administrator! 🚀
              </WelcomeTitle>
              
              <WelcomeDescription>
                Manage your hostel operations with comprehensive insights, real-time monitoring, and advanced analytics. 
                Keep track of student accommodations, staff management, financial records, and facility maintenance all from 
                this powerful centralized dashboard designed for efficiency and clarity.
              </WelcomeDescription>
              
              <StatusIndicators>
                <StatusItem color="#10b981">
                  <div className="dot"></div>
                  <span>All Systems Operational</span>
                </StatusItem>
                <StatusItem color="#3b82f6">
                  <div className="dot"></div>
                  <span>Real-time Monitoring Active</span>
                </StatusItem>
                <StatusItem color="#f59e0b">
                  <div className="dot"></div>
                  <span>Last Updated: Just now</span>
                </StatusItem>
              </StatusIndicators>
            </WelcomeCard>
          </WelcomeSection>

          {/* Statistics Cards */}
          <StatsGrid>
            <StatCard
              gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8 }}
            >
              <StatHeader>
                <StatIcon gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)">
                  <UsersIcon />
                </StatIcon>
                <StatBadge bgColor="rgba(59, 130, 246, 0.2)" textColor="#3b82f6">
                  Active
                </StatBadge>
              </StatHeader>
              <StatContent>
                <h3>Total Students</h3>
                <div className="value">{dashboardData?.stats?.totalStudents?.toLocaleString() || '0'}</div>
                <div className="trend" style={{ color: '#10b981' }}>
                  <ArrowTrendingUpIcon />
                  +12% from last month
                </div>
              </StatContent>
            </StatCard>

            <StatCard
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -8 }}
            >
              <StatHeader>
                <StatIcon gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                  <BuildingOfficeIcon />
                </StatIcon>
                <StatBadge bgColor="rgba(16, 185, 129, 0.2)" textColor="#10b981">
                  {(() => {
                    const occ = dashboardData?.stats?.occupiedRooms || 0;
                    const tot = dashboardData?.stats?.totalRooms || 0;
                    if (!tot) return '0%';
                    const pct = Math.round((occ / tot) * 100);
                    return isNaN(pct) ? '0%' : `${pct}%`;
                  })()}
                </StatBadge>
              </StatHeader>
              <StatContent>
                <h3>Room Occupancy</h3>
                <div className="value">
                  {dashboardData?.stats?.occupiedRooms || 0}/{dashboardData?.stats?.totalRooms || 0}
                </div>
                <div className="trend" style={{ color: '#10b981' }}>
                  <ArrowTrendingUpIcon />
                  86% occupancy rate
                </div>
              </StatContent>
            </StatCard>

            <StatCard
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              whileHover={{ y: -8 }}
            >
              <StatHeader>
                <StatIcon gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                  <ExclamationTriangleIcon />
                </StatIcon>
                <StatBadge bgColor="rgba(245, 158, 11, 0.2)" textColor="#f59e0b">
                  Urgent
                </StatBadge>
              </StatHeader>
              <StatContent>
                <h3>Pending Issues</h3>
                <div className="value">{dashboardData?.stats?.pendingComplaints || 0}</div>
                <div className="trend" style={{ color: '#f59e0b' }}>
                  <ExclamationTriangleIcon style={{ width: 16, height: 16 }} />
                  5 high priority
                </div>
              </StatContent>
            </StatCard>

            <StatCard
              gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ y: -8 }}
            >
              <StatHeader>
                <StatIcon gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
                  <CreditCardIcon />
                </StatIcon>
                <StatBadge bgColor="rgba(139, 92, 246, 0.2)" textColor="#8b5cf6">
                  Monthly
                </StatBadge>
              </StatHeader>
              <StatContent>
                <h3>Total Revenue</h3>
                <div className="value">₹{(dashboardData?.stats?.totalRevenue / 100000).toFixed(1)}L</div>
                <div className="trend" style={{ color: '#10b981' }}>
                  <ArrowTrendingUpIcon />
                  +8.5% this month
                </div>
              </StatContent>
            </StatCard>
          </StatsGrid>

          {/* Content Grid */}
          <ContentGrid>
            {/* Recent Activities */}
            <RecentActivity
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <h3>
                <BellIcon />
                Recent Activities
              </h3>
              <ActivityList>
                {dashboardData?.recentActivities?.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                  >
                    <ActivityIcon 
                      bgColor={activity.bgColor} 
                      iconColor={activity.iconColor}
                    >
                      <activity.icon />
                    </ActivityIcon>
                    <ActivityContent>
                      <h4>{activity.title}</h4>
                      <p>{activity.message}</p>
                      <p className="time">{activity.time}</p>
                    </ActivityContent>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.4)'
                      }}
                    >
                      <EyeIcon style={{ width: 16, height: 16 }} />
                    </motion.button>
                  </ActivityItem>
                ))}
              </ActivityList>
            </RecentActivity>

            {/* Quick Actions */}
            <QuickActions
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <h3>
                <SparklesIcon />
                Quick Actions
              </h3>
              <ActionsGrid>
                <ActionButton
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UsersIcon />
                  <div className="content">
                    <h4>Manage Students</h4>
                    <p>Add, edit, or view student records</p>
                  </div>
                </ActionButton>
                
                <ActionButton
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <BuildingOfficeIcon />
                  <div className="content">
                    <h4>Room Allocation</h4>
                    <p>Assign and manage room allocations</p>
                  </div>
                </ActionButton>
                
                <ActionButton
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ClipboardDocumentListIcon />
                  <div className="content">
                    <h4>View Complaints</h4>
                    <p>Review and resolve student issues</p>
                  </div>
                </ActionButton>
                
                <ActionButton
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChartBarIcon />
                  <div className="content">
                    <h4>Analytics</h4>
                    <p>View detailed reports and insights</p>
                  </div>
                </ActionButton>
              </ActionsGrid>
            </QuickActions>
          </ContentGrid>
        </Container>
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminDashboardStyled;
