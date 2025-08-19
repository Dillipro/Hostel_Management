import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { theme, Container, Flex, GlassCard } from '../styles/GlobalStyles'
import { useAuthStore } from '../stores/useAuthStore'
import cegLogo from '../assets/CEG_logo.png'
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  WrenchIcon,
  ShieldCheckIcon,
  HeartIcon,
  CalendarDaysIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline'

const Shell = styled.div`
  height: 100vh;
  display: flex;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%);
`

const SidebarWrapper = styled.div`
  display: none;
  @media (min-width: ${theme.breakpoints.md}) {
    display: flex;
  }
`

const Sidebar = styled.aside`
  width: 260px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
`

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  text-decoration: none;
`

const BrandText = styled.div`
  h1 { font-size: ${theme.typography.fontSizes.lg}; font-weight: ${theme.typography.fontWeights.bold}; margin: 0; }
  p { font-size: ${theme.typography.fontSizes.xs}; color: rgba(255,255,255,0.6); margin: 0; }
`

const UserCard = styled(GlassCard)`
  background: rgba(255, 255, 255, 0.06);
  padding: ${theme.spacing.md};
  margin: 0 ${theme.spacing.lg};
`

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
`

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  color: ${props => props.active ? '#fff' : 'rgba(255,255,255,0.75)'};
  text-decoration: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'transparent'};
  border: 1px solid ${props => props.active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'};
  transition: all .25s ease;
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'rgba(255,255,255,0.06)'};
    border-color: rgba(255,255,255,0.15);
  }
  svg { width: 20px; height: 20px; color: ${props => props.active ? '#fff' : 'rgba(255,255,255,0.6)'}; }
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  height: 64px;
  display: flex;
  align-items: center;
  background: rgba(10,10,10,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
`

const HeaderInner = styled(Container)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const HeaderLeft = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.md};
`

const MobileToggle = styled.button`
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05); border-radius: ${theme.borderRadius.xl};
  color: rgba(255,255,255,0.8);
  @media (min-width: ${theme.breakpoints.md}) { display: none; }
`

const Title = styled.h1`
  font-size: ${theme.typography.fontSizes.xl};
  font-weight: ${theme.typography.fontWeights.semibold};
  margin: 0; color: #fff;
`

const HeaderActions = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.md};
`

const IconBtn = styled.button`
  width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: ${theme.borderRadius.xl}; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8);
  transition: all .2s; cursor: pointer;
  &:hover{ background: rgba(255,255,255,0.1); }
`

const UserName = styled.span`
  font-size: ${theme.typography.fontSizes.sm}; color: rgba(255,255,255,0.9);
`

const Content = styled.main`
  flex: 1; overflow-y: auto; padding: ${theme.spacing['2xl']} 0;
