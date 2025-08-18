import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaQrcode, FaShieldAlt, FaExclamationTriangle, FaCheckCircle,
  FaTimesCircle, FaClock, FaHome, FaUtensils, FaSync, FaEye
} from 'react-icons/fa';

const IoTMonitor = ({ devices = [], accessLogs = [] }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getDeviceStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <FaCheckCircle className="text-green-500" />;
      case 'offline':
        return <FaTimesCircle className="text-red-500" />;
      case 'maintenance':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getDeviceTypeIcon = (type) => {
    switch (type) {
      case 'hostel_entry':
        return <FaHome className="text-blue-600" />;
      case 'mess_entry':
        return <FaUtensils className="text-purple-600" />;
      case 'room_access':
        return <FaQrcode className="text-green-600" />;
      default:
        return <FaShieldAlt className="text-gray-600" />;
    }
  };

  const getAccessStatusColor = (granted) => {
    return granted 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const refreshDevices = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaQrcode className="mr-2 text-blue-600" />
          IoT Device Monitor
        </h3>
        <button
          onClick={refreshDevices}
          className={`p-2 text-gray-600 hover:text-gray-900 transition-colors ${refreshing ? 'animate-spin' : ''}`}
          title="Refresh Devices"
        >
          <FaSync size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Device Status ({devices.length})</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {devices.map((device, index) => (
              <motion.div
                key={device.deviceId || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => setSelectedDevice(device)}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-xl">
                    {getDeviceTypeIcon(device.type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {device.location}
                    </div>
                    <div className="text-xs text-gray-600">
                      {device.deviceId} • {device.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getDeviceStatusIcon(device.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    device.status === 'online' ? 'bg-green-100 text-green-800' :
                    device.status === 'offline' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {device.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Access Logs */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Recent Access ({accessLogs.length})</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {accessLogs.slice(0, 10).map((log, index) => (
              <motion.div
                key={log._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    log.accessGranted ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {log.studentName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {log.location} • {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${getAccessStatusColor(log.accessGranted)}`}>
                    {log.accessGranted ? 'Granted' : 'Denied'}
                  </span>
                  {!log.accessGranted && (
                    <div className="text-xs text-red-600 mt-1">
                      {log.reason}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'online').length}
            </div>
            <div className="text-xs text-gray-600">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {devices.filter(d => d.status === 'offline').length}
            </div>
            <div className="text-xs text-gray-600">Offline</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {accessLogs.filter(l => l.accessGranted).length}
            </div>
            <div className="text-xs text-gray-600">Access Granted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {accessLogs.filter(l => !l.accessGranted).length}
            </div>
            <div className="text-xs text-gray-600">Access Denied</div>
          </div>
        </div>
      </div>

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Device Details</h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getDeviceTypeIcon(selectedDevice.type)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{selectedDevice.location}</div>
                  <div className="text-sm text-gray-600">{selectedDevice.deviceId}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center mt-1">
                    {getDeviceStatusIcon(selectedDevice.status)}
                    <span className="ml-2 text-sm text-gray-900 capitalize">{selectedDevice.status}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {selectedDevice.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Ping</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDevice.lastPing ? new Date(selectedDevice.lastPing).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Battery</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDevice.batteryLevel ? `${selectedDevice.batteryLevel}%` : 'N/A'}
                  </p>
                </div>
              </div>
              
              {selectedDevice.lastError && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm font-medium text-red-800">Last Error</div>
                  <div className="text-sm text-red-600 mt-1">{selectedDevice.lastError}</div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Diagnostics
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default IoTMonitor;
