import { useState, useEffect } from 'react';
import { Users, Check, X } from 'lucide-react';
import { getLeads, updateLead, getAllAgents } from '../services/api';

export default function LeadAssignmentPanel({ campaignId, onAssignmentComplete, showNotification }) {
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    if (!campaignId) return;
    loadUnassignedLeads();
    loadAgents();
  }, [campaignId]);

  const loadUnassignedLeads = async () => {
    try {
      setIsLoading(true);
      const response = await getLeads(campaignId, { limit: 100 });
      const leads = response.leads || [];
      setUnassignedLeads(leads.filter((lead) => !lead.assignedCaller));
    } catch (error) {
      showNotification('Failed to load unassigned leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const agentList = await getAllAgents();
      setAgents((agentList || []).filter((agent) => agent.role === 'caller-agent'));
    } catch (error) {
      showNotification('Failed to load agents', 'error');
    }
  };

  const handleSelectLead = (leadId) => {
    const next = new Set(selectedLeads);
    if (next.has(leadId)) next.delete(leadId);
    else next.add(leadId);
    setSelectedLeads(next);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === unassignedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(unassignedLeads.map((lead) => lead._id)));
    }
  };

  const handleAssignLeads = async () => {
    if (!selectedLeads.size || !selectedAgent) {
      showNotification('Please select leads and an agent', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await Promise.all(
        Array.from(selectedLeads).map((leadId) => updateLead(leadId, { assignedCaller: selectedAgent }))
      );

      showNotification(`${selectedLeads.size} lead(s) assigned successfully`, 'success');
      setSelectedLeads(new Set());
      setSelectedAgent('');
      await loadUnassignedLeads();
      onAssignmentComplete?.();
    } catch (error) {
      showNotification('Failed to assign leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAssignAll = async () => {
    if (!selectedAgent) {
      showNotification('Please select an agent', 'error');
      return;
    }

    if (!window.confirm('Assign ALL unassigned caller leads in this campaign to the selected agent?')) return;

    try {
      setIsLoading(true);
      await Promise.all(
        unassignedLeads.map((lead) => updateLead(lead._id, { assignedCaller: selectedAgent }))
      );
      showNotification('All unassigned leads assigned successfully', 'success');
      setSelectedLeads(new Set());
      setSelectedAgent('');
      await loadUnassignedLeads();
      onAssignmentComplete?.();
    } catch (error) {
      showNotification('Failed to assign all leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!unassignedLeads.length) {
    return (
      <div className="text-center py-8 bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
        <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-slate-700 dark:text-slate-300 font-medium">All leads assigned</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-900 dark:text-slate-200">Assign Leads To Caller Agents</h3>
        <span className="ml-auto text-sm text-slate-600 dark:text-slate-400">
          {selectedLeads.size} of {unassignedLeads.length} selected
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={handleBulkAssignAll}
          disabled={isLoading || !selectedAgent}
          className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          Assign All Unassigned
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Select Caller Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
          >
            <option value="">Choose an agent...</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        </div>

        <div className="border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/30 max-h-64 overflow-y-auto">
          <div className="sticky top-0 bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600 p-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedLeads.size === unassignedLeads.length && unassignedLeads.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-500 cursor-pointer"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Select All</span>
          </div>

          {unassignedLeads.map((lead) => (
            <div key={lead._id} className="p-3 border-b border-slate-600/30 flex items-center gap-3 hover:bg-slate-700/50 transition">
              <input
                type="checkbox"
                checked={selectedLeads.has(lead._id)}
                onChange={() => handleSelectLead(lead._id)}
                className="w-4 h-4 rounded border-slate-500 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{lead.businessName}</p>
                <p className="text-xs text-slate-400 truncate">{lead.phoneNumber}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setSelectedLeads(new Set())}
            disabled={isLoading || !selectedLeads.size}
            type="button"
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <X className="w-4 h-4 inline mr-1" />
            Clear
          </button>
          <button
            onClick={handleAssignLeads}
            disabled={isLoading || !selectedLeads.size || !selectedAgent}
            type="button"
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Assign ({selectedLeads.size})
          </button>
        </div>
      </div>
    </div>
  );
}
