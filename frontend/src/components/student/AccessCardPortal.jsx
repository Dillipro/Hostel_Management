import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaQrcode, FaDownload, FaSync, FaShieldAlt, FaHistory, 
  FaClock, FaCheckCircle, FaTimesCircle, FaKey, FaHome, FaUtensils
} from 'react-icons/fa';
import QRCode from 'qrcode';

const AccessCardPortal = () => {
  const [accessCardData, setAccessCardData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchAccessCardData();
  }, []);

  const fetchAccessCardData = async () => {
    try {
      const response = await fetch('/api/student-portal/access-card', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAccessCardData(data.data);
        generateQRCode(data.data.qrData);
      }
    } catch (error) {
      console.error('Error fetching access card data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (qrData) => {
    try {
      const qrString = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });
      setQrCodeData(qrString);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const regenerateAccessCard = async () => {
    setRegenerating(true);
    try {
      const response = await fetch('/api/student-portal/access-card/regenerate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAccessCardData(data.data);
        generateQRCode(data.data.qrData);
      }
    } catch (error) {
      console.error('Error regenerating access card:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `access_card_${accessCardData.student.regNo}.png`;
    link.click();
  };

  const getAccessStatus = (accessType) => {
    const paymentLinked = accessCardData?.paymentLinked;
    const isActive = accessCardData?.isActive;
    
    if (!isActive) return { status: 'inactive', color: 'red', text: 'Card Inactive' };
    
    switch (accessType) {
      case 'hostel':
        return paymentLinked?.hostelFeePaid 
          ? { status: 'active', color: 'green', text: 'Access Granted' }
          : { status: 'payment-required', color: 'yellow', text: 'Payment Required' };
      case 'mess':
        return paymentLinked?.messFeePaid 
          ? { status: 'active', color: 'green', text: 'Access Granted' }
          : { status: 'payment-required', color: 'yellow', text: 'Payment Required' };
      default:
        return { status: 'unknown', color: 'gray', text: 'Unknown' };
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaQrcode className="text-blue-600 mr-3" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">Digital Access Card</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={regenerateAccessCard}
                disabled={regenerating}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FaSync className={`mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FaKey className="mr-2 text-blue-600" />
              Your Digital Access Key
            </h3>
            
            <div className="text-center">
              {qrCodeData ? (
                <div className="mb-6">
                  <img 
                    src={qrCodeData} 
                    alt="QR Code" 
                    className="mx-auto border-2 border-gray-200 rounded-lg"
                  />
                </div>
              ) : (
                <div className="mb-6 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FaQrcode className="mx-auto text-gray-400 text-6xl mb-4" />
                  <p className="text-gray-500">Generating QR Code...</p>
                </div>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={downloadQRCode}
                  disabled={!qrCodeData}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <FaDownload className="mr-2" />
                  Download QR Code
                </button>
                
                <div className="text-sm text-gray-600">
                  <p>• Show this QR code to access hostel facilities</p>
                  <p>• Keep your access card secure and don't share with others</p>
                  <p>• Card expires on: {new Date(accessCardData?.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Access Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Card Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-green-600" />
                Card Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Card ID:</span>
                  <span className="font-mono text-gray-900">{accessCardData?.cardId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student:</span>
                  <span className="text-gray-900">{accessCardData?.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration No:</span>
                  <span className="font-mono text-gray-900">{accessCardData?.student.regNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issued Date:</span>
                  <span className="text-gray-900">
                    {new Date(accessCardData?.issuedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="text-gray-900">
                    {new Date(accessCardData?.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    accessCardData?.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {accessCardData?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Access Permissions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Permissions</h3>
              
              <div className="space-y-4">
                {/* Hostel Access */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaHome className="text-blue-600 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-900">Hostel Entry</div>
                      <div className="text-sm text-gray-600">Room and building access</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const status = getAccessStatus('hostel');
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-800`}>
                          {status.text}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Mess Access */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaUtensils className="text-purple-600 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-gray-900">Mess Entry</div>
                      <div className="text-sm text-gray-600">Dining hall access</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const status = getAccessStatus('mess');
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${status.color}-100 text-${status.color}-800`}>
                          {status.text}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Access Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FaHistory className="mr-2 text-gray-600" />
              Recent Access Log
            </h3>
            <span className="text-sm text-gray-500">Last 10 entries</span>
          </div>

          {accessCardData?.accessLog && accessCardData.accessLog.length > 0 ? (
            <div className="space-y-3">
              {accessCardData.accessLog.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      log.accessGranted ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {log.accessGranted ? (
                        <FaCheckCircle className="text-green-600" size={16} />
                      ) : (
                        <FaTimesCircle className="text-red-600" size={16} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {log.location} - {log.accessType}
                      </div>
                      <div className="text-sm text-gray-600">
                        {log.accessGranted ? 'Access Granted' : `Access Denied: ${log.reason}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaClock className="mx-auto text-gray-400 text-3xl mb-4" />
              <p className="text-gray-500">No access history available</p>
              <p className="text-sm text-gray-400 mt-1">Your access attempts will appear here</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AccessCardPortal;
