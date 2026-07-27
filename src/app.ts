import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();
connectDB();

const app = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://study-pilot-ai-omega.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(cors({ 
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use('/api', routes);

// Add a root route so the deployed backend doesn't show "Cannot GET /"
app.get('/', (req, res) => {
  res.send('StudyPilot AI Backend is running perfectly! 🚀');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
