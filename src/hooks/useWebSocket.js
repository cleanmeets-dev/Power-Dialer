import { useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocket';

/**
 * Hook to manage WebSocket connections and listen to events
 * @param {function} onCallInitiated - Callback when call is initiated
 * @param {function} onCallFailed - Callback when call fails
 * @param {function} onCallCompleted - Callback when call completes
 * @param {function} onCallConnectedToAgent - 🔴 FIX #4: Callback when call connects to agent
 * @param {function} onCallDropped - 🔴 FIX #4: Callback when call is dropped
 * @param {function} onAgentAvailabilityChanged - Callback when agent availability changes
 * @param {function} onCampaignStatusUpdated - 🔴 FIX #3: Callback when campaign status updates
 * @param {function} onAgentCallCompleted - 🔴 FIX #3: Callback when agent's call completes
 * @param {function} onCampaignCompleted - 🔴 FIX #3: Callback when campaign completes
 * @param {function} onCallbackTriggered - Callback when scheduler triggers a callback
 * @param {function} onCallbackScheduled - Callback when callback is scheduled
 * @param {function} onCallbackCancelled - Callback when callback is cancelled
 */
export function useWebSocket({
  onCallInitiated = null,
  onCallFailed = null,
  onCallCompleted = null,
  onCallConnectedToAgent = null,
  onCallDropped = null,
  onAgentAvailabilityChanged = null,
  onCampaignStatusUpdated = null,
  onAgentCallCompleted = null,
  onCampaignCompleted = null,
  onCallbackTriggered = null,
  onCallbackScheduled = null,
  onCallbackCancelled = null,
} = {}) {
  const isConnectedRef = useRef(false);

  // Use refs to store callbacks so they don't trigger re-subscriptions
  const callbacksRef = useRef({
    onCallInitiated,
    onCallFailed,
    onCallCompleted,
    onCallConnectedToAgent,
    onCallDropped,
    onAgentAvailabilityChanged,
    onCampaignStatusUpdated,
    onAgentCallCompleted,
    onCampaignCompleted,
    onCallbackTriggered,
    onCallbackScheduled,
    onCallbackCancelled,
  });

  // Update refs when callbacks change, but don't trigger re-subscriptions
  useEffect(() => {
    callbacksRef.current = {
      onCallInitiated,
      onCallFailed,
      onCallCompleted,
      onCallConnectedToAgent,
      onCallDropped,
      onAgentAvailabilityChanged,
      onCampaignStatusUpdated,
      onAgentCallCompleted,
      onCampaignCompleted,
      onCallbackTriggered,
      onCallbackScheduled,
      onCallbackCancelled,
    };
  }, [onCallInitiated, onCallFailed, onCallCompleted, onCallConnectedToAgent, onCallDropped, onAgentAvailabilityChanged, onCampaignStatusUpdated, onAgentCallCompleted, onCampaignCompleted, onCallbackTriggered, onCallbackScheduled, onCallbackCancelled]);

  useEffect(() => {
    // Connect to WebSocket server
    websocketService.connect();
    isConnectedRef.current = true;

    // Create wrapper handlers that use current callback from ref
    // 🔴 FIX #3: Updated event names to match what backend actually emits
    const wrappedHandlers = {
      'call:initiated': (data) => callbacksRef.current.onCallInitiated?.(data),
      'call:failed': (data) => callbacksRef.current.onCallFailed?.(data),
      'call:completed': (data) => callbacksRef.current.onCallCompleted?.(data),
      'call-connected-to-agent': (data) => callbacksRef.current.onCallConnectedToAgent?.(data),
      'call-dropped': (data) => callbacksRef.current.onCallDropped?.(data),
      'agent:availability-changed': (data) => callbacksRef.current.onAgentAvailabilityChanged?.(data),
      'campaign-status-updated': (data) => callbacksRef.current.onCampaignStatusUpdated?.(data),
      'agent-call-completed': (data) => callbacksRef.current.onAgentCallCompleted?.(data),
      'campaign-completed': (data) => callbacksRef.current.onCampaignCompleted?.(data),
      'callback:triggered': (data) => callbacksRef.current.onCallbackTriggered?.(data),
      'callback:scheduled': (data) => callbacksRef.current.onCallbackScheduled?.(data),
      'callback:cancelled': (data) => callbacksRef.current.onCallbackCancelled?.(data),
    };

    // Subscribe only once on mount
    Object.entries(wrappedHandlers).forEach(([event, handler]) => {
      websocketService.on(event, handler);
    });

    // Cleanup on unmount only
    return () => {
      Object.entries(wrappedHandlers).forEach(([event, handler]) => {
        websocketService.off(event, handler);
      });
    };
  }, []); // Empty dependency array - subscribe only once on mount

  const isConnected = useCallback(() => websocketService.isConnected(), []);
  const getSocketId = useCallback(() => websocketService.getSocketId(), []);

  return {
    isConnected,
    getSocketId,
    websocketService,
  };
}

export default useWebSocket;
