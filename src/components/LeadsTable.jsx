import { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  Eye,
  Edit3,
  CheckCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Phone,
  Calendar,
} from "lucide-react";
import { useLeads } from "../hooks/useLeads";
import LeadDetailModal from "./modals/LeadDetailModal.jsx";
import EditLeadModal from "./modals/EditLeadModal.jsx";
import UpdateLeadStatusModal from "./modals/UpdateLeadStatusModal.jsx";
import CompleteCallModal from "./modals/CompleteCallModal.jsx";
import ScheduleCallbackModal from "./modals/ScheduleCallbackModal.jsx";
import ConfirmModal from "./common/ConfirmModal.jsx";

const STATUSES = ["pending", "dialing", "connected", "completed", "failed"];
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function LeadsTable({ showNotification }) {
  const {
    leads,
    isLoading,
    pagination,
    filters,
    changePage,
    changePageSize,
    setSearch,
    setStatus,
    deleteSingleLead,
    deleteMultipleLeads,
    updateLead,
  } = useLeads();

  const [searchInput, setSearchInput] = useState("");

  // Local state for modals
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedLeadForCompleteCall, setSelectedLeadForCompleteCall] = useState(null);
  const [showCompleteCallModal, setShowCompleteCallModal] = useState(false);
  const [selectedLeadForCallback, setSelectedLeadForCallback] = useState(null);
  const [showScheduleCallbackModal, setShowScheduleCallbackModal] = useState(false);

  // Modal handlers
  const handleViewLead = (leadId) => {
    setSelectedLeadId(leadId);
    setShowDetailModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLeadForEdit(lead);
    setShowEditModal(true);
  };

  const handleEditSave = (updated) => {
    updateLead(updated);
    showNotification("Lead updated successfully", "success");
    setShowEditModal(false);
  };

  const handleUpdateStatus = (leadId) => {
    const lead = leads.find((l) => l._id === leadId);
    setSelectedLeadForStatus(lead);
    setShowStatusModal(true);
  };

  const handleDeleteClick = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leadToDelete) return;

    try {
      await api.delete(`/leads/${leadToDelete._id}`);
      deleteSingleLead(leadToDelete._id);
      showNotification("Lead deleted successfully", "success");
    } catch (error) {
      showNotification(
        error.response?.data?.error || "Failed to delete lead",
        "error",
      );
    } finally {
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
    }
  };

  const handleStatusUpdateSuccess = (updated) => {
    updateLead(updated);
    showNotification("Lead status updated successfully", "success");
    setShowStatusModal(false);
  };

  const handleCompleteCall = (lead) => {
    setSelectedLeadForCompleteCall(lead);
    setShowCompleteCallModal(true);
  };

  const handleCompleteCallSuccess = (result) => {
    updateLead(result.lead);
    showNotification("Call completed successfully", "success");
    setShowCompleteCallModal(false);
    setSelectedLeadForCompleteCall(null);
  };

  const handleScheduleCallback = (lead) => {
    setSelectedLeadForCallback(lead);
    setShowScheduleCallbackModal(true);
  };

  const handleScheduleCallbackSuccess = (updated) => {
    updateLead(updated);
    showNotification("Callback scheduled successfully", "success");
    setShowScheduleCallbackModal(false);
    setSelectedLeadForCallback(null);
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(leads.map((lead) => lead._id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (leadId) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedRows(newSelection);
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) {
      showNotification("Please select leads to delete", "error");
      return;
    }
    setLeadToDelete({ _id: "bulk", count: selectedRows.size });
    setShowDeleteConfirm(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(
        Array.from(selectedRows).map((leadId) =>
          api.delete(`/leads/${leadId}`),
        ),
      );
      deleteMultipleLeads(selectedRows);
      setSelectedRows(new Set());
      showNotification(
        `${selectedRows.size} lead(s) deleted successfully`,
        "success",
      );
    } catch (error) {
      showNotification("Failed to delete some leads", "error");
    } finally {
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
    }
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
      "City",
      "State",
      "Status",
      "Created At",
    ];
    const rows = leads.map((lead) => [
      lead.businessName || "",
      lead.phoneNumber || "",
      lead.email || "",
      lead.city || "",
      lead.state || "",
      lead.status || "",
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification("Leads exported successfully", "success");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Pagination calculation
  const totalLeads = pagination.total || leads.length;
  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;
  const pageSize = pagination.limit || 20;
  const startLead = (currentPage - 1) * pageSize + 1;
  const endLead = Math.min(currentPage * pageSize, totalLeads);

  const nextPendingLeadId = leads.find((l) => l.status === "pending")?._id;

  return (
    <>
      <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mt-6 border border-slate-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-primary-500">Leads</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1 truncate">
              {selectedRows.size > 0
                ? `${selectedRows.size} selected of ${totalLeads} total`
                : `Showing ${startLead}-${endLead} of ${totalLeads} leads`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {selectedRows.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="px-3 md:px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-600 text-white rounded-lg transition font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 whitespace-nowrap"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Delete ({selectedRows.size})</span>
                <span className="sm:hidden">({selectedRows.size})</span>
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={isLoading || leads.length === 0}
              className="px-3 md:px-4 py-2 bg-secondary-600 hover:bg-secondary-700 disabled:bg-slate-600 text-white rounded-lg transition font-semibold text-xs md:text-sm flex items-center gap-1 md:gap-2 whitespace-nowrap"
              title="Export as CSV"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-slate-700/50 text-xs md:text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <select
              value={filters.status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-slate-700/50 appearance-none cursor-pointer text-xs md:text-sm"
            >
              <option value="">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Size */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-slate-400 text-sm">
              Show
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => changePageSize(parseInt(e.target.value))}
              disabled={isLoading}
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm focus:outline-none focus:border-cyan-500 disabled:bg-slate-700/50"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-slate-400 text-sm">per page</span>
          </div>
          <div className="text-slate-400 text-sm">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-700/50">
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === leads.length && leads.length > 0
                    }
                    onChange={handleSelectAll}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-600 text-cyan-500 cursor-pointer"
                  />
                </th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">
                  Business Name
                </th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">
                  Phone
                </th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">
                  Email
                </th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">
                  Location
                </th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">
                  Status
                </th>
                <th className="text-center py-3 px-3 text-cyan-400 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className={`border-b transition ${
                    selectedRows.has(lead._id)
                      ? "bg-cyan-900/30 border-slate-700/50"
                      : lead._id === nextPendingLeadId
                      ? "bg-emerald-900/20 border-l-off border-emerald-500/50 shadow-[inset_4px_0_0_0_rgba(16,185,129,0.5)]"
                      : "hover:bg-slate-700/30 border-slate-700/50"
                  }`}
                >
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(lead._id)}
                      onChange={() => handleSelectRow(lead._id)}
                      disabled={isLoading}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-600 text-cyan-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 px-3 text-slate-200 max-w-xs truncate font-medium">
                    <div className="flex items-center gap-2">
                      <span>{lead.businessName || "—"}</span>
                      {lead._id === nextPendingLeadId && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          Next up
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-mono text-xs">
                    {lead.phoneNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-xs truncate max-w-xs">
                    {lead.email || "—"}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-xs">
                    {lead.city
                      ? `${lead.city}${lead.state ? ", " + lead.state : ""}`
                      : "—"}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize inline-block cursor-pointer transition hover:opacity-80 ${
                        lead.status === "pending"
                          ? "bg-slate-700 text-cyan-400"
                          : lead.status === "dialing"
                            ? "bg-yellow-900/50 text-yellow-400"
                            : lead.status === "connected"
                              ? "bg-emerald-900/50 text-emerald-400"
                              : lead.status === "failed"
                                ? "bg-rose-900/50 text-rose-400"
                                : lead.status === "completed"
                                  ? "bg-blue-900/50 text-blue-400"
                                  : "bg-slate-700 text-slate-400"
                      }`}
                      onClick={() => handleUpdateStatus(lead._id)}
                      title="Click to update status"
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleViewLead(lead._id)}
                        disabled={isLoading}
                        className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 transition cursor-pointer p-1 hover:bg-slate-600/30 rounded"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditLead(lead)}
                        disabled={isLoading}
                        className="text-blue-400 hover:text-blue-300 disabled:text-slate-600 transition cursor-pointer p-1 hover:bg-slate-600/30 rounded"
                        title="Edit notes & disposition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCompleteCall(lead)}
                        disabled={isLoading}
                        className="text-green-400 hover:text-green-300 disabled:text-slate-600 transition cursor-pointer p-1 hover:bg-slate-600/30 rounded"
                        title="Complete call"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleScheduleCallback(lead)}
                        disabled={isLoading}
                        className="text-purple-400 hover:text-purple-300 disabled:text-slate-600 transition cursor-pointer p-1 hover:bg-slate-600/30 rounded"
                        title="Schedule callback"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(lead._id)}
                        disabled={isLoading}
                        className="text-emerald-400 hover:text-emerald-300 disabled:text-slate-600 transition cursor-pointer p-1 hover:bg-slate-600/30 rounded"
                        title="Update call status"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(lead)}
                        disabled={isLoading}
                        className="text-rose-400 hover:text-rose-300 disabled:text-slate-600 transition cursor-pointer p-1 hover:bg-slate-600/30 rounded"
                        title="Delete lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {leads.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-slate-400 text-base">No leads found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={isLoading || currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:text-slate-600 text-slate-100 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  const distance = Math.abs(page - currentPage);
                  return distance <= 1 || page === 1 || page === totalPages;
                })
                .map((page, idx, arr) => (
                  <div key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="text-slate-500">...</span>
                    )}
                    <button
                      onClick={() => changePage(page)}
                      disabled={isLoading}
                      className={`px-3 py-1 rounded transition ${
                        page === currentPage
                          ? "bg-cyan-600 text-white font-semibold"
                          : "bg-slate-700 text-slate-100 hover:bg-slate-600"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={isLoading || currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:text-slate-600 text-slate-100 rounded-lg transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <LeadDetailModal
        isOpen={showDetailModal}
        leadId={selectedLeadId}
        onClose={() => setShowDetailModal(false)}
        onStatusUpdate={handleUpdateStatus}
        onEditLead={(lead) => {
          setShowDetailModal(false);
          handleEditLead(lead);
        }}
        onLeadDeleted={() => {
          deleteSingleLead(selectedLeadId);
          setShowDetailModal(false);
        }}
      />

      <EditLeadModal
        isOpen={showEditModal}
        lead={selectedLeadForEdit}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLeadForEdit(null);
        }}
        onSave={handleEditSave}
        onLeadDeleted={() => {
          deleteSingleLead(selectedLeadForEdit?._id);
          setShowEditModal(false);
          setSelectedLeadForEdit(null);
        }}
      />

      <UpdateLeadStatusModal
        isOpen={showStatusModal}
        lead={selectedLeadForStatus}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedLeadForStatus(null);
        }}
        onSuccess={handleStatusUpdateSuccess}
        onError={(error) => showNotification(error, "error")}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={leadToDelete?._id === "bulk" ? "Delete Leads" : "Delete Lead"}
        message={
          leadToDelete?._id === "bulk"
            ? `Are you sure you want to delete ${leadToDelete?.count} selected lead(s)? This action cannot be undone.`
            : `Are you sure you want to delete ${leadToDelete?.businessName || leadToDelete?.phoneNumber}?`
        }
        onConfirm={
          leadToDelete?._id === "bulk"
            ? handleBulkDeleteConfirm
            : handleDeleteConfirm
        }
        onCancel={() => {
          setShowDeleteConfirm(false);
          setLeadToDelete(null);
        }}
        danger
      />

      <CompleteCallModal
        isOpen={showCompleteCallModal}
        lead={selectedLeadForCompleteCall}
        onClose={() => {
          setShowCompleteCallModal(false);
          setSelectedLeadForCompleteCall(null);
        }}
        onSuccess={handleCompleteCallSuccess}
        onError={(error) => showNotification(error, "error")}
      />

      <ScheduleCallbackModal
        isOpen={showScheduleCallbackModal}
        lead={selectedLeadForCallback}
        onClose={() => {
          setShowScheduleCallbackModal(false);
          setSelectedLeadForCallback(null);
        }}
        onSuccess={handleScheduleCallbackSuccess}
        onError={(error) => showNotification(error, "error")}
      />
    </>
  );
}
