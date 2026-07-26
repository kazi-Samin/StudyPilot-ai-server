import { Router } from 'express';
import { getStudyPlans, getMyPlans, getStudyPlanById, createStudyPlan, updateStudyPlan, deleteStudyPlan } from '../controllers/studyPlan.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.route('/user/my-plans').get(protect, getMyPlans);
router.route('/').get(getStudyPlans).post(protect, createStudyPlan);
router.route('/:id').get(getStudyPlanById).put(protect, updateStudyPlan).delete(protect, deleteStudyPlan);

export default router;
