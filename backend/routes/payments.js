const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { 
  AccessCard, 
  Room, 
  Block, 
  Hostel 
} = require('../models/HostelInfrastructure');
const Student = require('../models/Student');
const FeeStructure = require('../models/FeeStructure');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { sendNotification } = require('../utils/notification');
const PDFDocument = require('pdfkit');
const { drawHeader, drawFooter } = require('../utils/pdf');
const QRCode = require('qrcode');

// Initialize Razorpay (replace with your keys)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_key_secret'
});

// =====================
// PAYMENT ORDER CREATION
// =====================

// Create payment order for fees
router.post('/create-order', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
  const studentId = req.user.id;
  const { feeType, amount, currency = 'INR', mealPlanCode, installmentCode } = req.body;
    
    if (!['hostel_fee', 'mess_fee', 'security_deposit', 'fine'].includes(feeType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee type'
      });
    }
    
    // Get student details
    const student = await Student.findById(studentId)
      .select('name regNo email phone hostelApplication');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Determine expected amount based on student profile or FeeStructure (supports mealPlan/installment)
    let expectedAmount;
    let fees = student.hostelApplication?.fees;
    if (!fees && student.hostelApplication?.hostelId && student.hostelApplication?.academicYear) {
      const fs = await FeeStructure.getActive(student.hostelApplication.hostelId, student.hostelApplication.academicYear);
      if (fs) {
        // Use new helper to compute personalized amount when feeType maps to an installment or meal plan scenario
        const total = fs.computeExpectedAmount({ student, mealPlanCode, installmentCode });
        // Backward-compatible mapping for simple code types
        fees = { hostelFee: 0, messFee: 0, securityDeposit: 0 };
        for (const item of (fs.items || [])) {
          if (!item.isActive) continue;
          if (item.code === 'hostel_fee') fees.hostelFee += Number(item.amount) || 0;
          if (item.code === 'mess_fee') fees.messFee += Number(item.amount) || 0;
          if (item.code === 'security_deposit') fees.securityDeposit += Number(item.amount) || 0;
        }
        // If installment/meal plan provided, expected becomes personalized total
        if (installmentCode || mealPlanCode) expectedAmount = total;
      }
    }
    if (expectedAmount == null) {
      switch (feeType) {
        case 'hostel_fee':
          expectedAmount = fees?.hostelFee;
          if (student.hostelApplication?.fees?.hostelFeePaid) {
            return res.status(400).json({ success: false, message: 'Hostel fee already paid' });
          }
          break;
        case 'mess_fee':
          expectedAmount = fees?.messFee;
          if (student.hostelApplication?.fees?.messFeePaid) {
            return res.status(400).json({ success: false, message: 'Mess fee already paid' });
          }
          break;
        case 'security_deposit':
          expectedAmount = fees?.securityDeposit;
          break;
        default:
          expectedAmount = amount; // For fines and other fees
      }
    }
    
    if (expectedAmount && Math.abs(amount - expectedAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Expected: ₹${expectedAmount}, Provided: ₹${amount}`
      });
    }
    
    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `${feeType}_${student.regNo}_${Date.now()}`,
      notes: {
        student_id: student._id.toString(),
        student_reg_no: student.regNo,
        student_name: student.name,
        fee_type: feeType,
        amount: amount.toString(),
        mealPlanCode: mealPlanCode || '',
        installmentCode: installmentCode || ''
      }
    };
    
    const order = await razorpay.orders.create(orderOptions);
    
    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        studentInfo: {
          name: student.name,
          regNo: student.regNo,
          email: student.email,
          phone: student.phone
        },
        feeType,
        // Include Razorpay key for frontend
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

// =====================
// PAYMENT VERIFICATION
// =====================

// Verify payment and update records
router.post('/verify-payment', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      feeType,
      amount
    } = req.body;
    
    const studentId = req.user.id;
    
    // Verify payment signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_key_secret')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
    
    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
    
    // Update student fee status
    const updateFields = {};
    const paymentRecord = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      feeType,
      amount: amount,
      status: 'success',
      paidAt: new Date(),
      method: payment.method,
      gateway: 'razorpay',
      transactionDetails: {
        bank: payment.bank,
        wallet: payment.wallet,
        vpa: payment.vpa,
        cardId: payment.card_id
      }
    };
    
    switch (feeType) {
      case 'hostel_fee':
        updateFields['hostelApplication.fees.hostelFeePaid'] = true;
        updateFields['hostelApplication.fees.hostelFeeLastPaidDate'] = new Date();
        updateFields['hostelApplication.fees.hostelFeePaymentId'] = razorpay_payment_id;
        break;
      case 'mess_fee':
        updateFields['hostelApplication.fees.messFeePaid'] = true;
        updateFields['hostelApplication.fees.messFeeLastPaidDate'] = new Date();
        updateFields['hostelApplication.fees.messFeePaymentId'] = razorpay_payment_id;
        break;
      case 'security_deposit':
        updateFields['hostelApplication.fees.securityDepositPaid'] = true;
        updateFields['hostelApplication.fees.securityDepositPaidDate'] = new Date();
        updateFields['hostelApplication.fees.securityDepositPaymentId'] = razorpay_payment_id;
        break;
    }
    
    // Update student record
    await Student.findByIdAndUpdate(studentId, {
      ...updateFields,
      $push: { paymentHistory: paymentRecord }
    });
    
    // Update access card permissions
    if (feeType === 'mess_fee') {
      await AccessCard.findOneAndUpdate(
        { studentId },
        {
          'paymentLinked.messFeePaid': true,
          'paymentLinked.lastPaymentDate': new Date(),
          'accessScopes.$[elem].isEnabled': true
        },
        {
          arrayFilters: [{ 'elem.scope': 'mess_entry' }]
        }
      );
    }
    
    if (feeType === 'hostel_fee') {
      await AccessCard.findOneAndUpdate(
        { studentId },
        {
          'paymentLinked.hostelFeePaid': true,
          'paymentLinked.lastPaymentDate': new Date()
        }
      );
    }
    
    // Send success notification
    await sendNotification({
      userId: studentId,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Your ${feeType.replace('_', ' ')} payment of ₹${amount} has been processed successfully.`,
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount,
        feeType
      }
    });
    
    // Generate receipt
    const receiptData = await generatePaymentReceipt(studentId, paymentRecord);
    
    res.json({
      success: true,
      message: 'Payment verified and processed successfully',
      data: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount,
        feeType,
        paidAt: new Date(),
        receipt: receiptData
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// =====================
// PAYMENT HISTORY & RECEIPTS
// =====================

// Get student payment history
router.get('/history', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 10, feeType, status } = req.query;
    
    const student = await Student.findById(studentId)
      .select('paymentHistory name regNo')
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    let payments = student.paymentHistory || [];
    
    // Apply filters
    if (feeType) {
      payments = payments.filter(payment => payment.feeType === feeType);
    }
    if (status) {
      payments = payments.filter(payment => payment.status === status);
    }
    
    // Sort by date (newest first)
    payments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = payments.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        payments: paginatedPayments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(payments.length / parseInt(limit)),
          totalPayments: payments.length,
          hasNextPage: endIndex < payments.length,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Download payment receipt
router.get('/receipt/:paymentId', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const studentId = req.user.id;
    
    const student = await Student.findById(studentId)
      .populate({
        path: 'hostelApplication.allocatedRoom',
        populate: {
          path: 'blockId',
          populate: {
            path: 'hostelId'
          }
        }
      })
      .lean();
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Find payment in history
    const payment = student.paymentHistory?.find(p => p.paymentId === paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Generate detailed receipt
    const receipt = {
      receiptId: `REC-${paymentId}`,
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      studentInfo: {
        name: student.name,
        regNo: student.regNo,
        email: student.email,
        phone: student.phone
      },
      accommodationInfo: student.hostelApplication?.allocatedRoom ? {
        hostelName: student.hostelApplication.allocatedRoom.blockId?.hostelId?.name,
        blockName: student.hostelApplication.allocatedRoom.blockId?.name,
        roomNumber: student.hostelApplication.allocatedRoom.roomNumber
      } : null,
      paymentDetails: {
        feeType: payment.feeType,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        paidAt: payment.paidAt,
        gateway: payment.gateway
      },
      institutionInfo: {
        name: 'College of Engineering Guindy, Anna University',
        address: 'Sardar Patel Road, Guindy, Chennai - 600025',
        phone: '+91-44-2220-3500',
        email: 'info@annauniv.edu'
      },
      generatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Download payment receipt as PDF
router.get('/receipt/:paymentId/pdf', authenticateToken, authorizeRoles(['student']), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const studentId = req.user.id;

    const student = await Student.findById(studentId)
      .populate({
        path: 'hostelApplication.allocatedRoom',
        populate: { path: 'blockId', populate: { path: 'hostelId' } }
      })
      .lean();

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const payment = student.paymentHistory?.find(p => p.paymentId === paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=receipt-${paymentId}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

  // Header with branding
  drawHeader(doc, 'Payment Receipt');

    // Student info
    doc.fontSize(12)
      .text(`Student: ${student.name || student.personalInfo?.firstName || ''} (${student.regNo || student.academic?.registerNumber})`)
      .text(`Email: ${student.email}`)
      .text(`Phone: ${student.phone}`)
      .moveDown();

    // Accommodation
    if (student.hostelApplication?.allocatedRoom) {
      const room = student.hostelApplication.allocatedRoom;
      doc.text(`Hostel: ${room.blockId?.hostelId?.name}`)
        .text(`Block: ${room.blockId?.name}`)
        .text(`Room: ${room.roomNumber}`)
        .moveDown();
    }

  // Payment details
    doc.fontSize(14).text('Payment Details', { underline: true });
    doc.fontSize(12)
      .text(`Payment ID: ${payment.paymentId}`)
      .text(`Order ID: ${payment.orderId}`)
      .text(`Fee Type: ${payment.feeType}`)
      .text(`Amount: ₹${payment.amount}`)
      .text(`Method: ${payment.method}`)
      .text(`Gateway: ${payment.gateway}`)
      .text(`Paid At: ${new Date(payment.paidAt).toLocaleString()}`)
      .moveDown();

    // Receipt QR code
    const qrPayload = {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      regNo: student.regNo,
      amount: payment.amount,
      ts: payment.paidAt
    };
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));
    const qrImg = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrImg, 'base64');
    const x = doc.x; const y = doc.y;
    doc.image(qrBuffer, x, y, { fit: [120, 120] });
    doc.moveDown(7);

  // Footer
  doc.moveDown();
  drawFooter(doc);
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================
// ADMIN PAYMENT MANAGEMENT
// =====================

// Get all payments (Admin only)
router.get('/admin/all-payments', authenticateToken, authorizeRoles(['admin', 'super_admin', 'accounts']), async (req, res) => {
  try {
    const {
      feeType,
      status,
      fromDate,
      toDate,
      studentRegNo,
      page = 1,
      limit = 20
    } = req.query;
    
    // Build aggregation pipeline
    const pipeline = [
      { $unwind: '$paymentHistory' },
      { $match: {} }
    ];
    
    // Add filters
    const matchFilters = {};
    if (feeType) matchFilters['paymentHistory.feeType'] = feeType;
    if (status) matchFilters['paymentHistory.status'] = status;
    if (studentRegNo) matchFilters.regNo = new RegExp(studentRegNo, 'i');
    if (fromDate) matchFilters['paymentHistory.paidAt'] = { $gte: new Date(fromDate) };
    if (toDate) {
      if (matchFilters['paymentHistory.paidAt']) {
        matchFilters['paymentHistory.paidAt'].$lte = new Date(toDate);
      } else {
        matchFilters['paymentHistory.paidAt'] = { $lte: new Date(toDate) };
      }
    }
    
    pipeline[1].$match = matchFilters;
    
    // Add projection and sorting
    pipeline.push(
      {
        $project: {
          studentInfo: {
            name: '$name',
            regNo: '$regNo',
            email: '$email',
            phone: '$phone'
          },
          payment: '$paymentHistory'
        }
      },
      { $sort: { 'payment.paidAt': -1 } }
    );
    
    // Execute aggregation with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paymentsData = await Student.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);
    
    // Get total count
    const totalCount = await Student.aggregate([
      ...pipeline,
      { $count: 'total' }
    ]);
    
    const total = totalCount[0]?.total || 0;
    
    res.json({
      success: true,
      data: {
        payments: paymentsData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPayments: total,
          hasNextPage: skip + paymentsData.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate payment analytics (Admin only)
router.get('/admin/analytics', authenticateToken, authorizeRoles(['admin', 'super_admin', 'accounts']), async (req, res) => {
  try {
    const {
      period = 'month', // 'week', 'month', 'year'
      feeType
    } = req.query;
    
    // Calculate date range
    const now = new Date();
    let fromDate;
    switch (period) {
      case 'week':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        fromDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const pipeline = [
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paidAt': { $gte: fromDate },
          'paymentHistory.status': 'success',
          ...(feeType && { 'paymentHistory.feeType': feeType })
        }
      },
      {
        $group: {
          _id: {
            feeType: '$paymentHistory.feeType',
            date: {
              $dateToString: {
                format: period === 'week' ? '%Y-%m-%d' : period === 'month' ? '%Y-%m-%d' : '%Y-%m',
                date: '$paymentHistory.paidAt'
              }
            }
          },
          totalAmount: { $sum: '$paymentHistory.amount' },
          totalPayments: { $sum: 1 },
          avgAmount: { $avg: '$paymentHistory.amount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ];
    
    const analyticsData = await Student.aggregate(pipeline);
    
    // Get overall statistics
    const overallStats = await Student.aggregate([
      { $unwind: '$paymentHistory' },
      {
        $match: {
          'paymentHistory.paidAt': { $gte: fromDate },
          'paymentHistory.status': 'success',
          ...(feeType && { 'paymentHistory.feeType': feeType })
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paymentHistory.amount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$paymentHistory.amount' },
          feeTypeBreakdown: {
            $push: {
              feeType: '$paymentHistory.feeType',
              amount: '$paymentHistory.amount'
            }
          }
        }
      }
    ]);
    
    // Process fee type breakdown
    let feeTypeStats = {};
    if (overallStats[0]?.feeTypeBreakdown) {
      feeTypeStats = overallStats[0].feeTypeBreakdown.reduce((acc, item) => {
        if (!acc[item.feeType]) {
          acc[item.feeType] = { count: 0, totalAmount: 0 };
        }
        acc[item.feeType].count += 1;
        acc[item.feeType].totalAmount += item.amount;
        return acc;
      }, {});
    }
    
    res.json({
      success: true,
      data: {
        period,
        fromDate,
        toDate: now,
        overallStats: {
          totalRevenue: overallStats[0]?.totalRevenue || 0,
          totalTransactions: overallStats[0]?.totalTransactions || 0,
          avgTransactionValue: overallStats[0]?.avgTransactionValue || 0
        },
        feeTypeStats,
        timeSeriesData: analyticsData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// =====================
// HELPER FUNCTIONS
// =====================

// Generate payment receipt data
async function generatePaymentReceipt(studentId, paymentRecord) {
  const student = await Student.findById(studentId)
    .populate({
      path: 'hostelApplication.allocatedRoom',
      populate: {
        path: 'blockId',
        populate: {
          path: 'hostelId'
        }
      }
    })
    .lean();
  
  return {
    receiptId: `REC-${paymentRecord.paymentId}`,
    institutionName: 'College of Engineering Guindy, Anna University',
    studentName: student.name,
    regNo: student.regNo,
    feeType: paymentRecord.feeType,
    amount: paymentRecord.amount,
    paidAt: paymentRecord.paidAt,
    paymentMethod: paymentRecord.method,
    transactionId: paymentRecord.paymentId,
    hostelInfo: student.hostelApplication?.allocatedRoom ? {
      hostel: student.hostelApplication.allocatedRoom.blockId?.hostelId?.name,
      block: student.hostelApplication.allocatedRoom.blockId?.name,
      room: student.hostelApplication.allocatedRoom.roomNumber
    } : null
  };
}

// Webhook for payment status updates (for Razorpay)
router.post('/webhook', async (req, res) => {
  try {
    const webhookBody = JSON.stringify(req.body);
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret')
      .update(webhookBody)
      .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    
    if (event === 'payment.failed') {
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const studentId = req.body.payload?.payment?.entity?.notes?.student_id;
      if (studentId) {
        await Student.findByIdAndUpdate(studentId, {
          $push: { paymentHistory: {
            orderId,
            paymentId,
            feeType: req.body.payload?.payment?.entity?.notes?.fee_type,
            amount: (req.body.payload?.payment?.entity?.amount || 0) / 100,
            status: 'failed',
            paidAt: new Date(),
            method: paymentEntity.method,
            gateway: 'razorpay',
            transactionDetails: { reason: paymentEntity.error_description || 'failed' }
          } }
        });
        await sendNotification({ userId: studentId, type: 'payment_failed', title: 'Payment Failed', message: 'Your payment attempt failed. Please try again.', data: { orderId, paymentId } });
      }
    }
    
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
