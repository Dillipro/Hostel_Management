import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'
import buildTheme from './theme'
import './styles.css'

// Public pages
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import AdmissionsInfo from './pages/AdmissionsInfo.jsx'
import FeesInfo from './pages/FeesInfo.jsx'
import Rules from './pages/Rules.jsx'
import Facilities from './pages/Facilities.jsx'
import Contact from './pages/Contact.jsx'
import CircularsPublic from './pages/CircularsPublic.jsx'

// Common components
import RequireRole from './components/RequireRole.jsx'
import StudentShell from './components/StudentShell.jsx'
import AdminShell from './components/AdminShell.jsx'
import WardenShell from './components/WardenShell.jsx'
import RCShell from './components/RCShell.jsx'

// Student pages
import StudentDashboard from './pages/student/components/Dashboard.jsx'
import StudentProfile from './pages/student/Profile.jsx'
import StudentApplications from './pages/student/Applications.jsx'
// import StudentAllotments from './pages/student/Allotments.jsx' // File doesn't exist
import StudentAppeals from './pages/student/Appeals.jsx'
import StudentComplaints from './pages/student/Complaints.jsx'
// import StudentPayments from './pages/student/Payments.jsx' // File doesn't exist
import StudentAttendance from './pages/student/Attendance.jsx'
import StudentCirculars from './pages/student/Circulars.jsx'

// RC pages
import RCDashboard from './pages/rc/Dashboard.jsx'
import RCStudents from './pages/rc/Students.jsx'
import RCApplications from './pages/rc/Applications.jsx'
import RCAppeals from './pages/rc/Appeals.jsx'
import RCComplaints from './pages/rc/Complaints.jsx'
import RCAttendance from './pages/rc/Attendance.jsx'
import RCNotices from './pages/rc/Notices.jsx'

// Warden pages
import WardenDashboard from './pages/warden/Dashboard.jsx'
import WardenStudents from './pages/warden/Students.jsx'
import WardenBlocks from './pages/warden/Blocks.jsx'
import WardenReallocations from './pages/warden/Reallocations.jsx'
import WardenComplaints from './pages/warden/Complaints.jsx'
import WardenApplications from './pages/warden/Applications.jsx'
import WardenFees from './pages/warden/Fees.jsx'
import WardenFeedback from './pages/warden/Feedback.jsx'
import WardenDiscipline from './pages/warden/Discipline.jsx'
import WardenCirculars from './pages/warden/Circulars.jsx'
import WardenReports from './pages/warden/Reports.jsx'
import WardenRCSupervision from './pages/warden/RCSupervision.jsx'
import WardenSecurity from './pages/warden/Security.jsx'

// Auth pages
import Login from './pages/auth/Login.jsx'
import Signup from './pages/auth/SignupNew.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminBlocks from './pages/admin/Blocks.jsx'
import AdminAllotments from './pages/admin/Allotments.jsx'
import AdminRounds from './pages/admin/Rounds.jsx'
import AdminPayments from './pages/admin/Payments.jsx'
import AdminRooms from './pages/admin/Rooms.jsx'
import AdminRoomPlanner from './pages/admin/RoomPlanner.jsx'
import AdminAppeals from './pages/admin/Appeals.jsx'
import AdminFinance from './pages/admin/Finance.jsx'
import AdminDocs from './pages/admin/Docs.jsx'
import AdminAnalytics from './pages/admin/Analytics.jsx'
import AdminUsers from './pages/admin/Users.jsx'
import AdminCirculars from './pages/admin/Circulars.jsx'
import AdminProfile from './pages/admin/Profile.jsx'

// Additional pages
import StudentHome from './pages/student/Home.jsx'
import StudentAdmission from './pages/student/Admission.jsx'
import StudentFees from './pages/student/Fees.jsx'
import StudentIDCard from './pages/student/IDCard.jsx'
import StudentNotices from './pages/student/Notices.jsx'
import RCSwaps from './pages/rc/Swaps.jsx'
import RCReports from './pages/rc/Reports.jsx'
import RCWorkOrders from './pages/rc/WorkOrders.jsx'
import RCAssets from './pages/rc/Assets.jsx'
import RCProfile from './pages/rc/Profile.jsx'

