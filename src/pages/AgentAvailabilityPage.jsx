import { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { User, Clock, Phone, CheckCircle, XCircle, RefreshCw, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getAgentStats,
  managerCheckInAgent,
  managerCheckOutAgent,
  managerEndAgentBreak,
  managerStartAgentBreak,
  updateAgentAvailability,
} from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function AgentAvailabilityPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAgentId, setLoadingAgentId] = useState(null);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  // Check if user is manager
  useEffect(() => {
    if (user && user.role !== 'manager') {
      showNotification('You do not have permission to access this page', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate, showNotification]);

  // Load agents from API
  const loadAgents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const agentsList = await getAgentStats();
      setAgents(agentsList || []);
    } catch (err) {
      setError('Failed to load agents');
      showNotification('Failed to load agents', 'error');
      setAgents([]);
      console.error('Error loading agents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time agent availability changes via WebSocket
  const handleAgentAvailabilityChanged = (data) => {
    console.log('📡 Real-time agent availability:', data);
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent._id === data.agentId
          ? {
              ...agent,
              ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
              ...(data.activeLead !== undefined ? { activeLead: data.activeLead } : {}),
              ...(data.attendance ? { attendance: data.attendance } : {}),
            }
          : agent
      )
    );
  };

  // Subscribe to WebSocket events
  useWebSocket({
    onAgentAvailabilityChanged: handleAgentAvailabilityChanged,
  });

  // Handle toggle availability
  const handleToggleAvailability = async (agent) => {
    const agentId = agent._id;
    const newStatus = !agent.isAvailable;

    setLoadingAgentId(agentId);
    const previousAgents = [...agents];

    // Optimistic update
    setAgents((prevAgents) =>
      prevAgents.map((a) =>
        a._id === agentId ? { ...a, isAvailable: newStatus } : a
      )
    );

    try {
      await updateAgentAvailability(agentId, newStatus);
      const statusText = newStatus ? 'available' : 'busy';
      showNotification(`${agent.name} is now ${statusText}`, 'success');
    } catch (err) {
      console.error('Failed to update agent availability:', err);
      // Revert on error
      setAgents(previousAgents);
      showNotification(`Failed to update ${agent.name}'s status`, 'error');
    } finally {
      setLoadingAgentId(null);
    }
  };

  const handleAttendanceAction = async (agent, action) => {
    setLoadingAgentId(agent._id);
    try {
      if (action === 'check-in') {
        await managerCheckInAgent(agent._id);
        showNotification(`${agent.name} checked in`, 'success');
      } else if (action === 'check-out') {
        await managerCheckOutAgent(agent._id);
        showNotification(`${agent.name} checked out`, 'success');
      } else if (action === 'break-start') {
        await managerStartAgentBreak(agent._id);
        showNotification(`${agent.name} is now on break`, 'success');
      } else if (action === 'break-end') {
        await managerEndAgentBreak(agent._id);
        showNotification(`${agent.name} break ended`, 'success');
      }

      await loadAgents();
    } catch (err) {
      console.error(`Failed attendance action (${action}) for ${agent.name}:`, err);
      const message = err.response?.data?.error || `Failed to update ${agent.name} attendance`;
      showNotification(message, 'error');
    } finally {
      setLoadingAgentId(null);
    }
  };

  // Initial load and periodic sync (every 30 seconds)
  useEffect(() => {
    loadAgents();

    // Sync every 30 seconds for consistency
    pollIntervalRef.current = setInterval(() => {
      loadAgents();
    }, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Manual refresh handler
  const handleRefresh = async () => {
    await loadAgents();
  };

  const getAvailabilityColor = (agent) => {
    if (!agent.attendance || !agent.attendance.isCheckedIn) {
      return 'bg-slate-900/50 border-slate-500/50 text-slate-300';
    }

    return agent.isAvailable && !agent.attendance.onBreak && !agent.activeLead
      ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300'
      : 'bg-rose-900/50 border-rose-500/50 text-rose-300';
  };

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

  const stats = {
    total: agents.length,
    available: agents.filter((a) => a.attendance && a.attendance.isCheckedIn && !a.attendance.onBreak && !a.activeLead && a.isAvailable).length,
    busy: agents.filter((a) => a.attendance && a.attendance.isCheckedIn && (a.attendance.onBreak || a.activeLead || !a.isAvailable)).length,
    totalCalls: agents.reduce((sum, a) => sum + (a.callsHandled || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <h1 className="text-3xl font-bold text-primary-500">Agent Availability</h1>
        <p className="text-slate-400 mt-2">Monitor and manage agent status</p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            isLoading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-linear-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-lg'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-400 text-sm">Total Agents</span>
          </div>
          <p className="text-3xl font-bold text-cyan-400">{stats.total}</p>
        </div>

        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-400 text-sm">Available</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{stats.available}</p>
        </div>

        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <XCircle className="w-5 h-5 text-rose-400" />
            <span className="text-slate-400 text-sm">Busy</span>
          </div>
          <p className="text-3xl font-bold text-rose-400">{stats.busy}</p>
        </div>

        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-blue-400" />
            <span className="text-slate-400 text-sm">Total Calls</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.totalCalls}</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-900/50 border border-rose-700 rounded-lg p-4">
          <p className="text-rose-400 text-sm flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && agents.length === 0 && (
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-8 border border-slate-700 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400">Loading agents...</p>
        </div>
      )}

      {/* Live Status */}
      {agents.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-blue-400 text-xs font-semibold">Auto-refreshing every 30 seconds (WebSocket enabled)</span>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent._id}
            className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl border border-slate-700 p-6 hover:border-cyan-500/50 transition"
          >
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded-full p-3 shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-200 truncate">{agent.name}</p>
                  <p className="text-xs text-slate-400 truncate">{agent.email}</p>
                </div>
              </div>
            </div>

            {/* Availability Status */}
            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getAvailabilityColor(
                  agent
                )}`}
              >
                {getAvailabilityIcon(agent)}
                {!agent.attendance || !agent.attendance.isCheckedIn
                  ? 'Checked Out'
                  : agent.activeLead
                    ? 'On Call'
                    : agent.attendance.onBreak
                      ? 'On Break'
                      : agent.isAvailable
                        ? 'Available'
                        : 'Busy'}
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-2 mb-4 pb-4 border-b border-slate-600">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Calls Handled
                </span>
                <span className="text-slate-200 font-semibold">{agent.callsHandled || 0}</span>
              </div>
              {agent.activeLead && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Active Call
                  </span>
                  <span className="text-cyan-400 font-semibold">Yes</span>
                </div>
              )}
            </div>

            {/* Toggle Button */}
            <div className="space-y-2">
              <button
                onClick={() => handleToggleAvailability(agent)}
                disabled={loadingAgentId === agent._id || !agent.attendance || !agent.attendance.isCheckedIn || Boolean(agent.activeLead)}
                className={`w-full py-2 rounded-lg font-semibold transition text-sm ${
                  agent.isAvailable
                    ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 disabled:bg-slate-700 disabled:text-slate-500'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:bg-slate-700 disabled:text-slate-500'
                }`}
              >
                {loadingAgentId === agent._id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : agent.isAvailable ? (
                  'Mark as Busy'
                ) : (
                  'Mark as Available'
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAttendanceAction(agent, 'check-in')}
                  disabled={loadingAgentId === agent._id || Boolean(agent.activeLead) || Boolean(agent.attendance?.isCheckedIn)}
                  className="py-2 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 disabled:bg-slate-700 disabled:text-slate-500"
                >
                  Check In
                </button>
                <button
                  onClick={() => handleAttendanceAction(agent, 'check-out')}
                  disabled={loadingAgentId === agent._id || Boolean(agent.activeLead) || !Boolean(agent.attendance?.isCheckedIn)}
                  className="py-2 rounded-lg text-xs font-semibold bg-slate-500/20 text-slate-200 hover:bg-slate-500/30 disabled:bg-slate-700 disabled:text-slate-500"
                >
                  Check Out
                </button>
                <button
                  onClick={() => handleAttendanceAction(agent, 'break-start')}
                  disabled={loadingAgentId === agent._id || Boolean(agent.activeLead) || !Boolean(agent.attendance?.isCheckedIn) || Boolean(agent.attendance?.onBreak)}
                  className="py-2 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:bg-slate-700 disabled:text-slate-500"
                >
                  Start Break
                </button>
                <button
                  onClick={() => handleAttendanceAction(agent, 'break-end')}
                  disabled={loadingAgentId === agent._id || !Boolean(agent.attendance?.onBreak)}
                  className="py-2 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 disabled:bg-slate-700 disabled:text-slate-500"
                >
                  End Break
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && agents.length === 0 && (
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl border border-slate-700 text-center py-12">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No agents found</p>
          <p className="text-slate-500 text-sm">Agents will appear here once they join</p>
        </div>
      )}
    </div>
  );
}
