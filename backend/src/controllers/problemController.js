import Problem from '../models/Problem.js';

//desc -> Get all problems (Dashboard View)
//route -> GET /api/problems

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

//desc -> Get single problem by ID (Workspace View)
//route -> GET /api/problems/:id

export const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if(!problem){
            return res.status(404).json({
                message: 'Problem not found'
            });
        }
        res.json(problem);
    } catch(error) {
        console.error(error);
        res.status(500).json({
            message: 'Server Error'
        });
    }
};
