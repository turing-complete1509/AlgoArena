import Submission from '../models/Submission.js';
import TestCase from '../models/TestCase.js';
import { executionQueue } from '../config/queue.js';

// @desc    Submit code for evaluation
// @route   POST /api/submissions
export const createSubmission = async (req, res) => {
    try {
        const { problemId, code, language } = req.body;
        
        const userId = req.user._id;

        // We support JS, Python, and C++

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

//@desc         Get user's submissions history
//@route        GET /api/submissions/history

export const getMySubmissions = async (req, res) => {
    try {
        const query = {
            userId: req.user._id
        }

        if(req.query.problemId){
            query.problemId = req.query.problemId;
        }

        const submissions = await Submission.find(query)
                .sort({submittedAt: -1})
                .select('-code');
            
        res.json(submissions);
    } catch(error){
        console.error('Error fetching history:', error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
}

