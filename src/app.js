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

// ================= SECURITY =================

app.use(helmet());

// ================= CORS =================

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://172.17.64.1:3000',

  // Production frontend
  'https://lms-jet-zeta.vercel.app',

  // Render environment variable
  process.env.FRONTEND_URL,
].filter(Boolean);

// Remove duplicates
const uniqueAllowedOrigins = [
  ...new Set(allowedOrigins),
];

const corsOptions = {
  origin: function (origin, callback) {
    // Requests without an Origin header
    // such as Postman or server-to-server requests
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

app.options(
  '*',
  cors(corsOptions)
);

// ================= BODY PARSING =================

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

// ================= COOKIES =================

app.use(cookieParser());

// ================= API RATE LIMIT =================

app.use('/api', apiLimiter);

// ================= PASSPORT =================

configurePassport();

app.use(passport.initialize());

// ================= STATIC FILES =================

const __dirname = path.resolve();

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ================= SWAGGER =================

setupSwagger(app);

// ================= API ROUTES =================

app.use('/api', routes);

// ================= ROOT =================

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'LMS API is running',
    docs: '/api-docs',
  });
});

// ================= 404 =================

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Cannot find ${req.originalUrl} on this server!`,
      404
    )
  );
});

// ================= GLOBAL ERROR HANDLER =================

app.use(globalErrorHandler);

export default app;
export { app };