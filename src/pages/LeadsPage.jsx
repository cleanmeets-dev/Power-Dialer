import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LeadsProvider } from '../context/LeadsContext';
import CampaignSelector from '../components/CampaignSelector';
import LeadsTable from '../components/LeadsTable';
import FileUpload from '../components/FileUpload';
import LeadAssignmentPanel from '../components/LeadAssignmentPanel';
import DialerControls from '../components/DialerControls';
import ActiveCalls from '../components/ActiveCalls';
import { useDialer } from '../hooks/useDialer';
import { getLeads } from '../services/api';

export default function LeadsPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';
  
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [totalLeads, setTotalLeads] = useState(0);
  const { isDialing, setIsDialing, activeCalls } = useDialer(selectedCampaignId, showNotification);

  // Fetch leads count when campaign changes
  useEffect(() => {
    if (!selectedCampaignId) {
      setTotalLeads(0);
      return;
    }

    const fetchLeadsCount = async () => {
      try {
        const response = await getLeads(selectedCampaignId, { limit: 1, page: 1 });
        // Handle both array and object responses
        let count = 0;
        if (Array.isArray(response)) {
          count = response.length;
        } else if (response?.pagination?.total) {
          count = response.pagination.total;
        } else if (typeof response === 'object') {
          count = response.length || 0;
        }
        setTotalLeads(count);
      } catch (error) {
        console.error('Error fetching leads count:', error);
        setTotalLeads(0);
      }
    };

    fetchLeadsCount();
  }, [selectedCampaignId]);

  const handleUploadSuccess = (message) => {
    showNotification(message, 'success');
  };

  const handleUploadError = (message) => {
    showNotification(message, 'error');
  };

  const handleUploadComplete = async () => {
    // Re-fetch leads count after upload
    if (selectedCampaignId) {
      try {
        const response = await getLeads(selectedCampaignId, { limit: 1, page: 1 });
        let count = 0;
        if (Array.isArray(response)) {
          count = response.length;
        } else if (response?.pagination?.total) {
          count = response.pagination.total;
        }
        setTotalLeads(count);
      } catch (error) {
        console.error('Error refreshing leads count:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <h1 className="text-3xl font-bold text-primary-500">Leads</h1>
        <p className="text-slate-400 mt-2">View and manage your leads</p>
      </div>

      {/* Campaign Selector */}
      <CampaignSelector
        selectedCampaignId={selectedCampaignId}
        onCampaignSelect={setSelectedCampaignId}
        onShowNotification={showNotification}
      />

      {/* Dialer Controls (Agents Only) */}
      {!isManager && selectedCampaignId && (
        <DialerControls
          campaignId={selectedCampaignId}
          isDialing={isDialing}
          setIsDialing={setIsDialing}
          onError={handleUploadError}
          onSuccess={handleUploadSuccess}
          totalLeads={totalLeads}
          isLoading={false}
        />
      )}

      {/* Active Calls (Agents Only) */}
      {!isManager && selectedCampaignId && (
        <ActiveCalls 
          calls={activeCalls}
          isLoading={false}
        />
      )}

      {/* Leads Table */}
      {selectedCampaignId && (
        <LeadsProvider campaignId={selectedCampaignId}>
          {/* File Upload (Managers Only) */}
          {isManager && (
            <FileUpload 
              campaignId={selectedCampaignId} 
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              onLeadsChange={setTotalLeads}
              onUploadComplete={handleUploadComplete}
            />
          )}

          {/* Lead Assignment Panel (Managers Only) */}
          {isManager && (
            <LeadAssignmentPanel
              campaignId={selectedCampaignId}
              onAssignmentComplete={() => {
                // Optionally refresh leads after assignment
              }}
              showNotification={showNotification}
            />
          )}

          <LeadsTable showNotification={showNotification} />
        </LeadsProvider>
      )}

      {!selectedCampaignId && (
        <div className="text-center py-12 bg-linear-to-br from-slate-800 to-slate-700 rounded-lg border border-slate-700">
          <p className="text-slate-400">Select a campaign to view and manage leads</p>
        </div>
      )}
    </div>
  );
}
