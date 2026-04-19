import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import Navbar from '../components/Navbar';
import NotificationSystem from '../components/NotificationSystem';
import OverviewPage from './OverviewPage';
import LeadsPage from './LeadsPage';
import CallLogsPage from './CallLogsPage';
import CampaignsPage from './CampaignsPage';
import websocketService from '../services/websocket';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { successMessage, errorMessage, showNotification } = useNotification();
  const [activePage, setActivePage] = useState('overview');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Subscribe to appointment-created notifications and show them using the notification hook
    const handler = (payload) => {
      if (!payload || !payload.message) return;
      showNotification?.(payload.message, 'success');
    };

    try {
      websocketService.connect();
      websocketService.on('notification:appointment-created', handler);
    } catch (e) {
      // ignore websocket subscription errors
    }

    return () => {
      try {
        websocketService.off('notification:appointment-created', handler);
      } catch (e) {}
    };
  }, [showNotification]);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage showNotification={showNotification} />;
      case 'leads':
        return <LeadsPage showNotification={showNotification} />;
      case 'call-logs':
        return <CallLogsPage showNotification={showNotification} />;
      case 'campaigns':
        return <CampaignsPage showNotification={showNotification} />;
      default:
        return <OverviewPage showNotification={showNotification} />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar user={user} onLogout={handleLogout} activePage={activePage} onNavigate={setActivePage} onShowNotification={showNotification} />

      <NotificationSystem successMessage={successMessage} errorMessage={errorMessage} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {renderPage()}
      </div>
    </div>
  );
}
