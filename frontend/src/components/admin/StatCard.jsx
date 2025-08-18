import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue', 
  change = null, 
  percentage = null,
  urgent = false,
  onClick 
}) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        title: 'text-blue-900',
        value: 'text-blue-800',
        subtitle: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        title: 'text-green-900',
        value: 'text-green-800',
        subtitle: 'text-green-600',
        border: 'border-green-200'
      },
      yellow: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-600',
        title: 'text-yellow-900',
        value: 'text-yellow-800',
        subtitle: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'text-red-600',
        title: 'text-red-900',
        value: 'text-red-800',
        subtitle: 'text-red-600',
        border: 'border-red-200'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        title: 'text-purple-900',
        value: 'text-purple-800',
        subtitle: 'text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        title: 'text-orange-900',
        value: 'text-orange-800',
        subtitle: 'text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      className={`relative ${colorClasses.bg} ${urgent ? 'ring-2 ring-red-400 ring-opacity-75' : ''} rounded-lg p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''} border ${colorClasses.border}`}
      onClick={onClick}
    >
      {urgent && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-red-500 text-white p-1 rounded-full animate-pulse">
            <FaExclamationTriangle size={12} />
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colorClasses.title}`}>{title}</p>
          <div className="flex items-baseline mt-2">
            <p className={`text-3xl font-bold ${colorClasses.value}`}>{value}</p>
            {percentage && (
              <span className={`ml-2 text-sm font-medium ${colorClasses.subtitle}`}>
                ({percentage}%)
              </span>
            )}
          </div>
          <p className={`text-sm ${colorClasses.subtitle} mt-1`}>{subtitle}</p>
          
          {change !== null && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <FaArrowUp className="text-green-500 mr-1" size={12} />
              ) : change < 0 ? (
                <FaArrowDown className="text-red-500 mr-1" size={12} />
              ) : null}
              <span className={`text-xs font-medium ${
                change > 0 ? 'text-green-600' : 
                change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 ? '+' : ''}{change}% from last period
              </span>
            </div>
          )}
        </div>
        
        <div className={`text-4xl ${colorClasses.icon} opacity-80`}>
          {icon}
        </div>
      </div>

      {/* Progress bar for percentage */}
      {percentage && (
        <div className="mt-4">
          <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                color === 'green' ? 'bg-green-500' :
                color === 'blue' ? 'bg-blue-500' :
                color === 'yellow' ? 'bg-yellow-500' :
                color === 'red' ? 'bg-red-500' :
                color === 'purple' ? 'bg-purple-500' :
                'bg-orange-500'
              } transition-all duration-1000 ease-out`}
              style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
