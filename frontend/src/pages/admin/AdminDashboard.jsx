import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  UsersIcon as UsersSolid,
  BuildingOfficeIcon as BuildingSolid,
  ExclamationTriangleIcon as ExclamationSolid
} from '@heroicons/react/24/solid'
import { useAuthStore } from '../../stores/useAuthStore'

const AdminDashboard = () => {
  const { user, logout } = useAuthStore()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setDashboardData({
        stats: {
          totalStudents: 1247,
          occupiedRooms: 387,
          totalRooms: 450,
          pendingComplaints: 23,
          totalRevenue: 2847500,
          activeStaff: 45
        },
        recentActivities: [
          { id: 1, type: 'complaint', message: 'New complaint from Block A-301', time: '2 mins ago' },
          { id: 2, type: 'payment', message: 'Fee payment received - ₹25,000', time: '5 mins ago' },
          { id: 3, type: 'admission', message: 'New student allocation completed', time: '12 mins ago' },
          { id: 4, type: 'maintenance', message: 'AC repair completed in Block B-205', time: '25 mins ago' }
        ],
        quickStats: [
          { label: 'Today\'s Check-ins', value: 12, change: '+8%' },
          { label: 'Pending Approvals', value: 7, change: '-15%' },
          { label: 'Maintenance Requests', value: 18, change: '+23%' },
          { label: 'Fee Collection', value: '₹1.2L', change: '+12%' }
        ]
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg font-medium">Loading Admin Dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              rotate: [0, 360, 0],
              opacity: [0.1, Math.random() * 0.3 + 0.1, 0.1]
            }}
            transition={{ 
              duration: Math.random() * 20 + 15, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
            className={`absolute ${
              i % 4 === 0 ? 'w-16 h-16 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full' :
              i % 4 === 1 ? 'w-12 h-12 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl' :
              i % 4 === 2 ? 'w-20 h-20 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-2xl' :
              'w-14 h-14 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-lg'
            } blur-sm`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-slate-800/30 backdrop-blur-2xl border-b border-slate-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheckIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <span className="text-sm text-slate-400 font-medium">
                  CEG Digital Hostel Management System
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-slate-700/50 backdrop-blur-sm rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-slate-700/70 border border-slate-600/30 transition-all duration-300"
                >
                  <BellIcon className="w-6 h-6" />
                </motion.button>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-slate-800/40 backdrop-blur-xl rounded-2xl px-4 py-3 border border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-white">{user?.name || 'Admin User'}</p>
                  <p className="text-slate-400">System Administrator</p>
                </div>
                <motion.button
                  onClick={logout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-2xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-yellow-400 mr-2" />
                <span className="text-cyan-300 text-sm font-semibold uppercase tracking-wider">
                  System Overview
                </span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                Welcome back, Administrator! 🚀
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                Manage your hostel operations with comprehensive insights, real-time monitoring, and advanced analytics. 
                Keep track of student accommodations, staff management, financial records, and facility maintenance all from one powerful dashboard.
              </p>
              
              <div className="flex items-center mt-6 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-semibold">All Systems Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300">Last updated: Just now</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Statistics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700/50 hover:border-blue-400/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UsersSolid className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-300 text-xs font-semibold bg-blue-500/20 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Total Students</h3>
            <p className="text-3xl font-black text-white mb-2">
              {dashboardData?.stats?.totalStudents?.toLocaleString() || '0'}
            </p>
            <p className="text-blue-300 text-sm flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              +12% from last month
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700/50 hover:border-green-400/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BuildingSolid className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-300 text-xs font-semibold bg-green-500/20 px-3 py-1 rounded-full">
                {Math.round((dashboardData?.stats?.occupiedRooms / dashboardData?.stats?.totalRooms) * 100)}%
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Room Occupancy</h3>
            <p className="text-3xl font-black text-white mb-2">
              {dashboardData?.stats?.occupiedRooms || 0}/{dashboardData?.stats?.totalRooms || 0}
            </p>
            <p className="text-green-300 text-sm flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              86% occupancy rate
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-r from-orange-600/20 to-red-600/20 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700/50 hover:border-orange-400/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ExclamationSolid className="h-6 w-6 text-white" />
              </div>
              <span className="text-orange-300 text-xs font-semibold bg-orange-500/20 px-3 py-1 rounded-full">
                Urgent
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Pending Issues</h3>
            <p className="text-3xl font-black text-white mb-2">
              {dashboardData?.stats?.pendingComplaints || 0}
            </p>
            <p className="text-orange-300 text-sm flex items-center">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              5 high priority
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700/50 hover:border-purple-400/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CreditCardIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-purple-300 text-xs font-semibold bg-purple-500/20 px-3 py-1 rounded-full">
                Monthly
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Total Revenue</h3>
            <p className="text-3xl font-black text-white mb-2">
              ₹{(dashboardData?.stats?.totalRevenue / 100000).toFixed(1)}L
            </p>
            <p className="text-purple-300 text-sm flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              +8.5% this month
            </p>
          </motion.div>
        </motion.div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-slate-800/30 backdrop-blur-2xl rounded-3xl p-6 border border-slate-700/50"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <SparklesIcon className="w-6 h-6 mr-2 text-cyan-400" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 backdrop-blur-sm rounded-xl p-4 text-left border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 group"
              >
                <UsersIcon className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold text-white mb-1">Manage Students</h4>
                <p className="text-sm text-slate-400">Add, edit, or view student records</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 backdrop-blur-sm rounded-xl p-4 text-left border border-green-500/20 hover:border-green-400/50 transition-all duration-300 group"
              >
                <BuildingOfficeIcon className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold text-white mb-1">Room Allocation</h4>
                <p className="text-sm text-slate-400">Assign and manage room allocations</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-orange-600/30 to-red-600/30 backdrop-blur-sm rounded-xl p-4 text-left border border-orange-500/20 hover:border-orange-400/50 transition-all duration-300 group"
              >
                <ClipboardDocumentListIcon className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold text-white mb-1">View Complaints</h4>
                <p className="text-sm text-slate-400">Review and resolve issues</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-xl p-4 text-left border border-purple-500/20 hover:border-purple-400/50 transition-all duration-300 group"
              >
                <ChartBarIcon className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-300" />
                <h4 className="font-semibold text-white mb-1">Analytics</h4>
                <p className="text-sm text-slate-400">View detailed reports and insights</p>
              </motion.button>
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-slate-800/30 backdrop-blur-2xl rounded-3xl p-6 border border-slate-700/50"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <BellIcon className="w-6 h-6 mr-2 text-cyan-400" />
              Recent Activities
            </h3>
            
            <div className="space-y-4">
              {dashboardData?.recentActivities?.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4 p-4 bg-slate-900/30 rounded-xl border border-slate-700/30"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'complaint' ? 'bg-red-500/20 text-red-400' :
                    activity.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                    activity.type === 'admission' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {activity.type === 'complaint' && <ExclamationTriangleIcon className="w-5 h-5" />}
                    {activity.type === 'payment' && <CreditCardIcon className="w-5 h-5" />}
                    {activity.type === 'admission' && <UserGroupIcon className="w-5 h-5" />}
                    {activity.type === 'maintenance' && <Cog6ToothIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.message}</p>
                    <p className="text-slate-400 text-sm">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {dashboardData?.quickStats?.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
            >
              <h4 className="text-slate-400 text-sm font-semibold mb-2">{stat.label}</h4>
              <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
              <p className={`text-sm flex items-center ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
                {stat.change}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}

export default AdminDashboardPage
