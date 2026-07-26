const fs = require('fs');
const path = require('path');

const root = 'c:\\\\Projects\\\\StudyPilot-ai-server';

const files = {
  'package.json': `{
  "name": "studypilot-ai-server",
  "version": "1.0.0",
  "description": "StudyPilot API server",
  "main": "src/app.ts",
  "scripts": {
    "dev": "npx tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "seed": "npx tsx src/seed/seed.ts"
  },
  "dependencies": {
    "@google/genai": "^0.1.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-validator": "^7.1.0",
    "google-auth-library": "^9.11.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^20.14.2",
    "tsx": "^4.15.1",
    "typescript": "^5.4.5"
  }
}`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "lib": ["es2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "typeRoots": ["./node_modules/@types", "./src/types"]
  },
  "include": ["src/**/*"]
}`,

  '.env.example': `PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/studypilot
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
`,

  'src/types/express.d.ts': `import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}`,

  'src/config/db.ts': `import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studypilot');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};`,

  'src/models/User.ts': `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // optional for oauth
  googleId: { type: String, required: false },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);`,

  'src/models/StudyPlan.ts': `import mongoose from 'mongoose';

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

export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);`,

  'src/models/Review.ts': `import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  studyPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPlan', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, { timestamps: true });

export const Review = mongoose.model('Review', reviewSchema);`,

  'src/middleware/auth.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};`,

  'src/middleware/error.middleware.ts': `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};`,

  'src/services/gemini.service.ts': `import { GoogleGenAI } from '@google/genai';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
};

export const generateContent = async (prompt: string) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return response.text;
};

export const chatWithGemini = async (message: string, history: Array<{role: string, content: string}> = []) => {
    const ai = getGeminiClient();
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
        ]
    });
    return response.text;
};`,

  'src/controllers/auth.controller.ts': `import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString()) });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString()) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if(!payload) return res.status(400).json({message: 'Invalid google token'});
        
        let user = await User.findOne({ email: payload.email });
        if(!user) {
            user = await User.create({
                name: payload.name,
                email: payload.email,
                googleId: payload.sub
            });
        }
        res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id.toString()) });
    } catch(error: any) { res.status(500).json({ message: error.message }); }
};

export const getMe = async (req: Request, res: Response) => {
  res.json(req.user);
};`,

  'src/controllers/studyPlan.controller.ts': `import { Request, Response } from 'express';
import { StudyPlan } from '../models/StudyPlan';

export const getStudyPlans = async (req: Request, res: Response) => {
  try {
    const { search, subject, difficulty, sort, page = '1', limit = '10' } = req.query;
    const query: any = {};
    
    if (search) query.$text = { $search: search as string };
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'duration') sortOptions = { duration: 1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const plans = await StudyPlan.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));
      
    const total = await StudyPlan.countDocuments(query);
    
    res.json({ plans, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
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
};`,

  'src/controllers/review.controller.ts': `import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { StudyPlan } from '../models/StudyPlan';

export const addReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment, studyPlanId } = req.body;
    const review = await Review.create({ rating, comment, studyPlanId, userId: req.user._id });
    
    const reviews = await Review.find({ studyPlanId });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await StudyPlan.findByIdAndUpdate(studyPlanId, { rating: avgRating, reviewCount: reviews.length });
    
    res.status(201).json(review);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await Review.find({ studyPlanId: req.params.planId }).populate('userId', 'name');
    res.json(reviews);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};`,

  'src/controllers/ai.controller.ts': `import { Request, Response } from 'express';
import { generateContent, chatWithGemini } from '../services/gemini.service';

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { subjects, difficulty, goals } = req.body;
    const prompt = \`As an AI tutor, suggest a study path for a \${difficulty} level student interested in \${subjects.join(', ')}. Their goals: \${goals}. Return a structured list of recommendations.\`;
    const result = await generateContent(prompt);
    res.json({ recommendation: result });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const generatePlan = async (req: Request, res: Response) => {
  try {
    const { topic, duration, difficulty, goals } = req.body;
    const prompt = \`Create a detailed \${duration} study plan for \${topic} at a \${difficulty} level. Goals: \${goals}. Provide schedule and topics.\`;
    const result = await generateContent(prompt);
    res.json({ plan: result });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    const responseText = await chatWithGemini(message, history || []);
    
    const suggestionsPrompt = \`Based on this response: "\${String(responseText).substring(0, 500)}...", suggest 3 follow-up questions the user can ask. Format as JSON array of strings.\`;
    let suggestions = [];
    try {
        const suggRaw = await generateContent(suggestionsPrompt);
        if (suggRaw) {
            const match = suggRaw.match(/\\[.*\\]/s);
            if (match) {
                suggestions = JSON.parse(match[0]);
            }
        }
    } catch(e) { /* ignore error in parsing suggestions */ }

    res.json({ response: responseText, suggestions });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};`,

  'src/routes/auth.routes.ts': `import { Router } from 'express';
import { register, login, googleAuth, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);

export default router;`,

  'src/routes/studyPlan.routes.ts': `import { Router } from 'express';
import { getStudyPlans, getStudyPlanById, createStudyPlan, updateStudyPlan, deleteStudyPlan } from '../controllers/studyPlan.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.route('/').get(getStudyPlans).post(protect, createStudyPlan);
router.route('/:id').get(getStudyPlanById).put(protect, updateStudyPlan).delete(protect, deleteStudyPlan);

export default router;`,

  'src/routes/review.routes.ts': `import { Router } from 'express';
import { addReview, getReviews } from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.post('/', protect, addReview);
router.get('/:planId', getReviews);

export default router;`,

  'src/routes/ai.routes.ts': `import { Router } from 'express';
import { getRecommendations, generatePlan, chat } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.post('/recommendations', protect, getRecommendations);
router.post('/generate-plan', protect, generatePlan);
router.post('/chat', protect, chat);

export default router;`,

  'src/routes/index.ts': `import { Router } from 'express';
import authRoutes from './auth.routes';
import studyPlanRoutes from './studyPlan.routes';
import reviewRoutes from './review.routes';
import aiRoutes from './ai.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/study-plans', studyPlanRoutes);
router.use('/reviews', reviewRoutes);
router.use('/ai', aiRoutes);

export default router;`,

  'src/app.ts': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,

  'src/seed/seed.ts': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { StudyPlan } from '../models/StudyPlan';
