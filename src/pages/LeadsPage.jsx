import { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isManager as checkIsManager } from '../utils/roleUtils';
import { LeadsProvider } from '../context/LeadsContext';
import LeadsTable from '../components/LeadsTable';
import FileUpload from '../components/FileUpload';
import DialerControls from '../components/DialerControls';
import ActiveCalls from '../components/ActiveCalls';
import { useDialer } from '../hooks/useDialer';
import { getCampaignById, getLeads } from '../services/api';

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export default function LeadsPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const isManager = checkIsManager(user?.role);
  const [searchParams] = useSearchParams();

  const [selectedCampaignId, setSelectedCampaignId] = useState(() => searchParams.get('campaignId') || '');
  const [selectedCampaignName, setSelectedCampaignName] = useState('');
  const [totalLeads, setTotalLeads] = useState(0);
  const { isDialing, setIsDialing, activeCalls } = useDialer(selectedCampaignId, showNotification);

  useEffect(() => {
    const rawCampaignId = (searchParams.get('campaignId') || '').trim();
    setSelectedCampaignId(rawCampaignId);
  }, [searchParams]);

  useEffect(() => {
    if (!selectedCampaignId) {
      setSelectedCampaignName('');
      setTotalLeads(0);
      return;
    }

    if (!OBJECT_ID_REGEX.test(selectedCampaignId)) {
      setSelectedCampaignName('Invalid campaign selection');
      setTotalLeads(0);
      showNotification('Invalid campaign selected. Please choose a campaign again.', 'error');
      return;
    }

    const loadCampaign = async () => {
      try {
        const campaign = await getCampaignById(selectedCampaignId);
        setSelectedCampaignName(campaign?.name || selectedCampaignId);
      } catch (error) {
        setSelectedCampaignName(selectedCampaignId);
      }
    };

    loadCampaign();
  }, [selectedCampaignId]);

  useEffect(() => {
    if (!selectedCampaignId) return;

    if (!OBJECT_ID_REGEX.test(selectedCampaignId)) return;

    const fetchLeadsCount = async () => {
      try {
        const response = await getLeads(selectedCampaignId, { limit: 1, page: 1 });
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
    if (!selectedCampaignId) return 0;

    try {
      const response = await getLeads(selectedCampaignId, { limit: 1, page: 1 });
      let count = 0;
      if (Array.isArray(response)) {
        count = response.length;
      } else if (response?.pagination?.total) {
        count = response.pagination.total;
      }
      setTotalLeads(count);
      return count;
    } catch (error) {
      console.error('Error refreshing leads count:', error);
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Leads</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">View and manage your leads</p>
      </div>

      {selectedCampaignId && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Selected Campaign</p>
            <p className="font-semibold text-slate-900 dark:text-white">{selectedCampaignName || selectedCampaignId}</p>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 text-right">
            Selected from the Campaigns page.
          </div>
        </div>
      )}

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

      {!isManager && selectedCampaignId && (
        <ActiveCalls calls={activeCalls} isLoading={false} />
      )}

      {selectedCampaignId && (
        <LeadsProvider campaignId={selectedCampaignId}>
          {isManager && (
            <FileUpload
              campaignId={selectedCampaignId}
              onSuccess={handleUploadSuccess}
              onError={handleUploadError}
              onLeadsChange={setTotalLeads}
              onUploadComplete={handleUploadComplete}
            />
          )}

          <LeadsTable showNotification={showNotification} />
          {/* <LeadsTable showNotification={showNotification} activeCalls={activeCalls} /> */}
        </LeadsProvider>
      )}

      {!selectedCampaignId && (
        <div className="text-center py-12 bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">Open a child campaign from Campaigns to view its leads</p>
        </div>
      )}
    </div>
  );
}
