// src/index.d.ts
import { IUser } from './models/User'; // Ensure 'IUser' is correctly imported from your User model

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // This is the correct, specific type declaration for 'user'
    }
  }
}