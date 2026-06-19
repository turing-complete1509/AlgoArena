import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { exec } from 'child_process';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Submission from './src/models/Submission.js';
import CustomSubmission from './src/models/CustomSubmission.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

// No local temp directory needed anymore, code is injected directly!

// Connect to MongoDB just like the main server
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/algoarena')
    .then(() => console.log('Worker connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const connection = new IORedis('redis://redis:6379', { maxRetriesPerRequest: null });

// This function spawns Docker and runs the code using Standard I/O
const runDockerTest = (language, filename, code, input) => {
    return new Promise((resolve, reject) => {
        let image, runCmd;

        if (language === 'javascript') {
            image = 'node:20-alpine';
            runCmd = `node ${filename}`;
        } else if (language === 'python') {
            image = 'python:3.9-alpine';
            runCmd = `python3 ${filename}`;
        } else if (language === 'cpp') {
            image = 'gcc:latest';
            // Compile then run
            runCmd = `g++ ${filename} -o a.out && ./a.out`;
        } else if (language === 'java') {
            image = 'eclipse-temurin:17-alpine';
            // Compile then run (assumes public class Main)
            runCmd = `javac ${filename} && java Main`;
        } else {
            return resolve({ status: 'Error', output: 'Unsupported language' });
        }

        const b64Code = Buffer.from(code).toString('base64');
        const setupCmd = `echo $B64_CODE | base64 -d > ${filename} && ${runCmd}`;

        // No volume mounts! The code is passed securely as an environment variable and decoded inside the isolated container.
        const dockerCmd = `docker run -i --rm -e B64_CODE="${b64Code}" -w /app ${image} sh -c "${setupCmd}"`;

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
    const { submissionId, code, testCases, isCustom, language, customInput } = job.data;
    console.log(`Processing ${isCustom ? 'custom ' : ''}submission: ${submissionId}`);

    const Model = isCustom ? CustomSubmission : Submission;
    const submission = await Model.findById(submissionId);
    if (!submission) return;

    // Update status to processing
    await Model.findByIdAndUpdate(submissionId, { status: 'Processing' });

    const lang = isCustom ? language : submission.language;
    let ext = '';
    if (lang === 'javascript') ext = 'js';
    else if (lang === 'python') ext = 'py';
    else if (lang === 'cpp') ext = 'cpp';
    else if (lang === 'java') ext = 'java';

    let filename = '';
    if (lang === 'java') {
        filename = 'Main.java';
    } else {
        filename = `main.${ext}`;
    }

    try {
        if (isCustom) {
            const formattedInput = customInput ? customInput.replace(/\\n/g, '\n') : '';
            const result = await runDockerTest(lang, filename, code, formattedInput);
            
            await Model.findByIdAndUpdate(submissionId, { 
                status: result.status === 'Success' ? 'Completed' : result.status,
                output: result.output 
            });
            console.log(`Custom submission ${submissionId} finished with status: ${result.status}`);
        } else {
            let finalStatus = 'Accepted';

            for (let i = 0; i < testCases.length; i++) {
                const tc = testCases[i];

                // Format input carefully
                const formattedInput = tc.input.replace(/\\n/g, '\n');
                const expectedOutput = tc.expectedOutput.replace(/\\n/g, '\n').trim();

                const result = await runDockerTest(lang, filename, code, formattedInput);

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

            await Model.findByIdAndUpdate(submissionId, { status: finalStatus });
            console.log(`Submission ${submissionId} finished with status: ${finalStatus}`);
        }

    } catch (e) {
        console.error("Worker error:", e);
        await Model.findByIdAndUpdate(submissionId, { status: 'Internal Error' });
    }

}, { connection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

console.log("AlgoArena Execution Worker is running...");
