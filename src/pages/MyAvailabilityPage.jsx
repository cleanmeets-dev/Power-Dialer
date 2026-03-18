import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Clock, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser, updateAgentAvailability } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function MyAvailabilityPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Load current user info
  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await getCurrentUser();
      setAgent(userData);
    } catch (err) {
      setError('Failed to load your information');
      showNotification('Failed to load your information', 'error');
      console.error('Error loading user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real-time availability changes via WebSocket
  const handleAgentAvailabilityChanged = (data) => {
    if (data.agentId === user?._id) {
      console.log('📡 Your availability changed:', data);
      setAgent((prevAgent) =>
        prevAgent ? { ...prevAgent, isAvailable: data.isAvailable } : null
      );
    }
  };

  // Subscribe to WebSocket events
  useWebSocket({
    onAgentAvailabilityChanged: handleAgentAvailabilityChanged,
  });

  // Handle toggle availability
  const handleToggleAvailability = async () => {
    if (!agent) return;

    const newStatus = !agent.isAvailable;
    setIsUpdating(true);

    const previousAgent = { ...agent };
    setAgent((prev) => prev ? { ...prev, isAvailable: newStatus } : null);

    try {
      await updateAgentAvailability(agent._id, newStatus);
      const statusText = newStatus ? 'available' : 'on break';
      showNotification(`You are now ${statusText}`, 'success');
    } catch (err) {
      console.error('Failed to update availability:', err);
      setAgent(previousAgent);
      showNotification('Failed to update your status. Please try again.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    await loadCurrentUser();
  };

  const getAvailabilityColor = (isAvailable) => {
    return isAvailable
      ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300'
      : 'bg-amber-900/50 border-amber-500/50 text-amber-300';
  };

  const getAvailabilityIcon = (isAvailable) => {
    return isAvailable ? (
      <CheckCircle className="w-6 h-6 text-emerald-400" />
    ) : (
      <Clock className="w-6 h-6 text-amber-400" />
    );
  };

  const getButtonColor = (isAvailable) => {
    return isAvailable
      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <h1 className="text-3xl font-bold text-primary-500">My Availability</h1>
        <p className="text-slate-400 mt-2">Manage your availability status</p>
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
      {isLoading && !agent && (
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-8 border border-slate-700 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400">Loading your information...</p>
        </div>
      )}

      {/* Agent Status Card */}
      {agent && (
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl border border-slate-700 p-8 max-w-md mx-auto w-full">
          {/* Agent Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded-full p-4 flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-lg text-slate-200">{agent.name}</p>
              <p className="text-sm text-slate-400">{agent.email}</p>
            </div>
          </div>

          {/* Availability Status */}
          <div className="mb-8 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm uppercase tracking-wide font-semibold">Current Status</span>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getAvailabilityColor(agent.isAvailable)}`}>
                {getAvailabilityIcon(agent.isAvailable)}
                {agent.isAvailable ? 'Available' : 'On Break'}
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl font-bold mb-2">
                {agent.isAvailable ? '✅' : '☕'}
              </div>
              <p className="text-slate-400 text-sm">
                {agent.isAvailable
                  ? 'You are ready to take calls'
                  : 'You are currently on break'}
              </p>
            </div>
          </div>

          {/* Stats */}
          {agent.callsHandled !== undefined && (
            <div className="mb-8 p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Calls Handled Today
                </span>
                <span className="text-slate-200 font-semibold text-lg">
                  {agent.callsHandled || 0}
                </span>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={handleToggleAvailability}
            disabled={isUpdating}
            className={`w-full py-3 rounded-lg font-semibold transition text-base ${getButtonColor(agent.isAvailable)} disabled:bg-slate-700 disabled:text-slate-500`}
          >
            {isUpdating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </span>
            ) : agent.isAvailable ? (
              '☕ Take a Break'
            ) : (
              '✅ Back to Work'
            )}
          </button>

          {/* Live Status Indicator */}
          <div className="mt-6 pt-6 border-t border-slate-600">
            <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Real-time updates enabled</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
