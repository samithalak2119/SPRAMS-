require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const ResearchEntry = require('../models/ResearchEntry');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await ResearchEntry.deleteMany({});

        // Create admin user
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@archive.edu',
            passwordHash: 'admin123456',
            role: 'admin',
        });

        // Create lecturer
        const lecturer = await User.create({
            name: 'Dr. Jane Smith',
            email: 'lecturer@archive.edu',
            passwordHash: 'lecturer123',
            role: 'lecturer',
        });

        // Create student
        const student = await User.create({
            name: 'John Doe',
            email: 'student@archive.edu',
            passwordHash: 'student123',
            role: 'student',
        });

        // Create sample projects
        const projects = await Project.insertMany([
            {
                title: 'AI-Powered Crop Disease Detection System',
                department: 'Computer Science',
                academicYear: '2023/2024',
                groupName: 'Team Alpha',
                supervisor: 'Dr. Jane Smith',
                abstract: 'This project develops an AI-powered system for early detection of crop diseases using computer vision and machine learning. The system analyzes images captured by smartphones to identify common crop diseases, providing farmers with actionable insights to improve yield and reduce economic losses.',
                members: [
                    { name: 'Alice Johnson', regNo: 'CS/2020/001' },
                    { name: 'Bob Williams', regNo: 'CS/2020/002' },
                    { name: 'Carol Davis', regNo: 'CS/2020/003' },
                ],
                createdBy: admin._id,
            },
            {
                title: 'Smart Campus Energy Management System',
                department: 'Electrical Engineering',
                academicYear: '2023/2024',
                groupName: 'EcoTech',
                supervisor: 'Prof. Michael Brown',
                abstract: 'A comprehensive IoT-based energy management system designed for university campuses. The system monitors power consumption in real-time, applies machine learning algorithms to predict energy demand, and automatically adjusts building systems to reduce energy waste by up to 30%.',
                members: [
                    { name: 'David Wilson', regNo: 'EE/2020/010' },
                    { name: 'Emma Martinez', regNo: 'EE/2020/011' },
                ],
                createdBy: admin._id,
            },
            {
                title: 'Blockchain-Based Academic Credential Verification',
                department: 'Information Technology',
                academicYear: '2022/2023',
                groupName: 'BlockEdu',
                supervisor: 'Dr. Sarah Lee',
                abstract: 'This project implements a blockchain-based system for storing, managing, and verifying academic credentials. Using distributed ledger technology, the system ensures tamper-proof storage of certificates and transcripts, enabling instant verification by employers and institutions worldwide.',
                members: [
                    { name: 'Frank Garcia', regNo: 'IT/2019/005' },
                    { name: 'Grace Taylor', regNo: 'IT/2019/006' },
                    { name: 'Henry Anderson', regNo: 'IT/2019/007' },
                    { name: 'Iris Thomas', regNo: 'IT/2019/008' },
                ],
                createdBy: admin._id,
            },
        ]);

        // Create sample research entries
        await ResearchEntry.insertMany([
            {
                title: 'Deep Learning Approaches for Natural Language Processing in Low-Resource Languages',
                description: 'This research investigates transfer learning techniques and cross-lingual models for improving NLP performance in languages with limited training data. We evaluate BERT-based models fine-tuned on multilingual datasets and propose a novel domain adaptation approach that achieves state-of-the-art results on five low-resource languages.',
                authorId: lecturer._id,
                year: 2024,
                tags: ['deep learning', 'NLP', 'low-resource languages', 'transfer learning', 'BERT'],
                files: [],
                aiSummary: 'This research explores techniques to improve natural language processing in languages with limited training data. Using BERT-based models and cross-lingual transfer learning, the study achieves state-of-the-art results across five low-resource languages. The proposed domain adaptation approach shows significant promise for expanding AI capabilities to underserved linguistic communities.',
            },
            {
                title: 'Sustainable Materials in Civil Engineering: A Systematic Review',
                description: 'A comprehensive systematic review of sustainable materials used in modern civil engineering projects from 2015 to 2024. This study analyzes 150+ peer-reviewed papers covering fly ash, recycled aggregates, bamboo, and bio-based composites. The review identifies key performance benchmarks and environmental impact metrics for each material category.',
                authorId: lecturer._id,
                year: 2023,
                tags: ['sustainable materials', 'civil engineering', 'systematic review', 'green building'],
                files: [],
            },
        ]);

        console.log('✅ Database seeded successfully!');
        console.log('📧 Admin: admin@archive.edu / admin123456');
        console.log('📧 Lecturer: lecturer@archive.edu / lecturer123');
        console.log('📧 Student: student@archive.edu / student123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seed();
