const request = require('supertest');
const { app } = require('../../src/app');

describe('Todos API Integration', () => {
  it('creates, edits, toggles, filters, and deletes a todo', async () => {
    const createResponse = await request(app).post('/api/todos').send({
      title: 'Prepare bootcamp demo',
      description: 'Draft workflow',
      dueDate: '2030-01-10',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      title: 'Prepare bootcamp demo',
      description: 'Draft workflow',
      dueDate: '2030-01-10',
      completed: false,
    });

    const todoId = createResponse.body.id;

    const updateResponse = await request(app).put(`/api/todos/${todoId}`).send({
      title: 'Prepare polished bootcamp demo',
      description: 'Draft workflow and rehearse',
      dueDate: '2030-01-12',
    });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toMatchObject({
      id: todoId,
      title: 'Prepare polished bootcamp demo',
      dueDate: '2030-01-12',
      completed: false,
    });

    const toggleResponse = await request(app).patch(`/api/todos/${todoId}/toggle`);
    expect(toggleResponse.status).toBe(200);
    expect(toggleResponse.body.completed).toBe(true);

    const completedResponse = await request(app).get('/api/todos').query({ status: 'completed' });
    expect(completedResponse.status).toBe(200);
    expect(completedResponse.body.some((todo) => todo.id === todoId)).toBe(true);

    const deleteResponse = await request(app).delete(`/api/todos/${todoId}`);
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({ message: 'Todo deleted successfully', id: todoId });

    const notFoundDeleteResponse = await request(app).delete(`/api/todos/${todoId}`);
    expect(notFoundDeleteResponse.status).toBe(404);
    expect(notFoundDeleteResponse.body.error).toBe('Todo not found');
  });

  it('sorts todos by due date asc then createdAt desc', async () => {
    const first = await request(app).post('/api/todos').send({
      title: 'Task A',
      dueDate: '2030-05-05',
    });
    const second = await request(app).post('/api/todos').send({
      title: 'Task B',
      dueDate: '2030-04-01',
    });

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);

    const listResponse = await request(app).get('/api/todos');
    expect(listResponse.status).toBe(200);

    const taskBIndex = listResponse.body.findIndex((todo) => todo.id === second.body.id);
    const taskAIndex = listResponse.body.findIndex((todo) => todo.id === first.body.id);

    expect(taskBIndex).toBeGreaterThanOrEqual(0);
    expect(taskAIndex).toBeGreaterThanOrEqual(0);
    expect(taskBIndex).toBeLessThan(taskAIndex);
  });
});
