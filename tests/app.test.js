import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

// Mock mongoose connection so it doesn't try to connect to a real MongoDB instance during tests
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true)
  };
});

describe('LMS platform backend integration tests', () => {
  beforeAll(async () => {
    // Mock connections are loaded
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('GET / should respond with welcome message and docs location', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      message: 'Welcome to LMS platform API services.',
      docs: '/api-docs'
    });
  });

  test('GET /api-docs should redirect or serve Swagger UI', async () => {
    const response = await request(app).get('/api-docs/');
    // Swagger UI returns 200 or 301/302 redirects
    expect([200, 301, 302]).toContain(response.status);
  });

  test('GET /api/v1/invalid-route should return 404 error response', async () => {
    const response = await request(app).get('/api/v1/invalid-route');
    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toContain('Cannot find');
  });
});
