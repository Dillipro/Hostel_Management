import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AcademicCapIcon, ArrowLeftIcon, SparklesIcon, HeartIcon, ShieldCheckIcon, CubeTransparentIcon } from '@heroicons/react/24/outline'
import Login from '../../components/auth/Login'

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/3 w-24 h-24 bg-green-300/30 rounded-full blur-xl"
        />
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: [0, Math.random() * 150 - 75, 0],
              y: [0, Math.random() * 150 - 75, 0],
              rotate: [0, 360, 0],
              scale: [1, Math.random() * 0.5 + 0.5, 1],
              opacity: [0.1, Math.random() * 0.3 + 0.1, 0.1]
            }}
            transition={{ 
              duration: Math.random() * 20 + 15, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
            className={`absolute ${
              i % 5 === 0 ? 'w-20 h-20 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full' :
              i % 5 === 1 ? 'w-16 h-16 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl' :
              i % 5 === 2 ? 'w-24 h-24 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full' :
              i % 5 === 3 ? 'w-12 h-12 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-lg' :
              'w-18 h-18 bg-gradient-to-r from-indigo-400/10 to-violet-400/10 rounded-2xl'
            } blur-sm shadow-2xl`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            x: [0, -120, 0],
            y: [0, 120, 0],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-36 h-36 bg-blue-300/25 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-20 w-28 h-28 bg-orange-300/25 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Enhanced Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-purple-600/80 to-pink-600/80 backdrop-blur-sm" />
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center mb-8">
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-2xl flex items-center justify-center mr-4 shadow-2xl"
                >
                  <AcademicCapIcon className="h-10 w-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    CEG Digital Hostel
                  </h1>
                  <p className="text-cyan-200 font-semibold text-lg">Management System</p>
                </div>
              </div>
              
              <h2 className="text-5xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                Welcome back to your colorful hostel experience! 🌈
              </h2>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed font-medium">
                Dive into your personalized rainbow dashboard, manage your vibrant hostel services, 
                and stay connected with your amazing hostel community! ✨
              </p>
              
              <div className="space-y-6">
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">🔒 Secure IoT access control</span>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">🔔 Real-time colorful notifications</span>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-4"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold">💝 24/7 caring support available</span>
                </motion.div>
              </div>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mt-12 p-6 bg-gradient-to-r from-yellow-300/20 to-orange-300/20 backdrop-blur-md rounded-2xl border border-white/20"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <SparklesIcon className="w-6 h-6 text-yellow-300" />
                  <span className="text-lg font-bold text-yellow-200">Fun Fact!</span>
                </div>
                <p className="text-white/90 font-medium">
                  Over 10,000+ students have made their hostel life more colorful with our system! 🎨
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Colorful Login Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Mobile branding */}
              <div className="lg:hidden flex items-center justify-center mb-8">
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center mr-4 shadow-2xl"
                >
                  <AcademicCapIcon className="h-10 w-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    CEG Digital Hostel
                  </h1>
                  <p className="text-lg font-semibold text-gray-700">Management System</p>
                </div>
              </div>
              
              <div className="text-center mb-8">
                <motion.h2 
                  animate={{ 
                    background: [
                      "linear-gradient(45deg, #8B5CF6, #EC4899)",
                      "linear-gradient(45deg, #EC4899, #F59E0B)",
                      "linear-gradient(45deg, #F59E0B, #10B981)",
                      "linear-gradient(45deg, #10B981, #3B82F6)",
                      "linear-gradient(45deg, #3B82F6, #8B5CF6)"
                    ]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  Sign in to your account! 🎉
                </motion.h2>
                <p className="text-gray-700 text-lg font-semibold">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-pink-600 hover:to-red-600 font-bold transition-all duration-300 underline decoration-2 underline-offset-2"
                  >
                    Create one here! ✨
                  </Link>
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border-2 border-gradient-to-r from-purple-200 via-pink-200 to-red-200"
              >
                <Login />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center space-y-4"
              >
                <Link
                  to="/"
                  className="inline-flex items-center text-white hover:text-yellow-200 transition-colors group font-semibold text-lg bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/30"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-2 transition-transform duration-300" />
                  Back to colorful home 🏠
                </Link>
                
                <div className="flex justify-center space-x-6 mt-6">
                  {['🎨', '🌈', '✨', '💖', '🎉'].map((emoji, index) => (
                    <motion.div
                      key={index}
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.3,
                        ease: "easeInOut"
                      }}
                      className="text-2xl"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
