import { Request, Response } from 'express';
import { AuthenticatedRequest, getUserFromRequest } from '../utils/authHelpers';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import Course from '../models/Course';

// Create payment intent (initiate payment)
export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { bookingId, gateway = 'razorpay' } = req.body;

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(bookingId).populate('course');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.student.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this booking' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this booking' });
    }

    // Create payment record
    const payment = new Payment({
      user: user._id,
      booking: bookingId,
      amount: booking.price,
      paymentMethod: gateway as any,
      status: 'pending',
      teacher: booking.teacher,
      description: `Payment for booking ${bookingId}`
    });

    await payment.save();

    // Here you would integrate with actual payment gateway
    // For now, we'll simulate payment intent creation
    const paymentIntent = {
      id: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      client_secret: `pi_${payment._id}_secret_${Date.now()}`, // Simulated
      paymentMethod: payment.paymentMethod
    };

    res.status(201).json({
      message: 'Payment intent created successfully',
      paymentIntent,
      payment
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
};

// Confirm payment (webhook or manual confirmation)
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId, transactionId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    payment.status = status;
    payment.transactionId = transactionId;
    payment.paidAt = new Date();

    await payment.save();

    // If payment is successful, update booking status
    if (status === 'completed') {
      await Booking.findByIdAndUpdate(payment.booking, {
        paymentStatus: 'paid',
        status: 'confirmed'
      });
    }

    res.json({
      message: 'Payment confirmed successfully',
      payment
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
};

// Get payment history for user
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = { user: user._id };
    
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'booking',
        populate: [
          { path: 'course', select: 'title subject' },
          { path: 'teacher', select: 'firstName lastName' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalPayments: total
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

// Get payment details by ID
export const getPaymentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { paymentId } = req.params;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'booking',
        populate: [
          { path: 'course', select: 'title subject pricing' },
          { path: 'teacher', select: 'firstName lastName email' },
          { path: 'student', select: 'firstName lastName email' }
        ]
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check authorization
    const isAuthorized = 
      payment.user.toString() === user._id.toString() ||
      user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
};

// Request refund
export const requestRefund = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { paymentId } = req.params;
    const { reason } = req.body;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payment = await Payment.findById(paymentId).populate('booking');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this payment' });
    }

    // Check if payment is eligible for refund
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    if (payment.refundStatus && payment.refundStatus !== 'none') {
      return res.status(400).json({ message: 'Refund already requested or processed' });
    }

    // Update payment with refund request
    payment.refundStatus = 'requested';
    payment.refundReason = reason;
    payment.refundRequestedAt = new Date();

    await payment.save();

    res.json({
      message: 'Refund request submitted successfully',
      payment
    });
  } catch (error) {
    console.error('Error requesting refund:', error);
    res.status(500).json({ message: 'Failed to request refund' });
  }
};

// Process refund (Admin only)
export const processRefund = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { paymentId } = req.params;
    const { action, adminNotes } = req.body; // action: 'approve' | 'reject'

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.refundStatus !== 'requested') {
      return res.status(400).json({ message: 'No refund request found' });
    }

    if (action === 'approve') {
      payment.refundStatus = 'completed';
      payment.refundAmount = payment.amount; // Full refund for now
      payment.refundedAt = new Date();
    } else if (action === 'reject') {
      payment.refundStatus = 'rejected';
    }

    payment.adminNotes = adminNotes;
    payment.processedBy = user._id as any;

    await payment.save();

    res.json({
      message: `Refund ${action}d successfully`,
      payment
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
};
