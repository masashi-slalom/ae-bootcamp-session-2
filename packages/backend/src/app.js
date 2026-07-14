const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    due_date TEXT,
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('In-memory database initialized');

const mapTodo = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  dueDate: row.due_date,
  completed: Boolean(row.completed),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const parseTodoPayload = (body, { isUpdate = false } = {}) => {
  const payload = {
    title: body.title,
    description: body.description,
    dueDate: body.dueDate,
    completed: body.completed,
  };

  if (!isUpdate || payload.title !== undefined) {
    if (typeof payload.title !== 'string' || payload.title.trim() === '') {
      return { error: 'Todo title is required' };
    }
    payload.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    if (typeof payload.description !== 'string') {
      return { error: 'Description must be a string' };
    }
    payload.description = payload.description.trim();
  }

  if (payload.dueDate !== undefined && payload.dueDate !== null && payload.dueDate !== '') {
    if (typeof payload.dueDate !== 'string' || Number.isNaN(Date.parse(payload.dueDate))) {
      return { error: 'Due date must be a valid date string' };
    }
    payload.dueDate = payload.dueDate.slice(0, 10);
  } else if (payload.dueDate === '') {
    payload.dueDate = null;
  }

  if (payload.completed !== undefined && typeof payload.completed !== 'boolean') {
    return { error: 'Completed must be a boolean value' };
  }

  return { payload };
};

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// API Routes
app.get('/api/todos', (req, res) => {
  try {
    const { status = 'all' } = req.query;
    let whereClause = '';

    if (status === 'active') {
      whereClause = 'WHERE completed = 0';
    } else if (status === 'completed') {
      whereClause = 'WHERE completed = 1';
    }

    const query = `
      SELECT *
      FROM todos
      ${whereClause}
      ORDER BY
        CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
        due_date ASC,
        created_at DESC
    `;

    const todos = db.prepare(query).all().map(mapTodo);
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', (req, res) => {
  try {
    const { payload, error } = parseTodoPayload(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const insertStmt = db.prepare(
      `INSERT INTO todos (title, description, due_date, completed)
       VALUES (?, ?, ?, ?)`
    );
    const result = insertStmt.run(
      payload.title,
      payload.description || '',
      payload.dueDate || null,
      payload.completed ? 1 : 0
    );
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(mapTodo(todo));
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.put('/api/todos/:id', (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const { payload, error } = parseTodoPayload(req.body, { isUpdate: true });
    if (error) {
      return res.status(400).json({ error });
    }

    const mergedTodo = {
      title: payload.title ?? existingTodo.title,
      description: payload.description ?? existingTodo.description,
      dueDate: payload.dueDate !== undefined ? payload.dueDate : existingTodo.due_date,
      completed: payload.completed !== undefined ? payload.completed : Boolean(existingTodo.completed),
    };

    const updateStmt = db.prepare(
      `UPDATE todos
       SET title = ?, description = ?, due_date = ?, completed = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    );
    updateStmt.run(
      mergedTodo.title,
      mergedTodo.description,
      mergedTodo.dueDate,
      mergedTodo.completed ? 1 : 0,
      id
    );

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(mapTodo(updatedTodo));
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.patch('/api/todos/:id/toggle', (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    db.prepare(
      `UPDATE todos
       SET completed = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(existingTodo.completed ? 0 : 1, id);

    const updatedTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    res.json(mapTodo(updatedTodo));
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

app.delete('/api/todos/:id', (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Valid todo ID is required' });
    }

    const existingTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM todos WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Todo deleted successfully', id });
    } else {
      res.status(404).json({ error: 'Todo not found' });
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = { app, db };