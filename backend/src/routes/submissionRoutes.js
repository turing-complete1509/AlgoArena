import express from 'express';
import { createSubmission, getSubmissionById, getMySubmissions, createCustomSubmission, getCustomSubmissionById } from '../controllers/submissionController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSubmission);
router.post('/custom', protect, createCustomSubmission);

router.get('/history', protect, getMySubmissions);

router.get('/custom/:id', protect, getCustomSubmissionById);
router.get('/:id', protect, getSubmissionById);

export default router;
