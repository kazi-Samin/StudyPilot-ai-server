import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  avatar: { type: String, required: false },
  googleId: { type: String, required: false },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
