import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis('redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

// Create a queue named 'code-execution'
export const executionQueue = new Queue('code-execution', { connection });
