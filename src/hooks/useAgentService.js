import { useState, useCallback } from 'react';
import { getAvailableAgents, updateAgentAvailability, getAgentStats } from '../services/api';

/**
 * Agent Service Hook - Manages agent availability and call assignments
 * Mirrors backend agentService.js
 */
export const useAgentService = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get all available agents
   */
  const fetchAvailableAgents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const agentsList = await getAvailableAgents();
      setAgents(Array.isArray(agentsList) ? agentsList : []);
      return { success: true, data: agentsList };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setAgents([]);
      console.error('Error fetching available agents:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get all agent statistics
   */
  const fetchAgentStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statsList = await getAgentStats();
      setAgents(Array.isArray(statsList) ? statsList : []);
      return { success: true, data: statsList };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setAgents([]);
      console.error('Error fetching agent stats:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an agent's availability status
   */
  const updateAvailability = useCallback(
    async (agentId, isAvailable) => {
      try {
        setError(null);
        const updatedAgent = await updateAgentAvailability(agentId, isAvailable);
        
        // Update local state
        setAgents((prevAgents) =>
          prevAgents.map((agent) =>
            agent._id === agentId ? { ...agent, ...updatedAgent } : agent
          )
        );
        
        return { success: true, data: updatedAgent };
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        setError(errorMsg);
        console.error('Error updating agent availability:', err);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  /**
   * Simulate assigning a call to an agent (local state update)
   */
  const assignCallToAgent = useCallback((agentId, leadId) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent._id === agentId
          ? { ...agent, isAvailable: false, activeLead: leadId }
          : agent
      )
    );
    return { success: true, data: { agentId, leadId } };
  }, []);

  /**
   * Simulate completing a call for an agent (local state update)
   */
  const completeAgentCall = useCallback((agentId, duration) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent._id === agentId
          ? {
              ...agent,
              isAvailable: true,
              activeLead: null,
              callsHandled: (agent.callsHandled || 0) + 1,
            }
          : agent
      )
    );
    return { success: true, data: { agentId, duration } };
  }, []);

  return {
    agents,
    isLoading,
    error,
    fetchAvailableAgents,
    fetchAgentStats,
    updateAvailability,
    assignCallToAgent,
    completeAgentCall,
  };
};

export default useAgentService;
