import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import FormSelect from '../common/FormSelect.jsx';
import { updateLeadStatus } from '../../services/api.js';
import { Loader } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'dialing', label: 'Dialing' },
  { value: 'connected', label: 'Connected' },
  { value: 'failed', label: 'Failed' },
  { value: 'completed', label: 'Completed' },
];

export default function UpdateLeadStatusModal({ isOpen, lead, onClose, onSuccess, onError }) {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status || 'pending');
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
          label="New Status"
          name="status"
          options={STATUS_OPTIONS}
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
            disabled={isLoading || status === lead?.status}
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
