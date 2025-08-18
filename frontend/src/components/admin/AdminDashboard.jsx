import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaBuilding, FaBed, FaExclamationTriangle, 
  FaMoneyBillWave, FaQrcode, FaChartLine, FaBell,
  FaUserCog, FaTasks, FaCog, FaShieldAlt, FaSync,
  FaHome, FaUtensils, FaWifi, FaLightbulb
} from 'react-icons/fa';
import { useAuthStore } from '../../stores/useAuthStore';
import StatCard from './StatCard';
import RealtimeChart from './RealtimeChart';
import IoTMonitor from './IoTMonitor';

const AdminDashboard = () => {
  const { user, logout } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/hostel-management/dashboard?timeRange=${selectedTimeRange}`, {
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

  const runAllocationAlgorithm = async () => {
    try {
      const response = await fetch('/api/hostel-management/run-allocation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert(`Allocation completed! ${data.allocatedStudents} students allocated.`);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error running allocation:', error);
      alert('Error running allocation algorithm');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-4 px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                CEG Hostel Management System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh"
              >
                <FaSync size={16} />
              </button>
              <div className="flex items-center space-x-3">
                <FaUserCog className="text-gray-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500">System Administrator</p>
                </div>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaShieldAlt size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runAllocationAlgorithm}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaTasks className="mr-2" />
              Run Room Allocation
            </button>
            <button
              onClick={() => window.location.href = '/admin/students'}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaUsers className="mr-2" />
              Manage Students
            </button>
            <button
              onClick={() => window.location.href = '/admin/hostels'}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FaBuilding className="mr-2" />
              Manage Hostels
            </button>
            <button
              onClick={() => window.location.href = '/admin/iot-devices'}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FaQrcode className="mr-2" />
              IoT Devices
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={dashboardData?.stats?.totalStudents || 0}
            subtitle="Registered students"
            icon={<FaUsers />}
            color="blue"
            change={dashboardData?.stats?.studentGrowth}
          />
          
          <StatCard
            title="Total Rooms"
            value={dashboardData?.stats?.totalRooms || 0}
            subtitle={`${dashboardData?.stats?.occupiedRooms || 0} occupied`}
            icon={<FaBed />}
            color="green"
            percentage={((dashboardData?.stats?.occupiedRooms || 0) / (dashboardData?.stats?.totalRooms || 1) * 100).toFixed(1)}
          />
          
          <StatCard
            title="Active Complaints"
            value={dashboardData?.stats?.activeComplaints || 0}
            subtitle={`${dashboardData?.stats?.highPriorityComplaints || 0} high priority`}
            icon={<FaExclamationTriangle />}
            color="red"
            urgent={dashboardData?.stats?.highPriorityComplaints > 0}
          />
          
          <StatCard
            title="Revenue (Month)"
            value={`₹${dashboardData?.stats?.monthlyRevenue || 0}`}
            subtitle={`${dashboardData?.stats?.pendingPayments || 0} pending payments`}
            icon={<FaMoneyBillWave />}
            color="yellow"
            change={dashboardData?.stats?.revenueGrowth}
          />
        </div>

        {/* IoT Monitoring */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <IoTMonitor 
            devices={dashboardData?.iotDevices || []}
            accessLogs={dashboardData?.recentAccess || []}
          />
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaChartLine className="mr-2 text-blue-600" />
              Access Analytics
            </h3>
            <RealtimeChart 
              data={dashboardData?.accessAnalytics || []}
              timeRange={selectedTimeRange}
            />
          </div>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaHome className="mr-2 text-green-600" />
              Hostel Status
            </h3>
            <div className="space-y-4">
              {dashboardData?.hostelStatus?.map((hostel, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{hostel.name}</div>
                    <div className="text-sm text-gray-600">{hostel.occupancy}% occupied</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    hostel.status === 'operational' ? 'bg-green-500' :
                    hostel.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUtensils className="mr-2 text-purple-600" />
              Mess Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Today's Attendance</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.messAnalytics?.todayAttendance || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Rating</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.messAnalytics?.averageRating || 0}/5
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Subscribers</span>
                <span className="font-semibold text-gray-900">
                  {dashboardData?.messAnalytics?.activeSubscribers || 0}
                </span>
              </div>
              <div className="pt-2">
                <div className="text-sm text-gray-600 mb-2">Weekly Trend</div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${dashboardData?.messAnalytics?.weeklyTrend || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaWifi className="mr-2 text-cyan-600" />
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaLightbulb className="text-yellow-500 mr-2" />
                  <span className="text-gray-600">IoT Devices</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dashboardData?.systemHealth?.iotDevices === 'healthy' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardData?.systemHealth?.iotDevices || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaShieldAlt className="text-blue-500 mr-2" />
                  <span className="text-gray-600">Security</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dashboardData?.systemHealth?.security === 'secure' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {dashboardData?.systemHealth?.security || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-green-500 mr-2" />
                  <span className="text-gray-600">Payment Gateway</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  dashboardData?.systemHealth?.paymentGateway === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dashboardData?.systemHealth?.paymentGateway || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaBell className="mr-2 text-orange-600" />
              Recent Complaints
            </h3>
            <div className="space-y-3">
              {(dashboardData?.recentComplaints || []).slice(0, 5).map((complaint, index) => (
                <motion.div
                  key={complaint._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      complaint.priority === 'high' ? 'bg-red-500' :
                      complaint.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {complaint.category} - {complaint.location}
                      </div>
                      <div className="text-xs text-gray-600">
                        {complaint.student?.name} • {new Date(complaint.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">
                    View
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCog className="mr-2 text-gray-600" />
              System Logs
            </h3>
            <div className="space-y-3">
              {(dashboardData?.systemLogs || []).slice(0, 5).map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {log.action}
                    </div>
                    <div className="text-xs text-gray-600">
                      {log.user} • {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.level === 'error' ? 'bg-red-100 text-red-800' :
                    log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.level}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
