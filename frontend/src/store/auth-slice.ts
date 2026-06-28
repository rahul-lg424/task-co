import { createSlice } from '@reduxjs/toolkit';
import type { User } from '../types';

// NOTE: Phase 1 stub. Thunks (register/login/me) and localStorage handling are
// added in Phase 2.
export interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
});

export default authSlice.reducer;
