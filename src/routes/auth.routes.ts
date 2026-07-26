import { Router } from 'express';
import { register, login, googleAuth, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

export default router;
