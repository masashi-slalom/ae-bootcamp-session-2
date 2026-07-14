import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './App.css';

const STORAGE_KEY = 'todo-app-todos';

const theme = createTheme({
  palette: {
    primary: { main: '#1976D2' },
    secondary: { main: '#455A64' },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#6B7280' },
  },
  typography: {
    fontSize: 16,
    body1: {
      lineHeight: 1.4,
    },
  },
});

const compareTodos = (leftTodo, rightTodo) => {
  const leftDueDate = leftTodo.dueDate ? new Date(leftTodo.dueDate).getTime() : Number.POSITIVE_INFINITY;
  const rightDueDate = rightTodo.dueDate ? new Date(rightTodo.dueDate).getTime() : Number.POSITIVE_INFINITY;

  if (leftDueDate !== rightDueDate) {
    return leftDueDate - rightDueDate;
  }

  const leftCreatedAt = new Date(leftTodo.createdAt || 0).getTime();
  const rightCreatedAt = new Date(rightTodo.createdAt || 0).getTime();
  return rightCreatedAt - leftCreatedAt;
};

const isOverdue = (todo) => {
  if (!todo.dueDate || todo.completed) {
    return false;
  }

  const dueDate = new Date(todo.dueDate);
  const now = new Date();
  dueDate.setHours(23, 59, 59, 999);
  return dueDate < now;
};

const toISODate = (dateValue) => {
  if (!dateValue) {
    return '';
  }
  return dateValue.slice(0, 10);
};

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    dueDate: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const cachedTodos = localStorage.getItem(STORAGE_KEY);
    if (cachedTodos) {
      try {
        const parsedTodos = JSON.parse(cachedTodos);
        if (Array.isArray(parsedTodos)) {
          setTodos(parsedTodos);
        }
      } catch (storageError) {
        console.error('Failed to parse local todos:', storageError);
      }
    }

    fetchTodos('all');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    fetchTodos(statusFilter);
  }, [statusFilter]);

  const sortedTodos = useMemo(() => {
    return [...todos].sort(compareTodos);
  }, [todos]);

  const resetForm = () => {
    setFormState({ title: '', description: '', dueDate: '' });
    setEditingId(null);
  };

  const fetchTodos = async (status) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/todos?status=${status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }

      const result = await response.json();
      setTodos(result);
      setError('');
    } catch (fetchError) {
      setError(`Failed to fetch todos: ${fetchError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName) => (event) => {
    setFormState((currentState) => ({
      ...currentState,
      [fieldName]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.title.trim()) {
      setError('Task title is required');
      return;
    }

    const payload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      dueDate: formState.dueDate || null,
    };

    const endpoint = editingId ? `/api/todos/${editingId}` : '/api/todos';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to save todo');
      }

      const savedTodo = await response.json();
      setTodos((currentTodos) => {
        if (editingId) {
          return currentTodos.map((todo) => (todo.id === editingId ? savedTodo : todo));
        }
        return [savedTodo, ...currentTodos];
      });

      setError('');
      setToastMessage(editingId ? 'Task updated' : 'Task added');
      resetForm();
    } catch (submitError) {
      setError(`Failed to save todo: ${submitError.message}`);
    }
  };

  const handleToggleTodo = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/toggle`, { method: 'PATCH' });
      if (!response.ok) {
        throw new Error('Failed to toggle todo');
      }

      const updatedTodo = await response.json();
      setTodos((currentTodos) =>
        currentTodos.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );
      setError('');
    } catch (toggleError) {
      setError(`Failed to toggle todo: ${toggleError.message}`);
    }
  };

  const handleEditTodo = (todo) => {
    setEditingId(todo.id);
    setFormState({
      title: todo.title,
      description: todo.description || '',
      dueDate: toISODate(todo.dueDate),
    });
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const response = await fetch(`/api/todos/${todoId}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));
      setError('');
      setToastMessage('Task deleted');
    } catch (deleteError) {
      setError(`Failed to delete todo: ${deleteError.message}`);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="todoAppRoot">
        <Container maxWidth="md" sx={{ py: 5 }}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                  TODO Planner
                </Typography>
                <Typography color="text.secondary">
                  Track work with due dates, status filters, and quick edits.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {editingId ? 'Edit Task' : 'Add Task'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Task Title"
                      value={formState.title}
                      onChange={handleFieldChange('title')}
                      placeholder="Prepare sprint notes"
                      required
                      fullWidth
                    />
                    <TextField
                      label="Description"
                      value={formState.description}
                      onChange={handleFieldChange('description')}
                      placeholder="Optional details"
                      multiline
                      minRows={2}
                      fullWidth
                    />
                    <TextField
                      label="Due Date"
                      type="date"
                      value={formState.dueDate}
                      onChange={handleFieldChange('dueDate')}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button type="submit" variant="contained" size="large">
                        {editingId ? 'Save Task' : 'Add Task'}
                      </Button>
                      {editingId && (
                        <Button type="button" variant="outlined" size="large" onClick={resetForm}>
                          Cancel Edit
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Typography variant="h6" component="h2">
                    Tasks
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      label="Status"
                      onChange={(event) => setStatusFilter(event.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {loading && <Typography sx={{ mt: 2 }}>Loading tasks...</Typography>}

                {error && (
                  <Alert sx={{ mt: 2 }} severity="error" role="alert">
                    {error}
                  </Alert>
                )}

                {!loading && !error && (
                  <List sx={{ mt: 1 }}>
                    {sortedTodos.length === 0 ? (
                      <Typography color="text.secondary">No tasks yet. Add one to get started.</Typography>
                    ) : (
                      sortedTodos.map((todo) => {
                        const overdue = isOverdue(todo);
                        return (
                          <ListItem key={todo.id} divider className={overdue ? 'todoOverdue' : ''}>
                            <Checkbox
                              checked={todo.completed}
                              onChange={() => handleToggleTodo(todo.id)}
                              inputProps={{ 'aria-label': `mark ${todo.title} complete` }}
                              sx={{ mr: 1 }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography className={todo.completed ? 'todoCompleted' : ''}>
                                {todo.title}
                              </Typography>
                              {todo.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {todo.description}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                {todo.dueDate && (
                                  <Chip
                                    size="small"
                                    label={`Due: ${todo.dueDate}`}
                                    color={overdue ? 'warning' : 'secondary'}
                                    variant="outlined"
                                  />
                                )}
                                {overdue && (
                                  <Chip
                                    size="small"
                                    label="Overdue"
                                    color="warning"
                                    variant="filled"
                                  />
                                )}
                              </Stack>
                            </Box>

                            <IconButton
                              aria-label={`edit ${todo.title}`}
                              color="primary"
                              onClick={() => handleEditTodo(todo)}
                              sx={{ minWidth: 44, minHeight: 44 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              aria-label={`delete ${todo.title}`}
                              color="error"
                              onClick={() => handleDeleteTodo(todo.id)}
                              sx={{ minWidth: 44, minHeight: 44 }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        );
                      })
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </Box>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={2000}
        onClose={() => setToastMessage('')}
        message={toastMessage}
      />
    </ThemeProvider>
  );
}

export default App;