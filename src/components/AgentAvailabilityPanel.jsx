import { User, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AgentAvailabilityPanel({ agents, onStatusChange }) {
  const getAvailabilityColor = (isAvailable) => {
    return isAvailable ? 'text-emerald-400' : 'text-rose-400';
  };

  const getAvailabilityIcon = (isAvailable) => {
    return isAvailable ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-2 rounded">
          <User className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-cyan-400">Agent Availability</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents && agents.length > 0 ? (
          agents.map(agent => (
            <div
              key={agent._id}
              className="bg-slate-700/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600 transition"
            >
              {/* Agent Info */}
              <div className="mb-3">
                <p className="font-semibold text-white text-sm mb-1">{agent.name}</p>
                <p className="text-xs text-slate-400">{agent.email}</p>
              </div>

              {/* Status Grid */}
              <div className="space-y-2 text-xs">
                {/* Role */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-cyan-400 font-medium capitalize">
                    {agent.role}
                  </span>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active:</span>
                  <div className="flex items-center gap-2">
                    {agent.isActive ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={agent.isActive ? 'text-emerald-400' : 'text-rose-400'}>
                      {agent.isActive ? 'Yes' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Available:</span>
                  <div className="flex items-center gap-2">
                    {agent.isAvailable ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className={agent.isAvailable ? 'text-emerald-400' : 'text-rose-400'}>
                      {agent.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>

                {/* Calls Handled */}
                {agent.callsHandled !== undefined && (
                  <div className="flex items-center justify-between border-t border-slate-600/50 pt-2 mt-2">
                    <span className="text-slate-400">Calls Handled:</span>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-300 font-semibold">{agent.callsHandled}</span>
                    </div>
                  </div>
                )}

                {/* Active Lead */}
                {agent.activeLead && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Lead:</span>
                    <span className="text-yellow-400 font-medium text-xs">In Progress</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {onStatusChange && (
                <div className="mt-4 pt-3 border-t border-slate-600/50 flex gap-2">
                  <button
                    onClick={() => onStatusChange(agent._id, 'toggle-availability')}
                    className="flex-1 px-2 py-1.5 text-xs font-medium rounded transition cursor-pointer"
                    style={{
                      backgroundColor: agent.isAvailable ? 'rgba(248, 113, 113, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      color: agent.isAvailable ? '#fca5a5' : '#86efac',
                    }}
                  >
                    {agent.isAvailable ? 'Set Busy' : 'Set Available'}
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
