import { useState, useEffect, useCallback } from 'react';
import { getDialerStatus, getCallLogs } from '../services/api';

/**
 * useDialer - Manages dialer state and polling logic
 * Handles polling for status updates when dialing is active
 */
export const useDialer = (selectedCampaignId, onStatusUpdate) => {
  const [isDialing, setIsDialing] = useState(false);
  const [dialedCount, setDialedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [callsInProgress, setCallsInProgress] = useState(0);
  const [activeCalls, setActiveCalls] = useState([]);
  const [pollInterval, setPollInterval] = useState(null);

  // Poll dialer status and call logs
  const pollStatus = useCallback(async () => {
    if (!selectedCampaignId) return;

    try {
      const status = await getDialerStatus(selectedCampaignId);
      setDialedCount(status.dialedLeads || status.totalDialled || 0);
      setSuccessCount(status.connectedCalls || status.connected || 0);
      setCallsInProgress(status.callsInProgress || status.inProgress || 0);

      const calls = await getCallLogs(selectedCampaignId);
      setActiveCalls(calls || []);

      // Stop polling if campaign completed
      if (status.status === 'completed' || status.completed) {
        setIsDialing(false);
        onStatusUpdate?.('Campaign completed!', 'success');
      }
    } catch (error) {
      console.error('Error polling status:', error);
    }
  }, [selectedCampaignId, onStatusUpdate]);

  // Setup polling interval when dialing starts
  useEffect(() => {
    if (!isDialing || !selectedCampaignId) {
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
      return;
    }

    // Poll immediately
    pollStatus();

    // Then poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);
    setPollInterval(interval);

    return () => clearInterval(interval);
  }, [isDialing, selectedCampaignId, pollStatus, pollInterval]);

  // Reset dialer state when campaign changes
  useEffect(() => {
    setIsDialing(false);
    setDialedCount(0);
    setSuccessCount(0);
    setCallsInProgress(0);
    setActiveCalls([]);
  }, [selectedCampaignId]);

  return {
    isDialing,
    setIsDialing,
    dialedCount,
    successCount,
    callsInProgress,
    activeCalls,
    pollStatus,
  };
};
