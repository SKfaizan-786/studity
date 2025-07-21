import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudentProfile {
  grade?: string;
  subjects?: string[];
  parentEmail?: string;
}

export interface ITeacherProfile {
  qualifications?: string;
  bio?: string;
  subjects?: string[];
  availability?: {
    day: string;
    slots: string[];
  }[];
}

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'student' | 'teacher';
  studentProfile?: IStudentProfile;
  teacherProfile?: ITeacherProfile;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      required: true,
    },
    studentProfile: {
      grade: String,
      subjects: [String],
      parentEmail: String,
    },
    teacherProfile: {
      qualifications: String,
      bio: String,
      subjects: [String],
      availability: [{
        day: String,
        slots: [String]
      }],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
