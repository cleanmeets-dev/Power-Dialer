import { createContext, useCallback, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const LeadsContext = createContext();

export function LeadsProvider({ children, campaignId }) {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    disposition: "",
    interestLevel: "",
    agentId: "",
  });

  const loadLeads = useCallback(
    async (options = {}) => {
      if (!campaignId) {
        setLeads([]);
        return { leads: [], pagination: null };
      }

      try {
        setIsLoading(true);
        const response = await api.get("/leads", {
          params: {
            campaignId,
            page: options.page ?? pagination.page,
            limit: options.limit ?? pagination.limit,
            status: (options.status ?? filters.status) || null,
            search: (options.search ?? filters.search) || null,
            disposition: (options.disposition ?? filters.disposition) || null,
            interestLevel: (options.interestLevel ?? filters.interestLevel) || null,
            agentId: (options.agentId ?? filters.agentId) || null,
          },
        });
        const leadsData = response.data;

        console.log("Leads data: ", leadsData);

        if (Array.isArray(leadsData)) {
          setLeads(leadsData);
          return { leads: leadsData, pagination: null };
        }

        if (leadsData.data) {
          setLeads(leadsData.data);
          if (leadsData.pagination) {
            setPagination(leadsData.pagination);
          }
          return { leads: leadsData.data, pagination: leadsData.pagination || null };
        }

        setLeads([]);
        return { leads: [], pagination: null };
      } catch (error) {
        console.error("Error loading leads:", error);
        setLeads([]);
        return { leads: [], pagination: null };
      } finally {
        setIsLoading(false);
      }
    },
    [
      campaignId,
      pagination.page,
      pagination.limit,
      filters.status,
      filters.search,
      filters.disposition,
      filters.interestLevel,
      filters.agentId,
    ],
  );

  // Auto-load when campaign changes
  useEffect(() => {
    loadLeads();
  }, [campaignId]);

  // Pagination
  const changePage = useCallback(
    async (page) => {
      setPagination((prev) => ({ ...prev, page }));
      return await loadLeads({ page });
    },
    [loadLeads],
  );

  const changePageSize = useCallback(
    (limit) => {
      setPagination((prev) => ({ ...prev, page: 1, limit }));
      loadLeads({ page: 1, limit });
    },
    [loadLeads],
  );

  // Filtering & Search
  const setSearch = useCallback((search) => {
    setFilters((prev) => ({ ...prev, search }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadLeads({ page: 1, search });
  }, []);

  const setStatus = useCallback(
    (status) => {
      setFilters((prev) => ({ ...prev, status }));
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadLeads({ page: 1, status });
    },
    [loadLeads],
  );

  const setDisposition = useCallback(
    (disposition) => {
      setFilters((prev) => ({ ...prev, disposition }));
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadLeads({ page: 1, disposition });
    },
    [loadLeads],
  );

  const setInterestLevel = useCallback(
    (interestLevel) => {
      setFilters((prev) => ({ ...prev, interestLevel }));
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadLeads({ page: 1, interestLevel });
    },
    [loadLeads],
  );

  const setAgentId = useCallback(
    (agentId) => {
      setFilters((prev) => ({ ...prev, agentId }));
      setPagination((prev) => ({ ...prev, page: 1 }));
      loadLeads({ page: 1, agentId });
    },
    [loadLeads],
  );

  // Lead operations
  const deleteSingleLead = useCallback((leadId) => {
    setLeads((prev) => prev.filter((l) => l._id !== leadId));
  }, []);

  const deleteMultipleLeads = useCallback((leadIds) => {
    setLeads((prev) => prev.filter((l) => !leadIds.has(l._id)));
  }, []);

  const updateLead = useCallback((updatedLead) => {
    setLeads((prev) =>
      prev.map((l) => (l._id === updatedLead._id ? updatedLead : l)),
    );
  }, []);

  const value = {
    // State
    leads,
    isLoading,
    pagination,
    filters,

    // Actions
    loadLeads,
    changePage,
    changePageSize,
    setSearch,
    setStatus,
    setDisposition,
    setInterestLevel,
    setAgentId,
    deleteSingleLead,
    deleteMultipleLeads,
    updateLead,
  };

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}
