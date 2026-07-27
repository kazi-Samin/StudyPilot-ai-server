import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { OAuth2Client } from 'google-auth-library';

const googleClientId = process.env.GOOGLE_CLIENT_ID || '5819473927-1qek5cqr5irkou22bs8n7u9lebgejq45.apps.googleusercontent.com';
const client = new OAuth2Client(googleClientId);

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({
      token: generateToken(user._id.toString()),
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({
        token: generateToken(user._id.toString()),
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: googleClientId
        });
        const payload = ticket.getPayload();
        if(!payload) return res.status(400).json({message: 'Invalid google token'});
        
        let user = await User.findOne({ email: payload.email });
        if(!user) {
            user = await User.create({
                name: payload.name,
                email: payload.email,
                googleId: payload.sub,
                avatar: payload.picture
            });
        }
        res.json({
          token: generateToken(user._id.toString()),
          user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
        });
    } catch(error: any) { res.status(500).json({ message: error.message }); }
};

export const getMe = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Not authorized' });
  res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar });
};
