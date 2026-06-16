import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Internal Error'],
        default: 'Pending'
    },
    metrics: {
        executionTimeMs: { type: Number, default: 0 },
        memoryUsedKb: { type: Number, default: 0 },
        testCasesPassed: { type: Number, default: 0 }
    },
    submittedAt: { type: Date, default: Date.now }
});

SubmissionSchema.index({ userId: 1, problemId: 1 });
SubmissionSchema.index({ submittedAt: -1 });

export default mongoose.model('Submission', SubmissionSchema);
