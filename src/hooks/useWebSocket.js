import { useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocket';

/**
 * Hook to manage WebSocket connections and listen to events
 * @param {function} onCallInitiated - Callback when call is initiated
 * @param {function} onCallFailed - Callback when call fails
 * @param {function} onCallCompleted - Callback when call completes
 * @param {function} onAgentAvailabilityChanged - Callback when agent availability changes
 * @param {function} onCallbackTriggered - Callback when scheduler triggers a callback
 * @param {function} onCallbackScheduled - Callback when callback is scheduled
 * @param {function} onCallbackCancelled - Callback when callback is cancelled
 * @param {function} onDialerStatusUpdate - Callback when dialer status updates
 */
export function useWebSocket({
  onCallInitiated = null,
  onCallFailed = null,
  onCallCompleted = null,
  onAgentAvailabilityChanged = null,
  onCallbackTriggered = null,
  onCallbackScheduled = null,
  onCallbackCancelled = null,
  onDialerStatusUpdate = null,
} = {}) {
  const isConnectedRef = useRef(false);

  // Use refs to store callbacks so they don't trigger re-subscriptions
  const callbacksRef = useRef({
    onCallInitiated,
    onCallFailed,
    onCallCompleted,
    onAgentAvailabilityChanged,
    onCallbackTriggered,
    onCallbackScheduled,
    onCallbackCancelled,
    onDialerStatusUpdate,
  });

  // Update refs when callbacks change, but don't trigger re-subscriptions
  useEffect(() => {
    callbacksRef.current = {
      onCallInitiated,
      onCallFailed,
      onCallCompleted,
      onAgentAvailabilityChanged,
      onCallbackTriggered,
      onCallbackScheduled,
      onCallbackCancelled,
      onDialerStatusUpdate,
    };
  }, [onCallInitiated, onCallFailed, onCallCompleted, onAgentAvailabilityChanged, onCallbackTriggered, onCallbackScheduled, onCallbackCancelled, onDialerStatusUpdate]);

  useEffect(() => {
    // Connect to WebSocket server
    websocketService.connect();
    isConnectedRef.current = true;

    // Create wrapper handlers that use current callback from ref
    const wrappedHandlers = {
      'call:initiated': (data) => callbacksRef.current.onCallInitiated?.(data),
      'call:failed': (data) => callbacksRef.current.onCallFailed?.(data),
      'call:completed': (data) => callbacksRef.current.onCallCompleted?.(data),
      'agent:availability-changed': (data) => callbacksRef.current.onAgentAvailabilityChanged?.(data),
      'callback:triggered': (data) => callbacksRef.current.onCallbackTriggered?.(data),
      'callback:scheduled': (data) => callbacksRef.current.onCallbackScheduled?.(data),
      'callback:cancelled': (data) => callbacksRef.current.onCallbackCancelled?.(data),
      'dialer:status-update': (data) => callbacksRef.current.onDialerStatusUpdate?.(data),
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
