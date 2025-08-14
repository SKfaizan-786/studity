import { Request, Response } from 'express';
import { AuthenticatedRequest, getUserFromRequest } from '../utils/authHelpers';
import Booking from '../models/Booking';
import Course from '../models/Course';
import Payment from '../models/Payment';
import User from '../models/User';

// Create a new booking (Students only)
export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    
    if (!user || user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create bookings' });
    }

    const { courseId, teacherId, scheduledDate, scheduledTime, duration, notes } = req.body;

    // Verify course exists and is active
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found or inactive' });
    }

    // Verify teacher exists and matches course instructor
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher' || course.instructor.toString() !== teacherId) {
      return res.status(400).json({ message: 'Invalid teacher for this course' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      teacher: teacherId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingBooking) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }

    // Create booking
    const booking = new Booking({
      student: user._id,
      teacher: teacherId,
      course: courseId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration,
      amount: course.price,
      notes
    });

    await booking.save();

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('student', 'firstName lastName email')
      .populate('teacher', 'firstName lastName email')
      .populate('course', 'title subject pricing');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// Get bookings for authenticated user
export const getUserBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    
    // Filter by user role
    if (user.role === 'student') {
      query.student = user._id;
    } else if (user.role === 'teacher') {
      query.teacher = user._id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('student', 'firstName lastName email profilePicture')
      .populate('teacher', 'firstName lastName email profilePicture')
      .populate('course', 'title subject pricing duration')
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalBookings: total
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Get booking by ID
export const getBookingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { bookingId } = req.params;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('student', 'firstName lastName email profilePicture')
      .populate('teacher', 'firstName lastName email profilePicture')
      .populate('course', 'title subject pricing duration description');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    const isAuthorized = 
      booking.student._id.toString() === user._id.toString() ||
      booking.teacher._id.toString() === user._id.toString() ||
      user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
};

// Update booking status
export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization based on status change
    let isAuthorized = false;
    
    if (status === 'confirmed' && booking.teacher._id.toString() === user._id.toString()) {
      isAuthorized = true;
    } else if (status === 'cancelled' && 
               (booking.student._id.toString() === user._id.toString() || 
                booking.teacher._id.toString() === user._id.toString())) {
      isAuthorized = true;
    } else if (status === 'completed' && booking.teacher._id.toString() === user._id.toString()) {
      isAuthorized = true;
    } else if (user.role === 'admin') {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status,
        ...(notes && { notes }),
        ...(status === 'completed' && { completedAt: new Date() })
      },
      { new: true, runValidators: true }
    ).populate('student teacher course');

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// Cancel booking
export const cancelBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can cancel this booking
    const canCancel = 
      booking.student._id.toString() === user._id.toString() ||
      booking.teacher._id.toString() === user._id.toString() ||
      user.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled (not already completed)
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Update booking status
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
        cancelledBy: user._id
      },
      { new: true }
    );

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

// Add feedback to booking
export const addBookingFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = getUserFromRequest(req);
    const { bookingId } = req.params;
    const { studentFeedback, teacherFeedback } = req.body;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only add feedback to completed bookings' });
    }

    const updateData: any = {};

    // Add appropriate feedback based on user role
    if (user.role === 'student' && booking.student._id.toString() === user._id.toString()) {
      updateData.studentFeedback = studentFeedback;
    } else if (user.role === 'teacher' && booking.teacher._id.toString() === user._id.toString()) {
      updateData.teacherFeedback = teacherFeedback;
    } else {
      return res.status(403).json({ message: 'Not authorized to add feedback to this booking' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Feedback added successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ message: 'Failed to add feedback' });
  }
};
