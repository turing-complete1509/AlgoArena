import express from 'express';
import { createSubmission, getSubmissionById } from '../controllers/submissionController.js';

const router = express.Router();

router.post('/', createSubmission);

router.get('/:id', getSubmissionById);

export default router;
