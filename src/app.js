import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'path';

import { configurePassport } from './config/passport.js';
import { apiLimiter } from './middlewares/rateLimiter.middleware.js';
import globalErrorHandler from './middlewares/error.middleware.js';
import routes from './routes/index.js';
import setupSwagger from './utils/swagger.js';
import AppError from './utils/AppError.js';

const app = express();

// ============================================================
// TRUST PROXY
// ============================================================
// Render runs behind a reverse proxy.
// This allows Express and express-rate-limit to correctly
// identify the original client IP from X-Forwarded-For.

app.set('trust proxy', 1);

// ============================================================
// SECURITY
// ============================================================

app.use(helmet());

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  // Local development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.17.64.1:3000',

  // Production frontend
  'https://lms-jet-zeta.vercel.app',

  // Production frontend from environment variable
  process.env.FRONTEND_URL,
].filter(Boolean);

// Remove duplicate origins
const uniqueAllowedOrigins = [
  ...new Set(allowedOrigins),
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header.
    // This includes server-to-server requests,
    // health checks, Postman, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (uniqueAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log(
      '❌ CORS blocked origin:',
      origin
    );

    return callback(
      new Error(`CORS blocked: ${origin}`)
    );
  },

  // Required for httpOnly authentication cookies
  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options(
  '*',
  cors(corsOptions)
);

// ============================================================
// BODY PARSING
// ============================================================

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ============================================================
// COOKIE PARSER
// ============================================================
// Required to read:
// req.cookies.accessToken
// req.cookies.refreshToken

app.use(cookieParser());

// ============================================================
// API RATE LIMITER
// ============================================================

app.use('/api', apiLimiter);

// ============================================================
// PASSPORT
// ============================================================

configurePassport();

app.use(passport.initialize());

// ============================================================
// STATIC FILES
// ============================================================

const __dirname = path.resolve();

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ============================================================
// SWAGGER
// ============================================================

setupSwagger(app);

// ============================================================
// API ROUTES
// ============================================================

app.use('/api', routes);

// ============================================================
// ROOT ROUTE
// ============================================================

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'LMS API is running',
    docs: '/api-docs',
  });
});

// ============================================================
// 404 HANDLER
// ============================================================

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Cannot find ${req.originalUrl} on this server!`,
      404
    )
  );
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(globalErrorHandler);

// ============================================================
// EXPORT
// ============================================================

export default app;
export { app };