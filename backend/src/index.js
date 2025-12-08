import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articlesRouter from './routes/articles.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import articleJob from './services/articleJob.js';
import Article from './models/Article.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/admin', adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Create tables if they don't exist
    await Article.createTable();
    await User.createTable();
    console.log('✓ Database tables ready');

    // Start the cron job for article generation
    articleJob.start();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api/articles`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
