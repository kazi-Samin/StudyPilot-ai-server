import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  duration: { type: String, required: true },
  imageUrl: { type: String },
  topics: [{ type: String }],
  schedule: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

studyPlanSchema.index({ title: 'text', shortDescription: 'text' });

export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
