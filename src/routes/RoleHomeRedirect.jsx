import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleHomeRoute } from '../utils/roleUtils';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RoleHomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const roleHome = getRoleHomeRoute(user.role);

  if (!roleHome || typeof roleHome !== 'string') {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={roleHome} replace />;
}
