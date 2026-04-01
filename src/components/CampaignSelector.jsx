import { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { createCampaign, getCampaigns } from '../services/api';

export default function CampaignSelector({ onCampaignSelect, onSelect, selectedCampaignId, selectedId, isLoading, onShowNotification }) {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  // Support both prop names for backwards compatibility
  const handleSelect = onCampaignSelect || onSelect;
  const currentSelectedId = selectedCampaignId || selectedId;

  // Fetch campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      const campaignList = Array.isArray(data) ? data : (data?.data || []);
      setCampaigns(campaignList);
      // Auto-select first campaign if none selected
      if (campaignList && campaignList.length > 0 && !currentSelectedId && handleSelect) {
        handleSelect(campaignList[0]._id);
      }
    } catch (err) {
      setError('Failed to load campaigns');
      if (onShowNotification) {
        onShowNotification('Failed to load campaigns', 'error');
      }
      console.error(err);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newName.trim()) {
      setError('Campaign name required');
      return;
    }

    try {
      setCreating(true);
      const newCampaign = await createCampaign(newName);
      setCampaigns([...campaigns, newCampaign]);
      handleSelect(newCampaign._id);
      setNewName('');
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError('Failed to create campaign');
      if (onShowNotification) {
        onShowNotification('Failed to create campaign', 'error');
      }
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700 mb-6">
      <h2 className="text-xl font-bold mb-4 text-primary-500">Select Campaign</h2>

      <div className="flex gap-4 mb-4">
        {/* Campaign Dropdown */}
        <select
          value={currentSelectedId || ''}
          onChange={(e) => handleSelect(e.target.value)}
          disabled={isLoading || campaigns.length === 0}
          className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none disabled:bg-slate-800 disabled:text-slate-500"
        >
          <option value="">Select a campaign...</option>
          {campaigns.map((campaign) => (
            <option key={campaign._id} value={campaign._id}>
              {campaign.name} ({campaign.totalLeads || 0} leads)
            </option>
          ))}
        </select>

        {/* Create Campaign Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          New
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
          <input
            type="text"
            placeholder="Campaign name (e.g., Q1 Sales Outreach)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateCampaign()}
            className="w-full px-3 py-2 bg-slate-800 text-white rounded border border-slate-600 mb-2 focus:border-cyan-500 outline-none"
          />
          <button
            onClick={handleCreateCampaign}
            disabled={creating}
            className="w-full px-4 py-2 bg-emerald-500 text-white rounded font-semibold hover:bg-emerald-600 disabled:bg-slate-600 transition"
          >
            {creating ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      )}

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
    </div>
  );
}
