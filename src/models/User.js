import mongoose from 'mongoose';
import { ROLES, ROLE_VALUES } from '../config/roles.js';

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.USER }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
