import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiClient, extractErrorMessage } from '../lib/api-client';
import type { Project } from '../types';

export interface ProjectsState {
  items: Project[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // Single project shown on the project detail page (header + task count).
  selected: Project | null;
  selectedStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  selectedError: string | null;
}

const initialState: ProjectsState = {
  items: [],
  status: 'idle',
  error: null,
  selected: null,
  selectedStatus: 'idle',
  selectedError: null,
};

// The backend list endpoint returns { data: { projects: [...] } }, but older
// notes describe { data: [...] }. Unwrap defensively so either shape works.
const unwrapProjects = (payload: unknown): Project[] => {
  const data = (payload as { data?: unknown })?.data;
  if (Array.isArray(data)) {
    return data as Project[];
  }
  const nested = (data as { projects?: unknown })?.projects;
  if (Array.isArray(nested)) {
    return nested as Project[];
  }
  return [];
};

export const fetchProjects = createAsyncThunk<Project[], void, { rejectValue: string }>(
  'projects/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/projects');
      return unwrapProjects(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load projects'));
    }
  },
);

export interface CreateProjectArgs {
  name: string;
  description?: string;
  color: string;
}

export const createProject = createAsyncThunk<Project, CreateProjectArgs, { rejectValue: string }>(
  'projects/create',
  async (input, { rejectWithValue }) => {
    try {
      // Success envelope is { data: { project } }.
      const response = await apiClient.post('/projects', input);
      return response.data.data.project as Project;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to create project'));
    }
  },
);

// GET /projects/:id → { data: { project } }, including the task count.
export const fetchProject = createAsyncThunk<Project, string, { rejectValue: string }>(
  'projects/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data.data.project as Project;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load project'));
    }
  },
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProject.pending, (state) => {
        state.selectedStatus = 'loading';
        state.selectedError = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.selectedStatus = 'failed';
        state.selectedError = action.payload ?? 'Failed to load project';
      })
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load projects';
      })
      // Prepend the created project so the new card appears without a refetch.
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default projectsSlice.reducer;
