import { useEffect, useState, useRef, useCallback } from 'react';
import { Device } from '@twilio/voice-sdk';
import axios from 'axios';

/**
 * 🔴 FIX #8: useTwilioDevice hook - Initialize Twilio Voice SDK for agent browser
 * 
 * This hook manages the agent's Twilio device for receiving browser-based calls.
 * When an agent is assigned a call, they'll hear it ring in their browser.
 * 
 * @param {boolean} isAgent - Whether current user is an agent
 * @returns {Object} { isReady, error, deviceRef, activeCall, callStatus }
 */
export function useTwilioDevice(isAgent = false) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // idle, ringing, connected
  const deviceRef = useRef(null);
  const tokenRefreshIntervalRef = useRef(null);

  const bindCallLifecycle = useCallback((call, initialStatus = 'ringing') => {
    setActiveCall(call);
    setCallStatus(initialStatus);

    call.on('accept', () => {
      setCallStatus('connected');
    });

    call.on('disconnect', () => {
      setCallStatus('idle');
      setActiveCall(null);
    });

    call.on('cancel', () => {
      setCallStatus('idle');
      setActiveCall(null);
    });

    call.on('reject', () => {
      setCallStatus('idle');
      setActiveCall(null);
    });
  }, []);

  const normalizeDialNumber = useCallback((value) => {
    const cleaned = String(value || '').replace(/[^\d+]/g, '');
    if (!cleaned) return '';
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 10) return `+1${cleaned}`;
    return `+${cleaned}`;
  }, []);

  const placeOutgoingCall = useCallback(async (rawNumber) => {
    const device = deviceRef.current;
    if (!device) {
      return { success: false, error: 'Twilio device is not initialized yet' };
    }

    const to = normalizeDialNumber(rawNumber);
    if (!to) {
      return { success: false, error: 'Enter a valid phone number' };
    }

    try {
      const call = await device.connect({ params: { To: to, to } });
      bindCallLifecycle(call, 'ringing');
      return { success: true, number: to };
    } catch (err) {
      const message = err?.message || 'Failed to place direct call';
      setError(message);
      return { success: false, error: message };
    }
  }, [bindCallLifecycle, normalizeDialNumber]);

  const hangupActiveCall = useCallback(() => {
    if (!activeCall) return;
    try {
      activeCall.disconnect();
    } catch (err) {
      console.error('Failed to disconnect active call:', err);
    }
  }, [activeCall]);

  useEffect(() => {
    // Only initialize for agents
    if (!isAgent) {
      console.log('👤 Not an agent - Twilio Device not initialized');
      return;
    }

    let isMounted = true;

    const init = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          throw new Error('Missing auth token (authToken). Please login again.');
        }

        // Use the same base URL convention as the rest of the app
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

        // Get Twilio token from backend
        const { data } = await axios.get(`${API_BASE_URL}/dialer/token`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        if (!isMounted) return;

        const device = new Device(data.token, {
          logLevel: 1,
          edge: [import.meta.env.VITE_TWILIO_EDGE || 'ashburn'],
        });

        // Device registered - ready to receive calls
        device.on('registered', () => {
          console.log('✅ Twilio Device registered — ready to receive calls');
          if (isMounted) {
            setIsReady(true);
            setError(null);
          }
        });

        // Incoming call from lead
        device.on('incoming', (call) => {
          console.log('📞 Incoming call from lead:', call.parameters);
          if (isMounted) {
            // Auto-answer removed. The agent must click "Accept" in the UI so the browser
            // doesn't block the microphone due to auto-play policies.
            bindCallLifecycle(call, 'ringing');
          }
        });

        // Device error (e.g., network issues)
        device.on('error', (err) => {
          console.error('❌ Twilio Device error:', err.message);
          if (isMounted) {
            setError(err.message || 'Device error occurred');
          }
        });

        // Token expired - refresh before it expires
        device.on('tokenWillExpire', async () => {
          console.log('🔄 Twilio token expiring - refreshing...');
          try {
            const { data: newData } = await axios.get(`${API_BASE_URL}/dialer/token`, {
              headers: {
                Authorization: `Bearer ${authToken}`
              }
            });
            device.updateToken(newData.token);
            console.log('✅ Token refreshed');
          } catch (err) {
            console.error('Failed to refresh token:', err);
            if (isMounted) {
              setError('Failed to refresh authentication');
            }
          }
        });

        // Register device to receive calls
        await device.register();

        if (isMounted) {
          deviceRef.current = device;

          // Setup token refresh interval (every 40 minutes for 1-hour token)
          tokenRefreshIntervalRef.current = setInterval(async () => {
            try {
              const { data } = await axios.get(`${API_BASE_URL}/dialer/token`, {
                headers: {
                  Authorization: `Bearer ${authToken}`
                }
              });
              device.updateToken(data.token);
              console.log('🔄 Token auto-refreshed');
            } catch (err) {
              console.error('Token refresh failed:', err);
            }
          }, 40 * 60 * 1000); // 40 minutes
        }
      } catch (err) {
        console.error('Failed to initialize Twilio Device:', err.message);
        if (isMounted) {
          setError(err.message || 'Failed to initialize Twilio');
          setIsReady(false);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      isMounted = false;

      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }

      if (deviceRef.current) {
        try {
          deviceRef.current.destroy();
          setIsReady(false);
        } catch (err) {
          console.error('Error destroying Twilio device:', err);
        }
      }
    };
  }, [bindCallLifecycle, isAgent]);

  return {
    isReady,
    error,
    isInitializing,
    deviceRef,
    activeCall,
    callStatus,
    placeOutgoingCall,
    hangupActiveCall,
  };
}
