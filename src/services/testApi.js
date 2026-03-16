import api from './api';

/**
 * Generate mock test leads
 * @param {string} campaignId - Campaign ID
 * @param {number} count - Number of leads to generate (default: 10)
 */
export const generateTestLeads = async (campaignId, count = 10) => {
  try {
    const response = await api.post('/test/leads', {
      campaignId,
      count,
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to generate test leads:', error);
    throw error;
  }
};

/**
 * Simulate a single call (dials, then auto-completes)
 * @param {string} leadId - Lead ID
 * @param {string} agentId - Agent ID
 * @param {number} duration - Call duration in seconds
 */
export const simulateCall = async (leadId, agentId, duration = 5) => {
  try {
    const response = await api.post('/test/simulate-call', {
      leadId,
      agentId,
      duration,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to simulate call:', error);
    throw error;
  }
};

/**
 * Auto-simulate multiple calls
 * @param {number} count - Number of calls to simulate
 * @param {number} interval - Interval between calls in milliseconds
 */
export const autoSimulateCalls = async (count = 5, interval = 2000) => {
  try {
    const response = await api.post('/test/auto-simulate', {
      count,
      interval,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to start auto-simulation:', error);
    throw error;
  }
};

/**
 * Get system status and statistics
 */
export const getSystemStatus = async () => {
  try {
    const response = await api.get('/test/status');
    return response.data.data;
  } catch (error) {
    console.error('Failed to get system status:', error);
    throw error;
  }
};

/**
 * Reset all test data
 */
export const resetTestData = async () => {
  try {
    const response = await api.post('/test/reset');
    return response.data;
  } catch (error) {
    console.error('Failed to reset test data:', error);
    throw error;
  }
};
