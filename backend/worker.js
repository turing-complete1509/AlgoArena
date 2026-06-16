import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { exec } from 'child_process';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './src/models/Submission.js';

dotenv.config();

// Connect to MongoDB just like the main server
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/algoarena')
    .then(() => console.log('Worker connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const connection = new IORedis('redis://localhost:6379', { maxRetriesPerRequest: null });

// This function spawns Docker and runs the code
const runDocker = (script) => {
    return new Promise((resolve, reject) => {
        // Run a fresh, isolated Node.js container
        // -i keeps STDIN open so we can pipe our script in
        // --rm automatically deletes the container when it finishes
        const dockerProcess = exec('docker run -i --rm node:18-alpine node', { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) return resolve({ status: 'Time Limit Exceeded', output: 'Execution timed out.' });
                return resolve({ status: 'Runtime Error', output: stderr || error.message });
            }
            if (stderr) {
                return resolve({ status: 'Runtime Error', output: stderr });
            }
            resolve({ status: 'Success', output: stdout.trim() });
        });

        // Write the script to the Docker container's standard input
        dockerProcess.stdin.write(script);
        dockerProcess.stdin.end();
    });
};

// The actual worker that listens to the queue
const worker = new Worker('code-execution', async (job) => {
    const { submissionId, code, testCases } = job.data;
    console.log(`Processing submission: ${submissionId}`);

    // Update status to processing
    await Submission.findByIdAndUpdate(submissionId, { status: 'Processing' });

    // We build a wrapper script that runs the user's code against the test cases
    const wrapperScript = `
        ${code}
        
        const testCases = ${JSON.stringify(testCases)};
        let passedAll = true;

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            
            // Assume user function is named twoSum for now (based on our seed data)
            // In a real OJ, we dynamically parse function names or enforce a template
            const args = tc.input.split('\\n'); 
            const target = parseInt(args[2]);
            const nums = args[1].split(' ').map(Number);
            
            try {
                const result = twoSum(nums, target);
                const expected = tc.expectedOutput.split(' ').map(Number);
                
                if (JSON.stringify(result) !== JSON.stringify(expected)) {
                    console.log("Wrong Answer");
                    passedAll = false;
                    break;
                }
            } catch (e) {
                console.error(e.message);
                process.exit(1);
            }
        }
        
        if (passedAll) console.log("Accepted");
    `;

    // Execute in Docker!
    const result = await runDocker(wrapperScript);

    // Save final status to DB
    let finalStatus = 'Wrong Answer';
    if (result.status === 'Runtime Error') finalStatus = 'Runtime Error';
    if (result.status === 'Time Limit Exceeded') finalStatus = 'Time Limit Exceeded';
    if (result.output === 'Accepted') finalStatus = 'Accepted';

    await Submission.findByIdAndUpdate(submissionId, { status: finalStatus });
    console.log(`Submission ${submissionId} finished with status: ${finalStatus}`);

}, { connection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

console.log("AlgoArena Execution Worker is running...");
