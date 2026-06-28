import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, extractErrorMessage } from '../lib/api-client';
import type { Priority, Status, Task } from '../types';

export interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
};

// Filters use 'ALL' for "no filter"; those are omitted from the query string
// entirely (never `?status=ALL`).
export type StatusFilter = Status | 'ALL';
export type PriorityFilter = Priority | 'ALL';

export interface TaskFilters {
  status: StatusFilter;
  priority: PriorityFilter;
}

const unwrapTasks = (payload: unknown): Task[] => {
  const data = (payload as { data?: unknown })?.data;
  if (Array.isArray(data)) {
    return data as Task[];
  }
  const nested = (data as { tasks?: unknown })?.tasks;
  if (Array.isArray(nested)) {
    return nested as Task[];
  }
  return [];
};

export const fetchTasks = createAsyncThunk<
  Task[],
  { projectId: string; filters: TaskFilters },
  { rejectValue: string }
>('tasks/fetch', async ({ projectId, filters }, { rejectWithValue }) => {
  try {
    // Build params, omitting any filter set to 'ALL'.
    const params: Record<string, string> = {};
    if (filters.status !== 'ALL') {
      params.status = filters.status;
    }
    if (filters.priority !== 'ALL') {
      params.priority = filters.priority;
    }
    const response = await apiClient.get(`/projects/${projectId}/tasks`, { params });
    return unwrapTasks(response.data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, 'Failed to load tasks'));
  }
});

export interface CreateTaskArgs {
  projectId: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
}

export const createTask = createAsyncThunk<Task, CreateTaskArgs, { rejectValue: string }>(
  'tasks/create',
  async ({ projectId, ...body }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/tasks`, body);
      return response.data.data.task as Task;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to create task'));
    }
  },
);

export interface UpdateTaskArgs {
  id: string;
  status?: Status;
  priority?: Priority;
  title?: string;
  description?: string;
  dueDate?: string | null;
}

export const updateTask = createAsyncThunk<Task, UpdateTaskArgs, { rejectValue: string }>(
  'tasks/update',
  async ({ id, ...patch }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/tasks/${id}`, patch);
      return response.data.data.task as Task;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to update task'));
    }
  },
);

export const deleteTask = createAsyncThunk<string, string, { rejectValue: string }>(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to delete task'));
    }
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load tasks';
      });
    // create/update/delete don't mutate the list here — the page refetches with
    // the active filters after each succeeds (the "invalidate" equivalent), so a
    // task that no longer matches the filter is correctly dropped.
  },
});

export default tasksSlice.reducer;
