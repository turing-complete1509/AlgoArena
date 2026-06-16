import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import problemRoutes from './routes/problemRoutes.js';
import authRoutes from './routes/authRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/problems', problemRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/submissions', submissionRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'AlgoArena API is running smoothly' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
