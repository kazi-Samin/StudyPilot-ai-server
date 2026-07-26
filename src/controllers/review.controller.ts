import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { StudyPlan } from '../models/StudyPlan';

export const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment, studyPlanId } = req.body;
    const review = await Review.create({ rating, comment, studyPlanId, userId: req.user._id });

    // Recalculate average rating
    const reviews = await Review.find({ studyPlanId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await StudyPlan.findByIdAndUpdate(studyPlanId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
    });

    // Return with populated user
    const populated = await Review.findById(review._id).populate('userId', 'name email');
    const result = populated?.toObject();
    if (result) {
      (result as any).user = result.userId;
    }
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ studyPlanId: req.params.planId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Transform: add `user` field from populated `userId`
    const transformed = reviews.map((review) => {
      const obj = review.toObject();
      (obj as any).user = obj.userId;
      return obj;
    });

    res.json(transformed);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
