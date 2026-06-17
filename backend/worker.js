import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { exec } from 'child_process';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './src/models/Submission.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, 'temp');

// Ensure temp directory exists
try {
    await fs.access(tempDir);
} catch {
    await fs.mkdir(tempDir);
}

// Connect to MongoDB just like the main server
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/algoarena')
    .then(() => console.log('Worker connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const connection = new IORedis('redis://127.0.0.1:6379', { maxRetriesPerRequest: null });

// This function spawns Docker and runs the code using Standard I/O
const runDockerTest = (language, filename, input) => {
    return new Promise((resolve, reject) => {
        let image, runCmd;

        if (language === 'javascript') {
            image = 'node:18-alpine';
            runCmd = `node ${filename}`;
        } else if (language === 'python') {
            image = 'python:3.9-alpine';
            runCmd = `python3 ${filename}`;
        } else if (language === 'cpp') {
            image = 'gcc:latest';
            // Compile then run
            runCmd = `g++ ${filename} -o a.out && ./a.out`;
        } else {
            return resolve({ status: 'Error', output: 'Unsupported language' });
        }

        // Mount the host temp directory to /app in the container
        const dockerCmd = `docker run -i --rm -v "${tempDir}:/app" -w /app ${image} sh -c "${runCmd}"`;

        const dockerProcess = exec(dockerCmd, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) return resolve({ status: 'Time Limit Exceeded', output: 'Execution timed out.' });
                return resolve({ status: 'Runtime Error', output: stderr || error.message });
            }
            // For C++, compiler warnings go to stderr, but we ignore them unless it's an error
            if (stderr && language !== 'cpp') {
                return resolve({ status: 'Runtime Error', output: stderr });
            }
            resolve({ status: 'Success', output: stdout.trim() });
        });

        // Write the input to the Docker container's standard input
        if (input) {
            dockerProcess.stdin.write(input);
        }
        dockerProcess.stdin.end();
    });
};

// The actual worker that listens to the queue
const worker = new Worker('code-execution', async (job) => {
    const { submissionId, code, testCases } = job.data;
    console.log(`Processing submission: ${submissionId}`);

    const submission = await Submission.findById(submissionId);
    if (!submission) return;

    // Update status to processing
    await Submission.findByIdAndUpdate(submissionId, { status: 'Processing' });

    const language = submission.language;
    let ext = '';
    if (language === 'javascript') ext = 'js';
    else if (language === 'python') ext = 'py';
    else if (language === 'cpp') ext = 'cpp';

    const jobIdStr = crypto.randomUUID();
    const filename = `main_${jobIdStr}.${ext}`;
    const filePath = path.join(tempDir, filename);

    try {
        await fs.writeFile(filePath, code);

        let finalStatus = 'Accepted';

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];

            // Format input carefully
            const formattedInput = tc.input.replace(/\\n/g, '\n');
            const expectedOutput = tc.expectedOutput.replace(/\\n/g, '\n').trim();

            const result = await runDockerTest(language, filename, formattedInput);

            if (result.status !== 'Success') {
                finalStatus = result.status;
                break;
            }

            if (result.output !== expectedOutput) {
                console.log(`Mismatch on TC ${i}. Expected: ${expectedOutput}, Got: ${result.output}`);
                finalStatus = 'Wrong Answer';
                break;
            }
        }

        await Submission.findByIdAndUpdate(submissionId, { status: finalStatus });
        console.log(`Submission ${submissionId} finished with status: ${finalStatus}`);

    } catch (e) {
        console.error("Worker error:", e);
        await Submission.findByIdAndUpdate(submissionId, { status: 'Internal Error' });
    } finally {
        // Clean up the temp file
        try {
            await fs.unlink(filePath);
        } catch (e) {
            // ignore
        }
    }

}, { connection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

console.log("AlgoArena Execution Worker is running...");