// theme moved to src/theme.js for central overrides

function useAuth() {
  const token = localStorage.getItem('access')
  return { token }
}

function RequireAuth({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function useThemeMode() {
  const [mode, setMode] = React.useState(() => localStorage.getItem('themeMode') || 'light')
  const theme = React.useMemo(() => buildTheme(mode), [mode])
  const toggle = React.useCallback(() => {
    setMode(m => { const next = m === 'light' ? 'dark' : 'light'; localStorage.setItem('themeMode', next); return next })
  }, [])
  React.useEffect(()=>{
    const onKey = (e)=>{
      if (e.key?.toLowerCase() === 'd' && e.shiftKey) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [toggle])
  return { mode, theme, toggle }
}

export const ThemeModeContext = React.createContext({ mode: 'light', toggle: () => {} })

function App() {
  const { mode, theme, toggle } = useThemeMode()
  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/admissions-info" element={<AdmissionsInfo />} />
          <Route path="/fees-info" element={<FeesInfo />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/circulars" element={<CircularsPublic />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<ForgotPassword />} />

          {/* Student area */}
          <Route path="/dashboard" element={<Navigate to="/student" replace />} />
          <Route path="/student" element={<RequireAuth><StudentShell /></RequireAuth>}>
            <Route index element={<StudentHome />} />
            <Route path="notices" element={<StudentNotices />} />
            <Route path="admission" element={<StudentAdmission />} />
            <Route path="complaints" element={<StudentComplaints />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="idcard" element={<StudentIDCard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="applications" element={<StudentApplications />} />
            <Route path="appeals" element={<StudentAppeals />} />
            <Route path="circulars" element={<StudentCirculars />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* RC area */}
          <Route path="/rc" element={<RequireRole allow={["rc","admin"]}><RCShell /></RequireRole>}>
            <Route index element={<RCDashboard />} />
            <Route path="students" element={<RCStudents />} />
            <Route path="attendance" element={<RCAttendance />} />
            <Route path="complaints" element={<RCComplaints />} />
            <Route path="applications" element={<RCApplications />} />
            <Route path="reports" element={<RCReports />} />
            <Route path="swaps" element={<RCSwaps />} />
            <Route path="notices" element={<RCNotices />} />
            <Route path="appeals" element={<RCAppeals />} />
            <Route path="workorders" element={<RCWorkOrders />} />
            <Route path="assets" element={<RCAssets />} />
            <Route path="profile" element={<RCProfile />} />
          </Route>

          {/* Warden area */}
          <Route path="/warden" element={<RequireRole allow={["warden"]}><WardenShell /></RequireRole>}>
            <Route index element={<WardenDashboard />} />
            <Route path="blocks" element={<WardenBlocks />} />
            <Route path="students" element={<WardenStudents />} />
            <Route path="reallocations" element={<WardenReallocations />} />
            <Route path="complaints" element={<WardenComplaints />} />
            <Route path="applications" element={<WardenApplications />} />
            <Route path="fees" element={<WardenFees />} />
            <Route path="feedback" element={<WardenFeedback />} />
            <Route path="discipline" element={<WardenDiscipline />} />
            <Route path="circulars" element={<WardenCirculars />} />
            <Route path="reports" element={<WardenReports />} />
            <Route path="rc-supervision" element={<WardenRCSupervision />} />
            <Route path="security" element={<WardenSecurity />} />
          </Route>

          {/* Admin area */}
          <Route path="/admin" element={<RequireRole allow={["admin"]}><AdminShell /></RequireRole>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="blocks" element={<AdminBlocks />} />
            <Route path="allotments" element={<AdminAllotments />} />
            <Route path="rounds" element={<AdminRounds />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="room-planner" element={<AdminRoomPlanner />} />
            <Route path="appeals" element={<AdminAppeals />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="circulars" element={<AdminCirculars />} />
            <Route path="docs" element={<AdminDocs />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
