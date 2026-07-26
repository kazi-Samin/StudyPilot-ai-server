import { Request, Response } from 'express';
import { StudyPlan } from '../models/StudyPlan';

export const getStudyPlans = async (req: Request, res: Response) => {
  try {
    const { search, subject, difficulty, sort, page = '1', limit = '10' } = req.query;
    const query: any = {};
    
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex }
      ];
    }
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'duration') sortOptions = { duration: 1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;
    
    const data = await StudyPlan.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
      
    const total = await StudyPlan.countDocuments(query);
    
    res.json({ data, total, page: Number(page), limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getMyPlans = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;
    
    const query = { userId: req.user._id };
    
    const data = await StudyPlan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    const total = await StudyPlan.countDocuments(query);
    
    res.json({ data, total, page: Number(page), limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getStudyPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await StudyPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const createStudyPlan = async (req: Request, res: Response) => {
  try {
    const plan = await StudyPlan.create({ ...req.body, userId: req.user._id });
    res.status(201).json(plan);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const updateStudyPlan = async (req: Request, res: Response) => {
  try {
    const plan = await StudyPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const deleteStudyPlan = async (req: Request, res: Response) => {
  try {
    await StudyPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan removed' });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};
