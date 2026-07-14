const request = require('supertest');
const { app, db } = require('../src/app');

afterAll(() => {
  if (db) db.close();
});

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

  describe('GET /api/todos', () => {
    it('returns an array of todos', async () => {
      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('filters by status=active returns only incomplete todos', async () => {
      // Create one active and one completed todo
      const active = await request(app).post('/api/todos').send({ title: 'Active task' });
      const completed = await request(app).post('/api/todos').send({ title: 'Completed task' });
      await request(app).patch(`/api/todos/${completed.body.id}/toggle`);

      const response = await request(app).get('/api/todos').query({ status: 'active' });

      expect(response.status).toBe(200);
      expect(response.body.every((todo) => todo.completed === false)).toBe(true);
      expect(response.body.some((todo) => todo.id === active.body.id)).toBe(true);
      expect(response.body.some((todo) => todo.id === completed.body.id)).toBe(false);
    });

    it('filters by status=completed returns only completed todos', async () => {
      const response = await request(app).get('/api/todos').query({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.every((todo) => todo.completed === true)).toBe(true);
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
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('returns 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ description: 'No title present' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Todo title is required');
    });

    it('returns 400 for blank title', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: '   ' });

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

  describe('PATCH /api/todos/:id/toggle', () => {
    it('toggles a todo from incomplete to complete', async () => {
      const created = await request(app).post('/api/todos').send({ title: 'Toggle me' });
      expect(created.body.completed).toBe(false);

      const toggled = await request(app).patch(`/api/todos/${created.body.id}/toggle`);
      expect(toggled.status).toBe(200);
      expect(toggled.body.completed).toBe(true);
    });

    it('returns 404 for non-existent todo', async () => {
      const response = await request(app).patch('/api/todos/999999/toggle');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    it('returns 400 for invalid id', async () => {
      const response = await request(app).patch('/api/todos/abc/toggle');
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('deletes an existing todo', async () => {
      const created = await request(app).post('/api/todos').send({ title: 'Delete me' });
      const response = await request(app).delete(`/api/todos/${created.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Todo deleted successfully', id: created.body.id });
    });

    it('returns 404 when todo does not exist', async () => {
      const response = await request(app).delete('/api/todos/999999');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    it('returns 400 for invalid id', async () => {
      const response = await request(app).delete('/api/todos/not-a-number');
      expect(response.status).toBe(400);
    });
  });
});