`

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, getRoleDisplayName } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
        roles: ['student', 'warden', 'admin', 'super_admin', 'counselor', 'mess_manager', 'maintenance', 'security', 'accounts', 'medical_officer']
      },
      {
        name: 'Profile',
        href: '/profile',
        icon: UserIcon,
        roles: ['student', 'warden', 'admin', 'super_admin', 'counselor', 'mess_manager', 'maintenance', 'security', 'accounts', 'medical_officer']
      }
    ]

    const roleSpecificItems = {
      student: [
        { name: 'Admission', href: '/student/admission', icon: ClipboardDocumentListIcon },
        { name: 'Room Allocation', href: '/student/room-allocation', icon: BuildingOfficeIcon },
        { name: 'Attendance', href: '/student/attendance', icon: CalendarDaysIcon },
        { name: 'Payments', href: '/student/payments', icon: CurrencyDollarIcon },
        { name: 'Requests', href: '/student/requests', icon: ClipboardDocumentListIcon },
        { name: 'Complaints', href: '/student/complaints', icon: WrenchIcon },
        { name: 'Mess', href: '/student/mess', icon: HeartIcon },
        { name: 'ID Card', href: '/student/id', icon: QrCodeIcon },
      ],
      warden: [
        { name: 'Students', href: '/warden/students', icon: UserGroupIcon },
        { name: 'Approvals', href: '/warden/approvals', icon: ClipboardDocumentListIcon },
        { name: 'Complaints', href: '/warden/complaints', icon: WrenchIcon },
        { name: 'Announcements', href: '/warden/announcements', icon: BellIcon },
        { name: 'Reports', href: '/warden/reports', icon: ClipboardDocumentListIcon },
      ],
      admin: [
        { name: 'Hostel Management', href: '/admin/hostels', icon: BuildingOfficeIcon },
        { name: 'Room Allocations', href: '/admin/allocations', icon: UserGroupIcon },
  { name: 'Mess Management', href: '/admin/mess', icon: HeartIcon },
  { name: 'Rooms', href: '/admin/rooms', icon: BuildingOfficeIcon },
        { name: 'User Management', href: '/admin/users', icon: UserIcon },
        { name: 'Payment Management', href: '/admin/payments', icon: CurrencyDollarIcon },
        { name: 'Reports & Analytics', href: '/admin/reports', icon: ClipboardDocumentListIcon },
        { name: 'System Settings', href: '/admin/system', icon: CogIcon },
      ],
      counselor: [
        { name: 'Students', href: '/counselor/students', icon: UserGroupIcon },
        { name: 'Appointments', href: '/counselor/appointments', icon: ClipboardDocumentListIcon },
        { name: 'Reports', href: '/counselor/reports', icon: ClipboardDocumentListIcon },
      ],
      mess_manager: [
        { name: 'Mess Management', href: '/mess/management', icon: HeartIcon },
        { name: 'Scanner', href: '/mess/scanner', icon: QrCodeIcon },
        { name: 'Menu Planning', href: '/mess/menu', icon: ClipboardDocumentListIcon },
        { name: 'Feedback', href: '/mess/feedback', icon: UserGroupIcon },
      ],
      maintenance: [
        { name: 'Work Orders', href: '/maintenance/work-orders', icon: WrenchIcon },
        { name: 'Inventory', href: '/maintenance/inventory', icon: ClipboardDocumentListIcon },
      ],
      security: [
        { name: 'Access Logs', href: '/security/access-logs', icon: ShieldCheckIcon },
        { name: 'Incidents', href: '/security/incidents', icon: ClipboardDocumentListIcon },
      ],
    }

    const userRole = user?.role
    if (userRole === 'super_admin') {
      return [...baseItems, ...roleSpecificItems.admin]
    }
    
    return [...baseItems, ...(roleSpecificItems[userRole] || [])]
  }

  const navigationItems = getNavigationItems()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <Shell>
      {/* Mobile sidebar */}
      <motion.div
        initial={false}
        animate={sidebarOpen ? { x: 0, opacity: 1 } : { x: '-100%', opacity: 0 }}
        transition={{ type: 'tween', duration: 0.25 }}
        style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'block' }}
      >
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        )}
        <motion.div
          style={{ position: 'relative', width: 280, height: '100%', background: 'rgba(15,15,15,0.96)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
          animate={sidebarOpen ? { x: 0 } : { x: -300 }}
        >
          <div style={{ position: 'absolute', top: 8, right: -48 }}>
            <IconBtn onClick={() => setSidebarOpen(false)}>
              <XMarkIcon style={{ width: 18, height: 18 }} />
            </IconBtn>
          </div>
          <SidebarContent navigationItems={navigationItems} user={user} getRoleDisplayName={getRoleDisplayName} isActivePath={isActivePath} />
        </motion.div>
      </motion.div>

      {/* Static sidebar */}
      <SidebarWrapper>
        <Sidebar>
          <SidebarContent navigationItems={navigationItems} user={user} getRoleDisplayName={getRoleDisplayName} isActivePath={isActivePath} />
        </Sidebar>
      </SidebarWrapper>

      {/* Main */}
      <Main>
        <Header>
          <HeaderInner>
            <HeaderLeft>
              <MobileToggle onClick={() => setSidebarOpen(true)}>
                <Bars3Icon style={{ width: 18, height: 18 }} />
              </MobileToggle>
              <img src={cegLogo} alt="CEG" style={{ width: 28, height: 28, objectFit: 'contain' }} />
              <Title>{getRoleDisplayName()} Dashboard</Title>
            </HeaderLeft>
            <HeaderActions>
              <IconBtn title="Notifications">
                <BellIcon style={{ width: 18, height: 18 }} />
              </IconBtn>
              <Flex align="center" gap={theme.spacing.md}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>{user?.personalInfo?.firstName?.charAt(0)?.toUpperCase()}</span>
                </div>
                <UserName>{user?.personalInfo?.firstName} {user?.personalInfo?.lastName}</UserName>
                <IconBtn onClick={handleLogout} title="Logout">
                  <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
                </IconBtn>
              </Flex>
            </HeaderActions>
          </HeaderInner>
        </Header>
        <Content>
          <Container>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              {children}
            </motion.div>
          </Container>
        </Content>
      </Main>
    </Shell>
  )
}

// Sidebar content component
const SidebarContent = ({ navigationItems, user, getRoleDisplayName, isActivePath }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
    <div style={{ paddingTop: 20, paddingBottom: 12 }}>
      <Brand to="/">
        <img src={cegLogo} alt="CEG" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        <BrandText>
          <h1>CEG Hostel</h1>
          <p>Anna University</p>
        </BrandText>
      </Brand>
      <div style={{ marginTop: 16 }}>
        <UserCard>
          <Flex align="center" gap={theme.spacing.md}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>{user?.personalInfo?.firstName?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.personalInfo?.firstName} {user?.personalInfo?.lastName}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{getRoleDisplayName()}</p>
            </div>
          </Flex>
        </UserCard>
      </div>
      <Nav>
        {navigationItems.map((item) => {
          const active = isActivePath(item.href)
          const Icon = item.icon
          return (
            <NavItem key={item.name} to={item.href} active={active}>
              <Icon />
              {item.name}
            </NavItem>
          )
        })}
      </Nav>
    </div>
  </div>
)

export default DashboardLayout
