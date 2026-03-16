import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { LeadsProvider } from '../context/LeadsContext';
import Navbar from '../components/Navbar';
import CampaignManager from '../components/CampaignManager';
import NotificationSystem from '../components/NotificationSystem';
import DashboardContent from '../components/DashboardContent';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { successMessage, errorMessage, showNotification } = useNotification();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar user={user} campaignId={selectedCampaignId} onLogout={handleLogout} onShowNotification={showNotification} />

      <NotificationSystem successMessage={successMessage} errorMessage={errorMessage} />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mb-6 border border-slate-700">
          <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Power Dialer Dashboard</h1>
          <p className="text-slate-300">Upload leads and start automated calling</p>
        </div>

        {/* Campaign Manager */}
        <CampaignManager selectedCampaignId={selectedCampaignId} onCampaignSelect={setSelectedCampaignId} onShowNotification={showNotification} />

        {/* Dashboard Content with LeadsProvider */}
        {selectedCampaignId && (
          <LeadsProvider campaignId={selectedCampaignId}>
            <DashboardContent selectedCampaignId={selectedCampaignId} />
          </LeadsProvider>
        )}
      </div>
    </div>
  );
}
