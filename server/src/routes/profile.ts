import express from 'express';
import { getProfile, updateProfile } from '../controllers/profile-controller';
import { authenticate } from '../controllers/auth-controller';

const router = express.Router();

router.route('/')
  .get(authenticate, getProfile)
  .put(authenticate, updateProfile);

export default router;
