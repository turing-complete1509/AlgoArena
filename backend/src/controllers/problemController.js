import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';

// @desc    Get all problems (Dashboard View)
// @route   GET /api/problems
export const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find().select('-description');
        res.json(problems);
    }catch(err){
        console.error(err);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

// @desc    Get single problem by ID (Workspace View)
// @route   GET /api/problems/:id
export const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if(!problem){
            return res.status(404).json({
                message: 'Problem not found'
            });
        }
        
        // Fetch the first testcase to use as a sample for the frontend console
        const sampleTestCase = await TestCase.findOne({ problemId: problem._id }).sort('order');
        
        const responseData = problem.toObject();
        if (sampleTestCase) {
            responseData.sampleTestCase = sampleTestCase.input;
        }

        res.json(responseData);
    } catch(error) {
        console.error(error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};

// @desc    Create a problem
// @route   POST /api/problems
export const createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, tags, testCases } = req.body;

        const problem = await Problem.create({
            title,
            description,
            difficulty,
            tags: tags || []
        });

        if (testCases && testCases.length > 0) {
            const testCasesToCreate = testCases.map((tc, index) => ({
                problemId: problem._id,
                order: index + 1,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden !== undefined ? tc.isHidden : true
            }));
            await TestCase.insertMany(testCasesToCreate);
        }

        res.status(201).json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a problem
// @route   PUT /api/problems/:id
export const updateProblem = async (req, res) => {
    try {
        const { title, description, difficulty, tags, testCases } = req.body;

        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        problem.title = title || problem.title;
        problem.description = description || problem.description;
        problem.difficulty = difficulty || problem.difficulty;
        if (tags !== undefined) problem.tags = tags;

        await problem.save();

        if (testCases) {
            // Delete existing test cases
            await TestCase.deleteMany({ problemId: problem._id });
            // Insert new test cases
            if (testCases.length > 0) {
                const testCasesToCreate = testCases.map((tc, index) => ({
                    problemId: problem._id,
                    order: index + 1,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: tc.isHidden !== undefined ? tc.isHidden : true
                }));
                await TestCase.insertMany(testCasesToCreate);
            }
        }

        res.json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a problem
// @route   DELETE /api/problems/:id
export const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        await TestCase.deleteMany({ problemId: problem._id });
        await Problem.deleteOne({ _id: problem._id });

        res.json({ message: 'Problem removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
