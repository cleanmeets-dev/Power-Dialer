import { useEffect, useState, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import axios from 'axios';

/**
 * 🔴 FIX #8: useTwilioDevice hook - Initialize Twilio Voice SDK for agent browser
 * 
 * This hook manages the agent's Twilio device for receiving browser-based calls.
 * When an agent is assigned a call, they'll hear it ring in their browser.
 * 
 * @param {boolean} isAgent - Whether current user is an agent
 * @returns {Object} { isReady, error, deviceRef }
 */
export function useTwilioDevice(isAgent = false) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const deviceRef = useRef(null);
  const tokenRefreshIntervalRef = useRef(null);

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
          edge: 'sydney', // Use appropriate edge for your region
          region: 'ie1',
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
          
          // Optional: Auto-answer calls (remove if you want manual acceptance)
          try {
            call.accept();
            console.log('✅ Call accepted');
          } catch (err) {
            console.error('Failed to accept call:', err);
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
  }, [isAgent]);

  return { 
    isReady, 
    error, 
    isInitializing,
    deviceRef 
  };
}
