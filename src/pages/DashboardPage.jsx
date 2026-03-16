import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useDialer } from '../hooks/useDialer';
import { useCampaignData } from '../hooks/useCampaignData';
import { getCampaigns, getUsers } from '../services/api';
import Navbar from '../components/Navbar';
import CampaignManager from '../components/CampaignManager';
import CampaignMetricsDisplay from '../components/CampaignMetricsDisplay';
// import AgentAvailabilityPanel from '../components/AgentAvailabilityPanel';
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
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  // const [agents, setAgents] = useState([]);
  const {
    leads,
    isLoading,
    pagination,
    loadLeads,
    handleLeadDeleted,
    handleLeadUpdated,
    changePage,
    changePageSize,
    searchLeads,
    filterByStatus,
  } = useCampaignData(selectedCampaignId);
  const {
    isDialing,
    setIsDialing,
    dialedCount,
    successCount,
    callsInProgress,
    activeCalls,
  } = useDialer(selectedCampaignId, showNotification);

  // Load selected campaign data
  useEffect(() => {
    if (selectedCampaignId) {
      const loadCampaignData = async () => {
        try {
          const campaigns = await getCampaigns();
          const campaign = campaigns.find(c => c._id === selectedCampaignId);
          setSelectedCampaign(campaign);
        } catch (error) {
          console.error('Failed to load campaign data:', error);
        }
      };
      loadCampaignData();
    }
  }, [selectedCampaignId]);

  // Load agents
  // useEffect(() => {
  //   const loadAgents = async () => {
  //     try {
  //       const users = await getUsers();
  //       const agentsOnly = Array.isArray(users) ? users.filter(u => u.role === 'agent') : [];
  //       setAgents(agentsOnly);
  //     } catch (error) {
  //       console.error('Failed to load agents:', error);
  //     }
  //   };
  //   loadAgents();
  // }, []);

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
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar
        user={user}
        campaignId={selectedCampaignId}
        onLogout={handleLogout}
        onShowNotification={showNotification}
      />

      <NotificationSystem
        successMessage={successMessage}
        errorMessage={errorMessage}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mb-6 border border-slate-700">
          <h1 className="text-4xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Power Dialer Dashboard
          </h1>
          <p className="text-slate-300">Upload leads and start automated calling</p>
        </div>

        {/* Campaign Manager */}
        <CampaignManager
          selectedCampaignId={selectedCampaignId}
          onCampaignSelect={setSelectedCampaignId}
          onShowNotification={showNotification}
        />

        {/* Campaign Metrics & Agent Availability - COMMENTED OUT */}
        {/* 
        {selectedCampaignId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
            <div className="lg:col-span-2">
              {selectedCampaign && (
                <CampaignMetricsDisplay campaign={selectedCampaign} />
              )}
            </div>
            <div>
              <AgentAvailabilityPanel 
                agents={agents}
                onStatusChange={(agentId, action) => {
                  console.log(`Agent ${agentId} status changed: ${action}`);
                }}
              />
            </div>
          </div>
        )}
        */}

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
            pagination={pagination}
            onUploadSuccess={handleUploadSuccess}
            onShowError={handleShowError}
            onShowSuccess={handleShowSuccess}
            onLeadDeleted={handleLeadDeleted}
            onLeadUpdated={handleLeadUpdated}
            onShowNotification={showNotification}
            onChangePage={changePage}
            onChangePageSize={changePageSize}
            onSearchLeads={searchLeads}
            onFilterByStatus={filterByStatus}
          />
        )}
      </div>
    </div>
  );
}
