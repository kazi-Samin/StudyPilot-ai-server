import { Router } from 'express';
import { getRecommendations, generatePlan, chat, streamChat } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.post('/recommendations', protect, getRecommendations);
router.post('/generate-plan', protect, generatePlan);
router.post('/chat/stream', streamChat);
router.get('/key', (req, res) => {
  res.json({ key: process.env.GEMINI_API_KEY });
});

export default router;
