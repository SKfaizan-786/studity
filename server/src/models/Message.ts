import mongoose, { Document, Schema, Types } from 'mongoose';

// Define Message interface for chat system
export interface IMessage extends Document {
  sender: Types.ObjectId; // Reference to user who sent the message
  recipient: Types.ObjectId; // Reference to user who receives the message
  booking?: Types.ObjectId; // Optional reference to booking context
  messageType: 'text' | 'image' | 'file' | 'video' | 'audio';
  content: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }[];
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  editedAt?: Date;
  replyTo?: Types.ObjectId; // Reference to message being replied to
  createdAt: Date;
  updatedAt: Date;
}

// Message Schema
const MessageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'video', 'audio'],
    default: 'text'
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  editedAt: {
    type: Date,
    default: null
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ booking: 1 });
MessageSchema.index({ createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);

// Define Notification interface
export interface INotification extends Document {
  recipient: Types.ObjectId; // Reference to user receiving notification
  type: 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'message_received' | 'reminder' | 'system';
  title: string;
  message: string;
  data?: any; // Additional data based on notification type
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string; // URL to navigate when notification is clicked
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Schema
const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking_confirmed', 'booking_cancelled', 'payment_received', 'message_received', 'reminder', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: Schema.Types.Mixed,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  actionUrl: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
