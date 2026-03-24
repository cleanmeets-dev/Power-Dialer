import { useEffect, useState, useRef } from 'react';
import { Device } from '@twilio/voice-sdk';
import axios from 'axios';
import wsService from '../services/websocket.js';

// --- MOCK TWILIO DEVICE CLASSES ---
class MockTwilioCall {
  constructor(parameters) {
    this.parameters = parameters;
    this.listeners = {};
    this.isMuted = false;
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
  accept() {
    console.log('[MOCK TWILIO] Call accepted');
    this.emit('accept', this);
  }
  reject() {
    console.log('[MOCK TWILIO] Call rejected');
    this.emit('reject', this);
  }
  disconnect() {
    console.log('[MOCK TWILIO] Call disconnected');
    this.emit('disconnect', this);
    
    // Forcefully end the mock call on the backend so it doesn't wait for the 42s timer
    if (this.parameters?.CallSid) {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      axios.post(`${API_BASE_URL}/dialer/status-callback`, {
        CallSid: this.parameters.CallSid,
        CallStatus: 'completed',
        CallDuration: '15' // 15 seconds mock duration
      }).catch(err => console.error('[MOCK TWILIO] Failed to emit endpoint', err));
    }
  }
  mute(shouldMute) {
    console.log('[MOCK TWILIO] Call muted:', shouldMute);
    this.isMuted = shouldMute;
    this.emit('mute', shouldMute);
  }
}

class MockTwilioDevice {
  constructor(token, options) {
    this.token = token;
    this.options = options;
    this.listeners = {};
    console.log('[MOCK TWILIO] Device initialized');
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
  async register() {
    console.log('[MOCK TWILIO] Registering device...');
    setTimeout(() => {
      this.emit('registered');
    }, 500);
  }
  updateToken(token) {
    this.token = token;
    console.log('[MOCK TWILIO] Token updated', token);
  }
  destroy() {
    console.log('[MOCK TWILIO] Device destroyed');
    this.listeners = {};
  }
}
// ----------------------------------

/**
 * useTwilioDevice hook - Initialize Twilio Voice SDK for agent browser
 * 
 * This hook manages the agent's Twilio device for receiving browser-based calls.
 * 
 * @param {boolean} isAgent - Whether current user is an agent
 * @returns {Object} Twilio device state and call control methods
 */
export function useTwilioDevice(isAgent = false) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Call State
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

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

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

        // Get Twilio token from backend
        const { data } = await axios.get(`${API_BASE_URL}/dialer/token`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        if (!isMounted) return;

        const isMockMode = import.meta.env.VITE_USE_MOCK_TWILIO === 'true';

        let device;
        if (isMockMode) {
          console.log('🧪 Using MockTwilioDevice...');
          device = new MockTwilioDevice(data.token, {});
          
          const handleMockIncoming = (callData) => {
            console.log('📞 [MOCK] Triggering incoming call:', callData);
            const mockCall = new MockTwilioCall({ CallSid: callData.callSid });
            device.emit('incoming', mockCall);
          };
          
          wsService.on('mock:incoming-call', handleMockIncoming);
          
          const originalDestroy = device.destroy.bind(device);
          device.destroy = () => {
            wsService.off('mock:incoming-call', handleMockIncoming);
            originalDestroy();
          };
        } else {
          device = new Device(data.token, { 
            logLevel: 1,
            edge: 'sydney',
            region: 'ie1',
          });
        }

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
            setIncomingCall(call);
          }

          call.on('accept', () => {
            console.log('✅ Call accepted');
            if (isMounted) {
              setIncomingCall(null);
              setActiveCall(call);
              setIsMuted(false);
            }
          });

          call.on('disconnect', () => {
            console.log('🛑 Call disconnected');
            if (isMounted) {
              setIncomingCall(null);
              setActiveCall(null);
              setIsMuted(false);
            }
          });

          call.on('reject', () => {
            console.log('❌ Call rejected');
            if (isMounted) {
              setIncomingCall(null);
            }
          });
          
          call.on('mute', (isMutedState) => {
            if (isMounted) setIsMuted(isMutedState);
          });
        });

        // Device error
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
              headers: { Authorization: `Bearer ${authToken}` }
            });
            device.updateToken(newData.token);
            console.log('✅ Token refreshed');
          } catch (err) {
            console.error('Failed to refresh token:', err);
            if (isMounted) setError('Failed to refresh authentication');
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
                headers: { Authorization: `Bearer ${authToken}` }
              });
              device.updateToken(data.token);
              console.log('🔄 Token auto-refreshed');
            } catch (err) {
              console.error('Token refresh failed:', err);
            }
          }, 40 * 60 * 1000);
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

  // Call Control Helpers
  const acceptCall = () => {
    if (incomingCall) {
      incomingCall.accept();
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      incomingCall.reject();
    }
  };

  const hangupCall = () => {
    if (activeCall) {
      activeCall.disconnect();
    }
  };

  const toggleMute = () => {
    if (activeCall) {
      const newMuteState = !isMuted;
      activeCall.mute(newMuteState);
      // Fallback for Mock SDK which relies on events, real Twilio might auto-fire mute event
      setIsMuted(newMuteState);
    }
  };

  return { 
    isReady, 
    error, 
    isInitializing,
    incomingCall,
    activeCall,
    isMuted,
    acceptCall,
    rejectCall,
    hangupCall,
    toggleMute
  };
}
