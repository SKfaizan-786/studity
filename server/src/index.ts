import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import './passport';

dotenv.config();

const app: Application = express();
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
  secret: process.env.SESSION_SECRET || 'studity-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
