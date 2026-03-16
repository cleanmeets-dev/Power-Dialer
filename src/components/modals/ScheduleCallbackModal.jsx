import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import { scheduleCallback } from '../../services/api.js';
import { Loader, Calendar } from 'lucide-react';

export default function ScheduleCallbackModal({
  isOpen,
  lead,
  onClose,
  onSuccess,
  onError,
}) {
  const [followUpDate, setFollowUpDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFollowUpDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lead) {
      onError?.('Lead is required');
      return;
    }

    if (!followUpDate) {
      onError?.('Follow-up date is required');
      return;
    }

    const selectedDate = new Date(followUpDate);
    if (selectedDate <= new Date()) {
      onError?.('Follow-up date must be in the future');
      return;
    }

    setIsLoading(true);
    try {
      const result = await scheduleCallback(lead._id, selectedDate.toISOString());
      onSuccess?.(result);
      onClose();
      setFollowUpDate('');
    } catch (error) {
      onError?.(error.response?.data?.error || 'Failed to schedule callback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule Callback - ${lead?.businessName || 'N/A'}`}
      maxWidth="max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Lead Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div>
            <p className="text-xs text-slate-400 uppercase">Phone</p>
            <p className="text-white font-medium text-sm">{lead?.phoneNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase">Business</p>
            <p className="text-white font-medium text-sm">{lead?.businessName}</p>
          </div>
        </div>

        {/* Follow-up Date & Time */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Follow-up Date & Time *
          </label>
          <input
            type="datetime-local"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-xs text-slate-400 mt-1">
            Must be in the future
          </p>
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 The lead will be automatically re-dialed at the scheduled time if the callback scheduler is active.
          </p>
        </div>

        {/* Submit Buttons */}
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
            disabled={isLoading || !followUpDate}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            Schedule Callback
          </button>
        </div>
      </form>
    </Modal>
  );
}
