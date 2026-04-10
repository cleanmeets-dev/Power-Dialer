import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  FileText,
  X,
  Download,
} from 'lucide-react';
import { getAllAgents, getLeads } from '../services/api';
import CampaignSelector from '../components/CampaignSelector';
import LeadDetailModal from '../components/modals/LeadDetailModal';

const DIALER_STATUSES = [
  'pending',
  'dialing',
  'connected',
  'failed',
  'completed',
];

const DISPOSITIONS = [
  'voicemail',
  'followup',
  'not-interested',
  'appointment',
  'wrong-number',
];

const APPOINTMENT_STATUSES = [
  'in-process',
  'qualified',
  'disqualified',
  'reschedule',
  'onhold',
];

export default function FollowupPage() {
  const { showNotification } = useOutletContext();
  useAuth();

  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedDialerStatus, setSelectedDialerStatus] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState('');
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState('');
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
        const response = await getLeads(selectedCampaignId, {
          page: currentPage,
          limit: pageSize,
          search: searchInput || null,
          status: selectedDialerStatus || null,
          disposition: selectedDisposition || null,
          appointmentStatus: selectedAppointmentStatus || null,
          agentId: selectedAgent || null,
        });

        setLeads(Array.isArray(response?.leads) ? response.leads : []);
        setTotal(response?.pagination?.total || 0);
      } catch (error) {
        console.error('Error fetching followup leads:', error);
        showNotification('Error fetching followup leads', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowupLeads();
  }, [selectedCampaignId, currentPage, pageSize, searchInput, selectedDialerStatus, selectedDisposition, selectedAppointmentStatus, selectedAgent, showNotification]);

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const users = await getAllAgents();
        const callerOnly = (Array.isArray(users) ? users : [])
          .filter((user) => user.role === 'caller-agent')
          .map((user) => ({
            _id: user._id,
            name: user.name || user.email,
            email: user.email,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setAgents(callerOnly);
      } catch (error) {
        console.error('Error loading caller agents:', error);
      }
    };

    fetchAgents();
  }, []);

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
    setSelectedDialerStatus('');
    setSelectedDisposition('');
    setSelectedAppointmentStatus('');
    setSelectedAgent('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (leads.length === 0) {
      showNotification('No leads to export', 'error');
      return;
    }

    const headers = [
      'Business Name',
      'Phone',
      'Email',
      'Dialer Status',
      'Disposition',
      'Appointment Status',
      'Agent Assigned',
      'Last Contacted',
      'Notes',
    ];
    const rows = leads.map((lead) => [
      lead.businessName || '',
      lead.phoneNumber || '',
      lead.email || '',
      lead.dialerStatus || '',
      lead.disposition || '',
      lead.appointmentStatus || '',
      getAssignedAgentLabel(lead) || '',
      formatDate(lead.lastDialedAt) || '',
      lead.agentNotes || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `followup-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Followup leads exported successfully', 'success');
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
      pending: 'bg-slate-100 text-slate-800',
      dialing: 'bg-blue-100 text-blue-800',
      connected: 'bg-emerald-100 text-emerald-800',
      failed: 'bg-rose-100 text-rose-800',
      completed: 'bg-indigo-100 text-indigo-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDispositionColor = (disposition) => {
    const colors = {
      voicemail: 'bg-gray-50 text-gray-700',
      followup: 'bg-yellow-50 text-yellow-700',
      'not-interested': 'bg-red-50 text-red-700',
      appointment: 'bg-emerald-50 text-emerald-700',
      'wrong-number': 'bg-orange-50 text-orange-700',
    };
    return colors[disposition] || 'bg-gray-50 text-gray-700';
  };

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);
  const getAssignedAgentLabel = (lead) => {
    if (lead.assignedCallerName) return lead.assignedCallerName;
    if (lead.assignedCaller && typeof lead.assignedCaller === 'object') {
      return lead.assignedCaller.name || lead.assignedCaller.email || '—';
    }
    if (typeof lead.assignedCaller === 'string') return lead.assignedCaller;
    return '—';
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lead Followups</h1>
        <p className="text-slate-600 dark:text-slate-400">Track engaged leads for follow-up</p>
      </div>

      {/* Campaign Selector */}
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <CampaignSelector
          onCampaignSelect={setSelectedCampaignId}
          selectedCampaignId={selectedCampaignId}
        />
      </div>

      {selectedCampaignId && (
        <>
          {/* Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchInput}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Dialer Status Filter */}
            <select
              value={selectedDialerStatus}
              onChange={(e) => {
                setSelectedDialerStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              {DIALER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>

            {/* Appointment Status Filter */}
            <select
              value={selectedAppointmentStatus}
              onChange={(e) => {
                setSelectedAppointmentStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500"
            >
              <option value="">All Appointment Statuses</option>
              {APPOINTMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('-', ' ').toUpperCase()}
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
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500"
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
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-100 transition"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters ? 'Hide' : 'More'} Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              {/* Agent Filter */}
              <select
                value={selectedAgent}
                onChange={(e) => {
                  setSelectedAgent(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500"
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name || agent.email}
                  </option>
                ))}
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
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>

          {/* Export Button */}
          {leads.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition font-semibold text-sm flex items-center gap-2 whitespace-nowrap"
                title="Export as CSV"
              >
                <Download className="w-4 h-4" />
                Export Leads
              </button>
            </div>
          )}

          {/* Results Counter */}
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {leads.length > 0 ? startIndex : 0} to {endIndex} of {total} followup
            leads
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : leads.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Lead
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Agent
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Disposition
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Last Dialed
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Follow-Up Date
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Notes
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead._id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition"
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {lead.businessName || 'N/A'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {lead.phoneNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <User className="w-4 h-4" />
                          {getAssignedAgentLabel(lead)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            lead.dialerStatus
                          )}`}
                        >
                          {lead.dialerStatus
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
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatDate(lead.lastDialedAt)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTime(lead.lastDialedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {lead.followUpDate
                              ? formatDate(lead.followUpDate)
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="max-w-xs">
                          <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                            {lead.agentNotes || '—'}
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
                <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-white rounded-lg transition"
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
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
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
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 dark:text-white rounded-lg transition"
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
