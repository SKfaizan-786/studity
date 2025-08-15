import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  _id: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  subject: string;
  date: Date;
  time: string;
  duration: number; // in hours
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  amount: number;
  notes?: string;
  meetingLink?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledBy?: string;
  cancelReason?: string;
  rescheduledFrom?: {
    date: Date;
    time: string;
  };
}

const BookingSchema: Schema = new Schema({
  student: {
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  teacher: {
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  subject: { 
    type: String, 
    required: true,
    enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Other']
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: { 
    type: Number, 
    required: true,
    min: 0.5,
    max: 8
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0
  },
  notes: { 
    type: String,
    maxlength: 500
  },
  meetingLink: { 
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Meeting link must be a valid URL'
    }
  },
  cancelledBy: {
    type: String,
    enum: ['student', 'teacher']
  },
  cancelReason: {
    type: String,
    maxlength: 300
  },
  rescheduledFrom: {
    date: Date,
    time: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
BookingSchema.index({ 'teacher.id': 1, date: 1 });
BookingSchema.index({ 'student.id': 1, date: 1 });
BookingSchema.index({ status: 1, date: 1 });
BookingSchema.index({ createdAt: -1 });

// Virtual for booking ID display
BookingSchema.virtual('bookingId').get(function(this: IBooking) {
  return `BK${this._id.toString().slice(-6).toUpperCase()}`;
});

// Pre-save middleware to validate booking date
BookingSchema.pre('save', function(this: IBooking, next) {
  if (this.isNew || this.isModified('date')) {
    const bookingDate = new Date(this.date);
    const now = new Date();
    
    // Booking must be in the future
    if (bookingDate <= now) {
      return next(new Error('Booking date must be in the future'));
    }
    
    // Booking can't be more than 90 days in advance
    const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (bookingDate > maxDate) {
      return next(new Error('Booking date cannot be more than 90 days in advance'));
    }
  }
  
  next();
});

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);