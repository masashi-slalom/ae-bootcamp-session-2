import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const initialTodos = [
  {
    id: 1,
    title: 'Plan sprint',
    description: 'Refine stories',
    dueDate: '2030-01-02',
    completed: false,
    createdAt: '2030-01-01T10:00:00.000Z',
    updatedAt: '2030-01-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Retro prep',
    description: '',
    dueDate: null,
    completed: true,
    createdAt: '2030-01-01T09:00:00.000Z',
    updatedAt: '2030-01-01T09:00:00.000Z',
  },
];

let todos = [];

const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    const status = req.url.searchParams.get('status') || 'all';
    let responseTodos = todos;

    if (status === 'active') {
      responseTodos = todos.filter((todo) => !todo.completed);
    }

    if (status === 'completed') {
      responseTodos = todos.filter((todo) => todo.completed);
    }

    return res(ctx.status(200), ctx.json(responseTodos));
  }),

  rest.post('/api/todos', (req, res, ctx) => {
    const requestBody = req.body;
    if (!requestBody.title || !requestBody.title.trim()) {
      return res(ctx.status(400), ctx.json({ error: 'Todo title is required' }));
    }

    const newTodo = {
      id: todos.length + 10,
      title: requestBody.title,
      description: requestBody.description || '',
      dueDate: requestBody.dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    todos = [newTodo, ...todos];
    return res(ctx.status(201), ctx.json(newTodo));
  }),

  rest.patch('/api/todos/:id/toggle', (req, res, ctx) => {
    const id = Number(req.params.id);
    const todoToUpdate = todos.find((todo) => todo.id === id);
    if (!todoToUpdate) {
      return res(ctx.status(404), ctx.json({ error: 'Todo not found' }));
    }

    todoToUpdate.completed = !todoToUpdate.completed;
    return res(ctx.status(200), ctx.json(todoToUpdate));
  }),

  rest.delete('/api/todos/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    todos = todos.filter((todo) => todo.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Todo deleted successfully', id }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  todos = [...initialTodos];
  localStorage.clear();
  server.resetHandlers();
});
afterAll(() => server.close());

describe('App Component', () => {
  beforeEach(() => {
    todos = [...initialTodos];
  });

  test('renders the todo planner heading', async () => {
    render(<App />);
    expect(await screen.findByText('TODO Planner')).toBeInTheDocument();
  });

  test('loads and displays todos', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Plan sprint')).toBeInTheDocument();
      expect(screen.getByText('Retro prep')).toBeInTheDocument();
    });
  });

  test('adds a new todo and clears the form', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Plan sprint')).toBeInTheDocument();
    });

    const titleInput = screen.getByRole('textbox', { name: /Task Title/i });
    await user.type(titleInput, 'Write demo notes');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => {
      expect(screen.getByText('Write demo notes')).toBeInTheDocument();
    });

    // Form should be cleared after successful add
    expect(titleInput).toHaveValue('');
  });

  test('filters completed todos', async () => {
    const user = userEvent.setup();
    render(<App />);

    const statusFilter = await screen.findByLabelText('Status');
    await user.click(statusFilter);
    await user.click(screen.getByRole('option', { name: 'Completed' }));

    await waitFor(() => {
      expect(screen.getByText('Retro prep')).toBeInTheDocument();
      expect(screen.queryByText('Plan sprint')).not.toBeInTheDocument();
    });
  });

  test('shows API error message when fetch fails', async () => {
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch todos');
    });
  });

  test('toggles a todo between complete and incomplete', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for todos to load and find Plan sprint's row
    const titleEl = await screen.findByText('Plan sprint');
    const listItem = titleEl.closest('li');
    const checkbox = within(listItem).getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      expect(within(listItem).getByRole('checkbox')).toBeChecked();
    });
  });

  test('deletes a todo and removes it from the list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Plan sprint')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete Plan sprint/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Plan sprint')).not.toBeInTheDocument();
    });
  });
});