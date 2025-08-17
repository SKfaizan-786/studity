import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import bookingRoutes from './routes/bookings';
import teacherRoutes from './routes/teachers';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import { reminderService } from './services/reminderService';

// Initialize passport configuration
// Change this line to the new file name
import './passport-config'; // ✅ CORRECT IMPORT

dotenv.config();

const app: Application = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'yuvshiksha-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Passport
app.use(passport.initialize()); // This will now correctly use the npm package
app.use(passport.session()); // This will now correctly use the npm package

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Set socket.io instance for notifications
    import('./services/notificationService').then(({ setSocketIO }) => {
      setSocketIO(io);
    });
    
    // Initialize reminder service after DB connection
    reminderService.init();
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// MongoDB connection status logging
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);

// Routes
// Debug logging middleware (TEMPORARY)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body) console.log('Body:', req.body);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Route
app.get('/', (_req, res) => {
  res.send('🚀 API is running...');
});

// ✅ Test DB Connection Route with TypeScript-safe check
app.get('/test-db-connection', async (_req, res) => {
  try {
    await mongoose.connection.asPromise(); // ensures the connection is ready
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(500).json({ message: 'Database is not ready' });
    }

    const testUser = await db.collection('users').findOne({});
    console.log('Test DB Connection: Found a user:', testUser ? testUser._id : 'No user found');
    res.json({ 
      message: 'DB connection test complete', 
      userFound: !!testUser, 
      testUser: testUser ? testUser._id.toString() : null
    });
  } catch (err: any) {
    console.error('Test DB Connection Error:', err);
    res.status(500).json({ message: 'DB connection test failed', error: err.message });
  }
});

// Socket.io connection handling
const connectedUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (userId: string) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Handle joining chat rooms
  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data: {
    sender: string;
    recipient: string;
    content: string;
    messageType?: string;
    booking?: string;
  }) => {
    try {
      // Import Message model dynamically to avoid circular dependencies
      const Message = (await import('./models/Message')).default;
      
      // Create new message
      const newMessage = new Message({
        sender: data.sender,
        recipient: data.recipient,
        content: data.content,
        messageType: data.messageType || 'text',
        booking: data.booking || null
      });

      await newMessage.save();
      
      // Populate sender and recipient info
      await newMessage.populate([
        { path: 'sender', select: 'firstName lastName avatar email' },
        { path: 'recipient', select: 'firstName lastName avatar email' }
      ]);

      // Create room ID (consistent for both users)
      const roomId = [data.sender, data.recipient].sort().join('_');
      
      // Emit to both users
      io.to(roomId).emit('new_message', newMessage);
      
  // Also emit to individual user rooms in case they're not in the chat room
      io.to(`user_${data.recipient}`).emit('message_notification', {
        messageId: newMessage._id,
        sender: newMessage.sender,
        content: data.content,
        timestamp: newMessage.createdAt
      });

      // Create a message notification in the database
      const { notificationService } = await import('./services/notificationService');
      const populatedSender = newMessage.sender as any; // Type assertion for populated field
      await notificationService.createNotification({
        recipient: new (await import('mongoose')).Types.ObjectId(data.recipient),
        sender: new (await import('mongoose')).Types.ObjectId(data.sender),
        title: 'New Message',
        message: `You have a new message from ${populatedSender.firstName} ${populatedSender.lastName}`,
        type: 'message',
        category: 'message',
        priority: 'low',
        actionUrl: `/messages/${data.sender}`,
        data: {
          messageId: newMessage._id,
          senderId: data.sender
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('mark_message_read', async (messageId: string) => {
    try {
      const Message = (await import('./models/Message')).default;
      await Message.findByIdAndUpdate(messageId, {
        isRead: true,
        readAt: new Date()
      });
      
      socket.broadcast.emit('message_read', { messageId });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});