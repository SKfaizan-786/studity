import { Router } from 'express';
import { login, register, authenticate } from '../controllers/auth-controller';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (example - will need to add more as needed)
// router.get('/me', authenticate, getUserProfile);

export default router;
