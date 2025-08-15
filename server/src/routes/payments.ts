import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getPaymentById,
  requestRefund,
  processRefund
} from '../controllers/payment-controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Protected routes - require authentication
router.use(authMiddleware);

// Create payment intent
router.post('/intent', createPaymentIntent);

// Confirm payment (can be called by webhooks or frontend)
router.post('/confirm', confirmPayment);

// Get payment history for user
router.get('/history', getPaymentHistory);

// Get specific payment
router.get('/:paymentId', getPaymentById);

// Request refund
router.post('/:paymentId/refund/request', requestRefund);

// Process refund (Admin only)
router.post('/:paymentId/refund/process', requireRole('admin'), processRefund);

export default router;
