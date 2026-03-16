import { useState } from 'react';
import { Trash2, Eye, Edit3, CheckCircle, Search, Filter, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { deleteLead } from '../services/api';
import LeadDetailModal from './modals/LeadDetailModal.jsx';
import EditLeadModal from './modals/EditLeadModal.jsx';
import UpdateLeadStatusModal from './modals/UpdateLeadStatusModal.jsx';
import ConfirmModal from './common/ConfirmModal.jsx';

const STATUSES = ['pending', 'dialing', 'connected', 'completed', 'failed'];

export default function LeadsTable({
  leads,
  isLoading,
  pagination = {},
  onLeadDeleted,
  onLeadUpdated,
  onShowNotification,
  onChangePage,
  onChangePageSize,
  onSearchLeads,
  onFilterByStatus,
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleViewLead = (leadId) => {
    setSelectedLeadId(leadId);
    setShowDetailModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLeadForEdit(lead);
    setShowEditModal(true);
  };

  const handleEditSave = (updated) => {
    onLeadUpdated?.(updated);
    onShowNotification?.('Lead updated successfully', 'success');
    setShowEditModal(false);
  };

  const handleUpdateStatus = (leadId) => {
    const lead = leads.find(l => l._id === leadId);
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
      await deleteLead(leadToDelete._id);
      onLeadDeleted?.(leadToDelete._id);
      onShowNotification?.('Lead deleted successfully', 'success');
    } catch (error) {
      onShowNotification?.(error.response?.data?.error || 'Failed to delete lead', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
    }
  };

  const handleStatusUpdateSuccess = (updated) => {
    onLeadUpdated?.(updated);
    onShowNotification?.('Lead status updated successfully', 'success');
    setShowStatusModal(false);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(new Set(leads.map(lead => lead._id)));
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
      onShowNotification?.('Please select leads to delete', 'error');
      return;
    }
    setLeadToDelete({ _id: 'bulk', count: selectedRows.size });
    setShowDeleteConfirm(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await Promise.all(
        Array.from(selectedRows).map(leadId => deleteLead(leadId))
      );
      Array.from(selectedRows).forEach(leadId => onLeadDeleted?.(leadId));
      setSelectedRows(new Set());
      onShowNotification?.(`${selectedRows.size} lead(s) deleted successfully`, 'success');
    } catch (error) {
      onShowNotification?.('Failed to delete some leads', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setLeadToDelete(null);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearchLeads?.(term);
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    onFilterByStatus?.(status);
  };

  const handlePageSizeChange = (e) => {
    onChangePageSize?.(parseInt(e.target.value));
  };

  const handleExport = () => {
    if (leads.length === 0) {
      onShowNotification?.('No leads to export', 'error');
      return;
    }

    const headers = ['Business Name', 'Phone', 'Email', 'City', 'State', 'Status', 'Created At'];
    const rows = leads.map(lead => [
      lead.businessName || '',
      lead.phoneNumber || '',
      lead.email || '',
      lead.city || '',
      lead.state || '',
      lead.status || '',
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    onShowNotification?.('Leads exported successfully', 'success');
  };

  const totalLeads = pagination.total || leads.length;
  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;
  const pageSize = pagination.limit || 20;

  return (
    <>
      <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mt-6 border border-slate-700">
        {/* Header with Title and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">Leads</h2>
            <p className="text-slate-400 text-sm mt-1">
              Showing {selectedRows.size > 0
                ? `${selectedRows.size} selected of ${totalLeads} total`
                : `${totalLeads} lead${totalLeads !== 1 ? 's' : ''}`} out of {pagination.total} leads
            </p>
          </div>
          <div className="flex gap-2">
            {selectedRows.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-600 text-white rounded-lg transition font-semibold text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedRows.size})
              </button>
            )}
            <button
              onClick={handleExport}
              disabled={isLoading || leads.length === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition font-semibold text-sm flex items-center gap-2"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by business name, phone, or city..."
              value={searchTerm}
              onChange={handleSearch}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-700/50"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-700/50 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-slate-400 text-sm">
              Show
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
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
                    checked={selectedRows.size === leads.length && leads.length > 0}
                    onChange={handleSelectAll}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-600 text-cyan-500 cursor-pointer"
                  />
                </th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">Business Name</th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">Phone</th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">Email</th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">Location</th>
                <th className="text-left py-3 px-3 text-cyan-400 font-semibold">Status</th>
                <th className="text-center py-3 px-3 text-cyan-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  className={`border-b border-slate-700/50 transition ${
                    selectedRows.has(lead._id)
                      ? 'bg-cyan-900/30'
                      : 'hover:bg-slate-700/30'
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
                    {lead.businessName || '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-mono text-xs">
                    {lead.phoneNumber}
                  </td>
                  <td className="py-3 px-3 text-slate-300 text-xs truncate max-w-xs">
                    {lead.email || '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-xs">
                    {lead.city ? `${lead.city}${lead.state ? ', ' + lead.state : ''}` : '—'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize inline-block cursor-pointer transition hover:opacity-80 ${
                        lead.status === 'pending'
                          ? 'bg-slate-700 text-cyan-400'
                          : lead.status === 'dialing'
                          ? 'bg-yellow-900/50 text-yellow-400'
                          : lead.status === 'connected'
                          ? 'bg-emerald-900/50 text-emerald-400'
                          : lead.status === 'failed'
                          ? 'bg-rose-900/50 text-rose-400'
                          : lead.status === 'completed'
                          ? 'bg-blue-900/50 text-blue-400'
                          : 'bg-slate-700 text-slate-400'
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <button
              onClick={() => onChangePage?.(currentPage - 1)}
              disabled={isLoading || currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 disabled:text-slate-600 text-slate-100 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const distance = Math.abs(page - currentPage);
                  return distance <= 1 || page === 1 || page === totalPages;
                })
                .map((page, idx, arr) => (
                  <div key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="text-slate-500">...</span>
                    )}
                    <button
                      onClick={() => onChangePage?.(page)}
                      disabled={isLoading}
                      className={`px-3 py-1 rounded transition ${
                        page === currentPage
                          ? 'bg-cyan-600 text-white font-semibold'
                          : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => onChangePage?.(currentPage + 1)}
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
          onLeadDeleted?.(selectedLeadId);
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
          onLeadDeleted?.(selectedLeadForEdit?._id);
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
        onError={(error) => onShowNotification?.(error, 'error')}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={leadToDelete?._id === 'bulk' ? 'Delete Leads' : 'Delete Lead'}
        message={
          leadToDelete?._id === 'bulk'
            ? `Are you sure you want to delete ${leadToDelete?.count} selected lead(s)? This action cannot be undone.`
            : `Are you sure you want to delete ${leadToDelete?.businessName || leadToDelete?.phoneNumber}?`
        }
        onConfirm={leadToDelete?._id === 'bulk' ? handleBulkDeleteConfirm : handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setLeadToDelete(null);
        }}
        danger
      />
    </>
  );
}
