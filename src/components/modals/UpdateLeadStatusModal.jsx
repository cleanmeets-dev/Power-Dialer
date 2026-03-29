import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import FormSelect from '../common/FormSelect.jsx';
import { updateLeadStatus } from '../../services/api.js';
import { Loader } from 'lucide-react';

const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'interested', label: 'Interested' },
  { value: 'not_interested', label: 'Not Interested' },
  { value: 'callback', label: 'Callback' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export default function UpdateLeadStatusModal({ isOpen, lead, onClose, onSuccess, onError }) {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.leadStatus || 'new');
    }
  }, [lead, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;

    setIsLoading(true);
    try {
      const updated = await updateLeadStatus(lead._id, status);
      onSuccess?.(updated);
      onClose();
    } catch (error) {
      onError?.(error.response?.data?.error || 'Failed to update lead status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Lead Status - ${lead?.businessName || 'N/A'}`} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-2">Phone Number</p>
          <p className="text-white font-medium">{lead?.phoneNumber}</p>
        </div>

        <FormSelect
          label="New Lead Status"
          name="leadStatus"
          options={LEAD_STATUS_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        />

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || status === lead?.leadStatus}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            Update Status
          </button>
        </div>
      </form>
    </Modal>
  );
}
