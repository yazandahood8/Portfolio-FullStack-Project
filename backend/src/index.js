// src/index.js
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
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

import path from 'path';
import { errorHandler } from './middlewares/errorHandler.js';
import uploadsRouter from './routes/uploads.js';

const app = express();

// parse JSON bodies
app.use(express.json());

const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost:3001'
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// Test DB connection on startup
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL', err);
    process.exit(1);
  });

// Mount versioned routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/users/:userId/skills', skillRoutes);
app.use('/api/v1/users/:userId/experiences', experienceRoutes);
app.use('/api/v1/users/:userId/projects', projectRoutes);
app.use('/api/v1/users/:userId/blog-posts', blogPostRoutes);
app.use('/api/v1/users/:userId/educations', educationRoutes);
app.use('/api/v1/users/:userId/volunteerings', volunteeringRoutes);
app.use('/api/v1/messages', messagesRouter);

app.use('/api/v1/blog-posts', blogPostRoutes);
app.use('/api/v1/uploads', uploadsRouter);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/v1', assistantRoutes);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
