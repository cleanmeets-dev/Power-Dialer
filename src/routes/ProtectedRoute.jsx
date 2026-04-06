import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleHomeRoute } from '../utils/roleUtils';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * Shows loading spinner while checking auth, redirects to login if not authenticated
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const roleHome = getRoleHomeRoute(user?.role);
    return <Navigate to={roleHome} replace />;
  }

  return children;
}
