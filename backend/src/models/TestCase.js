import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    order: { type: Number, required: true },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: true },
    weight: { type: Number, default: 1 }
});

TestCaseSchema.index({ problemId: 1, order: 1 });

export default mongoose.model('TestCase', TestCaseSchema);
