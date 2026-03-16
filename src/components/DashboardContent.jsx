import FileUpload from './FileUpload';
import DialerControls from './DialerControls';
import ActiveCalls from './ActiveCalls';
import LeadsTable from './LeadsTable';
import LoadingSpinner from './LoadingSpinner';
import DashboardStats from './DashboardStats';
import { useLeads } from '../hooks/useLeads';
import { useDialer } from '../hooks/useDialer';
import { useNotification } from '../hooks/useNotification';

export default function DashboardContent({ selectedCampaignId }) {
  const { leads, isLoading, loadLeads } = useLeads();
  const { showNotification } = useNotification();
  const {
    isDialing,
    setIsDialing,
    dialedCount,
    successCount,
    callsInProgress,
    activeCalls,
  } = useDialer(selectedCampaignId, showNotification);

  const handleUploadSuccess = () => {
    showNotification('Leads uploaded successfully', 'success');
    loadLeads();
  };

  const handleShowError = (message) => {
    showNotification(message, 'error');
  };

  const handleShowSuccess = (message) => {
    showNotification(message, 'success');
  };

  return (
    <>
      {/* Stats Cards */}
      <DashboardStats
        totalLeads={leads.length}
        dialedCount={dialedCount}
        successCount={successCount}
        callsInProgress={callsInProgress}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - File Upload & Dialer */}
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

        {/* Right Column - Active Calls */}
        <ActiveCalls calls={activeCalls} isLoading={isLoading} />
      </div>

      {/* Leads Table */}
      <LeadsTable />

      {/* Loading State */}
      {isLoading && leads.length === 0 && <LoadingSpinner />}
    </>
  );
}
