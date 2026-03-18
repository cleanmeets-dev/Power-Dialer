import { useState, useCallback } from 'react';
import { getLeads, getLeadById, updateLead } from '../services/api';

/**
 * Queue Service Hook - Manages lead queue operations
 * Mirrors backend queueService.js for local state management
 */
export const useQueueService = () => {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get next leads to dial from a campaign
   * In production, this would call getLeads with status='pending'
   */
  const getNextLeadsToCall = useCallback(async (campaignId, count = 5) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, you'd want a dedicated endpoint
      // For now, use getLeads and filter locally
      const leadsData = await getLeads();
      
      // Filter leads from this campaign with pending status
      const pendingLeads = (Array.isArray(leadsData) ? leadsData : [])
        .filter(
          (lead) =>
            (!campaignId || lead.campaignId === campaignId) &&
            lead.status === 'pending'
        )
        .slice(0, count);
      
      setQueue(pendingLeads);
      return { success: true, data: pendingLeads };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      setQueue([]);
      console.error('Error fetching next leads to call:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Mark a lead as currently being dialed
   */
  const markAsDialing = useCallback(async (leadId) => {
    try {
      const updatedLead = await updateLead(leadId, {
        status: 'dialing',
        lastDialedAt: new Date().toISOString(),
      });
      
      // Update local queue state
      setQueue((prevQueue) =>
        prevQueue.map((lead) =>
          lead._id === leadId ? { ...lead, status: 'dialing', ...updatedLead } : lead
        )
      );
      
      return { success: true, data: updatedLead };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error marking lead as dialing:', err);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Mark a lead as completed
   */
  const markAsCompleted = useCallback(
    async (leadId, reason = 'completed') => {
      try {
        const updatedLead = await updateLead(leadId, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          completionReason: reason,
        });
        
        // Remove from queue or update status
        setQueue((prevQueue) =>
          prevQueue.filter((lead) => lead._id !== leadId)
        );
        
        return { success: true, data: updatedLead };
      } catch (err) {
        const errorMsg = err.response?.data?.error || err.message;
        setError(errorMsg);
        console.error('Error marking lead as completed:', err);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  /**
   * Mark a lead as failed (for retry)
   */
  const markAsRetryable = useCallback(async (leadId, reason = 'no-answer') => {
    try {
      const updatedLead = await updateLead(leadId, {
        status: 'pending',
        lastFailureReason: reason,
        retryCount: (await getLeadById(leadId)).retryCount + 1 || 1,
      });
      
      // Update in queue
      setQueue((prevQueue) =>
        prevQueue.map((lead) =>
          lead._id === leadId ? { ...lead, status: 'pending', ...updatedLead } : lead
        )
      );
      
      return { success: true, data: updatedLead };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error marking lead as retryable:', err);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Refresh the queue from server
   */
  const refreshQueue = useCallback(async (campaignId, status = 'pending') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const leadsData = await getLeads();
      
      const filteredQueue = (Array.isArray(leadsData) ? leadsData : []).filter(
        (lead) =>
          (!campaignId || lead.campaignId === campaignId) &&
          (!status || lead.status === status)
      );
      
      setQueue(filteredQueue);
      return { success: true, data: filteredQueue };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error refreshing queue:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get queue length
   */
  const getQueueLength = useCallback(() => {
    return queue.length;
  }, [queue]);

  /**
   * Get queue statistics
   */
  const getQueueStats = useCallback(() => {
    const total = queue.length;
    const dialing = queue.filter((lead) => lead.status === 'dialing').length;
    const completed = queue.filter((lead) => lead.status === 'completed').length;
    const pending = queue.filter((lead) => lead.status === 'pending').length;
    
    return {
      total,
      dialing,
      completed,
      pending,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [queue]);

  return {
    queue,
    isLoading,
    error,
    getNextLeadsToCall,
    markAsDialing,
    markAsCompleted,
    markAsRetryable,
    refreshQueue,
    getQueueLength,
    getQueueStats,
  };
};

export default useQueueService;
