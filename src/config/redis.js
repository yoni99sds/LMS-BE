import Redis from 'ioredis';
import logger from './logger.js';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Create Redis client
const redisClient =
  process.env.NODE_ENV !== 'test'
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          if (times > 3) {
            logger.warn(
              'Redis connection failed. Falling back to in-memory store.'
            );
            return null;
          }

          return Math.min(times * 100, 2000);
        }
      })
    : null;

// Events
if (redisClient) {
  redisClient.on('connect', () => {
    logger.info('Connected to Redis successfully.');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis error: %s', err.message);
  });
}

// In-memory fallback
const memoryStore = new Map();

const redisService = {
  async get(key) {
    if (redisClient && redisClient.status === 'ready') {
      try {
        return await redisClient.get(key);
      } catch (err) {
        logger.error(
          'Redis get error: %s. Falling back to memory.',
          err.message
        );
      }
    }

    return memoryStore.get(key) || null;
  },

  async set(key, value, expirySeconds = null) {
    if (redisClient && redisClient.status === 'ready') {
      try {
        if (expirySeconds) {
          await redisClient.set(key, value, 'EX', expirySeconds);
        } else {
          await redisClient.set(key, value);
        }

        return true;
      } catch (err) {
        logger.error(
          'Redis set error: %s. Falling back to memory.',
          err.message
        );
      }
    }

    memoryStore.set(key, value);

    if (expirySeconds) {
      setTimeout(() => {
        memoryStore.delete(key);
      }, expirySeconds * 1000);
    }

    return true;
  },

  async del(key) {
    if (redisClient && redisClient.status === 'ready') {
      try {
        await redisClient.del(key);
        return true;
      } catch (err) {
        logger.error(
          'Redis delete error: %s. Falling back to memory.',
          err.message
        );
      }
    }

    memoryStore.delete(key);

    return true;
  },

  isConnected() {
    return redisClient && redisClient.status === 'ready';
  },

  client: redisClient
};

export default redisService;
export { redisClient };