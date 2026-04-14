import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { getCampaigns } from '../services/api';
import CreateCampaignModal from './modals/CreateCampaignModal';

export default function CampaignSelector({ onCampaignSelect, onSelect, selectedCampaignId, selectedId, isLoading, onShowNotification, refreshKey = 0 }) {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  // Support both prop names for backwards compatibility
  const handleSelect = onCampaignSelect || onSelect;
  const currentSelectedId = selectedCampaignId || selectedId;

  // Fetch campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, [refreshKey]);

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      const rootCampaigns = Array.isArray(data) ? data : (data?.data || []);
      const callerRoots = rootCampaigns.filter((root) => root.pipelineType === 'caller');
      const campaignList = [];

      callerRoots.forEach((root) => {
        campaignList.push({ ...root, __isChild: false, __parentName: null });
        const children = Array.isArray(root.children) ? root.children : [];
        children
          .filter((child) => child.pipelineType === 'caller')
          .forEach((child) => {
            campaignList.push({ ...child, __isChild: true, __parentName: root.name });
          });
      });

      setCampaigns(campaignList);
    } catch (err) {
      setError('Failed to load campaigns');
      if (onShowNotification) {
        onShowNotification('Failed to load campaigns', 'error');
      }
      console.error(err);
    }
  };

  const handleCreateSuccess = async (newCampaign) => {
    setShowCreateModal(false);
    setError('');
    await loadCampaigns();
    if (newCampaign?._id) {
      handleSelect(newCampaign._id);
    }
    onShowNotification?.('Campaign created successfully', 'success');
  };

  return (
    <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700 mb-6">
      <h2 className="text-xl font-bold mb-4 text-primary-500">Select Campaign</h2>

      <div className="flex gap-4 mb-4">
        {/* Campaign Dropdown */}
        <select
          value={currentSelectedId || ''}
          onChange={(e) => handleSelect(e.target.value)}
          disabled={isLoading || campaigns.length === 0}
          className="flex-1 px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-600 focus:border-cyan-500 outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500"
        >
          <option value="">Select a campaign...</option>
          {campaigns.map((campaign) => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.__isChild ? `-- ${campaign.name}` : campaign.name}
            </option>
          ))}
        </select>

        {/* Create Campaign Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          New
        </button>
      </div>

      {/* Selected Campaign Info */}
      {currentSelectedId && campaigns.length > 0 && (
        <div className="p-3 bg-primary-500/20 border border-primary-500/50 rounded">
          <p className="text-primary-500 text-sm">
            ✓ Campaign selected and ready for leads
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        onError={(message) => {
          const nextMessage = message || 'Failed to create campaign';
          setError(nextMessage);
          onShowNotification?.(nextMessage, 'error');
        }}
      />
    </div>
  );
}
