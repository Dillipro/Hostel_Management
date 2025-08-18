import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCreditCard, FaMoneyBillWave, FaHistory, FaReceipt, 
  FaCheckCircle, FaClock, FaExclamationTriangle, FaDownload,
  FaCalendarAlt, FaRupeeSign
} from 'react-icons/fa';

const PaymentPortal = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const response = await fetch('/api/student-portal/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPaymentData(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (feeType) => {
    setProcessingPayment(feeType);
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: feeType,
          amount: feeType === 'hostel' ? paymentData.currentFees.hostelFee.amount : paymentData.currentFees.messFee.amount
        })
      });

      const data = await response.json();
      if (data.success) {
        // Initialize Razorpay
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: 'INR',
          name: 'CEG Hostel Management',
          description: `${feeType === 'hostel' ? 'Hostel' : 'Mess'} Fee Payment`,
          order_id: data.order.id,
          handler: async (response) => {
            await verifyPayment(response, feeType);
          },
          prefill: {
            name: paymentData.student.name,
            email: paymentData.student.email,
            contact: paymentData.student.phone
          },
          theme: {
            color: '#3B82F6'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  const verifyPayment = async (paymentResponse, feeType) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...paymentResponse,
          type: feeType
        })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh payment data
        fetchPaymentData();
        alert('Payment successful!');
      } else {
        alert('Payment verification failed. Please contact administration.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Payment verification failed. Please contact administration.');
    }
  };

  const downloadReceipt = async (paymentId) => {
    try {
      const response = await fetch(`/api/payments/receipt/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt_${paymentId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
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
          <div className="flex items-center">
            <FaCreditCard className="text-blue-600 mr-3" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Payment Portal</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Fees Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Hostel Fee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-blue-600 mr-3" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Hostel Fee</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                paymentData?.currentFees?.hostelFee?.paid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {paymentData?.currentFees?.hostelFee?.paid ? 'Paid' : 'Pending'}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                ₹{paymentData?.currentFees?.hostelFee?.amount || 0}
              </div>
              <div className="text-sm text-gray-600">
                Due: {new Date(paymentData?.currentFees?.hostelFee?.dueDate).toLocaleDateString()}
              </div>
            </div>

            {!paymentData?.currentFees?.hostelFee?.paid && (
              <button
                onClick={() => initiatePayment('hostel')}
                disabled={processingPayment === 'hostel'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment === 'hostel' ? 'Processing...' : 'Pay Now'}
              </button>
            )}
          </motion.div>

          {/* Mess Fee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-purple-600 mr-3" size={20} />
                <h3 className="text-lg font-semibold text-gray-900">Mess Fee</h3>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                paymentData?.currentFees?.messFee?.paid 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {paymentData?.currentFees?.messFee?.paid ? 'Paid' : 'Pending'}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                ₹{paymentData?.currentFees?.messFee?.amount || 0}
              </div>
              <div className="text-sm text-gray-600">
                Due: {new Date(paymentData?.currentFees?.messFee?.dueDate).toLocaleDateString()}
              </div>
            </div>

            {!paymentData?.currentFees?.messFee?.paid && (
              <button
                onClick={() => initiatePayment('mess')}
                disabled={processingPayment === 'mess'}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment === 'mess' ? 'Processing...' : 'Pay Now'}
              </button>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'current'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Current Semester
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Payment History
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'current' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fee Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Room Rent</span>
                        <span className="text-gray-900">₹{paymentData?.feeBreakdown?.roomRent || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Electricity</span>
                        <span className="text-gray-900">₹{paymentData?.feeBreakdown?.electricity || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Water</span>
                        <span className="text-gray-900">₹{paymentData?.feeBreakdown?.water || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Maintenance</span>
                        <span className="text-gray-900">₹{paymentData?.feeBreakdown?.maintenance || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="font-semibold text-blue-700">Total</span>
                        <span className="font-semibold text-blue-900">
                          ₹{(paymentData?.currentFees?.hostelFee?.amount || 0) + (paymentData?.currentFees?.messFee?.amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
                    <div className="space-y-3">
                      {paymentData?.paymentSchedule?.map((payment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-600 mr-2" size={16} />
                            <div>
                              <div className="font-medium text-gray-700">{payment.type}</div>
                              <div className="text-sm text-gray-500">
                                Due: {new Date(payment.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">₹{payment.amount}</div>
                            <div className={`text-sm ${
                              payment.status === 'paid' ? 'text-green-600' : 
                              payment.status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {payment.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="space-y-4">
                  {paymentData?.paymentHistory?.length === 0 ? (
                    <div className="text-center py-8">
                      <FaHistory className="mx-auto text-gray-400 text-3xl mb-4" />
                      <p className="text-gray-500">No payment history available</p>
                    </div>
                  ) : (
                    paymentData?.paymentHistory?.map((payment) => (
                      <div key={payment._id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              payment.status === 'success' ? 'bg-green-100' :
                              payment.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              {payment.status === 'success' ? (
                                <FaCheckCircle className="text-green-600" />
                              ) : payment.status === 'failed' ? (
                                <FaExclamationTriangle className="text-red-600" />
                              ) : (
                                <FaClock className="text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {payment.type === 'hostel' ? 'Hostel Fee' : 'Mess Fee'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(payment.createdAt).toLocaleDateString()} • 
                                Payment ID: {payment.razorpayPaymentId || payment._id}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-semibold text-gray-900">₹{payment.amount}</div>
                              <div className={`text-sm ${
                                payment.status === 'success' ? 'text-green-600' : 
                                payment.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {payment.status}
                              </div>
                            </div>
                            {payment.status === 'success' && (
                              <button
                                onClick={() => downloadReceipt(payment._id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                                title="Download Receipt"
                              >
                                <FaDownload size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
