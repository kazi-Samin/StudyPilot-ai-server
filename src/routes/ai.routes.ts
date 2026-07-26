import { Router } from 'express';
import { getRecommendations, generatePlan, chat } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.post('/recommendations', protect, getRecommendations);
router.post('/generate-plan', protect, generatePlan);
router.post('/chat', protect, chat);

export default router;
