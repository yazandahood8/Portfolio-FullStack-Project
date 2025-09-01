// src/index.js
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import path from 'path';
import pool from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import blogPostRoutes from './routes/blogPostRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import volunteeringRoutes from './routes/volunteeringRoutes.js';
import messagesRouter from './routes/messageRoutes.js';
import certificationRoutes from './routes/certificationRoutes.js';

import uploadsRouter from './routes/uploads.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// JSON
app.use(express.json());

// CORS
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:3001',
  'https://portfolio-fullstack-project-1.onrender.com',
];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// DB connect (startup check)
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL', err);
    process.exit(1);
  });

// ---- Static / uploads
app.use('/api/v1/uploads', uploadsRouter);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ---- Versioned routes
app.use('/api/v1/auth', authRoutes);

// IMPORTANT: mount specific /users/:userId/* routes BEFORE the generic /users
app.use('/api/v1/users/:userId/skills',        skillRoutes);
app.use('/api/v1/users/:userId/experiences',   experienceRoutes);
app.use('/api/v1/users/:userId/projects',      projectRoutes);
app.use('/api/v1/users/:userId/blog-posts',    blogPostRoutes);
app.use('/api/v1/users/:userId/educations',    educationRoutes);
app.use('/api/v1/users/:userId/volunteerings', volunteeringRoutes);
app.use('/api/v1/users/:userId/certifications', certificationRoutes);

// Generic users router LAST so it doesn't swallow the sub-resources
app.use('/api/v1/users', userRoutes);

// Other routes
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/blog-posts', blogPostRoutes); // if you also expose global blog routes
app.use('/api/v1', assistantRoutes);

// Global error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
