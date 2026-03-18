import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import Navbar from '../components/Navbar';
import NotificationSystem from '../components/NotificationSystem';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { successMessage, errorMessage, showNotification } = useNotification();

  // Determine active page based on current route
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'overview';
    if (path.includes('leads')) return 'leads';
    if (path.includes('call-logs')) return 'call-logs';
    if (path.includes('campaigns')) return 'campaigns';
    if (path.includes('my-availability')) return 'my-availability';
    if (path.includes('agents')) return 'agents';
    return 'overview';
  };

  const activePage = getActivePage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (pageId) => {
    switch (pageId) {
      case 'overview':
        navigate('/dashboard');
        break;
      case 'leads':
        navigate('/dashboard/leads');
        break;
      case 'call-logs':
        navigate('/dashboard/call-logs');
        break;
      case 'campaigns':
        navigate('/dashboard/campaigns');
        break;
      case 'my-availability':
        navigate('/dashboard/my-availability');
        break;
      case 'agents':
        navigate('/dashboard/agents');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        activePage={activePage} 
        onNavigate={handleNavigate}
        showNotification={showNotification}
      />

      <NotificationSystem successMessage={successMessage} errorMessage={errorMessage} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <Outlet context={{ showNotification }} />
      </div>
    </div>
  );
}
