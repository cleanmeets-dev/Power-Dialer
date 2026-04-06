import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, RefreshCw, ClipboardList, Phone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCurrentUser } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useDialer } from '../hooks/useDialer';
import AttendanceModal from '../components/modals/AttendanceModal';
import CampaignSelector from '../components/CampaignSelector';
import DialerControls from '../components/DialerControls';

export default function MyAvailabilityPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const [agent, setAgent] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isDialing, setIsDialing } = useDialer(
    selectedCampaignId,
    (message, type = 'success') => showNotification(message, type),
    { mode: 'agent', agentId: user?._id }
  );

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
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
        prevAgent
          ? {
              ...prevAgent,
              ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
              ...(data.activeLead !== undefined ? { activeLead: data.activeLead } : {}),
              ...(data.attendance ? { attendance: data.attendance } : {}),
            }
          : null
      );
    }
  };

  // Subscribe to WebSocket events
  useWebSocket({
    onAgentAvailabilityChanged: handleAgentAvailabilityChanged,
  });

  // Load on mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    await loadCurrentUser();
  };

  const attendanceStatus = useMemo(() => {
    const attendance = agent?.attendance || {};
    if (agent?.activeLead) return 'On Call';
    if (!attendance.isCheckedIn) return 'Checked Out';
    if (attendance.onBreak) return 'On Break';
    if (agent?.isAvailable) return 'Available';
    return 'Unavailable';
  }, [agent]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-primary-400">My Availability</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your availability status</p>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
            isLoading
              ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed'
              : 'bg-linear-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700 shadow-lg'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Auto Dialer moved to its own dedicated page */}

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
        <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-8 border border-slate-200 dark:border-slate-700 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading your information...</p>
        </div>
      )}

      {/* Agent Status Card */}
      {agent && (
        <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 border border-slate-200 dark:border-slate-700 p-8 max-w-2xl mx-auto w-full">
          {/* Agent Info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded-full p-4 shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-lg text-slate-900 dark:text-slate-200">{agent.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{agent.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Current Status</p>
              <p className="text-xl font-semibold text-cyan-300 mt-1">{attendanceStatus}</p>
            </div>

            <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-300 dark:border-slate-600">
              <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">Breaks Taken</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-200 mt-1">{agent.attendance && agent.attendance.breaksTaken || 0}</p>
            </div>
          </div>

          {/* Stats */}
          {agent.callsHandled !== undefined && (
            <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Calls Handled Today
                </span>
                <span className="text-slate-900 dark:text-slate-200 font-semibold text-lg">
                  {agent.callsHandled || 0}
                </span>
              </div>
            </div>
          )}

          {/* Attendance Modal Trigger */}
          <button
            onClick={() => setIsAttendanceModalOpen(true)}
            className="w-full py-3 rounded-lg font-semibold transition text-base bg-cyan-600 text-white hover:bg-cyan-700 flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Open Attendance Modal
          </button>

          {/* Live Status Indicator */}
          <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-600">
            <div className="flex items-center justify-center gap-2 text-blue-400 text-xs">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Real-time updates enabled</span>
            </div>
          </div>
        </div>
      )}

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onAttendanceChanged={(updatedAgent) => {
          if (updatedAgent) {
            setAgent(updatedAgent);
            showNotification('Attendance updated', 'success');
          }
        }}
      />
    </div>
  );
}
