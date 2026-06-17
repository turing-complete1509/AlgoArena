import express from 'express';
import {
    getProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem
} from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getProblems)
    .post(protect, admin, createProblem);

router.route('/:id')
    .get(getProblemById)
    .put(protect, admin, updateProblem)
    .delete(protect, admin, deleteProblem);

export default router;