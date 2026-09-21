import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import logger from '../config/logger.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS Platform Backend API',
      version: '1.0.0',
      description: 'Production-Ready Learning Management System (LMS) API built with Node.js, Express, MongoDB and Mongoose.',
      contact: {
        name: 'API Support',
        email: 'support@lms-platform.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Paths to files containing OpenAPI documentation annotations
  apis: [
    './src/routes/*.js',
    './src/routes/v1/*.js',
    './src/app.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger documentation configured at /api-docs');
};

export default setupSwagger;
