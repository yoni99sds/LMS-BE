import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';

const createRateLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: {
      status: 'fail',
      message,
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,

    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
  });

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour (temporary)
  max: 1000,

  standardHeaders: true,
  legacyHeaders: false,

  // 🔥 FIX: prevents double counting crash
  skip: (req) => req.method === 'OPTIONS',

  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.',
    });
  },
});
export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  15,
  'Too many authentication attempts from this IP, please try again after 15 minutes'
);
