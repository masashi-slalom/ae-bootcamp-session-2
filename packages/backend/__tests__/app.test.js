const request = require('supertest');
const { app } = require('../src/app');

describe('App Health and Validation', () => {
  describe('GET /', () => {
    it('returns healthy status', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        message: 'Backend server is running',
      });
    });
  });

  describe('POST /api/todos', () => {
    it('creates a todo with valid payload', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({
          title: 'Write tests',
          description: 'Cover API and UI',
          dueDate: '2030-12-01',
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        title: 'Write tests',
        description: 'Cover API and UI',
        dueDate: '2030-12-01',
        completed: false,
      });
    });

    it('returns 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ description: 'No title present' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Todo title is required');
    });

    it('returns 400 for invalid due date', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Task', dueDate: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Due date must be a valid date string');
    });
  });
});