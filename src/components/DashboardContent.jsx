import FileUpload from "./FileUpload";
import DialerControls from "./DialerControls";
import ActiveCalls from "./ActiveCalls";
import AgentAvailabilityPanel from "./AgentAvailabilityPanel";
import LeadsTable from "./LeadsTable";
import LoadingSpinner from "./LoadingSpinner";
import DashboardStats from "./DashboardStats";
import { useLeads } from "../hooks/useLeads";
import { useDialer } from "../hooks/useDialer";
import { useNotification } from "../hooks/useNotification";
import { useWebSocket } from "../hooks/useWebSocket";
import useAgentStats from "../hooks/useAgentStats";

export default function DashboardContent({ selectedCampaignId }) {
  const { leads, pagination, isLoading, loadLeads } = useLeads();
  const { showNotification } = useNotification();
  const { agents, loadAgents: refreshAgents } = useAgentStats();
  const {
    isDialing,
    setIsDialing,
    dialedCount,
    successCount,
    callsInProgress,
    activeCalls,
  } = useDialer(selectedCampaignId, showNotification);

  // WebSocket listeners for real-time updates
  const handleCallInitiated = (data) => {
    console.log('📞 Call initiated:', data);
    showNotification(`Call initiated: ${data.businessName || data.phoneNumber}`, 'info');
  };

  const handleCallCompleted = (data) => {
    console.log('📞 Call completed:', data);
    showNotification('Call completed', 'success');
    loadLeads(); // Reload leads to reflect updated status
  };

  const handleCallFailed = (data) => {
    console.log('❌ Call failed:', data);
    showNotification(`Call failed: ${data.error || 'Unknown error'}`, 'error');
    refreshAgents(); // Reload agents to reflect availability
  };

  const handleAgentAvailabilityChanged = (data) => {
    console.log('👤 Agent availability changed:', data);
    refreshAgents(); // Reload agents
  };

  const handleCallbackScheduled = (data) => {
    console.log('📅 Callback scheduled:', data);
    showNotification(`Callback scheduled for ${data.businessName}`, 'success');
  };

  const handleCallbackTriggered = (data) => {
    console.log('📞 Callback triggered:', data);
    showNotification(`Callback triggered: ${data.businessName}`, 'info');
  };

  // Setup WebSocket connection
  useWebSocket({
    onCallInitiated: handleCallInitiated,
    onCallCompleted: handleCallCompleted,
    onCallFailed: handleCallFailed,
    onAgentAvailabilityChanged: handleAgentAvailabilityChanged,
    onCallbackScheduled: handleCallbackScheduled,
    onCallbackTriggered: handleCallbackTriggered,
  });

  const handleUploadSuccess = () => {
    showNotification("Leads uploaded successfully", "success");
    loadLeads();
  };

  const handleShowError = (message) => {
    showNotification(message, "error");
  };

  const handleShowSuccess = (message) => {
    showNotification(message, "success");
  };

  return (
    <>
      {/* Dashboard Stats */}
      <DashboardStats
        totalLeads={pagination.total}
        dialedCount={dialedCount}
            successCount={successCount}
            callsInProgress={callsInProgress}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FileUpload
                campaignId={selectedCampaignId}
                isLoading={isLoading}
                onSuccess={handleUploadSuccess}
                onError={handleShowError}
              />
              <DialerControls
                campaignId={selectedCampaignId}
                isDialing={isDialing}
                setIsDialing={setIsDialing}
                onError={handleShowError}
                onSuccess={handleShowSuccess}
                totalLeads={leads.length}
                isLoading={isLoading}
              />
            </div>

            <div className="space-y-6">
              <ActiveCalls calls={activeCalls} isLoading={isLoading} />
              <AgentAvailabilityPanel 
                agents={agents} 
                onStatusChange={refreshAgents}
              />
            </div>
          </div>

          <LeadsTable />

          {/* Loading State */}
          {isLoading && leads.length === 0 && <LoadingSpinner />}
    </>
  );
}
