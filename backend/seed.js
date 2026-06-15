import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './src/models/Problem.js';
import TestCase from './src/models/TestCase.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.mongoURI || 'mongodb://localhost:27017/algoarena');
        console.log('MongoDB Connected for Seeding');

        await Problem.deleteMany();
        await TestCase.deleteMany();

        const twoSum = await Problem.create({
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
            difficulty: 'Easy',
            tags: ['Array', 'Hash Table'],
            metrics: {testCaseCount:2}
        });

        await TestCase.insertMany([
            {
                problemId: twoSum._id,
                order: 1,
                input: '4\n2 7 11 15\n9',
                expectedOutput: '0 1',
                isHidden: false
            },
            {
                problemId: twoSum._id,
                order: 2,
                input: '3\n3 2 4\n6',
                expectedOutput: '1 2',
                isHidden: true
            }
        ]);

        console.log('Database Seeded Successfully!');
        process.exit();
    }catch (error) {
        console.error('Error seeding DB:', error);
        process.exit(1);
    }
}

seedDB();