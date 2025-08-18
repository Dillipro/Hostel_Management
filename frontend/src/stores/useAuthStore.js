import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'
import { connectSocket, disconnectSocket } from '../utils/socket'
import toast from 'react-hot-toast'

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.withCredentials = true

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // User types mapping for better UX
      userTypeLabels: {
        student: 'Student',
        warden: 'Warden',
        admin: 'Administrator',
        super_admin: 'Super Administrator',
        counselor: 'Counselor',
        mess_manager: 'Mess Manager',
        maintenance: 'Maintenance Staff',
        security: 'Security Staff',
        accounts: 'Accounts Officer',
        medical_officer: 'Medical Officer',
      },
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Initialize auth from storage
      initializeAuth: async () => {
        const { accessToken } = get()
        if (accessToken) {
          try {
            // Set auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            
            // Verify token is still valid by making a test request
            await axios.get('/api/auth/profile')
            set({ isAuthenticated: true })
          } catch (error) {
            // Token is invalid, clear auth
            get().logout()
          }
        }
      },
      
      // Register new user
      register: async (userData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/auth/register', userData)
          
          if (response.data.status === 'success') {
            toast.success('Registration successful! Please verify your account with OTP.')
            return { success: true, data: response.data.data }
          }
          
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed'
          set({ error: message })
          toast.error(message)
          return { success: false, message }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Verify OTP
      verifyOTP: async (userId, otp) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/auth/verify-otp', { userId, otp })
          
          if (response.data.status === 'success') {
            const { user, tokens } = response.data.data
            
            // Set auth data
            set({
              user,
              accessToken: tokens.accessToken,
              isAuthenticated: true,
              isLoading: false
            })
            
            // Set auth header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`
            // Connect realtime socket
            connectSocket(tokens.accessToken)
            
            toast.success('Account verified successfully!')
            return { success: true, user }
          }
          
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'OTP verification failed'
          set({ error: message, isLoading: false })
          toast.error(message)
          return { success: false, message }
        }
      },
      
      // Login
      login: async (identifier, password, rememberMe = false) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/auth/login', {
            identifier,
            password,
            rememberMe
          })
          
          if (response.data.status === 'success') {
            const { user, accessToken } = response.data.data
            
            // Set auth data
            set({
              user,
              accessToken,
              isAuthenticated: true,
              isLoading: false
            })
            
            // Set auth header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            // Connect realtime socket
            connectSocket(accessToken)
            
            toast.success(`Welcome back, ${user.personalInfo.firstName}!`)
            return { success: true, user }
          }
          
          // Check if verification is required
          if (response.data.requiresVerification) {
            return { 
              success: false, 
              message: response.data.message, 
              requiresVerification: true,
              userId: identifier
            }
          }
          
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed'
          set({ error: message, isLoading: false })
          toast.error(message)
          return { success: false, message }
        }
      },
      
      // Refresh token
      refreshToken: async () => {
        try {
          const response = await axios.post('/api/auth/refresh-token')
          
          if (response.data.status === 'success') {
            const { accessToken } = response.data.data
            
            set({ accessToken })
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            
            return { success: true }
          }
          
          return { success: false }
        } catch (error) {
          // Refresh failed, logout user
          get().logout()
          return { success: false }
        }
      },
      
      // Logout
      logout: async (showToast = true) => {
        set({ isLoading: true })
        
        try {
          await axios.post('/api/auth/logout')
        } catch (error) {
          // Continue with logout even if request fails
        }
        
        // Clear auth data
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
        
  // Clear auth header
        delete axios.defaults.headers.common['Authorization']
  // Disconnect socket
  disconnectSocket()
        
        if (showToast) {
          toast.success('Logged out successfully')
        }
      },
      
      // Forgot password
      forgotPassword: async (identifier) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/auth/forgot-password', { identifier })
          
          if (response.data.status === 'success') {
            toast.success('Password reset instructions sent to your email/phone')
            return { success: true }
          }
          
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to send reset instructions'
          set({ error: message, isLoading: false })
          toast.error(message)
          return { success: false, message }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Reset password
      resetPassword: async (identifier, otp, newPassword) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.post('/api/auth/reset-password', {
            identifier,
            otp,
            newPassword
          })
          
          if (response.data.status === 'success') {
            toast.success('Password reset successfully! Please login with your new password.')
            return { success: true }
          }
          
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Password reset failed'
          set({ error: message, isLoading: false })
          toast.error(message)
          return { success: false, message }
        } finally {
          set({ isLoading: false })
        }
      },
      
      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await axios.put('/api/user/profile', profileData)
          
          if (response.data.status === 'success') {
            set({
              user: { ...get().user, ...response.data.data },
              isLoading: false
            })
            
            toast.success('Profile updated successfully')
            return { success: true, user: response.data.data }
          }
          
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Profile update failed'
          set({ error: message, isLoading: false })
          toast.error(message)
          return { success: false, message }
        }
      },
      
      // Get user role display name
      getRoleDisplayName: () => {
        const { user, userTypeLabels } = get()
        return user ? userTypeLabels[user.role] || user.role : 'Guest'
      },
      
      // Check if user has specific role
      hasRole: (roles) => {
        const { user } = get()
        if (!user) return false
        
        if (Array.isArray(roles)) {
          return roles.includes(user.role)
        }
        
        return user.role === roles
      },
      
      // Check if user has permission
      hasPermission: (module, action) => {
        const { user } = get()
        if (!user) return false
        
        // Super admin has all permissions
        if (user.role === 'super_admin') return true
        
        // Check user permissions
        const permissions = user.permissions || []
        const modulePermission = permissions.find(p => p.module === module)
        
        return modulePermission && modulePermission.actions.includes(action)
      },
      
      // Get dashboard route based on user role
      getDashboardRoute: () => {
        const { user } = get()
        if (!user) return '/login'
        
        const dashboardRoutes = {
          student: '/student/dashboard',
          warden: '/warden/dashboard',
          admin: '/admin/dashboard',
          super_admin: '/admin/dashboard',
          counselor: '/staff/dashboard',
          mess_manager: '/staff/dashboard',
          maintenance: '/staff/dashboard',
          security: '/staff/dashboard',
          accounts: '/staff/dashboard',
          medical_officer: '/staff/dashboard',
        }
        
        return dashboardRoutes[user.role] || '/dashboard'
      },
    }),
    {
      name: 'ceg-hostel-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Axios interceptors for handling auth
axios.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const { accessToken, refreshToken, logout } = useAuthStore.getState()
    
    if (error.response?.status === 401 && accessToken && !originalRequest._retry) {
      originalRequest._retry = true
      
      const refreshResult = await refreshToken()
      if (refreshResult.success) {
        return axios(originalRequest)
      } else {
        logout(false)
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export { useAuthStore }
