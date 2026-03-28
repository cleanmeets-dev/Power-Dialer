import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      // ProtectedRoute and React Router will handle the redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication ====================

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} User data and token
 */
export const login = async (email, password) => {
  try {
    console.log('🔄 API: Attempting login for email:', email);
    const response = await api.post('/auth/login', { email, password });
    
    console.log('✅ API: Login successful', {
      user: response.data?.data?.user?.email,
      token: response.data?.data?.token?.substring(0, 20) + '...'
    });
    
    return response.data.data;
  } catch (error) {
    console.error('❌ API: Login failed', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data?.error,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    throw error;
  }
};

/**
 * Register a new agent (manager-only - disabled for now)
 * @param {string} email - Agent email
 * @param {string} password - Agent password
 * @param {string} name - Agent name
 * @returns {Promise} User data
 */
export const register = async (email, password, name) => {
  const response = await api.post('/auth/register', { email, password, name });
  return response.data.data;
};

/**
 * Get current authenticated user
 * @returns {Promise} Current user data
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};

/**
 * Create a new user (manager-only)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name
 * @param {string} role - User role (manager or agent)
 * @returns {Promise} Created user data
 */
export const createUser = async (email, password, name, role = 'agent') => {
  const response = await api.post('/auth/create-user', { 
    email, 
    password, 
    name,
    role 
  });
  return response.data.data;
};

/**
 * Get all agents (manager-only)
 * @returns {Promise} List of agents
 */
export const getAllAgents = async () => {
  const response = await api.get('/auth/agents');
  return response.data.data;
};

/**
 * Get all users
 * @returns {Promise} List of all users
 */
export const getUsers = async () => {
  const response = await api.get('/auth/agents');
  return response.data.data;
};

/**
 * Logout (client-side only)
 */
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Logout from backend - triggers auto-availability disable
 */
export const logoutFromBackend = async () => {
  try {
    const response = await api.post('/auth/logout');
    console.log('✅ Backend logout successful');
    return response.data;
  } catch (error) {
    console.error('⚠️ Backend logout failed (frontend logout still completed):', error.message);
    // Still clear local storage even if backend fails
    throw error;
  }
};

// ==================== Campaigns ====================

export const createCampaign = async (name) => {
  const response = await api.post('/campaigns', { name });
  return response.data.data;
};

export const getCampaigns = async () => {
  const response = await api.get('/campaigns');
  return response.data.data;
};

export const getCampaignById = async (id) => {
  const response = await api.get(`/campaigns/${id}`);
  return response.data.data;
};

export const updateCampaign = async (id, updates) => {
  const response = await api.put(`/campaigns/${id}`, updates);
  return response.data.data;
};

export const deleteCampaign = async (id) => {
  await api.delete(`/campaigns/${id}`);
};

// ==================== Leads ====================

export const uploadLeads = async (file, campaignId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('campaignId', campaignId);

  const response = await api.post('/leads/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getLeads = async (campaignId, options = {}) => {
  const { status = null, page = 1, limit = 20, search = null } = options;
  
  let url = `/leads?page=${page}&limit=${limit}`;
  if (campaignId) url = `/leads?campaignId=${campaignId}&page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  
  const response = await api.get(url);
  return {
    leads: response.data.data || [],
    pagination: response.data.pagination || { total: 0, page, limit, totalPages: 0 }
  };
};

export const getLead = async (id) => {
  const response = await api.get(`/leads/${id}`);
  return response.data.data;
};

export const updateLeadStatus = async (id, status) => {
  const response = await api.put(`/leads/${id}/status`, { status });
  return response.data.data;
};

export const updateLead = async (id, updates) => {
  const response = await api.put(`/leads/${id}`, updates);
  return response.data.data;
};

export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

// ==================== Dialer ====================

export const startDialing = async (campaignId) => {
  const response = await api.post('/dialer/start', { campaignId });
  return response.data;
};

export const startAgentAutoDialing = async (campaignId, agentId) => {
  const response = await api.post('/dialer/start', { campaignId, agentId });
  return response.data;
};

export const stopDialing = async (campaignId) => {
  const response = await api.post('/dialer/stop', { campaignId });
  return response.data;
};

export const stopAgentAutoDialing = async (campaignId, agentId) => {
  const response = await api.post('/dialer/stop', { campaignId, agentId });
  return response.data;
};

export const getDialerStatus = async (campaignId) => {
  const response = await api.get(`/dialer/status?campaignId=${campaignId}`);
  return response.data.data;
};

export const getAgentAutoDialerStatus = async (campaignId, agentId) => {
  const response = await api.get(`/dialer/status?campaignId=${campaignId}&agentId=${agentId}`);
  return response.data.data;
};

export const getCallLogs = async (campaignId) => {
  const response = await api.get(`/dialer/calls?campaignId=${campaignId}`);
  return response.data.data;
};

// ==================== Call Management ====================

/**
 * Complete a call with disposition and notes
 * @param {string} leadId - Lead ID
 * @param {object} data - Call completion data
 * @returns {Promise} Updated lead, callLog, and agent
 */
export const completeCall = async (leadId, data) => {
  const response = await api.post(`/leads/${leadId}/complete-call`, data);
  return response.data.data;
};

/**
 * Schedule a callback for a lead
 * @param {string} leadId - Lead ID
 * @param {string} followUpDate - ISO date string
 * @returns {Promise} Updated lead with followUpDate
 */
export const scheduleCallback = async (leadId, followUpDate) => {
  const response = await api.post(`/leads/${leadId}/schedule-callback`, { followUpDate });
  return response.data.data;
};

/**
 * Cancel a scheduled callback
 * @param {string} leadId - Lead ID
 * @returns {Promise} Updated lead
 */
export const cancelCallback = async (leadId) => {
  const response = await api.post(`/leads/${leadId}/cancel-callback`);
  return response.data.data;
};

// ==================== Agent Management ====================

/**
 * Get available agents
 * @returns {Promise} List of available agents
 */
export const getAvailableAgents = async () => {
  const response = await api.get('/auth/agents/available');
  return response.data.data;
};

/**
 * Update agent availability status
 * @param {string} agentId - Agent ID
 * @param {boolean} isAvailable - Availability status
 * @returns {Promise} Updated agent
 */
export const updateAgentAvailability = async (agentId, isAvailable) => {
  const response = await api.put(`/auth/agents/${agentId}/availability`, { isAvailable });
  return response.data.data;
};

export const checkIn = async () => {
  const response = await api.post('/auth/attendance/check-in');
  return response.data.data;
};

export const checkOut = async () => {
  const response = await api.post('/auth/attendance/check-out');
  return response.data.data;
};

export const startBreak = async () => {
  const response = await api.post('/auth/attendance/break/start');
  return response.data.data;
};

export const endBreak = async () => {
  const response = await api.post('/auth/attendance/break/end');
  return response.data.data;
};

export const getMyAttendance = async () => {
  const response = await api.get('/auth/attendance/me');
  return response.data.data;
};

export const managerCheckInAgent = async (agentId) => {
  const response = await api.post(`/auth/attendance/agents/${agentId}/check-in`);
  return response.data.data;
};

export const managerCheckOutAgent = async (agentId) => {
  const response = await api.post(`/auth/attendance/agents/${agentId}/check-out`);
  return response.data.data;
};

export const managerStartAgentBreak = async (agentId) => {
  const response = await api.post(`/auth/attendance/agents/${agentId}/break/start`);
  return response.data.data;
};

export const managerEndAgentBreak = async (agentId) => {
  const response = await api.post(`/auth/attendance/agents/${agentId}/break/end`);
  return response.data.data;
};

/**
 * Get historical attendance reports (Manager only)
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @param {string} agentId - Optional agent ID filter
 */
export const getAttendanceHistory = async (startDate, endDate, agentId = null) => {
  let url = `/auth/attendance/history?`;
  if (startDate) url += `startDate=${encodeURIComponent(startDate)}&`;
  if (endDate) url += `endDate=${encodeURIComponent(endDate)}&`;
  if (agentId) url += `agentId=${agentId}&`;
  
  const response = await api.get(url);
  return response.data.data;
};

/**
 * Get agent statistics
 * @returns {Promise} List of agents with stats
 */
export const getAgentStats = async () => {
  const response = await api.get('/auth/agents/stats');
  return response.data.data;
};

// ==================== Lead Assignment ====================

/**
 * Assign a single lead to an agent
 * @param {string} leadId - Lead ID
 * @param {string} agentId - Agent ID
 * @returns {Promise} Updated lead
 */
export const assignLead = async (leadId, agentId) => {
  const response = await api.put(`/leads/${leadId}/assign`, { agentId });
  return response.data.data;
};

/**
 * Assign multiple leads to an agent
 * @param {array} leadIds - Array of lead IDs
 * @param {string} agentId - Agent ID
 * @returns {Promise} Assignment result
 */
export const assignLeadsToAgent = async (leadIds, agentId) => {
  const response = await api.post('/leads/assign-batch', { leadIds, agentId });
  return response.data.data;
};

export default api;
