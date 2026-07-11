import app from '@/app';
import prisma from '@/infrastructure/database/connection';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

describe('Auth API', () => {
  let accessToken: string;
  let testUserId: string;
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app).post('/api/v1/auth/register').send({
        email: 'invalid-email',
        password: 'Test1234',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });
  });
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'test@example.com',
        password: 'Test1234',
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');

      accessToken = response.body.data.accessToken;
      testUserId = response.body.data.user.id;
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should get logged in user info', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testUserId);
    });

    it('should return 404 for invalid id', async () => {
      const res = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should update user data', async () => {
      const res = await request(app)
        .put(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated User', phone: '01712345678' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated User');
    });
  });

  describe('PATCH /api/v1/users/:id/status', () => {
    it('should toggle isActive status', async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/activated|deactivated/);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete the user', async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User deleted successfully');
    });
  });
});
