import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, subtitle, icon, color = 'blue', onClick }) => {
  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        title: 'text-blue-900',
        value: 'text-blue-800',
        subtitle: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        title: 'text-green-900',
        value: 'text-green-800',
        subtitle: 'text-green-600'
      },
      yellow: {
        bg: 'bg-yellow-50',
        icon: 'text-yellow-600',
        title: 'text-yellow-900',
        value: 'text-yellow-800',
        subtitle: 'text-yellow-600'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'text-orange-600',
        title: 'text-orange-900',
        value: 'text-orange-800',
        subtitle: 'text-orange-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        title: 'text-purple-900',
        value: 'text-purple-800',
        subtitle: 'text-purple-600'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'text-red-600',
        title: 'text-red-900',
        value: 'text-red-800',
        subtitle: 'text-red-600'
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
      className={`${colorClasses.bg} rounded-lg p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colorClasses.title}`}>{title}</p>
          <p className={`text-2xl font-bold ${colorClasses.value} mt-1`}>{value}</p>
          <p className={`text-sm ${colorClasses.subtitle} mt-1`}>{subtitle}</p>
        </div>
        <div className={`text-3xl ${colorClasses.icon}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
