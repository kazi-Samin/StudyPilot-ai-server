import { Router } from 'express';
import authRoutes from './auth.routes';
import studyPlanRoutes from './studyPlan.routes';
import reviewRoutes from './review.routes';
import aiRoutes from './ai.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/study-plans', studyPlanRoutes);
router.use('/reviews', reviewRoutes);
router.use('/ai', aiRoutes);

export default router;
