import Submission from '../models/Submission.js';
import TestCase from '../models/TestCase.js';
import { executionQueue } from '../config/queue.js';

// @desc    Submit code for evaluation
// @route   POST /api/submissions
export const createSubmission = async (req, res) => {
    try {
        const { problemId, code, language } = req.body;
        
        const userId = req.user._id;

        if (language !== 'javascript') {
            return res.status(400).json({ message: 'Only JavaScript is supported currently.' });
        }

        // 1. Create a Pending submission in the database
        const submission = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: 'Pending'
        });

        // 2. Fetch test cases for this problem
        const testCases = await TestCase.find({ problemId }).sort('order');

        // 3. Add job to the BullMQ Queue
        await executionQueue.add('execute-code', {
            submissionId: submission._id,
            code,
            testCases
        });

        // 4. Return immediately! Execution happens in the background.
        res.status(201).json({
            message: 'Submission received and queued for execution',
            submissionId: submission._id
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
export const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

