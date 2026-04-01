import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { getVisibleFields } from '../../utils/leadFieldConfig.js';
import Modal from '../common/Modal.jsx';
import { getLead } from '../../services/api.js';
import { Phone, Mail, MapPin, Calendar, Clock, CheckCircle, XCircle, FileText, AlertCircle, Briefcase, Edit3, ListChecks } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'bg-cyan-500/20 text-cyan-400',
  dialing: 'bg-yellow-500/20 text-yellow-400',
  connected: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-rose-500/20 text-rose-400',
  completed: 'bg-blue-500/20 text-blue-400',
  new: 'bg-slate-500/20 text-slate-300',
  contacted: 'bg-blue-500/20 text-blue-400',
  interested: 'bg-emerald-500/20 text-emerald-400',
  not_interested: 'bg-rose-500/20 text-rose-400',
  callback: 'bg-yellow-500/20 text-yellow-400',
  converted: 'bg-emerald-600/20 text-emerald-300',
  closed: 'bg-slate-600/20 text-slate-300',
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
  const { user } = useAuth();
  const visibleFields = getVisibleFields(user?.role);
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

  // Group fields by category
  const commonFields = visibleFields.filter(f => ['businessName', 'contactName', 'phoneNumber', 'email', 'businessAddress', 'city', 'state', 'country'].includes(f.key));
  const roleSpecificFields = visibleFields.filter(f => !f.key.startsWith('dialerStatus') && !f.key.startsWith('leadStatus') && !f.key.startsWith('disposition') && !f.key.startsWith('callNotes') && !f.key.startsWith('generalNotes') && !f.key.startsWith('followUpDate') && !commonFields.some(cf => cf.key === f.key));
  const statusFields = visibleFields.filter(f => ['dialerStatus', 'leadStatus', 'disposition', 'callNotes', 'generalNotes', 'followUpDate'].includes(f.key));

  const renderFieldValue = (key, value) => {
    if (!value) return '—';
    if (key.includes('Date') || key.includes('date')) {
      return typeof value === 'string' ? new Date(value).toLocaleDateString() : '—';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lead.businessName || 'Lead Details'} maxWidth="max-w-4xl">
      {/* Status & Disposition Badges */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize block ${STATUS_COLORS[lead.dialerStatus] || 'bg-slate-600 text-slate-300'}`}>
            {lead.dialerStatus}
          </span>
          <p className="text-xs text-slate-500 mt-1">Dialer Status</p>
        </div>
        {lead.leadStatus && (
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize block ${STATUS_COLORS[lead.leadStatus] || 'bg-slate-600 text-slate-300'}`}>
              {lead.leadStatus}
            </span>
            <p className="text-xs text-slate-500 mt-1">Lead Status</p>
          </div>
        )}
        {lead.disposition && (
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize block ${DISPOSITION_COLORS[lead.disposition] || 'bg-slate-600 text-slate-300'}`}>
              {lead.disposition}
            </span>
            <p className="text-xs text-slate-500 mt-1">Disposition</p>
          </div>
        )}
      </div>

      {/* Fields Grid - Role-based */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-2">
        {visibleFields.map((field) => {
          const value = lead[field.key];
          if (!value || (typeof value === 'string' && value.trim() === '')) return null;
          
          return (
            <div key={field.key} className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">{field.label}</p>
              {field.type === 'textarea' ? (
                <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded whitespace-pre-wrap">{renderFieldValue(field.key, value)}</p>
              ) : (
                <p className="text-sm font-medium text-white">{renderFieldValue(field.key, value)}</p>
              )}
            </div>
          );
        })}
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
            Edit
          </button>
        )}
        {onStatusUpdate && (
          <button
            onClick={() => onStatusUpdate?.(lead._id)}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition flex items-center gap-2"
          >
            <ListChecks className="w-4 h-4" />
            Update Status
          </button>
        )}
      </div>
    </Modal>
  );
}
