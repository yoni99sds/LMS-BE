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

// ===============================
// 1) SECURITY HEADERS
// ===============================
app.use(helmet());

// ===============================
// 2) CORS FIX (IMPORTANT)
// ===============================

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.17.64.1:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server requests or mobile apps
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log('❌ CORS blocked origin:', origin);

    return callback(
      new Error(`CORS blocked: ${origin}`)
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],

  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// IMPORTANT: Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// ===============================
// 3) BODY + COOKIE PARSER
// ===============================

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

app.use(cookieParser());

// ===============================
// 4) RATE LIMITING
// ===============================

app.use('/api', apiLimiter);

// ===============================
// 5) PASSPORT SETUP
// ===============================

configurePassport();

app.use(passport.initialize());

// ===============================
// 6) STATIC FILES
// ===============================

const __dirname = path.resolve();

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ===============================
// 7) SWAGGER DOCS
// ===============================

setupSwagger(app);

// ===============================
// 8) ROUTES
// ===============================

app.use('/api', routes);

// ===============================
// 9) HEALTH CHECK
// ===============================

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'LMS API is running',
    docs: '/api-docs'
  });
});

// ===============================
// 10) 404 HANDLER
// ===============================

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Cannot find ${req.originalUrl} on this server!`,
      404
    )
  );
});

// ===============================
// 11) GLOBAL ERROR HANDLER
// ===============================

app.use(globalErrorHandler);

// ===============================
// 12) SEED INSTRUCTOR
// ===============================
//
// The seed function checks whether the instructor
// already exists before creating one.
//
// IMPORTANT:
// This assumes MongoDB has already been connected
// before app.js is initialized.
//



export default app;
export { app };