import { Review } from '../models/Review';

dotenv.config();

const subjects = ['Mathematics', 'Physics', 'Computer Science', 'Biology', 'History', 'Economics', 'Psychology', 'Literature'];
const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

const generatePlans = (userId: mongoose.Types.ObjectId) => {
    const plans = [];
    for(let i = 1; i <= 20; i++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        plans.push({
            title: \`Mastering \${subject} - Level \${i}\`,
            shortDescription: \`A comprehensive guide to \${subject}\`,
            fullDescription: \`Detailed syllabus covering multiple topics in \${subject}, designed for \${difficulty} level.\`,
            subject,
            difficulty,
            duration: \`\${Math.floor(Math.random() * 10) + 2} weeks\`,
            imageUrl: \`https://source.unsplash.com/random/800x600/?\${subject}\`,
            topics: [\`Intro to \${subject}\`, \`Core concepts\`, \`Advanced problems\`],
            schedule: 'Week 1: Basics\\nWeek 2: Deep dive',
            userId
        });
    }
    return plans;
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studypilot');
        
        await User.deleteMany({});
        await StudyPlan.deleteMany({});
        await Review.deleteMany({});
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('demo1234', salt);
        
        const user = await User.create({
            name: 'Demo User',
            email: 'demo@studypilot.com',
            password: hashedPassword
        });
        
        const plansToInsert = generatePlans(user._id);
        const insertedPlans = await StudyPlan.insertMany(plansToInsert);
        
        for (const plan of insertedPlans) {
            await Review.create({
                studyPlanId: plan._id,
                userId: user._id,
                rating: 5,
                comment: 'Excellent plan!'
            });
            await StudyPlan.findByIdAndUpdate(plan._id, { rating: 5, reviewCount: 1 });
        }
        
        console.log('Database Seeded!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();`
};

Object.keys(files).forEach(filename => {
    const filePath = path.join(root, filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, files[filename], 'utf8');
});
console.log('Successfully created 22 files.');
