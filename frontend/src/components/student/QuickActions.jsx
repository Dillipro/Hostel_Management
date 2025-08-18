import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaQrcode, FaCreditCard, FaClipboardList, FaExclamationCircle,
  FaCalendarAlt, FaClipboard, FaMoneyBillWave, FaBell, FaFileAlt,
  FaUserEdit, FaWifi, FaKey, FaPhone
} from 'react-icons/fa';

const quickActions = [
  {
    id: 'qr-code',
    title: 'View QR Code',
    description: 'Access your digital room key',
    icon: <FaQrcode />,
    color: 'blue',
    action: 'view-qr'
  },
  {
    id: 'make-payment',
    title: 'Make Payment',
    description: 'Pay hostel and mess fees',
    icon: <FaCreditCard />,
    color: 'green',
    action: 'payment'
  },
  {
    id: 'apply-leave',
    title: 'Apply Leave',
    description: 'Submit leave application',
    icon: <FaCalendarAlt />,
    color: 'purple',
    action: 'leave'
  },
  {
    id: 'file-complaint',
    title: 'File Complaint',
    description: 'Report hostel issues',
    icon: <FaExclamationCircle />,
    color: 'red',
    action: 'complaint'
  },
  {
    id: 'mess-feedback',
    title: 'Mess Feedback',
    description: 'Rate today\'s meals',
    icon: <FaClipboard />,
    color: 'orange',
    action: 'feedback'
  },
  {
    id: 'guest-request',
    title: 'Guest Request',
    description: 'Register visitor entry',
    icon: <FaUserEdit />,
    color: 'indigo',
    action: 'guest'
  },
  {
    id: 'wifi-request',
    title: 'WiFi Issues',
    description: 'Report connectivity problems',
    icon: <FaWifi />,
    color: 'cyan',
    action: 'wifi'
  },
  {
    id: 'emergency-contact',
    title: 'Emergency Contact',
    description: 'Contact warden/security',
    icon: <FaPhone />,
    color: 'yellow',
    action: 'emergency'
  }
];

const QuickActions = () => {
  const [selectedAction, setSelectedAction] = useState(null);

  const handleActionClick = (action) => {
    setSelectedAction(action);
    // Handle different actions
    switch (action.action) {
      case 'view-qr':
        // Open QR code modal
        break;
      case 'payment':
        // Navigate to payment page
        window.location.href = '/student/payments';
        break;
      case 'leave':
        // Navigate to leave application
        window.location.href = '/student/leave-application';
        break;
      case 'complaint':
        // Navigate to complaint form
        window.location.href = '/student/complaints';
        break;
      case 'feedback':
        // Open feedback modal
        break;
      case 'guest':
        // Navigate to guest registration
        window.location.href = '/student/guest-registration';
        break;
      case 'wifi':
        // Open WiFi issue form
        break;
      case 'emergency':
        // Show emergency contacts
        break;
      default:
        break;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      red: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700',
      indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700',
      cyan: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700'
    };
    return colors[color] || colors.blue;
  };

  const getIconColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      orange: 'text-orange-600',
      indigo: 'text-indigo-600',
      cyan: 'text-cyan-600',
      yellow: 'text-yellow-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <span className="text-sm text-gray-500">Choose an action below</span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleActionClick(action)}
            className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${getColorClasses(action.color)}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`text-2xl mb-2 ${getIconColorClasses(action.color)}`}>
                {action.icon}
              </div>
              <h4 className="font-medium text-sm mb-1">{action.title}</h4>
              <p className="text-xs opacity-75">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-xs text-gray-600">QR Access</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">₹</div>
            <div className="text-xs text-gray-600">Online Pay</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">✓</div>
            <div className="text-xs text-gray-600">Easy Leave</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">!</div>
            <div className="text-xs text-gray-600">Quick Help</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickActions;
