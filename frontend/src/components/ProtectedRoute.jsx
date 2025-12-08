import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
