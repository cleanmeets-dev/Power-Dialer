import { useState } from 'react';
import Modal from '../common/Modal.jsx';
import FormInput from '../common/FormInput.jsx';
import { createCampaign } from '../../services/api.js';
import { Loader } from 'lucide-react';

export default function CreateCampaignModal({ isOpen, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (formData.name.trim().length < 3) newErrors.name = 'Campaign name must be at least 3 characters';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const campaign = await createCampaign(formData.name.trim());
      onSuccess?.(campaign);
      setFormData({ name: '' });
      setErrors({});
      onClose();
    } catch (error) {
      onError?.(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Campaign">
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Campaign Name"
          name="name"
          placeholder="Enter campaign name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
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
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            Create Campaign
          </button>
        </div>
      </form>
    </Modal>
  );
}
