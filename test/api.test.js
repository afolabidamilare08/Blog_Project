const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');

describe('Blog API', () => {
  let authToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_api_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication', () => {
    test('POST /api/auth/login - should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      
      authToken = response.body.data.token;
    });

    test('POST /api/auth/login - should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Public Blog Endpoints', () => {
    test('GET /api/blogs - should return published blogs', async () => {
      const response = await request(app)
        .get('/api/blogs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.blogs)).toBe(true);
    });

    test('GET /api/health - should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Protected Admin Endpoints', () => {
    test('GET /api/admin/blogs - should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/blogs');

      expect(response.status).toBe(401);
    });

    test('GET /api/admin/blogs - should work with valid token', async () => {
      const response = await request(app)
        .get('/api/admin/blogs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
}); 