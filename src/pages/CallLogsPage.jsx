import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown, ChevronUp, Phone, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import CampaignSelector from '../components/CampaignSelector';
import { getCallLogs } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function CallLogsPage() {
  const { showNotification } = useOutletContext();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);
  const lastLogCountRef = useRef(0);

  // Load call logs from API
  const loadCallLogs = useCallback(async () => {
    if (!selectedCampaignId) return;

    try {
      setIsLoading(true);
      setError(null);
      const logs = await getCallLogs(selectedCampaignId);
      console.log("Logs: ", logs);
      
      const logsArray = Array.isArray(logs) ? logs : logs?.data || [];
      setCallLogs(logsArray);

      // Show notification if new logs added
      if (logsArray.length > lastLogCountRef.current) {
        const newLogCount = logsArray.length - lastLogCountRef.current;
        showNotification(`${newLogCount} new call log(s)`, 'success');
      }
      lastLogCountRef.current = logsArray.length;
    } catch (err) {
      setError('Failed to load call logs');
      showNotification('Failed to load call logs', 'error');
      setCallLogs([]);
      console.error('Error loading call logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampaignId, showNotification]);

  // Handle real-time call completed events via WebSocket
  const handleCallCompleted = useCallback((data) => {
    if (data.campaignId === selectedCampaignId) {
      // WebSocket payload is summary-level; re-fetch to keep row schema consistent.
      loadCallLogs();
      lastLogCountRef.current += 1;
      showNotification('New call log recorded', 'success');
    }
  }, [selectedCampaignId, showNotification, loadCallLogs]);

  // Subscribe to WebSocket call events
  useWebSocket({
    onCallCompleted: handleCallCompleted,
  });

  // Periodic sync fallback (every 10 seconds) - WebSocket is primary for real-time updates
  useEffect(() => {
    if (!selectedCampaignId) return;

    // Load initial logs
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const logs = await getCallLogs(selectedCampaignId);
        
        const logsArray = Array.isArray(logs) ? logs : logs?.data || [];
        setCallLogs(logsArray);

        if (logsArray.length > lastLogCountRef.current) {
          const newLogCount = logsArray.length - lastLogCountRef.current;
          showNotification(`${newLogCount} new call log(s)`, 'success');
        }
        lastLogCountRef.current = logsArray.length;
      } catch (err) {
        setError('Failed to load call logs');
        showNotification('Failed to load call logs', 'error');
        setCallLogs([]);
        console.error('Error loading call logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();

    // Fallback sync every 10 seconds to ensure data consistency
    pollIntervalRef.current = setInterval(() => {
      loadLogs();
    }, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedCampaignId, showNotification]);

  // Manual refresh handler
  const handleRefresh = async () => {
    await loadCallLogs();
  }

  const getStatusColor = (outcome) => {
    switch (outcome) {
      case 'completed':
      case 'answered':
      case 'successful':
        return 'bg-emerald-900/50 text-emerald-400';
      case 'failed':
      case 'no-answer':
      case 'declined':
        return 'bg-rose-900/50 text-rose-400';
      case 'missed':
        return 'bg-yellow-900/50 text-yellow-400';
      default:
        return 'bg-slate-700 text-slate-400';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <h1 className="text-3xl font-bold text-primary-500">Call Logs</h1>
        <p className="text-slate-400 mt-2">Review your calling history</p>
      </div>

      {/* Campaign Selector */}
      <CampaignSelector
        selectedCampaignId={selectedCampaignId}
        onCampaignSelect={setSelectedCampaignId}
        onShowNotification={showNotification}
      />

      {/* Refresh Button */}
      {selectedCampaignId && (
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
      )}

      {selectedCampaignId && (
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl border border-slate-700 overflow-hidden">
          {/* Error Alert */}
          {error && (
            <div className="bg-rose-900/50 border-b border-rose-700 p-4">
              <p className="text-rose-400 text-sm flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && callLogs.length === 0 && (
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-8 h-8 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-400">Loading call logs...</p>
            </div>
          )}

          {/* Live Status */}
          {callLogs.length > 0 && (
            <div className="p-4 bg-blue-500/10 border-b border-blue-500/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-xs font-semibold">Auto-refreshing every 10 seconds (WebSocket enabled)</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-slate-700">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400 text-sm">Total Calls</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{callLogs.length}</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 text-sm">Answered</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">
                {callLogs.filter(log => log.outcome === 'answered' || log.outcome === 'completed' || log.outcome === 'successful').length}
              </p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-sm">Avg Duration</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">
                {callLogs.length > 0
                  ? formatDuration(
                    Math.round(
                      callLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / callLogs.length
                    )
                  )
                  : '—'}
              </p>
            </div>
          </div>

          {/* Call Logs List */}
          <div className="divide-y divide-slate-700">
            {callLogs.map(log => (
              <div key={log._id} className="p-4 hover:bg-slate-700/30 transition">
                <div
                  onClick={() => setExpandedLogId(expandedLogId === log._id ? null : log._id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-200 font-semibold truncate">{log.lead?.phoneNumber || 'Unknown'}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(log.outcome)}`}>
                        {log.outcome || 'pending'}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-slate-400">
                      <span>{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</span>
                      <span>{formatDuration(log.duration)}</span>
                    </div>
                  </div>
                  {expandedLogId === log._id ? (
                    <ChevronUp className="w-5 h-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  )}
                </div>

                {/* Expanded Details */}
                {expandedLogId === log._id && (
                  <div className="mt-4 pt-4 border-t border-slate-700 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wide">Phone</span>
                        <span className="text-slate-200 font-semibold">{log.lead?.phoneNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wide">Outcome</span>
                        <span className="text-slate-200 font-semibold capitalize">{log.outcome || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wide">Duration</span>
                        <span className="text-slate-200 font-semibold">{formatDuration(log.duration)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wide">Date</span>
                        <span className="text-slate-200 font-semibold">{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {log.recordingUrl && (
                      <div className="border-t border-slate-600 pt-3">
                        <span className="text-slate-400 block text-xs uppercase tracking-wide mb-2">Call Recording</span>
                        <audio controls className="w-full h-8" src={log.recordingUrl}>
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {log.agentNotes && (
                      <div className="border-t border-slate-600 pt-3">
                        <span className="text-slate-400 block text-xs uppercase tracking-wide mb-1">Agent Notes</span>
                        <span className="text-slate-200">{log.agentNotes}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-600 pt-3 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wide mb-1">Call Quality</span>
                        <span className="text-slate-200 font-semibold">{log.callQuality || 'Not Rated'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs uppercase tracking-wide mb-1">Sentiment</span>
                        <span className="text-slate-200 font-semibold">{log.sentiment || 'Not Analyzed'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!isLoading && callLogs.length === 0 && (
            <div className="text-center py-12">
              <Phone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No call logs yet</p>
              <p className="text-slate-500 text-sm">Logs will appear here when calls are made</p>
            </div>
          )}
        </div>
      )}

      {!selectedCampaignId && (
        <div className="text-center py-12 bg-linear-to-br from-slate-800 to-slate-700 rounded-lg border border-slate-700">
          <p className="text-slate-400">Select a campaign to view call logs</p>
        </div>
      )}
    </div>
  );
}
