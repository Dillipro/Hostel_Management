import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle, theme } from './styles/GlobalStyles'
import { useAuthStore } from './stores/useAuthStore'
import { Spinner } from './components/common/Spinner'
import ErrorBoundary from './components/common/ErrorBoundary'

// Lazy load styled components for better performance
const LandingPage = React.lazy(() => import('./pages/LandingPageStyled'))
const LoginPage = React.lazy(() => import('./pages/auth/LoginPageStyled'))
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'))
const PendingApproval = React.lazy(() => import('./pages/auth/PendingApproval'))
const VerifyOTPPage = React.lazy(() => import('./pages/auth/VerifyOTPPage'))
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'))

// Dashboard Components for different user types
const StudentDashboard = React.lazy(() => import('./pages/student/StudentDashboardStyled'))
const WardenDashboard = React.lazy(() => import('./pages/warden/WardenDashboard'))
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboardStyled'))
const CounselorDashboard = React.lazy(() => import('./pages/counselor/CounselorDashboard'))
const MessManagerDashboard = React.lazy(() => import('./pages/mess/MessManagerDashboard'))
const MaintenanceDashboard = React.lazy(() => import('./pages/maintenance/MaintenanceDashboard'))
const SecurityDashboard = React.lazy(() => import('./pages/security/SecurityDashboard'))
const AccountsDashboard = React.lazy(() => import('./pages/accounts/AccountsDashboard'))
const MedicalDashboard = React.lazy(() => import('./pages/medical/MedicalDashboard'))

// Layout Components
const PublicLayout = React.lazy(() => import('./layouts/PublicLayout'))
const DashboardLayout = React.lazy(() => import('./layouts/DashboardLayout'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-ceg-blue to-blue-600 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="text-center text-white"
    >
      <Spinner size="lg" className="mb-4" />
      <p className="text-lg font-medium">Loading...</p>
    </motion.div>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore()
  const approval = (user?.approvalStatus || user?.status || user?.accountStatus || '').toString().toLowerCase()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  // Students must be approved to access protected areas other than pending page
  if (user?.role === 'student' && approval && approval !== 'approved') {
    return <Navigate to="/pending-approval" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return children
}

// Role-based Dashboard Router
const DashboardRouter = () => {
  const { user } = useAuthStore()
  
  const dashboardComponents = {
    student: StudentDashboard,
    warden: WardenDashboard,
    admin: AdminDashboard,
    super_admin: AdminDashboard,
    counselor: CounselorDashboard,
    mess_manager: MessManagerDashboard,
    maintenance: MaintenanceDashboard,
    security: SecurityDashboard,
    accounts: AccountsDashboard,
    medical_officer: MedicalDashboard,
  }
  
  const DashboardComponent = dashboardComponents[user?.role]
  
  if (!DashboardComponent) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <DashboardComponent />
}

function App() {
  const { isAuthenticated, user, initializeAuth } = useAuthStore()
  
  // Initialize auth on app load
  React.useEffect(() => {
    initializeAuth()
  }, [initializeAuth])
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ErrorBoundary>
        <div className="App">
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicLayout>
                  <LandingPage />
                </PublicLayout>
              } />
              
              <Route path="/login" element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <PublicLayout>
                    <LoginPage />
                  </PublicLayout>
              } />
              
              <Route path="/register" element={
                isAuthenticated ? 
                  <Navigate to="/dashboard" replace /> : 
                  <PublicLayout>
                    <RegisterPage />
                  </PublicLayout>
              } />
              <Route path="/pending-approval" element={
                <PublicLayout>
                  <PendingApproval />
                </PublicLayout>
              } />
              
              <Route path="/verify-otp" element={
                <PublicLayout>
                  <VerifyOTPPage />
                </PublicLayout>
              } />
              
              <Route path="/forgot-password" element={
                <PublicLayout>
                  <ForgotPasswordPage />
                </PublicLayout>
              } />
              
              {/* Protected Dashboard Routes */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardRouter />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Student Routes */}
              <Route path="/student/*" element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="profile" element={<StudentDashboard />} />
                      <Route path="admission" element={<StudentDashboard />} />
                      <Route path="room-allocation" element={<StudentDashboard />} />
                      <Route path="payments" element={<StudentDashboard />} />
                      <Route path="complaints" element={<StudentDashboard />} />
                      <Route path="leave-requests" element={<StudentDashboard />} />
                      <Route path="mess" element={<StudentDashboard />} />
                      <Route path="documents" element={<StudentDashboard />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Warden Routes */}
              <Route path="/warden/*" element={
                <ProtectedRoute allowedRoles={['warden']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<WardenDashboard />} />
                      <Route path="students" element={<WardenDashboard />} />
                      <Route path="leave-approvals" element={<WardenDashboard />} />
                      <Route path="complaints" element={<WardenDashboard />} />
                      <Route path="announcements" element={<WardenDashboard />} />
                      <Route path="visitors" element={<WardenDashboard />} />
                      <Route path="reports" element={<WardenDashboard />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="hostels" element={<AdminDashboard />} />
                      <Route path="allocations" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminDashboard />} />
                      <Route path="payments" element={<AdminDashboard />} />
                      <Route path="reports" element={<AdminDashboard />} />
                      <Route path="system" element={<AdminDashboard />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Staff Routes */}
              <Route path="/staff/*" element={
                <ProtectedRoute allowedRoles={['counselor', 'mess_manager', 'maintenance', 'security', 'accounts', 'medical_officer']}>
                  <DashboardLayout>
                    <Routes>
                      <Route path="dashboard" element={<DashboardRouter />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              {/* Error Routes */}
              <Route path="/unauthorized" element={
                <PublicLayout>
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto"
                      >
                        <div className="text-6xl text-red-500 mb-4">🚫</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
                        <button
                          onClick={() => window.history.back()}
                          className="btn-primary"
                        >
                          Go Back
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </PublicLayout>
              } />
              
              {/* 404 Not Found */}
              <Route path="*" element={
                <PublicLayout>
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto"
                      >
                        <div className="text-6xl text-blue-500 mb-4">🏛️</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                        <button
                          onClick={() => window.location.href = '/'}
                          className="btn-primary"
                        >
                          Go Home
                        </button>
                      </motion.div>
                    </div>
                  </div>
                </PublicLayout>
              } />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </div>
    </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
