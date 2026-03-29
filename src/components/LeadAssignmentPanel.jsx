import { useState, useEffect } from 'react';
import { Users, Check, X } from 'lucide-react';
import { getLeads, assignLead, getAllAgents } from '../services/api';

export default function LeadAssignmentPanel({ campaignId, onAssignmentComplete, showNotification }) {
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState(new Set());
  const [selectedAgent, setSelectedAgent] = useState('');

  // Load unassigned leads and agents
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
      // Filter for leads without assignedCaller or assignedCloser
      const unassigned = leads.filter(lead => !lead.assignedCaller && !lead.assignedCloser);
      setUnassignedLeads(unassigned);
    } catch (error) {
      console.error('Error loading unassigned leads:', error);
      showNotification('Failed to load unassigned leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const agentsList = await getAllAgents();
      setAgents(agentsList || []);
    } catch (error) {
      console.error('Error loading agents:', error);
      showNotification('Failed to load agents', 'error');
    }
  };

  const handleSelectLead = (leadId) => {
    const updated = new Set(selectedLeads);
    if (updated.has(leadId)) {
      updated.delete(leadId);
    } else {
      updated.add(leadId);
    }
    setSelectedLeads(updated);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === unassignedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(unassignedLeads.map(lead => lead._id)));
    }
  };

  const handleAssignLeads = async () => {
    if (selectedLeads.size === 0 || !selectedAgent) {
      showNotification('Please select leads and an agent', 'error');
      return;
    }

    try {
      setIsLoading(true);
      // Assign each lead to the selected agent
      for (const leadId of selectedLeads) {
        await assignLead(leadId, selectedAgent);
      }
      
      showNotification(`${selectedLeads.size} leads assigned successfully`, 'success');
      setSelectedLeads(new Set());
      setSelectedAgent('');
      loadUnassignedLeads();
      
      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
    } catch (error) {
      console.error('Error assigning leads:', error);
      showNotification('Failed to assign leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (unassignedLeads.length === 0) {
    return (
      <div className="text-center py-8 bg-linear-to-br from-slate-800 to-slate-700 rounded-lg border border-slate-700">
        <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-slate-300 font-medium">All leads assigned!</p>
        <p className="text-slate-400 text-sm mt-1">There are no unassigned leads in this campaign.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-slate-200">Assign Leads to Agents</h3>
        <span className="ml-auto text-sm text-slate-400">
          {selectedLeads.size} of {unassignedLeads.length} selected
        </span>
      </div>

      <div className="space-y-4">
        {/* Agent Select */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">Select Agent</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            disabled={isLoading}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-500"
          >
            <option value="">Choose an agent...</option>
            {agents.map(agent => (
              <option key={agent._id} value={agent._id}>
                {agent.name} - {agent.role === 'caller-agent' ? 'Caller' : agent.role === 'closer-agent' ? 'Closer' : 'Agent'} ({agent.email})
              </option>
            ))}
          </select>
        </div>

        {/* Leads List */}
        <div className="border border-slate-600 rounded-lg bg-slate-700/30 max-h-64 overflow-y-auto">
          <div className="sticky top-0 bg-slate-700 border-b border-slate-600 p-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedLeads.size === unassignedLeads.length && unassignedLeads.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-slate-500 cursor-pointer"
            />
            <span className="text-sm text-slate-300 font-medium">Select All</span>
          </div>

          {unassignedLeads.map(lead => (
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

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setSelectedLeads(new Set())}
            disabled={isLoading || selectedLeads.size === 0}
            type="button"
            className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <X className="w-4 h-4 inline mr-1" />
            Clear
          </button>
          <button
            onClick={handleAssignLeads}
            disabled={isLoading || selectedLeads.size === 0 || !selectedAgent}
            type="button"
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Assign ({selectedLeads.size})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
