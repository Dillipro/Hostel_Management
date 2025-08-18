import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationCircle, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const RecentActivity = ({ activities = [] }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <FaCheckCircle className="text-green-500" />;
      case 'in-progress':
        return <FaClock className="text-yellow-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-sm text-gray-500">Last 7 days</span>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <FaExclamationCircle className="mx-auto text-gray-400 text-3xl mb-4" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">Your complaints and requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border-l-4 rounded-r-lg bg-gray-50 ${getPriorityColor(activity.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {activity.category || 'General Issue'}
                    </h4>
                    <p className="text-gray-700 text-sm mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      {activity.priority && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          activity.priority === 'high' 
                            ? 'bg-red-100 text-red-700' 
                            : activity.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {activity.priority} priority
                        </span>
                      )}
                    </div>
                    {activity.assignedTo && (
                      <p className="text-xs text-gray-500 mt-1">
                        Assigned to: {activity.assignedTo.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {activities.length > 5 && (
            <div className="text-center pt-4">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all activities →
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {activities.filter(a => a.status === 'resolved').length}
            </div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">
              {activities.filter(a => a.status === 'in-progress').length}
            </div>
            <div className="text-xs text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {activities.length}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentActivity;
