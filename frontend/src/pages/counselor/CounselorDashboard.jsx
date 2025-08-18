import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  PhoneIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartSolid,
  UserGroupIcon as UserGroupSolid,
  CalendarDaysIcon as CalendarSolid,
  ExclamationTriangleIcon as ExclamationSolid
} from '@heroicons/react/24/solid'
import { useAuthStore } from '../../stores/useAuthStore'

const CounselorDashboard = () => {
  const { user, logout } = useAuthStore()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setDashboardData({
        stats: {
          totalSessions: 156,
          activeCases: 23,
          scheduledAppointments: 8,
          emergencyCases: 2,
          completedSessions: 134,
          studentSatisfaction: 94.5
        },
        recentSessions: [
          { id: 1, student: 'Anonymous Student #1', type: 'Academic Stress', status: 'completed', time: '2 hours ago' },
          { id: 2, student: 'Anonymous Student #2', type: 'Personal Issues', status: 'ongoing', time: '4 hours ago' },
          { id: 3, student: 'Anonymous Student #3', type: 'Career Guidance', status: 'scheduled', time: '1 day ago' },
          { id: 4, student: 'Anonymous Student #4', type: 'Mental Health', status: 'emergency', time: '2 days ago' }
        ],
        upcomingAppointments: [
          { time: '10:00 AM', student: 'Student A', type: 'Follow-up Session', duration: '45 mins' },
          { time: '11:30 AM', student: 'Student B', type: 'Career Counseling', duration: '60 mins' },
          { time: '02:00 PM', student: 'Student C', type: 'Academic Support', duration: '30 mins' },
          { time: '03:30 PM', student: 'Student D', type: 'Stress Management', duration: '45 mins' }
        ],
        weeklyStats: [
          { label: 'Sessions This Week', value: 18, change: '+12%' },
          { label: 'New Cases', value: 5, change: '+25%' },
          { label: 'Resolved Cases', value: 12, change: '+8%' },
          { label: 'Student Feedback', value: '4.8/5', change: '+5%' }
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
          <p className="text-white text-lg font-medium">Loading Counselor Dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
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
              i % 3 === 0 ? 'w-16 h-16 bg-gradient-to-r from-rose-400/10 to-pink-400/10 rounded-full' :
              i % 3 === 1 ? 'w-12 h-12 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-xl' :
              'w-14 h-14 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-2xl'
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
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <HeartSolid className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-rose-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  Counselor Dashboard
                </h1>
                <span className="text-sm text-slate-400 font-medium">
                  Student Mental Health & Support Services
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
                  className="p-3 bg-slate-700/50 backdrop-blur-sm rounded-xl text-slate-300 hover:text-rose-300 hover:bg-slate-700/70 border border-slate-600/30 transition-all duration-300"
                >
                  <BellIcon className="w-6 h-6" />
                </motion.button>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">2</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-slate-800/40 backdrop-blur-xl rounded-2xl px-4 py-3 border border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-r from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-white">{user?.name || 'Dr. Counselor'}</p>
                  <p className="text-slate-400">Student Counselor</p>
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
          <div className="relative overflow-hidden bg-gradient-to-r from-rose-600/20 to-indigo-600/20 backdrop-blur-2xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-indigo-500/5 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-yellow-400 mr-2" />
                <span className="text-rose-300 text-sm font-semibold uppercase tracking-wider">
                  Mental Health Support
                </span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                Supporting Student Well-being 🌟
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                Provide compassionate counseling services, mental health support, and guidance to help students navigate 
                academic and personal challenges. Create a safe space for growth, healing, and academic success through 
                professional counseling and support programs.
              </p>
              
              <div className="flex items-center mt-6 space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 font-semibold">Available for Consultations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartIcon className="w-4 h-4 text-rose-300" />
                  <span className="text-rose-300">Confidential & Professional</span>
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
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-300 text-xs font-semibold bg-blue-500/20 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Counseling Sessions</h3>
            <p className="text-3xl font-black text-white mb-2">
              {dashboardData?.stats?.totalSessions || 0}
            </p>
            <p className="text-blue-300 text-sm flex items-center">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              +15% this month
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700/50 hover:border-purple-400/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserGroupSolid className="h-6 w-6 text-white" />
              </div>
              <span className="text-purple-300 text-xs font-semibold bg-purple-500/20 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Active Cases</h3>
            <p className="text-3xl font-black text-white mb-2">
              {dashboardData?.stats?.activeCases || 0}
            </p>
            <p className="text-purple-300 text-sm flex items-center">
              <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
              Ongoing support
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700/50 hover:border-green-400/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CalendarSolid className="h-6 w-6 text-white" />
              </div>
              <span className="text-green-300 text-xs font-semibold bg-green-500/20 px-3 py-1 rounded-full">
                Today
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Scheduled Today</h3>
            <p className="text-3xl font-black text-white mb-2">
              {dashboardData?.stats?.scheduledAppointments || 0}
            </p>
            <p className="text-green-300 text-sm flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              Appointments
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-2xl rounded-2xl p-6 border border-slate-700/50 hover:border-red-400/50 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ExclamationSolid className="h-6 w-6 text-white" />
              </div>
              <span className="text-red-300 text-xs font-semibold bg-red-500/20 px-3 py-1 rounded-full">
                Priority
              </span>
            </div>
            <h3 className="text-slate-300 font-semibold mb-2">Emergency Cases</h3>
            <p className="text-3xl font-black text-white mb-2">
              {dashboardData?.stats?.emergencyCases || 0}
            </p>
            <p className="text-red-300 text-sm flex items-center">
              <PhoneIcon className="w-4 h-4 mr-1" />
              Immediate attention
            </p>
          </motion.div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2 bg-slate-800/30 backdrop-blur-2xl rounded-3xl p-6 border border-slate-700/50"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-cyan-400" />
              Recent Sessions
            </h3>
            
            <div className="space-y-4">
              {dashboardData?.recentSessions?.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-slate-900/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    session.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400' :
                    session.status === 'scheduled' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {session.status === 'completed' && <CheckCircleIcon className="w-5 h-5" />}
                    {session.status === 'ongoing' && <ChatBubbleLeftRightIcon className="w-5 h-5" />}
                    {session.status === 'scheduled' && <CalendarDaysIcon className="w-5 h-5" />}
                    {session.status === 'emergency' && <ExclamationTriangleIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white font-semibold">{session.student}</p>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        session.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        session.status === 'ongoing' ? 'bg-blue-500/20 text-blue-300' :
                        session.status === 'scheduled' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm mb-1">{session.type}</p>
                    <p className="text-slate-400 text-xs">{session.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Today's Appointments */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-slate-800/30 backdrop-blur-2xl rounded-3xl p-6 border border-slate-700/50"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <CalendarDaysIcon className="w-6 h-6 mr-2 text-cyan-400" />
              Today's Schedule
            </h3>
            
            <div className="space-y-4">
              {dashboardData?.upcomingAppointments?.map((appointment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-cyan-400 font-semibold text-sm">
                      {appointment.time}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                      {appointment.duration}
                    </span>
                  </div>
                  <h4 className="text-white font-medium mb-1">{appointment.student}</h4>
                  <p className="text-slate-300 text-sm">{appointment.type}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Weekly Stats & Contact Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {dashboardData?.weeklyStats?.map((stat, index) => (
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

          {/* Emergency & Contact Options */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-slate-800/30 backdrop-blur-2xl rounded-3xl p-6 border border-slate-700/50"
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaceSmileIcon className="w-6 h-6 mr-2 text-cyan-400" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 backdrop-blur-sm rounded-xl p-4 text-left border border-blue-500/20 hover:border-blue-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="w-6 h-6 text-blue-400" />
                  <div>
                    <h4 className="font-semibold text-white">Schedule Appointment</h4>
                    <p className="text-sm text-slate-400">Book a counseling session</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-red-600/30 to-orange-600/30 backdrop-blur-sm rounded-xl p-4 text-left border border-red-500/20 hover:border-red-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-6 h-6 text-red-400" />
                  <div>
                    <h4 className="font-semibold text-white">Emergency Support</h4>
                    <p className="text-sm text-slate-400">24/7 crisis intervention</p>
                  </div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 backdrop-blur-sm rounded-xl p-4 text-left border border-green-500/20 hover:border-green-400/50 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  <AcademicCapIcon className="w-6 h-6 text-green-400" />
                  <div>
                    <h4 className="font-semibold text-white">Academic Support</h4>
                    <p className="text-sm text-slate-400">Study skills & guidance</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default CounselorDashboard
