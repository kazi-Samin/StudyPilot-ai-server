import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getRecommendations, generatePlan, chat, streamChat } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Rate limit: max 10 AI chat requests per IP per minute
const aiChatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: 'Too many requests. Please wait a moment before sending another message.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/recommendations', protect, getRecommendations);
router.post('/generate-plan', protect, generatePlan);
router.post('/chat', aiChatLimiter, chat);
router.post('/chat/stream', aiChatLimiter, streamChat);

export default router;
