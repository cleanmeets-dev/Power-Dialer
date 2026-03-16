import { useState, useEffect, useCallback } from 'react';
import { getLeads } from '../services/api';

/**
 * useCampaignData - Manages campaign-related data (leads, loading state, pagination)
 * Fetches leads when campaign changes with pagination support
 */
export const useCampaignData = (selectedCampaignId, paginationOptions = {}) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const loadLeads = useCallback(async (options = {}) => {
    if (!selectedCampaignId) {
      setLeads([]);
      return;
    }

    try {
      setIsLoading(true);
      const leadsData = await getLeads(selectedCampaignId, {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        status: options.status || null,
        search: options.search || null,
      });
      
      // Handle both array response or paginated response object
      if (Array.isArray(leadsData)) {
        setLeads(leadsData);
      } else if (leadsData.data) {
        setLeads(leadsData.data);
        if (leadsData.pagination) {
          setPagination(leadsData.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCampaignId, pagination.page, pagination.limit]);

  // Load leads when campaign changes
  useEffect(() => {
    loadLeads();
  }, [selectedCampaignId, loadLeads]);

  const handleLeadDeleted = useCallback((leadId) => {
    setLeads((prevLeads) => prevLeads.filter(lead => lead._id !== leadId));
  }, []);

  const handleLeadUpdated = useCallback((updatedLead) => {
    setLeads((prevLeads) => 
      prevLeads.map(lead => lead._id === updatedLead._id ? updatedLead : lead)
    );
  }, []);

  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    loadLeads({ page: newPage });
  }, [loadLeads]);

  const changePageSize = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, page: 1, limit: newLimit }));
    loadLeads({ page: 1, limit: newLimit });
  }, [loadLeads]);

  const searchLeads = useCallback((searchTerm) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadLeads({ page: 1, search: searchTerm });
  }, [loadLeads]);

  const filterByStatus = useCallback((status) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadLeads({ page: 1, status: status || null });
  }, [loadLeads]);

  const reloadLeads = useCallback(() => {
    return loadLeads();
  }, [loadLeads]);

  return {
    leads,
    isLoading,
    pagination,
    loadLeads: reloadLeads,
    handleLeadDeleted,
    handleLeadUpdated,
    changePage,
    changePageSize,
    searchLeads,
    filterByStatus,
  };
};
