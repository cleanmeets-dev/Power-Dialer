import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Users } from "lucide-react";
import { getAllAgents } from "../../services/api";

export default function AssignLeadsModal({
  isOpen,
  onClose,
  onAssign,
  selectedCount,
}) {
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
      setSelectedAgentId("");
      setError(null);
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAgents();
      setAgents(data || []);
    } catch (err) {
      setError("Failed to load agents. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      setError("Please select an agent");
      return;
    }
    onAssign(selectedAgentId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-500" />
            Assign Leads
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-center">
            <p className="text-slate-300">
              You are about to assign <span className="font-bold text-cyan-400">{selectedCount}</span> lead(s).
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-500/20 border border-rose-500/50 rounded flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Select Agent
                </label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => {
                    setSelectedAgentId(e.target.value);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-800"
                >
                  <option value="">-- Choose an agent --</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} {agent.isAvailable ? "(Online)" : "(Offline)"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedAgentId}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Assign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
