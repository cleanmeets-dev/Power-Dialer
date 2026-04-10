import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { getVisibleFields } from '../../utils/leadFieldConfig.js';
import Modal from '../common/Modal.jsx';
import FormInput from '../common/FormInput.jsx';
import FormSelect from '../common/FormSelect.jsx';
import { updateDisposition, updateLead } from '../../services/api.js';
import { Save, X, AlertCircle } from 'lucide-react';

export default function EditLeadModal({ isOpen, lead, onClose, onSave }) {
  const { user } = useAuth();
  const visibleFields = useMemo(() => getVisibleFields(user?.role), [user?.role]);
  
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      const newFormData = {};
      visibleFields.forEach(field => {
        newFormData[field.key] = lead[field.key] || '';
      });
      setFormData(newFormData);
    }
  }, [lead, isOpen, visibleFields]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const updateData = {};
      
      visibleFields.forEach(field => {
        if (field.key in formData && !field.readOnly) {
          if (user?.role === 'caller-agent' && field.key === 'appointmentStatus') return;
          updateData[field.key] = formData[field.key] || null;
        }
      });

      const updated = user?.role === 'caller-agent'
        ? await updateDisposition(lead._id, updateData)
        : await updateLead(lead._id, updateData);
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update lead');
    } finally {
      setIsLoading(false);
    }
  };

  if (!lead) return null;

  const editableFields = visibleFields.filter((f) => {
    if (f.readOnly) return false;
    if (user?.role === 'caller-agent' && f.key === 'appointmentStatus') return false;
    return true;
  });

  const modalTitle = user?.role === 'caller-agent'
    ? `Edit Disposition - ${lead.businessName || 'N/A'}`
    : `Edit Lead - ${lead.businessName || 'N/A'}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editableFields.map((field) => (
            <div key={field.key}>
              {field.type === 'select' ? (
                <FormSelect
                  label={field.label}
                  name={field.key}
                  value={formData[field.key] || ''}
                  onChange={handleChange}
                  options={field.options ? field.options.map(opt => ({ value: opt, label: opt })) : []}
                />
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name={field.key}
                    checked={formData[field.key] || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary-500"
                  />
                  {field.label}
                </label>
              ) : field.type === 'textarea' ? (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 text-sm font-semibold mb-2">
                    {field.label}
                  </label>
                  <textarea
                    name={field.key}
                    value={formData[field.key] || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                    placeholder={field.label}
                  />
                </div>
              ) : (
                <FormInput
                  label={field.label}
                  name={field.key}
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={handleChange}
                  placeholder={field.label}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : (user?.role === 'caller-agent' ? 'Update Disposition' : 'Save Changes')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
