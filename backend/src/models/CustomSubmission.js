import mongoose from 'mongoose';

const CustomSubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    customInput: { type: String, required: true },
    output: { type: String }, // STDOUT or STDERR from Docker
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Completed', 'Error'],
        default: 'Pending'
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CustomSubmission', CustomSubmissionSchema);
