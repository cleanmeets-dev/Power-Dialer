import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDialer } from '../hooks/useDialer';
import CampaignSelector from '../components/CampaignSelector';
import DialerControls from '../components/DialerControls';
import { LeadsProvider } from '../context/LeadsContext';
import LeadsTable from '../components/LeadsTable';
import { PhoneCall } from 'lucide-react';

export default function AutoDialerPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isDialing, setIsDialing } = useDialer(
    selectedCampaignId,
    (message, type = 'success') => showNotification(message, type),
    { mode: 'agent', agentId: user?._id }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
            <PhoneCall className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-500">Auto Dialer</h1>
            <p className="text-slate-400 mt-2">Agent-specific sequential automatic dialing</p>
          </div>
        </div>
      </div>

      {/* Auto Dialer Controls */}
      <div className="space-y-4">
        <CampaignSelector
          selectedCampaignId={selectedCampaignId}
          onCampaignSelect={setSelectedCampaignId}
          onShowNotification={showNotification}
        />
        {selectedCampaignId && (
          <DialerControls
            campaignId={selectedCampaignId}
            isDialing={isDialing}
            setIsDialing={setIsDialing}
            onError={(message) => showNotification(message, 'error')}
            onSuccess={(message) => showNotification(message, 'success')}
            totalLeads={1}
            isLoading={isLoading}
            mode="agent"
            agentId={user?._id}
          />
        )}
      </div>

      {/* Auto Dialer Queue / Leads Display */}
      {selectedCampaignId && (
        <div className="pt-4 border-t border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 px-1">Campaign Queue</h2>
          <LeadsProvider campaignId={selectedCampaignId}>
            <LeadsTable showNotification={showNotification} />
          </LeadsProvider>
        </div>
      )}
    </div>
  );
}
