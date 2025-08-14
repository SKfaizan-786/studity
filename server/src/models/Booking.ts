import mongoose, { Document, Schema, Types } from 'mongoose';

// Define Booking interface
export interface IBooking extends Document {
  student: Types.ObjectId; // Reference to student
  teacher: Types.ObjectId; // Reference to teacher
  course?: Types.ObjectId; // Optional reference to course
  subject: string;
  sessionType: 'one-time' | 'package' | 'course';
  scheduledDate: Date;
  duration: number; // in minutes
  timeSlot: {
    start: string; // e.g., "10:00"
    end: string;   // e.g., "11:00"
  };
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  meetingLink?: string;
  meetingId?: string;
  notes?: string;
  studentNotes?: string;
  teacherNotes?: string;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentId?: string;
  cancellationReason?: string;
  rescheduledFrom?: Types.ObjectId; // Reference to original booking if rescheduled
  reminderSent: boolean;
  feedback?: {
    rating: number; // 1-5
    comment?: string;
    submittedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Booking Schema
const BookingSchema = new Schema<IBooking>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  sessionType: {
    type: String,
    enum: ['one-time', 'package', 'course'],
    default: 'one-time'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 30, // minimum 30 minutes
    max: 240 // maximum 4 hours
  },
  timeSlot: {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  meetingLink: {
    type: String,
    default: null
  },
  meetingId: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  studentNotes: {
    type: String,
    maxlength: 500
  },
  teacherNotes: {
    type: String,
    maxlength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  rescheduledFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    submittedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
BookingSchema.index({ student: 1 });
BookingSchema.index({ teacher: 1 });
BookingSchema.index({ scheduledDate: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ teacher: 1, scheduledDate: 1 }); // Compound index for teacher availability

// Validate that end time is after start time
BookingSchema.pre('save', function(next) {
  const startTime = this.timeSlot.start.split(':').map(Number);
  const endTime = this.timeSlot.end.split(':').map(Number);
  
  const startMinutes = startTime[0] * 60 + startTime[1];
  const endMinutes = endTime[0] * 60 + endTime[1];
  
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  next();
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
