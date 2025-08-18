import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon, 
  ExclamationCircleIcon, 
  CreditCardIcon, 
  QrCodeIcon, 
  BellIcon, 
  ChartBarIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon, 
  WifiIcon, 
  ShieldCheckIcon, 
  CalendarDaysIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid, 
  CubeIcon as CubeSolid, 
  CreditCardIcon as CreditCardSolid 
} from '@heroicons/react/24/solid';
import { useAuthStore } from '../../stores/useAuthStore';
import DashboardCard from './DashboardCard';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import NotificationPanel from './NotificationPanel';

const StudentDashboard = () => {
  const { user, logout } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/student-portal/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      {/* Header */}
      <header className="relative z-50 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Student Portal
                </h1>
                <span className="text-sm text-blue-200 font-medium">
                  CEG Digital Hostel Management
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <NotificationPanel />
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-white">{dashboardData?.student?.name}</p>
                  <p className="text-blue-200">{dashboardData?.student?.regNo}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-blue-200 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
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
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl" />
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <StarIcon className="h-6 w-6 text-yellow-400 mr-2" />
                <span className="text-blue-200 text-sm font-medium">Dashboard Overview</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {dashboardData?.student?.name}! ✨
              </h2>
              <p className="text-blue-100 text-lg">
                {dashboardData?.accommodation 
                  ? `🏠 Your room: ${dashboardData.accommodation.blockName} - ${dashboardData.accommodation.roomNumber}`
                  : '⏳ Room allocation pending'
                }
              </p>
              
              {/* Status indicator */}
              <div className="flex items-center mt-4 space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm">System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <WifiIcon className="h-4 w-4 text-blue-300" />
                  <span className="text-blue-300 text-sm">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CreditCardSolid className="h-6 w-6 text-white" />
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                dashboardData?.feeStatus?.hostelFee?.paid && dashboardData?.feeStatus?.messFee?.paid 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {dashboardData?.feeStatus?.hostelFee?.paid && dashboardData?.feeStatus?.messFee?.paid ? 'Paid' : 'Pending'}
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">Fee Status</h3>
            <p className="text-2xl font-bold text-white">
              ₹{dashboardData?.feeStatus?.hostelFee?.amount + dashboardData?.feeStatus?.messFee?.amount || 0}
            </p>
            <p className="text-green-200 text-sm">Total hostel fees</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-blue-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CalendarDaysIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-blue-300 text-xs font-medium bg-blue-500/20 px-2 py-1 rounded-full">Active</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Active Leaves</h3>
            <p className="text-2xl font-bold text-white">{dashboardData?.activeLeaves?.length || 0}</p>
            <p className="text-blue-200 text-sm">Current applications</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ExclamationCircleIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-orange-300 text-xs font-medium bg-orange-500/20 px-2 py-1 rounded-full">Issues</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Complaints</h3>
            <p className="text-2xl font-bold text-white">{dashboardData?.recentComplaints?.length || 0}</p>
            <p className="text-orange-200 text-sm">Recent issues</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-purple-300 text-xs font-medium bg-purple-500/20 px-2 py-1 rounded-full">Avg</span>
            </div>
            <h3 className="text-white font-semibold mb-1">Mess Attendance</h3>
            <p className="text-2xl font-bold text-white">{dashboardData?.attendanceStats?.averageMessVisitsPerDay || 0}</p>
            <p className="text-purple-200 text-sm">Avg. visits/day</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
          <div>
            <RecentActivity activities={dashboardData?.recentComplaints || []} />
          </div>
        </div>

        {/* Accommodation Info */}
        {dashboardData?.accommodation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaHome className="mr-2 text-blue-600" />
              Accommodation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-600">Hostel</p>
                <p className="text-lg font-semibold text-blue-900">
                  {dashboardData.accommodation.hostelName}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600">Block</p>
                <p className="text-lg font-semibold text-green-900">
                  {dashboardData.accommodation.blockName}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-600">Room</p>
                <p className="text-lg font-semibold text-purple-900">
                  {dashboardData.accommodation.roomNumber}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-600">Floor</p>
                <p className="text-lg font-semibold text-orange-900">
                  {dashboardData.accommodation.floorNumber}
                </p>
              </div>
            </div>
            
            {/* Roommates */}
            {dashboardData.accommodation.roommates && dashboardData.accommodation.roommates.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Roommates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.accommodation.roommates.map((roommate, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {roommate.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{roommate.name}</p>
                        <p className="text-sm text-gray-500">{roommate.regNo} • {roommate.year} Year</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          Bed {roommate.bedNumber}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* QR Access Card */}
        {dashboardData?.accessCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaQrcode className="mr-2 text-green-600" />
              Digital Access Card
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <FaQrcode size={120} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    QR Code for access control
                  </p>
                  <button className="mt-2 text-blue-600 hover:text-blue-700 font-medium">
                    View Full Size
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaHome className="text-blue-600 mr-2" />
                    <span>Hostel Entry</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    dashboardData.accessCard.paymentLinked?.hostelFeePaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dashboardData.accessCard.paymentLinked?.hostelFeePaid ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaUtensils className="text-purple-600 mr-2" />
                    <span>Mess Entry</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    dashboardData.accessCard.paymentLinked?.messFeePaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dashboardData.accessCard.paymentLinked?.messFeePaid ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaShieldAlt className="text-green-600 mr-2" />
                    <span>Card Status</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    dashboardData.accessCard.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dashboardData.accessCard.isActive ? 'Valid' : 'Expired'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Announcements */}
        {dashboardData?.announcements && dashboardData.announcements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaBell className="mr-2 text-yellow-600" />
              Recent Announcements
            </h3>
            <div className="space-y-4">
              {dashboardData.announcements.map((announcement, index) => (
                <div key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <FaBell className="text-yellow-600" />
                    </div>
                    <div className="ml-3 w-full">
                      <p className="font-medium text-yellow-800">{announcement.title}</p>
                      <p className="text-yellow-700 text-sm mt-1">{announcement.message}</p>
                      <p className="text-yellow-600 text-xs mt-2">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
