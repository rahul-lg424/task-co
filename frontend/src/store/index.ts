import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth-slice';
import projectsReducer from './projects-slice';
import tasksReducer from './tasks-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
