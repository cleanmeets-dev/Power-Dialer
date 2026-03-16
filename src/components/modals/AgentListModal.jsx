import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { getAllAgents } from '../../services/api.js';
import { Mail, Trash2, ShieldCheck } from 'lucide-react';

export default function AgentListModal({ isOpen, onClose, onDeleteAgent, onShowNotification }) {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAgents();
    }
  }, [isOpen]);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const data = await getAllAgents();
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load agents:', error);
      onShowNotification?.('Failed to load agents', 'error');
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (agent) => {
    if (window.confirm(`Are you sure you want to delete ${agent.name}?`)) {
      onDeleteAgent?.(agent._id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Agents" maxWidth="max-w-2xl">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-8">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No agents found</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {agents.map((agent) => (
            <div key={agent._id} className="border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition">
              <div className="flex-1">
                <p className="font-semibold text-white">{agent.name}</p>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                  <Mail className="w-3 h-3" />
                  {agent.email}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded capitalize">
                  {agent.role}
                </span>
                <button
                  onClick={() => handleDelete(agent)}
                  className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                  title="Delete agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-700">
        <button
          onClick={loadAgents}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
        >
          Refresh
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
