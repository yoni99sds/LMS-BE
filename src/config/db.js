import mongoose from 'mongoose';
import logger from './logger.js';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lms';

  try {
    const options = {
      autoIndex: true, // Build indexes (use false in high-scale prod, true for dev/typical)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    await mongoose.connect(mongoUri, options);
    logger.info('MongoDB connected successfully.');
  } catch (error) {
    logger.error('MongoDB connection error: %s', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error after initial connection: %s', err.message);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB.');
});

export default connectDB;
