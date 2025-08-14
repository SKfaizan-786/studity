import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  addBookingFeedback
} from '../controllers/booking-controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

// Create booking (students only)
router.post('/', requireRole('student'), createBooking);

// Get user's bookings
router.get('/', getUserBookings);

// Get specific booking
router.get('/:bookingId', getBookingById);

// Update booking status
router.patch('/:bookingId/status', updateBookingStatus);

// Cancel booking
router.patch('/:bookingId/cancel', cancelBooking);

// Add feedback to booking
router.patch('/:bookingId/feedback', addBookingFeedback);

export default router;
