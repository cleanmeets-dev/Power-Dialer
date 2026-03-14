import FileUpload from './FileUpload';
import DialerControls from './DialerControls';
import ActiveCalls from './ActiveCalls';
import LeadsTable from './LeadsTable';
import LoadingSpinner from './LoadingSpinner';
import DashboardStats from './DashboardStats';

/**
 * DashboardContent - Main dashboard content area
 * Shows stats, file upload, dialer controls, active calls, and leads table
 */
export default function DashboardContent({
  selectedCampaignId,
  isDialing,
  setIsDialing,
  isLoading,
  leads,
  dialedCount,
  successCount,
  callsInProgress,
  activeCalls,
  onUploadSuccess,
  onShowError,
  onShowSuccess,
  onLeadDeleted,
}) {
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
            onSuccess={onUploadSuccess}
            onError={onShowError}
          />
          <DialerControls
            campaignId={selectedCampaignId}
            isDialing={isDialing}
            setIsDialing={setIsDialing}
            onError={onShowError}
            onSuccess={onShowSuccess}
            totalLeads={leads.length}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Active Calls */}
        <ActiveCalls calls={activeCalls} isLoading={isLoading} />
      </div>

      {/* Leads Table */}
      {leads.length > 0 && (
        <LeadsTable
          leads={leads}
          isLoading={isLoading}
          onLeadDeleted={onLeadDeleted}
        />
      )}

      {/* Loading State */}
      {isLoading && leads.length === 0 && <LoadingSpinner />}
    </>
  );
}
