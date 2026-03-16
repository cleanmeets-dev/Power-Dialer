import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import { updateLead } from '../../services/api.js';
import { Save, X, AlertCircle } from 'lucide-react';

const DISPOSITIONS = [
  { value: 'interested', label: 'Interested' },
  { value: 'not-interested', label: 'Not Interested' },
  { value: 'callback', label: 'Callback' },
  { value: 'wrong-number', label: 'Wrong Number' },
  { value: 'no-answer', label: 'No Answer' },
  { value: 'do-not-call', label: 'Do Not Call' },
];

export default function EditLeadModal({ isOpen, lead, onClose, onSave }) {
  const [formData, setFormData] = useState({
    notes: '',
    lastDialedNotes: '',
    disposition: '',
    followUpDate: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      setFormData({
        notes: lead.notes || '',
        lastDialedNotes: lead.lastDialedNotes || '',
        disposition: lead.disposition || '',
        followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '',
      });
    }
  }, [lead, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const updated = await updateLead(lead._id, {
        notes: formData.notes,
        lastDialedNotes: formData.lastDialedNotes,
        disposition: formData.disposition || undefined,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
      });
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update lead');
    } finally {
      setIsLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Lead Details" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}

        {/* Disposition */}
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            Call Disposition
          </label>
          <select
            name="disposition"
            value={formData.disposition}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition disabled:opacity-50"
          >
            <option value="">Select Disposition...</option>
            {DISPOSITIONS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Initial Notes */}
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            Notes (Before Call)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes about this lead..."
            disabled={isLoading}
            rows="3"
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition disabled:opacity-50 resize-none"
          />
        </div>

        {/* Last Dialed Notes */}
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            Call Notes (After Dialing)
          </label>
          <textarea
            name="lastDialedNotes"
            value={formData.lastDialedNotes}
            onChange={handleChange}
            placeholder="Notes from the last call..."
            disabled={isLoading}
            rows="3"
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition disabled:opacity-50 resize-none"
          />
        </div>

        {/* Follow-up Date */}
        <div>
          <label className="block text-slate-300 text-sm font-semibold mb-2">
            Schedule Follow-up (Optional)
          </label>
          <input
            type="date"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 outline-none transition disabled:opacity-50"
          />
          {formData.followUpDate && (
            <p className="text-xs text-slate-400 mt-1">
              Follow-up scheduled for {new Date(formData.followUpDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
