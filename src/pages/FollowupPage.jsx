import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
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
  PhoneCall,
  ClipboardCheck,
  Clock3,
  Layers3,
} from "lucide-react";
import { getAllAgents, getLeads } from "../services/api";
import CampaignSelector from "../components/CampaignSelector";
import LeadDetailModal from "../components/modals/LeadDetailModal";
import EditLeadModal from "../components/modals/EditLeadModal";
import UpdateQualificationModal from "../components/modals/UpdateQualificationModal";

const DIALER_STATUSES = [
  "pending",
  "dialing",
  "connected",
  "failed",
  "completed",
];

const DISPOSITIONS = [
  "voicemail",
  "followup",
  "not-interested",
  "appointment",
  "wrong-number",
];

const APPOINTMENT_STATUSES = [
  "qualified-level-1",
  "qualified-level-2",
  "qualified-level-3",
  "disqualified",
  "in-process",
  "reschedule",
  "onhold",
];

export default function FollowupPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const canExport = ["admin", "manager"].includes(user?.role);
  const canManageLeads = ["admin", "manager"].includes(user?.role);

  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedDialerStatus, setSelectedDialerStatus] = useState("completed");
  const [selectedDisposition, setSelectedDisposition] = useState("appointment");
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] =
    useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState({
    scopedTotal: 0,
    interested: 0,
    appointments: 0,
    followupsScheduled: 0,
  });

  // Fetch followup leads
  const loadFollowupLeads = useCallback(async () => {
    if (!selectedCampaignId) {
      setLeads([]);
      setTotal(0);
      setStats({
        scopedTotal: 0,
        interested: 0,
        appointments: 0,
        followupsScheduled: 0,
      });
      return;
    }

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
      setStats({
        scopedTotal: response?.stats?.scopedTotal || 0,
        interested: response?.stats?.interested || 0,
        appointments: response?.stats?.appointments || 0,
        followupsScheduled: response?.stats?.followupsScheduled || 0,
      });
    } catch (error) {
      console.error("Error fetching followup leads:", error);
      showNotification("Error fetching followup leads", "error");
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedCampaignId,
    currentPage,
    pageSize,
    searchInput,
    selectedDialerStatus,
    selectedDisposition,
    selectedAppointmentStatus,
    selectedAgent,
    showNotification,
  ]);

  useEffect(() => {
    loadFollowupLeads();
  }, [loadFollowupLeads]);

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const users = await getAllAgents();
        const callerOnly = (Array.isArray(users) ? users : [])
          .filter((user) => user.role === "caller-agent")
          .map((user) => ({
            _id: user._id,
            name: user.name || user.email,
            email: user.email,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setAgents(callerOnly);
      } catch (error) {
        console.error("Error loading caller agents:", error);
      }
    };

    fetchAgents();
  }, []);

  const handleViewLead = (leadId) => {
    setSelectedLeadId(leadId);
    setShowDetailModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLeadForEdit(lead);
    setShowEditModal(true);
  };

  const handleEditSave = (updated) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead._id === updated._id ? updated : lead)),
    );
    showNotification("Lead updated successfully", "success");
    setShowEditModal(false);
    loadFollowupLeads();
  };

  const handleUpdateStatus = (leadId) => {
    const lead = leads.find((item) => item._id === leadId);
    setSelectedLeadForStatus(lead || null);
    setShowStatusModal(true);
  };

  const handleStatusUpdateSuccess = (updated) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) => (lead._id === updated._id ? updated : lead)),
    );
    showNotification("Qualification updated successfully", "success");
    setShowStatusModal(false);
    loadFollowupLeads();
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setSelectedDialerStatus("completed");
    setSelectedDisposition("appointment");
    setSelectedAppointmentStatus("");
    setSelectedAgent("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (leads.length === 0) {
      showNotification("No leads to export", "error");
      return;
    }

    const headers = [
      "Business Name",
      "Phone",
      "Email",
      "Dialer Status",
      "Disposition",
      "Appointment Status",
      "Agent Assigned",
      "Last Contacted",
      "Notes",
    ];
    const rows = leads.map((lead) => [
      lead.businessName || "",
      lead.phoneNumber || "",
      lead.email || "",
      lead.dialerStatus || "",
      lead.disposition || "",
      lead.appointmentStatus || "",
      getAssignedAgentLabel(lead) || "",
      formatDate(lead.lastDialedAt) || "",
      lead.agentNotes || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `followup-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification("Followup leads exported successfully", "success");
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-slate-800 text-slate-50",
      dialing: "bg-blue-800 text-blue-50",
      connected: "bg-emerald-800 text-emerald-50",
      failed: "bg-rose-800 text-rose-50",
      completed: "bg-indigo-800 text-indigo-50",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getDispositionColor = (disposition) => {
    const colors = {
      voicemail: "bg-gray-700 text-gray-50",
      followup: "bg-yellow-700 text-yellow-50",
      "not-interested": "bg-red-700 text-red-50",
      appointment: "bg-emerald-800 text-emerald-50",
      "wrong-number": "bg-orange-700 text-orange-50",
    };
    return colors[disposition] || "bg-gray-50 text-gray-700";
  };

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  const getAssignedAgentLabel = (lead) => {
    if (lead.assignedCallerName) return lead.assignedCallerName;
    if (lead.assignedCaller && typeof lead.assignedCaller === "object") {
      return lead.assignedCaller.name || lead.assignedCaller.email || "—";
    }
    if (typeof lead.assignedCaller === "string") return lead.assignedCaller;
    return "—";
  };

  const activeFiltersCount = [
    searchInput,
    selectedDialerStatus,
    selectedDisposition,
    selectedAppointmentStatus,
    selectedAgent,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-linear-to-r from-cyan-50 via-sky-50 to-slate-100 p-6 shadow-xl dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/20" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-indigo-300/20 blur-2xl dark:bg-indigo-500/20" />

        <div className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Lead Followups
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Track call outcomes, assignments, and next actions in one place.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-200">
            <Layers3 className="h-4 w-4" />
            {stats.scopedTotal} total followup leads
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <CampaignSelector
          onCampaignSelect={setSelectedCampaignId}
          selectedCampaignId={selectedCampaignId}
        />
      </div>

      {selectedCampaignId && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">Filters active</span>
                <Filter className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </div>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{activeFiltersCount}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">search + field filters</p>
            </div> */}
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="relative xl:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone..."
                  value={searchInput}
                  onChange={handleSearch}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-500 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400"
                />
              </div>

              <select
                value={selectedDialerStatus}
                onChange={(e) => {
                  setSelectedDialerStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All Statuses</option>
                {DIALER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={selectedAppointmentStatus}
                onChange={(e) => {
                  setSelectedAppointmentStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All Appointment Statuses</option>
                {APPOINTMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("-", " ").toUpperCase()}
                  </option>
                ))}
              </select>

              <select
                value={selectedDisposition}
                onChange={(e) => {
                  setSelectedDisposition(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">All Dispositions</option>
                {DISPOSITIONS.map((disposition) => (
                  <option key={disposition} value={disposition}>
                    {disposition.replace("-", " ").toUpperCase()}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Filter className="h-4 w-4" />
                {showAdvancedFilters ? "Hide" : "More"} Filters
              </button>
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_auto] dark:border-slate-700 dark:bg-slate-900/40">
                <select
                  value={selectedAgent}
                  onChange={(e) => {
                    setSelectedAgent(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="">All Agents</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name || agent.email}
                    </option>
                  ))}
                </select>

                <button
                  onClick={clearAllFilters}
                  className="flex items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Showing {leads.length > 0 ? startIndex : 0}-{endIndex} of{" "}
                {total} followup leads
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                {canExport && leads.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 rounded-lg bg-secondary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary-700"
                    title="Export as CSV"
                  >
                    <Download className="h-4 w-4" />
                    Export Leads
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            {isLoading ? (
              <div className="flex items-center justify-center p-10">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500"></div>
              </div>
            ) : leads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/40">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Lead
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Agent
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Disposition
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Last Dialed
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Follow-Up Date (If any)
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="border-b border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/20"
                      >
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {lead.businessName || "N/A"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {lead.phoneNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <User className="h-4 w-4" />
                            {getAssignedAgentLabel(lead)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                              lead.dialerStatus,
                            )}`}
                          >
                            {lead.dialerStatus
                              ?.replace("_", " ")
                              .toUpperCase() || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getDispositionColor(
                              lead.disposition,
                            )}`}
                          >
                            {lead.disposition
                              ?.replace("-", " ")
                              .toUpperCase() || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                          <span className="line-clamp-2">
                            {lead.businessAddress || lead.address || "—"}
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
                            <Calendar className="h-4 w-4 text-amber-500" />
                            <span className="text-slate-700 dark:text-slate-300">
                              {lead.followUpDate
                                ? formatDate(lead.followUpDate)
                                : "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleViewLead(lead._id)}
                            className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <FileText className="mb-3 h-12 w-12 text-slate-400 dark:text-slate-600" />
                <p className="text-slate-600 dark:text-slate-400">
                  No followup leads found for this campaign.
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded text-sm transition ${
                        currentPage === page
                          ? "bg-primary-600 text-white shadow"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {!selectedCampaignId && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
          <Layers3 className="mb-3 h-10 w-10 text-slate-400 dark:text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Select a Campaign to Begin
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Choose a campaign above to load followup leads, apply filters, and
            export your current view.
          </p>
        </div>
      )}

      <LeadDetailModal
        isOpen={showDetailModal}
        leadId={selectedLeadId}
        onClose={() => setShowDetailModal(false)}
        onEditLead={canManageLeads ? handleEditLead : undefined}
        onStatusUpdate={canManageLeads ? handleUpdateStatus : undefined}
      />

      {canManageLeads && (
        <>
          <EditLeadModal
            isOpen={showEditModal}
            lead={selectedLeadForEdit}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditSave}
          />

          <UpdateQualificationModal
            isOpen={showStatusModal}
            lead={selectedLeadForStatus}
            onClose={() => setShowStatusModal(false)}
            onSuccess={handleStatusUpdateSuccess}
            onError={(message) => showNotification(message, "error")}
          />
        </>
      )}
    </div>
  );
}
