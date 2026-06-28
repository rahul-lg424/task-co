import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../lib/auth-storage';

// Gate for authenticated routes: if there's no token in localStorage, bounce to
// /login; otherwise render the nested route via <Outlet />.
export const ProtectedRoute = () => {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
