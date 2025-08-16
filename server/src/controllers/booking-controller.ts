import { Response } from 'express';
import { Booking, IBooking } from '../models/Booking';
import UserModel, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

export const bookingController = {
  // Get all bookings for a teacher
  getTeacherBookings: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teacherId = req.user?.id;
      if (!teacherId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { status, page = 1, limit = 10, search, dateFilter } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query
      const query: any = { 'teacher.id': teacherId };

      if (status && status !== 'all') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { 'student.name': { $regex: search, $options: 'i' } },
          { 'student.email': { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } }
        ];
      }

      if (dateFilter && dateFilter !== 'all') {
        const now = new Date();
        switch (dateFilter) {
          case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            query.date = { $gte: today, $lt: tomorrow };
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            query.date = { $gte: weekAgo, $lte: now };
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            query.date = { $gte: monthAgo, $lte: now };
            break;
        }
      }

      // Get bookings with pagination
      const bookings = await Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Booking.countDocuments(query);

      // Get statistics
      const stats = {
        total: await Booking.countDocuments({ 'teacher.id': teacherId }),
        pending: await Booking.countDocuments({ 'teacher.id': teacherId, status: 'pending' }),
        confirmed: await Booking.countDocuments({ 'teacher.id': teacherId, status: 'confirmed' }),
        completed: await Booking.countDocuments({ 'teacher.id': teacherId, status: 'completed' }),
        cancelled: await Booking.countDocuments({ 'teacher.id': teacherId, status: 'cancelled' })
      };

      res.json({
        bookings,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: total
        },
        stats
      });
    } catch (error) {
      console.error('Error fetching teacher bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  },

  // Get all bookings for a student
  getStudentBookings: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const query: any = { 'student.id': studentId };
      if (status && status !== 'all') {
        query.status = status;
      }

      const bookings = await Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Booking.countDocuments(query);

      res.json({
        bookings,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: total
        }
      });
    } catch (error) {
      console.error('Error fetching student bookings:', error);
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  },

  // Create a new booking
  createBooking: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { teacherId, subject, date, time, duration, notes } = req.body;

      // Validate required fields
      if (!teacherId || !subject || !date || !time || !duration) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Get teacher details
      const teacher = await UserModel.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(404).json({ message: 'Teacher not found' });
      }

      // Get student details
      const student = await UserModel.findById(studentId);
      if (!student || student.role !== 'student') {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Check for booking conflicts - manual implementation for now
      const existingBookings = await Booking.find({
        'teacher.id': teacherId,
        date: {
          $gte: new Date(new Date(date).toISOString().split('T')[0]),
          $lt: new Date(new Date(new Date(date).toISOString().split('T')[0]).getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $in: ['pending', 'confirmed'] }
      });

      const startTime = new Date(`${new Date(date).toISOString().split('T')[0]}T${time}:00`);
      const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

      const hasConflict = existingBookings.some(booking => {
        const existingStart = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.time}:00`);
        const existingEnd = new Date(existingStart.getTime() + booking.duration * 60 * 60 * 1000);
        return startTime < existingEnd && endTime > existingStart;
      });

      if (hasConflict) {
        return res.status(409).json({ message: 'Teacher is not available at the selected time' });
      }

      // Calculate amount based on teacher's hourly rate
      const hourlyRate = teacher.teacherProfile?.hourlyRate || 800;
      const amount = hourlyRate * duration;

      // Create booking
      const booking = new Booking({
        student: {
          id: studentId,
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          phone: 'N/A' // Phone not available in student profile
        },
        teacher: {
          id: teacherId,
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email
        },
        subject,
        date: new Date(date),
        time,
        duration,
        amount,
        notes: notes || '',
        status: 'pending'
      });

      await booking.save();

      res.status(201).json({
        message: 'Booking created successfully',
        booking
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({ message: 'Error creating booking' });
    }
  },

  // Update booking status
  updateBookingStatus: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bookingId } = req.params;
      const { status, cancelReason, meetingLink } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user is authorized to update this booking
      const isTeacher = booking.teacher.id.toString() === userId;
      const isStudent = booking.student.id.toString() === userId;

      if (!isTeacher && !isStudent) {
        return res.status(403).json({ message: 'Unauthorized to update this booking' });
      }

      // Validate status transitions
      const validTransitions: { [key: string]: string[] } = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled', 'rescheduled'],
        completed: [],
        cancelled: [],
        rescheduled: ['confirmed', 'cancelled']
      };

      if (!validTransitions[booking.status].includes(status)) {
        return res.status(400).json({ 
          message: `Cannot change status from ${booking.status} to ${status}` 
        });
      }

      // Update booking
      booking.status = status;

      if (status === 'cancelled') {
        booking.cancelledBy = isTeacher ? 'teacher' : 'student';
        booking.cancelReason = cancelReason || '';
      }

      if (status === 'confirmed' && meetingLink) {
        booking.meetingLink = meetingLink;
      }

      await booking.save();

      res.json({
        message: 'Booking status updated successfully',
        booking
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Error updating booking status' });
    }
  },

  // Reschedule booking
  rescheduleBooking: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bookingId } = req.params;
      const { date, time } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user is authorized to reschedule
      const isTeacher = booking.teacher.id.toString() === userId;
      const isStudent = booking.student.id.toString() === userId;

      if (!isTeacher && !isStudent) {
        return res.status(403).json({ message: 'Unauthorized to reschedule this booking' });
      }

      // Check if booking can be rescheduled
      if (!['pending', 'confirmed'].includes(booking.status)) {
        return res.status(400).json({ message: 'Booking cannot be rescheduled' });
      }

      // Check for conflicts - manual implementation
      const existingBookings = await Booking.find({
        'teacher.id': booking.teacher.id,
        date: {
          $gte: new Date(new Date(date).toISOString().split('T')[0]),
          $lt: new Date(new Date(new Date(date).toISOString().split('T')[0]).getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: bookingId }
      });

      const startTime = new Date(`${new Date(date).toISOString().split('T')[0]}T${time}:00`);
      const endTime = new Date(startTime.getTime() + booking.duration * 60 * 60 * 1000);

      const hasConflict = existingBookings.some(existingBooking => {
        const existingStart = new Date(`${existingBooking.date.toISOString().split('T')[0]}T${existingBooking.time}:00`);
        const existingEnd = new Date(existingStart.getTime() + existingBooking.duration * 60 * 60 * 1000);
        return startTime < existingEnd && endTime > existingStart;
      });

      if (hasConflict) {
        return res.status(409).json({ message: 'Teacher is not available at the selected time' });
      }

      // Store original date/time
      booking.rescheduledFrom = {
        date: booking.date,
        time: booking.time
      };

      // Update with new date/time
      booking.date = new Date(date);
      booking.time = time;
      booking.status = 'rescheduled';

      await booking.save();

      res.json({
        message: 'Booking rescheduled successfully',
        booking
      });
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      res.status(500).json({ message: 'Error rescheduling booking' });
    }
  },

  // Get booking details
  getBookingDetails: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Check if user is authorized to view this booking
      const isTeacher = booking.teacher.id.toString() === userId;
      const isStudent = booking.student.id.toString() === userId;

      if (!isTeacher && !isStudent) {
        return res.status(403).json({ message: 'Unauthorized to view this booking' });
      }

      res.json({ booking });
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).json({ message: 'Error fetching booking details' });
    }
  },

  // Get teacher availability
  getTeacherAvailability: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { teacherId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      // Get all confirmed and pending bookings for the teacher on the specified date
      const bookings = await Booking.find({
        'teacher.id': teacherId,
        date: {
          $gte: new Date(date as string),
          $lt: new Date(new Date(date as string).getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $in: ['pending', 'confirmed'] }
      });

      // Default available hours (9 AM to 9 PM)
      const availableSlots = [];
      for (let hour = 9; hour < 21; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        
        // Check if this slot conflicts with any booking
        const hasConflict = bookings.some(booking => {
          const bookingStart = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.time}:00`);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 60 * 1000);
          const slotStart = new Date(`${booking.date.toISOString().split('T')[0]}T${timeSlot}:00`);
          const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1-hour slot
          
          return slotStart < bookingEnd && slotEnd > bookingStart;
        });

        if (!hasConflict) {
          availableSlots.push(timeSlot);
        }
      }

      res.json({ availableSlots });
    } catch (error) {
      console.error('Error fetching teacher availability:', error);
      res.status(500).json({ message: 'Error fetching availability' });
    }
  }
};
