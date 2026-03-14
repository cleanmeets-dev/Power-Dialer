import { useState, useEffect, useCallback } from 'react';
import { getLeads } from '../services/api';

/**
 * useCampaignData - Manages campaign-related data (leads, loading state)
 * Fetches leads when campaign changes
 */
export const useCampaignData = (selectedCampaignId) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLeads = useCallback(async () => {
    if (!selectedCampaignId) {
      setLeads([]);
      return;
    }

    try {
      setIsLoading(true);
      const leadsData = await getLeads(selectedCampaignId);
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampaignId]);

  // Load leads when campaign changes
  useEffect(() => {
    loadLeads();
  }, [selectedCampaignId, loadLeads]);

  const handleLeadDeleted = useCallback((leadId) => {
    setLeads((prevLeads) => prevLeads.filter(lead => lead._id !== leadId));
  }, []);

  const reloadLeads = useCallback(() => {
    return loadLeads();
  }, [loadLeads]);

  return {
    leads,
    isLoading,
    loadLeads: reloadLeads,
    handleLeadDeleted,
  };
};
