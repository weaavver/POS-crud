import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sends logged-out visitors to /login and remembers where they were headed,
// so Login can send them back after they sign in.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for AuthContext to read localStorage, otherwise a logged-in user
  // would get bounced to /login on every page refresh.
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}