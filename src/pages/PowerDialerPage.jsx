import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDialer } from '../hooks/useDialer';
import CampaignSelector from '../components/CampaignSelector';
import DialerControls from '../components/DialerControls';
import { LeadsProvider } from '../context/LeadsContext';
import LeadsTable from '../components/LeadsTable';
import { Zap } from 'lucide-react';

export default function PowerDialerPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [totalLeads, setTotalLeads] = useState(0);
  const { isDialing, setIsDialing, activeCalls } = useDialer(selectedCampaignId, showNotification);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-500">Power Dialer</h1>
            <p className="text-slate-400 mt-2">Rapid sequential dialing with callbacks for maximum efficiency</p>
          </div>
        </div>
      </div>

      {/* Campaign Selector */}
      <CampaignSelector
        selectedCampaignId={selectedCampaignId}
        onCampaignSelect={setSelectedCampaignId}
        onShowNotification={showNotification}
      />

      {/* Power Dialer Controls */}
      {selectedCampaignId && (
        <DialerControls
          campaignId={selectedCampaignId}
          isDialing={isDialing}
          setIsDialing={setIsDialing}
          onError={(message) => showNotification(message, 'error')}
          onSuccess={(message) => showNotification(message, 'success')}
          totalLeads={totalLeads}
          isLoading={false}
          mode="power"
          agentId={user?._id}
        />
      )}

      {/* Active Calls */}
      {selectedCampaignId && activeCalls && activeCalls.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <h3 className="font-semibold text-slate-200 mb-3">Active Calls: {activeCalls.length}</h3>
          {/* Implement ActiveCalls component or display here */}
        </div>
      )}

      {/* Leads Display */}
      {selectedCampaignId && (
        <div className="pt-4 border-t border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-200 mb-4 px-1">Assigned Leads</h2>
          <LeadsProvider campaignId={selectedCampaignId}>
            <LeadsTable showNotification={showNotification} />
          </LeadsProvider>
        </div>
      )}

      {!selectedCampaignId && (
        <div className="text-center py-12 bg-linear-to-br from-slate-800 to-slate-700 rounded-lg border border-slate-700">
          <p className="text-slate-400">Select a campaign to start dialing</p>
        </div>
      )}
    </div>
  );
}
