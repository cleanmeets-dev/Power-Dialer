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
  pagination,
  onUploadSuccess,
  onShowError,
  onShowSuccess,
  onLeadDeleted,
  onLeadUpdated,
  onShowNotification,
  onChangePage,
  onChangePageSize,
  onSearchLeads,
  onFilterByStatus,
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
      {(
        <LeadsTable
          leads={leads}
          isLoading={isLoading}
          pagination={pagination}
          onLeadDeleted={onLeadDeleted}
          onLeadUpdated={onLeadUpdated}
          onShowNotification={onShowNotification}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
          onSearchLeads={onSearchLeads}
          onFilterByStatus={onFilterByStatus}
        />
      )}

      {/* Loading State */}
      {isLoading && leads.length === 0 && <LoadingSpinner />}
    </>
  );
}
