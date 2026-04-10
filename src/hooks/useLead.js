import { useState, useEffect, useCallback } from 'react';
import { getLead, updateLead, updateQualificationStatus } from '../services/api';

/**
 * useLead - Manage a single lead by ID
 * Fetches lead details, updates, and status changes
 */
export const useLead = (leadId) => {
  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load lead details
  const loadLead = useCallback(async () => {
    if (!leadId) {
      setLead(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const leadData = await getLead(leadId);
      setLead(leadData);
    } catch (err) {
      console.error('Error loading lead:', err);
      setError(err.message);
      setLead(null);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  // Load lead when ID changes
  useEffect(() => {
    loadLead();
  }, [leadId, loadLead]);

  // Update lead details (notes, disposition, follow-up date)
  const updateLeadDetails = useCallback(async (updates) => {
    if (!leadId) return null;

    try {
      setIsLoading(true);
      setError(null);
      const updated = await updateLead(leadId, updates);
      setLead(updated);
      return updated;
    } catch (err) {
      console.error('Error updating lead:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  // Update appointment qualification status
  const updateStatus = useCallback(async (status) => {
    if (!leadId) return null;

    try {
      setIsLoading(true);
      setError(null);
      const updated = await updateQualificationStatus(leadId, status);
      setLead(updated);
      return updated;
    } catch (err) {
      console.error('Error updating qualification status:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  // Refresh lead data
  const refresh = useCallback(() => {
    return loadLead();
  }, [loadLead]);

  return {
    lead,
    isLoading,
    error,
    updateLeadDetails,
    updateStatus,
    refresh,
  };
};
