import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HeartIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BellIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const MedicalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const healthStats = [
    {
      title: 'Total Patients',
      value: '847',
      change: '+12%',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Today\'s Appointments',
      value: '23',
      change: '+5%',
      icon: CalendarDaysIcon,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Emergency Cases',
      value: '3',
      change: '-2%',
      icon: ExclamationTriangleIcon,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50'
    },
    {
      title: 'Health Checkups',
      value: '156',
      change: '+8%',
      icon: HeartIcon,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50'
    }
  ]

  const recentPatients = [
    { id: 1, name: 'John Doe', room: 'A-101', condition: 'Fever', status: 'Stable', priority: 'low' },
    { id: 2, name: 'Jane Smith', room: 'B-205', condition: 'Headache', status: 'Under Observation', priority: 'medium' },
    { id: 3, name: 'Mike Johnson', room: 'C-302', condition: 'Injury', status: 'Critical', priority: 'high' },
    { id: 4, name: 'Sarah Wilson', room: 'A-157', condition: 'Checkup', status: 'Completed', priority: 'low' }
  ]

  const upcomingAppointments = [
    { time: '09:00 AM', patient: 'Alex Brown', type: 'Routine Checkup' },
    { time: '10:30 AM', patient: 'Emily Davis', type: 'Follow-up' },
    { time: '02:00 PM', patient: 'Robert Lee', type: 'Emergency' },
    { time: '03:30 PM', patient: 'Lisa Garcia', type: 'Consultation' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <HeartIcon className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Medical Dashboard 🏥
                  </h1>
                  <p className="text-gray-600 text-sm font-semibold">Healthcare Management & Patient Monitoring</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm"
              >
                <PlusIcon className="w-4 h-4 inline mr-1" />
                New Patient
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-white/50 backdrop-blur-lg p-2 rounded-xl shadow-lg border border-white/20"
              >
                <BellIcon className="w-5 h-5 text-purple-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      >
        {healthStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * (index + 1) }}
            whileHover={{ scale: 1.03, y: -3 }}
            className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-5 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.change.startsWith('+') 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
            <p className="text-gray-600 font-medium text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-5 border border-white/20"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md flex items-center justify-center">
                <UserGroupIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Recent Patients 👥</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {recentPatients.map((patient, index) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-3 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                  patient.priority === 'high' 
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:border-red-300'
                    : patient.priority === 'medium'
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      patient.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : patient.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{patient.name}</h3>
                      <p className="text-xs text-gray-600">Room: {patient.room} • {patient.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      patient.status === 'Critical' ? 'bg-red-100 text-red-700'
                      : patient.status === 'Under Observation' ? 'bg-yellow-100 text-yellow-700'
                      : patient.status === 'Stable' ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Appointments & Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Upcoming Appointments */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-5 border border-white/20">
            <div className="flex items-center space-x-2 mb-5">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-md flex items-center justify-center">
                <CalendarDaysIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Today's Schedule 📅</h2>
            </div>
            
            <div className="space-y-3">
              {upcomingAppointments.map((appointment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-3 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors"
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-700 text-sm">{appointment.time}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        appointment.type === 'Emergency' ? 'bg-red-100 text-red-700'
                        : appointment.type === 'Follow-up' ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                      }`}>
                        {appointment.type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium">{appointment.patient}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg p-5 border border-white/20">
            <div className="flex items-center space-x-2 mb-5">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Quick Actions ⚡</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: DocumentTextIcon, label: 'Medical Records', color: 'from-blue-500 to-cyan-500' },
                { icon: ShieldCheckIcon, label: 'Health Reports', color: 'from-green-500 to-emerald-500' },
                { icon: ClockIcon, label: 'Schedule', color: 'from-purple-500 to-pink-500' },
                { icon: HeartIcon, label: 'Vitals', color: 'from-red-500 to-orange-500' }
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`p-3 bg-gradient-to-r ${action.color} rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  <action.icon className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MedicalDashboard
