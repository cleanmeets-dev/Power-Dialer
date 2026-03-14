import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useDialer } from '../hooks/useDialer';
import { useCampaignData } from '../hooks/useCampaignData';
import Navbar from '../components/Navbar';
import CampaignSelector from '../components/CampaignSelector';
import NotificationSystem from '../components/NotificationSystem';
import DashboardContent from '../components/DashboardContent';

/**
 * DashboardPage - Main dashboard page
 * Displays campaigns, leads, dialer controls, and active calls
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { successMessage, errorMessage, showNotification } = useNotification();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const { leads, isLoading, loadLeads, handleLeadDeleted } = useCampaignData(selectedCampaignId);
  const {
    isDialing,
    setIsDialing,
    dialedCount,
    successCount,
    callsInProgress,
    activeCalls,
  } = useDialer(selectedCampaignId, showNotification);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUploadSuccess = (message) => {
    showNotification(message, 'success');
    loadLeads();
  };

  const handleShowError = (message) => {
    showNotification(message, 'error');
  };

  const handleShowSuccess = (message) => {
    showNotification(message, 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onShowNotification={showNotification}
      />

      <NotificationSystem
        successMessage={successMessage}
        errorMessage={errorMessage}
      />

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mb-6 border border-slate-700">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Power Dialer Dashboard
          </h1>
          <p className="text-slate-300">Upload leads and start automated calling</p>
        </div>

        {/* Campaign Selector */}
        <CampaignSelector
          onSelect={setSelectedCampaignId}
          selectedId={selectedCampaignId}
          isLoading={isLoading}
        />

        {/* Dashboard Content */}
        {selectedCampaignId && (
          <DashboardContent
            selectedCampaignId={selectedCampaignId}
            isDialing={isDialing}
            setIsDialing={setIsDialing}
            isLoading={isLoading}
            leads={leads}
            dialedCount={dialedCount}
            successCount={successCount}
            callsInProgress={callsInProgress}
            activeCalls={activeCalls}
            onUploadSuccess={handleUploadSuccess}
            onShowError={handleShowError}
            onShowSuccess={handleShowSuccess}
            onLeadDeleted={handleLeadDeleted}
          />
        )}
      </div>
    </div>
  );
}
