import axios from 'axios';
import { clearAuth, getToken } from './auth-storage';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const apiClient = axios.create({ baseURL });

// Request interceptor: attach the JWT from localStorage as a Bearer token on
// every request, so call sites never set the header manually.
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on a 401 the token is stale/invalid — clear it and send
// the user back to /login (hard redirect, since this lives outside React Router).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

// Pulls a human-readable message out of the backend's { error: { message } }
// envelope, falling back to the axios message.
export const extractErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? error.message ?? fallback;
  }
  return fallback;
};
