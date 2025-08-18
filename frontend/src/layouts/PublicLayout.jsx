import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import styled from 'styled-components'
import { theme, Container } from '../styles/GlobalStyles'
import cegLogo from '../assets/CEG_logo.png'

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(ellipse at top, rgba(99,102,241,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, rgba(236,72,153,0.12) 0%, transparent 50%),
              linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #0a0a0a 100%);
`;

const TopBar = styled.header`
  position: sticky;
  top: 0; z-index: 10;
  background: rgba(10,10,10,0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.08);
`;

const BarInner = styled(Container)`
  height: 64px;
  display: flex; align-items: center; justify-content: space-between;
`;

const Brand = styled(Link)`
  display: flex; align-items: center; gap: ${theme.spacing.md}; text-decoration: none;
`;

const BrandText = styled.div`
  h1{ font-size: ${theme.typography.fontSizes.xl}; font-weight: ${theme.typography.fontWeights.bold}; margin: 0; color: #fff; }
  p{ font-size: ${theme.typography.fontSizes.xs}; color: rgba(255,255,255,0.6); margin: 0; }
`;

const NavLinks = styled.nav`
  display: none; gap: ${theme.spacing['2xl']}; align-items: center;
  @media (min-width: ${theme.breakpoints.md}) { display: flex; }
  a{ color: rgba(255,255,255,0.85); text-decoration: none; font-weight: ${theme.typography.fontWeights.medium}; }
  a:hover{ color: #fff; }
  .primary{ padding: 10px 16px; border-radius: ${theme.borderRadius.xl}; background: ${theme.colors.gradients.primary}; color: #fff; }
`;

const Main = styled.main`
  flex: 1;
`;

const Footer = styled.footer`
  background: rgba(255,255,255,0.04);
  border-top: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.85);
`;

const FooterInner = styled(Container)`
  padding: ${theme.spacing['2xl']} 0;
`;

const PublicLayout = ({ children }) => {
  return (
    <Wrapper>
      <TopBar>
        <BarInner>
          <Brand to="/">
            <img src={cegLogo} alt="CEG" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            <BrandText>
              <h1>CEG Hostel Connect</h1>
              <p>Anna University</p>
            </BrandText>
          </Brand>
          <NavLinks>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register" className="primary">Register</Link>
          </NavLinks>
        </BarInner>
      </TopBar>
      <Main>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </Main>
      <Footer>
        <FooterInner>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: theme.spacing['2xl'] }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
                <img src={cegLogo} alt="CEG" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                <div>
                  <h2 style={{ margin: 0 }}>CEG Hostel Connect</h2>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Digital Hostel Management System</p>
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: theme.spacing.md }}>
                Smart Digital Hostel Management System for College of Engineering, Guindy - Anna University.
                Streamlining hostel operations with modern technology.
              </p>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
                <p style={{ fontWeight: 600, marginBottom: 8 }}>Developed by Team-6:</p>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>• Dilli Babu R - 2023115086 (Database & Integration)</li>
                  <li>• Jothi Prakesh B - 2023115111 (Backend Development)</li>
                  <li>• Manoj Kumar K - 2023115314 (Frontend Development)</li>
                </ul>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: theme.spacing.md }}>Quick Links</h3>
              <ul style={{ display: 'grid', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                <li><Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link></li>
                <li><Link to="/login" style={{ color: 'rgba(255,255,255,0.7)' }}>Login</Link></li>
                <li><Link to="/register" style={{ color: 'rgba(255,255,255,0.7)' }}>Register</Link></li>
                <li><a href="https://ceg.annauniv.edu" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)' }}>CEG Campus</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ marginBottom: theme.spacing.md }}>Contact Info</h3>
              <div style={{ color: 'rgba(255,255,255,0.7)', display: 'grid', gap: 6 }}>
                <p style={{ margin: 0 }}>📧 echquery@yahoo.com</p>
                <p style={{ margin: 0 }}>📞 044-22352257</p>
                <p style={{ margin: 0 }}>📍 Engineering College Hostels<br />12, Sardar Patel Road<br />Anna University, Guindy<br />Chennai - 600025</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: theme.spacing['2xl'], paddingTop: theme.spacing['2xl'], display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>© 2025 CEG Hostel Management System. All rights reserved.</p>
            <div style={{ display: 'flex', gap: theme.spacing.lg }}>
              <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Privacy Policy</Link>
              <Link to="/terms" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Terms of Service</Link>
            </div>
          </div>
        </FooterInner>
      </Footer>
    </Wrapper>
  )
}

export default PublicLayout
