import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    tags: [{ type: String }],
    limits: {
        timeLimitSec: { type: Number, default: 2.0 },
        memoryLimitMb: { type: Number, default: 256 },
        maxSourceCodeSizeKb: { type: Number, default: 50 },
        maxOutputSizeKb: { type: Number, default: 1024 }
    },
    metrics: {
        testCaseCount: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

ProblemSchema.index({ tags: 1, difficulty: 1 });

export default mongoose.model('Problem', ProblemSchema);
