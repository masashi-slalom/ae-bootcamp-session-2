const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/todo.page');

const clearTodos = async (request) => {
  const response = await request.get('http://127.0.0.1:3030/api/todos');
  const todos = await response.json();
  for (const todo of todos) {
    await request.delete(`http://127.0.0.1:3030/api/todos/${todo.id}`);
  }
};

test.beforeEach(async ({ page, request }) => {
  await clearTodos(request);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('creates a task from the main form', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.createTodo({
    title: 'Create roadmap draft',
    description: 'Outline milestones',
    dueDate: '2030-05-10',
  });

  await expect(page.getByText('Create roadmap draft')).toBeVisible();
  await expect(page.getByText('Outline milestones')).toBeVisible();
});

test('edits an existing task title', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.createTodo({ title: 'Write old title' });
  await todoPage.editTodo({ currentTitle: 'Write old title', nextTitle: 'Write updated title' });

  await expect(page.getByText('Write updated title')).toBeVisible();
  await expect(page.getByText('Task updated')).toBeVisible();
});

test('toggles a task to completed', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.createTodo({ title: 'Toggle me' });
  await todoPage.toggleTodo('Toggle me');

  await expect(todoPage.todoRow('Toggle me').locator('.todoCompleted')).toBeVisible();
});

test('filters completed tasks', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.createTodo({ title: 'Completed item' });
  await todoPage.createTodo({ title: 'Active item' });
  await todoPage.toggleTodo('Completed item');

  await todoPage.setStatusFilter('Completed');

  await expect(page.getByText('Completed item')).toBeVisible();
  await expect(page.getByText('Active item')).toHaveCount(0);
});

test('deletes a task', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.createTodo({ title: 'Delete me' });
  await todoPage.deleteTodo('Delete me');

  await expect(page.getByText('Delete me')).toHaveCount(0);
  await expect(page.getByText('Task deleted')).toBeVisible();
});
