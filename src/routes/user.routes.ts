import { Router } from 'express';
import { updateProfile, updatePassword } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

export default router;
