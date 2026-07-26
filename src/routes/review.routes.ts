import { Router } from 'express';
import { addReview, getReviews } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.post('/', protect, addReview);
router.get('/:planId', getReviews);

export default router;
