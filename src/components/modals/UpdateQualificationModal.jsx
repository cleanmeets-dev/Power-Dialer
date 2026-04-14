import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import FormSelect from '../common/FormSelect.jsx';
import { updateQualificationStatus } from '../../services/api.js';
import { Loader } from 'lucide-react';

const QUALIFICATION_OPTIONS = [
  { value: 'qualified-level-1', label: 'Qualified Level 1' },
  { value: 'qualified-level-2', label: 'Qualified Level 2' },
  { value: 'qualified-level-3', label: 'Qualified Level 3' },
  { value: 'disqualified', label: 'Disqualified' },
  { value: 'in-process', label: 'In Process' },
  { value: 'reschedule', label: 'Reschedule' },
  { value: 'onhold', label: 'On Hold' },
];

export default function UpdateQualificationModal({ isOpen, lead, onClose, onSuccess, onError }) {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.appointmentStatus || 'in-process');
    }
  }, [lead, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) return;

    setIsLoading(true);
    try {
      const updated = await updateQualificationStatus(lead._id, status);
      onSuccess?.(updated);
      onClose();
    } catch (error) {
      onError?.(error.response?.data?.error || 'Failed to update qualification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Qualification - ${lead?.businessName || 'N/A'}`} maxWidth="max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Phone Number</p>
          <p className="text-slate-900 dark:text-white font-medium">{lead?.phoneNumber}</p>
        </div>

        <FormSelect
          label="Appointment Status"
          name="appointmentStatus"
          options={QUALIFICATION_OPTIONS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
        />

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || status === lead?.appointmentStatus}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            Save Qualification
          </button>
        </div>
      </form>
    </Modal>
  );
}
