import { useState, useEffect, useCallback } from 'react';
import { getAgentStats } from '../services/api';
import { useWebSocket } from './useWebSocket';

/**
 * Hook to manage agent stats and real-time updates
 */
export function useAgentStats() {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const agentsList = await getAgentStats();
      setAgents(agentsList);
    } catch (error) {
      console.error('Failed to load agent stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle agent availability changes via WebSocket
  const handleAgentAvailabilityChanged = useCallback((data) => {
    console.log('📡 Agent availability changed:', data);
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent._id === data.agentId
          ? { ...agent, isAvailable: data.isAvailable }
          : agent
      )
    );
  }, []);

  // Setup WebSocket listener
  useWebSocket({
    onAgentAvailabilityChanged: handleAgentAvailabilityChanged,
  });

  // Load agents on mount
  useEffect(() => {
    loadAgents();
    
    // Reload agents every 30 seconds to sync with server
    const interval = setInterval(async () => {
      setIsLoading(true);
      try {
        const agentsList = await getAgentStats();
        setAgents(agentsList);
      } catch (error) {
        console.error('Failed to load agent stats:', error);
      } finally {
        setIsLoading(false);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadAgents]);

  return {
    agents,
    isLoading,
    loadAgents,
    refreshAgents: loadAgents,
  };
}

export default useAgentStats;
