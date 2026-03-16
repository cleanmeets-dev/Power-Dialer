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
 */
export function useWebSocket({
  onCallInitiated = null,
  onCallFailed = null,
  onCallCompleted = null,
  onAgentAvailabilityChanged = null,
  onCallbackTriggered = null,
  onCallbackScheduled = null,
  onCallbackCancelled = null,
} = {}) {
  const isConnectedRef = useRef(false);

  useEffect(() => {
    // Connect to WebSocket server
    websocketService.connect();
    isConnectedRef.current = true;

    // Setup event listeners
    if (onCallInitiated) {
      websocketService.on('call:initiated', onCallInitiated);
    }
    if (onCallFailed) {
      websocketService.on('call:failed', onCallFailed);
    }
    if (onCallCompleted) {
      websocketService.on('call:completed', onCallCompleted);
    }
    if (onAgentAvailabilityChanged) {
      websocketService.on('agent:availability-changed', onAgentAvailabilityChanged);
    }
    if (onCallbackTriggered) {
      websocketService.on('callback:triggered', onCallbackTriggered);
    }
    if (onCallbackScheduled) {
      websocketService.on('callback:scheduled', onCallbackScheduled);
    }
    if (onCallbackCancelled) {
      websocketService.on('callback:cancelled', onCallbackCancelled);
    }

    // Cleanup on unmount
    return () => {
      if (onCallInitiated) websocketService.off('call:initiated', onCallInitiated);
      if (onCallFailed) websocketService.off('call:failed', onCallFailed);
      if (onCallCompleted) websocketService.off('call:completed', onCallCompleted);
      if (onAgentAvailabilityChanged) websocketService.off('agent:availability-changed', onAgentAvailabilityChanged);
      if (onCallbackTriggered) websocketService.off('callback:triggered', onCallbackTriggered);
      if (onCallbackScheduled) websocketService.off('callback:scheduled', onCallbackScheduled);
      if (onCallbackCancelled) websocketService.off('callback:cancelled', onCallbackCancelled);
    };
  }, [onCallInitiated, onCallFailed, onCallCompleted, onAgentAvailabilityChanged, onCallbackTriggered, onCallbackScheduled, onCallbackCancelled]);

  const isConnected = useCallback(() => websocketService.isConnected(), []);
  const getSocketId = useCallback(() => websocketService.getSocketId(), []);

  return {
    isConnected,
    getSocketId,
    websocketService,
  };
}

export default useWebSocket;
