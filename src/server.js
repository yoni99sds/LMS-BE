import './config/env.js';

import app from './app.js';
import connectDB from './config/db.js';
import logger from './config/logger.js';

// ==============================
// Uncaught Exceptions
// ==============================
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err);
  process.exit(1);
});

// ==============================
// Connect MongoDB
// ==============================
connectDB();

// ==============================
// Start Server
// ==============================
const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  logger.info(
    `LMS Server running in ${
      process.env.NODE_ENV || 'development'
    } mode on port ${port}`
  );
});

// ===========================a===
// Unhandled Promise Rejections
// ==============================
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down gracefully...');
  logger.error(err);

  server.close(() => {
    process.exit(1);
  });
});