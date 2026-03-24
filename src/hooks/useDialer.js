import { useState, useEffect, useCallback } from 'react';
import { getDialerStatus } from '../services/api';
import { useWebSocket } from './useWebSocket';

/**
 * useDialer - Manages dialer state using WebSocket for real-time updates
 * Handles parallel calling with multiple agents
 */
export const useDialer = (selectedCampaignId, onStatusUpdate) => {
  const [isDialing, setIsDialing] = useState(false);
  const [dialedCount, setDialedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [callsInProgress, setCallsInProgress] = useState(0);
  const [activeCalls, setActiveCalls] = useState([]);

  // Handle real-time call events via WebSocket
  const handleCallInitiated = useCallback((data) => {
    // Add campaign filter
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    setCallsInProgress((prev) => prev + 1);
    
    // Add call to active calls with unique ID
    setActiveCalls((prev) => [
      ...prev,
      {
        _id: data.callSid || `call_${Date.now()}_${Math.random()}`,
        callSid: data.callSid,
        leadId: data.leadId?.toString(), // 🔴 FIX #6: Store leadId so matching works
        lead: { phoneNumber: data.phoneNumber },
        phoneNumber: data.phoneNumber,
        businessName: data.businessName,
        agent: { name: data.agentName, _id: data.agentId },
        agentId: data.agentId,
        agentName: data.agentName,
        outcome: 'connecting',
        status: 'connecting',
        startTime: new Date(),
      },
    ]);
  }, [selectedCampaignId]);

  const handleCallCompleted = useCallback((data) => {
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    setSuccessCount((prev) => prev + 1);
    setCallsInProgress((prev) => Math.max(0, prev - 1));
    setDialedCount((prev) => prev + 1);
    
    // 🔴 FIX #5: callSid is now included in the emit, so matching works properly
    // Remove from active calls and mark as completed
    setActiveCalls((prev) =>
      prev.map((call) =>
        call.callSid === data.callSid
          ? { ...call, outcome: 'connected', status: 'completed', endTime: new Date() }
          : call
      )
    );
  }, [selectedCampaignId]);

  const handleCallFailed = useCallback((data) => {
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    setCallsInProgress((prev) => Math.max(0, prev - 1));
    setDialedCount((prev) => prev + 1);
    
    // 🔴 FIX #5: callSid is now included in the emit, use it for matching
    // Update failed call in active calls
    setActiveCalls((prev) =>
      prev.map((call) =>
        call.callSid === data.callSid
          ? { ...call, outcome: 'failed', status: 'failed', error: data.reason }
          : call
      )
    );
  }, [selectedCampaignId]);

  const handleStatusUpdate = useCallback((data) => {
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    setDialedCount(data.dialedLeads || 0);
    setSuccessCount(data.connectedCalls || 0);
    setCallsInProgress(data.callsInProgress || 0);

    if (data.status === 'completed') {
      setIsDialing(false);
      onStatusUpdate?.('Campaign completed!', 'success');
    }
  }, [selectedCampaignId, onStatusUpdate]);

  // 🔴 FIX #4: Handle call connected to agent event
  const handleCallConnectedToAgent = useCallback((data) => {
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    setActiveCalls((prev) =>
      prev.map((call) =>
        call.leadId === data.leadId?.toString() // Match by leadId
          ? { 
              ...call, 
              agentName: data.agentName, 
              agentId: data.agentId, 
              status: 'connected',
              outcome: 'connected', // FIX: update outcome as well!
              agent: { name: data.agentName, _id: data.agentId }
            }
          : call
      )
    );
  }, [selectedCampaignId]);

  // 🔴 FIX #4: Handle call dropped event
  const handleCallDropped = useCallback((data) => {
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    setCallsInProgress((prev) => Math.max(0, prev - 1));
    
    setActiveCalls((prev) =>
      prev.map((call) =>
        call.leadId === data.leadId?.toString()
          ? { 
              ...call, 
              status: 'dropped', 
              outcome: 'failed',
              error: data.reason 
            }
          : call
      )
    );
  }, [selectedCampaignId]);

  // 🔴 FIX #3: Handle campaign status updated event
  const handleCampaignStatusUpdated = useCallback((data) => {
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    // Update dialer state based on campaign status
    setIsDialing(data.status === 'active');
  }, [selectedCampaignId]);

  // 🔴 FIX #3: Handle campaign completed event
  const handleCampaignCompleted = useCallback((data) => {
    if (selectedCampaignId && data.campaignId !== selectedCampaignId) return;
    
    setIsDialing(false);
    onStatusUpdate?.('Campaign completed!', 'success');
  }, [selectedCampaignId, onStatusUpdate]);

  // Subscribe to WebSocket events
  useWebSocket({
    onCallInitiated: handleCallInitiated,
    onCallCompleted: handleCallCompleted,
    onCallFailed: handleCallFailed,
    onCallConnectedToAgent: handleCallConnectedToAgent,
    onCallDropped: handleCallDropped,
    onCampaignStatusUpdated: handleCampaignStatusUpdated,
    onCampaignCompleted: handleCampaignCompleted,
  });

  // Fetch initial status when dialing starts
  useEffect(() => {
    if (!isDialing || !selectedCampaignId) return;

    const fetchInitialStatus = async () => {
      try {
        const status = await getDialerStatus(selectedCampaignId);
        setDialedCount(status.dialedLeads || status.totalDialled || 0);
        setSuccessCount(status.connectedCalls || status.connected || 0);
        setCallsInProgress(status.callsInProgress || status.inProgress || 0);

        // Note: activeCalls are tracked via WebSocket events (call-initiated, call-completed, call-failed)
        // We don't fetch full call logs here because that would be 50 records by default
        // and incorrectly show them as "active" when most are already completed
      } catch (error) {
        console.error('Error fetching initial dialer status:', error);
      }
    };

    fetchInitialStatus();
    
    // Poll for updates every 5 seconds while dialing
    const interval = setInterval(fetchInitialStatus, 5000);
    
    return () => clearInterval(interval);
  }, [isDialing, selectedCampaignId]);

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
  };
};
