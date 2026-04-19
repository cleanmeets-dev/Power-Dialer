// File removed: unused component
import { useState, useEffect } from 'react';
import { User, Phone, CheckCircle, XCircle, Loader, AlertCircle, Circle } from 'lucide-react';
import { updateAgentAvailability } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function AgentAvailabilityPanel({ agents: initialAgents, onStatusChange }) {
  const [agentsState, setAgentsState] = useState(initialAgents || []);
  const [loadingAgentId, setLoadingAgentId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Sync initial agents
  useEffect(() => {
    setAgentsState(initialAgents || []);
  }, [initialAgents]);

  // Listen for real-time availability changes via WebSocket
  const handleAgentAvailabilityChanged = (data) => {
    console.log('📡 Real-time agent availability:', data);
    setAgentsState(prevAgents =>
      prevAgents.map(agent =>
        agent._id === data.agentId
          ? {
            ...agent,
            ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
            ...(data.activeLead !== undefined ? { activeLead: data.activeLead } : {}),
            ...(data.attendance ? { attendance: data.attendance } : {})
          }
          : agent
      )
    );
  };

  useWebSocket({
    onAgentAvailabilityChanged: handleAgentAvailabilityChanged,
  });

  const handleToggleAvailability = async (agent) => {
    const agentId = agent._id;
    const newAvailabilityStatus = !agent.isAvailable;

    // Optimistically update UI
    setLoadingAgentId(agentId);
    setError(null);
    setSuccessMessage(null);

    const previousAgents = [...agentsState];
    setAgentsState(prevAgents =>
      prevAgents.map(a =>
        a._id === agentId ? { ...a, isAvailable: newAvailabilityStatus } : a
      )
    );

    try {
      await updateAgentAvailability(agentId, newAvailabilityStatus);
      const statusText = newAvailabilityStatus ? 'available' : 'busy';
      setSuccessMessage(`${agent.name} is now ${statusText}`);
      onStatusChange?.(agentId, 'toggle-availability');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to update agent availability:', err);
      // Revert optimistic update
      setAgentsState(previousAgents);
      setError(`Failed to update ${agent.name}'s status. Please try again.`);

      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingAgentId(null);
    }
  };

  // Returns color class for agent availability
  const getAvailabilityColor = (agent) => {
    if (!agent.attendance || !agent.attendance.isCheckedIn) {
      return 'bg-slate-900/50 border-slate-500/50 text-slate-300';
    }
    return agent.isAvailable && !agent.attendance.onBreak && !agent.activeLead
      ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300'
      : 'bg-rose-900/50 border-rose-500/50 text-rose-300';
  };

  // Returns icon for agent availability
  const getAvailabilityIcon = (agent) => {
    if (!agent.attendance || !agent.attendance.isCheckedIn) {
      return <Clock className="w-5 h-5 text-slate-400" />;
    }
    return agent.isAvailable && !agent.attendance.onBreak && !agent.activeLead ? (
      <CheckCircle className="w-5 h-5 text-emerald-400" />
    ) : (
      <XCircle className="w-5 h-5 text-rose-400" />
    );
  };

  // Stats for agent availability
  const stats = {
    total: agentsState.length,
    available: agentsState.filter((a) => a.attendance && a.attendance.isCheckedIn && !a.attendance.onBreak && !a.activeLead && a.isAvailable).length,
    busy: agentsState.filter((a) => a.attendance && a.attendance.isCheckedIn && (a.attendance.onBreak || a.activeLead || !a.isAvailable)).length,
    totalCalls: agentsState.reduce((sum, a) => sum + (a.callsToday || 0), 0),
  };

  return (
    <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 border border-slate-200 dark:border-slate-700 p-6 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-cyan-400">Agent Availability</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Toggle agent status in real-time</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 p-3 bg-rose-900/30 border border-rose-500/50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-500/50 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-200">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {agentsState && agentsState.length > 0 ? (
          agentsState.map(agent => (
            <div
              key={agent._id}
              className="bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 hover:border-slate-300 dark:hover:border-cyan-500/30 transition"
            >
              {/* Agent Info */}
              <div className="mb-4">
                <p className="font-semibold text-slate-900 dark:text-white text-base mb-1">{agent.name}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{agent.email}</p>
              </div>

              {/* Status Grid */}
              <div className="space-y-2.5 text-sm">
                {/* Agent Status with automatic activity detection */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Status:</span>
                  <div className="flex items-center gap-2">
                    {!agent.attendance || !agent.attendance.isCheckedIn ? (
                      <>
                        <Circle className="w-3 h-3 text-slate-500 fill-slate-500" />
                        <span className="text-slate-400 font-medium">Checked Out</span>
                      </>
                    ) : agent.activeLead ? (
                      <>
                        <Circle className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
                        <span className="text-red-400 font-medium">On Call</span>
                      </>
                    ) : agent.attendance?.onBreak ? (
                      <>
                        <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-yellow-400 font-medium">Break</span>
                      </>
                    ) : agent.isAvailable ? (
                      <>
                        <Circle className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                        <span className="text-emerald-400 font-medium">Available</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-yellow-400 font-medium">Break</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Role:</span>
                  <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-primary-500 font-medium capitalize">
                    {agent.role}
                  </span>
                </div>

                {/* Calls Today */}
                {(agent.callsToday !== undefined || agent.callsHandled !== undefined) && (
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-600/50 pt-2 mt-2">
                    <span className="text-slate-600 dark:text-slate-400">Calls Today:</span>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                      <span className="text-slate-900 dark:text-slate-300 font-semibold">{agent.callsToday ?? agent.callsHandled ?? 0}</span>
                    </div>
                  </div>
                )}

                {/* Active Lead is now shown in Status field above */}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600/50">
                {agent.activeLead ? (
                  // Agent is on a call - show disabled state
                  <div className="w-full py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-400 dark:border-slate-500 cursor-not-allowed">
                    <Circle className="w-3 h-3 fill-current animate-pulse" />
                    In Call
                  </div>
                ) : !agent.attendance || !agent.attendance.isCheckedIn ? (
                  // Agent has not checked in - show disabled state
                  <div className="w-full py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-400 dark:border-slate-500 cursor-not-allowed">
                    <Circle className="w-3 h-3 fill-current" />
                    Checked Out
                  </div>
                ) : (
                  // Agent is logged in - allow toggle between available/break
                  <button
                    onClick={() => handleToggleAvailability(agent)}
                    disabled={loadingAgentId === agent._id}
                    className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${agent.isAvailable
                        ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingAgentId === agent._id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : agent.isAvailable ? (
                      <>
                        <Circle className="w-3 h-3 fill-current" />
                        Take Break
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3 fill-current" />
                        Return
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <User className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400">No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
