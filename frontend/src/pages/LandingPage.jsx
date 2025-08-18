import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  CreditCardIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  AcademicCapIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  SparklesIcon,
  HeartIcon,
  FireIcon,
  CubeTransparentIcon,
  BoltIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 100])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  const features = [
    {
      icon: ShieldCheckIcon,
      title: '🔒 Advanced IoT Security & Access Control System',
      description: 'Revolutionary multi-layered security architecture featuring quantum-encrypted QR/RFID technology, advanced biometric authentication with facial recognition, real-time behavioral analysis, and comprehensive access monitoring with predictive threat detection',
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      bgGradient: 'from-cyan-50/80 via-blue-50/80 to-indigo-50/80',
      glowColor: 'shadow-blue-500/25'
    },
    {
      icon: CreditCardIcon,
      title: '💳 Intelligent Payment & Financial Management Hub',
      description: 'Next-generation integrated payment ecosystem with multi-currency support, AI-powered fraud detection, automated billing optimization, comprehensive financial analytics, and seamless integration with banking systems worldwide',
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      bgGradient: 'from-emerald-50/80 via-green-50/80 to-teal-50/80',
      glowColor: 'shadow-emerald-500/25'
    },
    {
      icon: ChartBarIcon,
      title: '📊 AI-Powered Analytics & Business Intelligence Platform',
      description: 'Sophisticated data visualization and predictive analytics engine with machine learning algorithms, real-time insights generation, comprehensive reporting suite, and intelligent decision-making support systems',
      gradient: 'from-purple-400 via-violet-500 to-indigo-600',
      bgGradient: 'from-purple-50/80 via-violet-50/80 to-indigo-50/80',
      glowColor: 'shadow-purple-500/25'
    },
    {
      icon: RocketLaunchIcon,
      title: '� Revolutionary Mobile Experience & Progressive Web App',
      description: 'Cutting-edge native mobile application with advanced offline synchronization, real-time push notifications, augmented reality features, voice commands, and seamless cross-platform compatibility',
      gradient: 'from-pink-400 via-rose-500 to-red-600',
      bgGradient: 'from-pink-50/80 via-rose-50/80 to-red-50/80',
      glowColor: 'shadow-pink-500/25'
    },
    {
      icon: BoltIcon,
      title: '⚡ 24/7 Intelligent Monitoring & Automated Response System',
      description: 'Enterprise-grade continuous system monitoring with AI-powered incident detection, automated response protocols, predictive maintenance alerts, and comprehensive performance optimization',
      gradient: 'from-orange-400 via-amber-500 to-yellow-600',
      bgGradient: 'from-orange-50/80 via-amber-50/80 to-yellow-50/80',
      glowColor: 'shadow-orange-500/25'
    },
    {
      icon: GlobeAltIcon,
      title: '� Comprehensive Student Portal & Academic Integration',
      description: 'All-in-one student services ecosystem with academic record integration, personalized learning paths, social networking features, career guidance tools, and seamless university system connectivity',
      gradient: 'from-indigo-400 via-blue-500 to-cyan-600',
      bgGradient: 'from-indigo-50/80 via-blue-50/80 to-cyan-50/80',
      glowColor: 'shadow-indigo-500/25'
    }
  ]

  const stats = [
    { 
      value: '2,500+', 
      label: 'Elite Students & Scholars �✨', 
      icon: AcademicCapIcon, 
      color: 'from-blue-500 via-cyan-500 to-teal-500',
      description: 'Top-tier academic institutions trust our platform'
    },
    { 
      value: '99.98%', 
      label: 'Enterprise-Grade System Uptime ⚡🛡️', 
      icon: CheckCircleIcon, 
      color: 'from-green-500 via-emerald-500 to-teal-500',
      description: 'Industry-leading reliability and performance'
    },
    { 
      value: '24/7/365', 
      label: 'Premium Support & Monitoring 🚀�', 
      icon: ClockIcon, 
      color: 'from-purple-500 via-violet-500 to-indigo-500',
      description: 'Round-the-clock expert assistance available'
    },
    { 
      value: '100%', 
      label: 'Military-Grade Security & Encryption 🔐🛡️', 
      icon: ShieldCheckIcon, 
      color: 'from-orange-500 via-red-500 to-pink-500',
      description: 'Bank-level security protocols implemented'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
      {/* Animated Cursor Following Effect */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Advanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Geometric Floating Elements */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`geo-${i}`}
            animate={{ 
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              rotate: [0, 360, 0],
              scale: [1, Math.random() * 0.5 + 0.5, 1],
              opacity: [0.1, Math.random() * 0.3 + 0.1, 0.1]
            }}
            transition={{ 
              duration: Math.random() * 20 + 20, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
            className={`absolute ${
              i % 6 === 0 ? 'w-16 h-16 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full' :
              i % 6 === 1 ? 'w-12 h-12 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-xl rotate-45' :
              i % 6 === 2 ? 'w-20 h-20 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full' :
              i % 6 === 3 ? 'w-8 h-8 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-lg' :
              i % 6 === 4 ? 'w-24 h-24 bg-gradient-to-r from-indigo-400/10 to-violet-400/10 rounded-2xl' :
              'w-14 h-14 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 rounded-full'
            } blur-sm shadow-2xl`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}

        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-purple-900/10"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/10 backdrop-blur-2xl border-b border-white/10 shadow-2xl">
        <div className="max-w-8xl mx-auto px-8 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <motion.div 
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <motion.div 
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="relative w-14 h-14 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25"
              >
                <AcademicCapIcon className="h-8 w-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-2xl opacity-75 blur-md -z-10"></div>
              </motion.div>
              <div className="relative">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  🏠 CEG Digital Hostel Elite
                </h1>
                <p className="text-sm text-cyan-300/90 font-semibold tracking-wider">
                  ✨ Next-Generation Management Ecosystem ✨
                </p>
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg blur-sm -z-10"></div>
              </div>
            </motion.div>
            
            <motion.div 
              className="hidden lg:flex items-center space-x-10"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
            >
              {[
                { name: 'Revolutionary Features 🚀', href: '#features' },
                { name: 'Enterprise Solutions �', href: '#enterprise' },
                { name: 'Technology Stack 🔧', href: '#tech' },
                { name: 'Success Stories 💫', href: '#success' },
                { name: 'Expert Support 📞', href: '#contact' }
              ].map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="relative text-white/90 font-semibold hover:text-cyan-300 transition-all duration-500 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 shadow-lg hover:shadow-cyan-500/25 text-sm group"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
            >
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 text-base overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>🎉 Launch Experience</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 blur-xl opacity-50 -z-10"></div>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Revolutionary Hero Section */}
      <section className="pt-40 pb-32 px-8 lg:px-12 relative">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10"
          style={{ y: y1 }}
        />
        
        <div className="max-w-8xl mx-auto relative">
          <motion.div
            className="text-center max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 backdrop-blur-xl border border-cyan-400/20 text-cyan-300 px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-2xl shadow-cyan-500/10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <StarIcon className="w-5 h-5" />
                </motion.div>
                <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  🚀 Revolutionary Next-Generation Hostel Management Ecosystem 🚀
                </span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 mb-8 leading-tight tracking-tight">
                Digital Hostel
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent relative">
                  Management
                  <motion.div 
                    className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-3xl -z-10"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
                <span className="block text-3xl md:text-5xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mt-4">
                  Intelligence Platform
                </span>
              </h1>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-5xl mx-auto font-medium">
                Transform your hostel operations with cutting-edge{' '}
                <span className="text-cyan-400 font-bold">IoT integration</span>,{' '}
                <span className="text-indigo-400 font-bold">AI-powered analytics</span>, and{' '}
                <span className="text-purple-400 font-bold">seamless digital experiences</span>{' '}
                designed for the future of modern educational institutions and student life management.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16"
              variants={itemVariants}
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/25 transform transition-all duration-500 flex items-center space-x-3 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <RocketLaunchIcon className="w-6 h-6" />
                    <span>🚀 Launch Free Enterprise Trial</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 blur-2xl opacity-50 -z-10"></div>
                </motion.button>
              </Link>
              
              <motion.button 
                className="flex items-center space-x-4 text-slate-300 hover:text-cyan-300 font-semibold text-lg transition-colors duration-500 group"
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative w-12 h-12 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full flex items-center justify-center border border-slate-600 group-hover:border-cyan-400/50 transition-all duration-500">
                  <PlayIcon className="w-5 h-5 ml-1 group-hover:text-cyan-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <span className="group-hover:text-cyan-300 transition-colors duration-300">
                  🎬 Watch Interactive Demo & Virtual Tour
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
          
          {/* Enhanced Stats Grid */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mt-20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="relative group"
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center hover:border-cyan-400/30 transition-all duration-500 relative overflow-hidden">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg relative`}>
                      <stat.icon className="w-6 h-6 text-white" />
                      <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} blur-lg opacity-50 -z-10`}></div>
                    </div>
                  </div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-300 text-sm font-semibold mb-2">{stat.label}</div>
                  <div className="text-slate-400 text-xs">{stat.description}</div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="py-32 relative" id="features">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/50"
          style={{ y: y2 }}
        />
        
        <div className="max-w-8xl mx-auto px-8 lg:px-12 relative">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-purple-400/20 text-purple-300 px-6 py-3 rounded-full text-sm font-bold mb-8">
              <LightBulbIcon className="w-5 h-5" />
              <span>Revolutionary Technology Stack</span>
            </div>
            
            <h2 className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 mb-8 leading-tight">
              Powerful Features &
              <span className="block bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Advanced Capabilities
              </span>
            </h2>
            
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-medium">
              Comprehensive suite of cutting-edge tools designed to revolutionize hostel operations, 
              enhance student experience, and provide actionable business intelligence insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`relative bg-slate-800/30 backdrop-blur-2xl rounded-3xl p-8 border border-slate-700/50 hover:border-slate-600/70 transition-all duration-700 group overflow-hidden ${feature.glowColor} hover:shadow-2xl`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-3xl`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl relative`}>
                    <feature.icon className="h-8 w-8 text-white" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} blur-xl opacity-50 -z-10`}></div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors duration-500">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-300 leading-relaxed mb-6 text-base group-hover:text-slate-200 transition-colors duration-500">
                    {feature.description}
                  </p>
                  
                  <motion.button 
                    className="flex items-center space-x-3 text-cyan-400 font-bold hover:text-cyan-300 transition-all duration-300 group-hover:space-x-4 text-base"
                    whileHover={{ x: 5 }}
                  >
                    <span>Explore Advanced Features</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </motion.button>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-xl opacity-50"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-lg opacity-30"></div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Featured Highlight */}
          <motion.div
            className="mt-24 relative bg-gradient-to-r from-slate-800/50 via-slate-900/50 to-slate-800/50 backdrop-blur-2xl rounded-4xl p-12 text-center border border-slate-700/30 overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
          >
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-indigo-500/5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-purple-600/10"></div>
            
            <div className="relative z-10 max-w-5xl mx-auto">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 backdrop-blur-xl border border-cyan-400/30 text-cyan-300 px-6 py-3 rounded-full text-sm font-bold mb-8"
              >
                <FireIcon className="w-5 h-5" />
                <span>Limited Time Enterprise Offer</span>
              </motion.div>
              
              <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 mb-6">
                Ready to Transform Your Institution?
              </h3>
              
              <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                Join over 2,500+ leading educational institutions worldwide already using our revolutionary platform 
                to enhance their hostel operations, boost student satisfaction, and drive operational excellence.
              </p>
              
              <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white px-10 py-5 rounded-2xl font-bold hover:shadow-2xl hover:shadow-cyan-500/25 transform transition-all duration-500 flex items-center space-x-3 group overflow-hidden text-lg"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <RocketLaunchIcon className="w-6 h-6" />
                      <span>🚀 Start Your Enterprise Trial</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </motion.button>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 text-slate-300 hover:text-cyan-300 font-semibold transition-colors duration-500 bg-slate-800/50 backdrop-blur-xl px-8 py-4 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 text-lg"
                >
                  <HeartIcon className="w-6 h-6" />
                  <span>💬 Schedule Expert Consultation</span>
                </motion.button>
              </div>
            </div>
            
            {/* Decorative floating elements */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-purple-900/20"></div>
        
        <div className="max-w-8xl mx-auto px-8 lg:px-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12 mb-16">
            <div className="xl:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <motion.div 
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl relative"
                >
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 blur-lg opacity-50 -z-10"></div>
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                    CEG Digital Hostel Elite
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Next-Generation Management Ecosystem
                  </p>
                </div>
              </div>
              
              <p className="text-slate-300 leading-relaxed text-lg mb-6 max-w-lg">
                Transforming hostel management through revolutionary technology, 
                artificial intelligence, and seamless digital experiences that 
                empower educational institutions worldwide.
              </p>
              
              <div className="flex items-center space-x-4">
                {[
                  { icon: '🌟', label: 'Premium Support' },
                  { icon: '🔒', label: 'Enterprise Security' },
                  { icon: '🚀', label: 'Continuous Innovation' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-slate-400">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-8 text-cyan-300">Enterprise Solutions</h4>
              <ul className="space-y-4 text-slate-300">
                {[
                  'Advanced Analytics & BI',
                  'Custom Integrations',
                  'Multi-Campus Management', 
                  'API & SDK Access',
                  'White-label Solutions',
                  'Dedicated Account Manager'
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      to="#" 
                      className="hover:text-cyan-300 transition-colors duration-300 flex items-center space-x-2"
                    >
                      <span className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></span>
                      <span>{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-xl font-bold mb-8 text-indigo-300">Support & Resources</h4>
              <ul className="space-y-4 text-slate-300">
                {[
                  'Comprehensive Documentation',
                  'Video Tutorials & Guides',
                  '24/7 Premium Support',
                  'Developer Community',
                  'Training & Certification',
                  'System Status & Updates'
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      to="#" 
                      className="hover:text-indigo-300 transition-colors duration-300 flex items-center space-x-2"
                    >
                      <span className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></span>
                      <span>{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700/50 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <p className="text-slate-400 mb-2 text-lg">
                  © 2025 CEG Digital Hostel Management Intelligence Platform. All rights reserved.
                </p>
                <p className="text-sm text-slate-500">
                  Developed with ❤️ by{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 font-bold">
                    Dilli Babu R, Jothi Prakesh B, Manoj Kumar K
                  </span>
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <ShieldExclamationIcon className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <CubeTransparentIcon className="w-4 h-4" />
                  <span>Terms of Service</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <GlobeAltIcon className="w-4 h-4" />
                  <span>Global Presence</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-2xl"></div>
      </footer>
    </div>
  )
}

export default LandingPage
