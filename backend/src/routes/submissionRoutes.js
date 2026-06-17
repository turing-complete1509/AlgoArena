import express from 'express';
import { createSubmission, getSubmissionById } from '../controllers/submissionController.js';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createSubmission);

router.get('/:id', protect, getSubmissionById);

export default router;
