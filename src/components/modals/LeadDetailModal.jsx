import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { getLead } from '../../services/api.js';
import { Phone, Mail, MapPin, Calendar, Clock, CheckCircle, XCircle, FileText, AlertCircle, Briefcase, Edit3, ListChecks } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-cyan-500/20 text-cyan-400',
  dialing: 'bg-yellow-500/20 text-yellow-400',
  connected: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-rose-500/20 text-rose-400',
  completed: 'bg-blue-500/20 text-blue-400',
};

const DISPOSITION_COLORS = {
  'interested': 'bg-emerald-500/20 text-emerald-400',
  'not-interested': 'bg-rose-500/20 text-rose-400',
  'callback': 'bg-yellow-500/20 text-yellow-400',
  'wrong-number': 'bg-orange-500/20 text-orange-400',
  'no-answer': 'bg-slate-500/20 text-slate-400',
  'do-not-call': 'bg-red-500/20 text-red-400',
};

export default function LeadDetailModal({ isOpen, leadId, onClose, onStatusUpdate, onEditLead }) {
  const [lead, setLead] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && leadId) {
      loadLead();
    }
  }, [isOpen, leadId]);

  const loadLead = async () => {
    setIsLoading(true);
    try {
      const data = await getLead(leadId);
      setLead(data);
    } catch (error) {
      console.error('Failed to load lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Lead Details">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
        </div>
      </Modal>
    );
  }

  if (!lead) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatDateOnly = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead.businessName || 'Lead Details'} maxWidth="max-w-2xl">
      {/* Status & Disposition Badges */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[lead.dialerStatus] || 'bg-slate-600 text-slate-300'}`}>
            Dialer Status: {lead.dialerStatus}
          </span>
        </div>
        {lead.leadStatus && (
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[lead.leadStatus] || 'bg-slate-600 text-slate-300'}`}>
              Lead Status: {lead.leadStatus}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="space-y-5">
        {/* Contact Information */}
        <div>
          <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contact Information
          </h4>
          <div className="space-y-2 pl-6">
            {lead.phoneNumber && (
              <div className="text-white">
                <p className="text-xs text-slate-500">Phone Number</p>
                <p className="font-medium text-cyan-400">{lead.phoneNumber}</p>
              </div>
            )}
            {lead.email && (
              <div className="text-white">
                <p className="text-xs text-slate-500">Email Address</p>
                <p className="font-medium text-cyan-400 break-all">{lead.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Business Information */}
        <div>
          <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Business Information
          </h4>
          <div className="space-y-2 pl-6">
            {lead.businessName && (
              <div className="text-white">
                <p className="text-xs text-slate-500">Business Name</p>
                <p className="font-medium">{lead.businessName}</p>
              </div>
            )}
            {lead.businessAddress && (
              <div className="text-white">
                <p className="text-xs text-slate-500">Street Address</p>
                <p className="font-medium">{lead.businessAddress}</p>
              </div>
            )}
            {(lead.city || lead.state || lead.country) && (
              <div className="text-white">
                <p className="text-xs text-slate-500">Location</p>
                <p className="font-medium">
                  {[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Call History */}
        {lead.lastDialedAt && (
          <div>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Call History
            </h4>
            <div className="space-y-2 pl-6">
              <div className="text-white">
                <p className="text-xs text-slate-500">Last Dialed</p>
                <p className="font-medium">{formatDate(lead.lastDialedAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {(lead.generalNotes || lead.callNotes) && (
          <div>
            <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </h4>
            <div className="space-y-2 pl-6">
              {lead.generalNotes && (
                <div className="text-white">
                  <p className="text-xs text-slate-500">General Notes</p>
                  <p className="font-medium text-slate-300 bg-slate-800/50 p-2 rounded text-sm">{lead.generalNotes}</p>
                </div>
              )}
              {lead.callNotes && (
                <div className="text-white">
                  <p className="text-xs text-slate-500">Call Notes</p>
                  <p className="font-medium text-slate-300 bg-slate-800/50 p-2 rounded text-sm">{lead.callNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Follow-up Schedule */}
        {lead.followUpDate && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-yellow-400 font-semibold uppercase">Follow-up Scheduled</p>
              <p className="text-sm text-yellow-300 font-medium">{formatDateOnly(lead.followUpDate)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-700 flex-wrap">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition flex items-center gap-2"
        >
          Close
        </button>
        {onEditLead && (
          <button
            onClick={() => onEditLead(lead)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Disposition
          </button>
        )}
        <button
          onClick={() => onStatusUpdate?.(lead._id)}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition flex items-center gap-2"
        >
          <ListChecks className="w-4 h-4" />
          Update Call Status
        </button>
      </div>
    </Modal>
  );
}
