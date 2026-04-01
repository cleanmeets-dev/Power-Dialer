import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Calendar,
  User,
  FileText,
  X,
} from 'lucide-react';
import axios from 'axios';
import CampaignSelector from '../components/CampaignSelector';
import LeadDetailModal from '../components/modals/LeadDetailModal';

const LEAD_STATUSES = [
  'contacted',
  'interested',
  'not_interested',
  'callback',
  'converted',
  'closed',
];

const DISPOSITIONS = [
  'interested',
  'not-interested',
  'callback',
  'wrong-number',
  'no-answer',
  'do-not-call',
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function FollowupPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();

  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState('');
  const [selectedInterestLevel, setSelectedInterestLevel] = useState('');
  const [daysSinceContact, setDaysSinceContact] = useState('');
  const [followupUrgency, setFollowupUrgency] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [agents, setAgents] = useState([]);

  // Fetch followup leads
  useEffect(() => {
    if (!selectedCampaignId) {
      setLeads([]);
      setTotal(0);
      return;
    }

    const fetchFollowupLeads = async () => {
      setIsLoading(true);
      try {
        const params = {
          campaignId: selectedCampaignId,
          page: currentPage,
          limit: pageSize,
        };

        // Add search filter
        if (searchInput) {
          params.search = searchInput;
        }

        if (selectedStatus) {
          params.leadStatus = selectedStatus;
        }

        if (selectedDisposition) {
          params.disposition = selectedDisposition;
        }

        if (selectedInterestLevel) {
          params.interestLevel = selectedInterestLevel;
        }

        if (daysSinceContact) {
          params.daysSinceContact = daysSinceContact;
        }

        if (followupUrgency) {
          params.followupUrgency = followupUrgency;
        }

        if (selectedAgent) {
          params.agentId = selectedAgent;
        }

        const response = await api.get('/leads/followups', { params });
        console.log('Followup response:', response.data);

        if (response.data.success) {
          setLeads(response.data.data);
          setTotal(response.data.pagination.total);
        } else {
          showNotification(
            response.data.error || 'Failed to fetch followup leads',
            'error'
          );
        }
      } catch (error) {
        console.error('Error fetching followup leads:', error);
        showNotification('Error fetching followup leads', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowupLeads();
  }, [selectedCampaignId, currentPage, pageSize, searchInput, selectedStatus, selectedDisposition, selectedInterestLevel, daysSinceContact, followupUrgency, selectedAgent]);

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Extract unique agents from current leads
        const uniqueAgents = new Map();
        leads.forEach(lead => {
          if (lead.assignedCaller && lead.assignedCaller._id) {
            const agent = lead.assignedCaller;
            uniqueAgents.set(agent._id, {
              _id: agent._id,
              name: agent.name || agent.email,
              email: agent.email
            });
          }
          if (lead.assignedCloser && lead.assignedCloser._id) {
            const agent = lead.assignedCloser;
            uniqueAgents.set(agent._id, {
              _id: agent._id,
              name: agent.name || agent.email,
              email: agent.email
            });
          }
        });
        setAgents(Array.from(uniqueAgents.values()).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error extracting agents:', error);
      }
    };

    fetchAgents();
  }, [leads]);

  const handleViewLead = (leadId) => {
    setSelectedLeadId(leadId);
    setShowDetailModal(true);
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSelectedStatus('');
    setSelectedDisposition('');
    setSelectedInterestLevel('');
    setDaysSinceContact('');
    setFollowupUrgency('');
    setSelectedAgent('');
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      contacted: 'bg-blue-100 text-blue-800',
      interested: 'bg-green-100 text-green-800',
      not_interested: 'bg-red-100 text-red-800',
      callback: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-emerald-100 text-emerald-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDispositionColor = (disposition) => {
    const colors = {
      interested: 'bg-green-50 text-green-700',
      'not-interested': 'bg-red-50 text-red-700',
      callback: 'bg-yellow-50 text-yellow-700',
      'wrong-number': 'bg-orange-50 text-orange-700',
      'no-answer': 'bg-gray-50 text-gray-700',
      'do-not-call': 'bg-red-50 text-red-700',
    };
    return colors[disposition] || 'bg-gray-50 text-gray-700';
  };

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);
  const getAssignedAgentLabel = (lead) => {
    if (lead.assignedCallerName) return lead.assignedCallerName;
    if (lead.assignedCloserName) return lead.assignedCloserName;
    if (lead.assignedCaller && typeof lead.assignedCaller === 'object') {
      return lead.assignedCaller.name || lead.assignedCaller.email || '—';
    }
    if (lead.assignedCloser && typeof lead.assignedCloser === 'object') {
      return lead.assignedCloser.name || lead.assignedCloser.email || '—';
    }
    if (typeof lead.assignedCaller === 'string') return lead.assignedCaller;
    if (typeof lead.assignedCloser === 'string') return lead.assignedCloser;
    return '—';
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-600">Lead Followups</h1>
        <p className="text-slate-400">Track engaged leads for follow-up</p>
      </div>

      {/* Campaign Selector */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <CampaignSelector
          onCampaignSelect={setSelectedCampaignId}
          selectedCampaignId={selectedCampaignId}
        />
      </div>

      {selectedCampaignId && (
        <>
          {/* Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchInput}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Lead Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            {/* Disposition Filter */}
            <select
              value={selectedDisposition}
              onChange={(e) => {
                setSelectedDisposition(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value="">All Dispositions</option>
              {DISPOSITIONS.map((disposition) => (
                <option key={disposition} value={disposition}>
                  {disposition.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? 'Hide' : 'More'} Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
              {/* Agent Filter */}
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name || agent.email}
                  </option>
                ))}
              </select>

              {/* Interest Level Filter */}
              <select
                value={selectedInterestLevel}
                onChange={(e) => {
                  setSelectedInterestLevel(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">All Interest Levels</option>
                <option value="cold">Cold</option>
                <option value="warm">Warm</option>
                <option value="hot">Hot</option>
              </select>

              {/* Days Since Contact Filter */}
              <input
                type="number"
                placeholder="Days since contact"
                min="0"
                value={daysSinceContact}
                onChange={(e) => {
                  setDaysSinceContact(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />

              {/* Follow-up Urgency Filter */}
              <select
                value={followupUrgency}
                onChange={(e) => {
                  setFollowupUrgency(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
              >
                <option value="">All Follow-ups</option>
                <option value="overdue">Overdue</option>
                <option value="due-today">Due Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="no-followup">No Scheduled</option>
              </select>

              {/* Clear Filters Button */}
              <button
                onClick={clearAllFilters}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/50 rounded-lg text-rose-400 transition"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}

          {/* Page Size */}
          <div className="flex justify-end">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Results Counter */}
          <div className="text-sm text-slate-400">
            Showing {leads.length > 0 ? startIndex : 0} to {endIndex} of {total} followup
            leads
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : leads.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-700/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Lead
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Agent
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Disposition
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Last Dialed
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Follow-Up Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="border-b border-slate-700 hover:bg-slate-700/30 transition"
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">
                            {lead.businessName || 'N/A'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {lead.phoneNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <User className="w-4 h-4" />
                          {getAssignedAgentLabel(lead)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            lead.leadStatus
                          )}`}
                        >
                          {lead.leadStatus
                            ?.replace('_', ' ')
                            .toUpperCase() || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getDispositionColor(
                            lead.disposition
                          )}`}
                        >
                          {lead.disposition?.replace('-', ' ').toUpperCase() ||
                            '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(lead.lastDialedAt)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(lead.lastDialedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-300">
                            {lead.followUpDate
                              ? formatDate(lead.followUpDate)
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs">
                          <p className="text-slate-300 line-clamp-2">
                            {lead.callNotes || lead.generalNotes || '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleViewLead(lead._id)}
                          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-medium transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <FileText className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400">
                  No followup leads found for this campaign.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() =>
                  setCurrentPage(Math.max(1, currentPage - 1))
                }
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      } transition text-sm`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        isOpen={showDetailModal}
        leadId={selectedLeadId}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}
