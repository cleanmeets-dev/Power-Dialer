import { useState, useEffect } from 'react';
import Modal from '../common/Modal.jsx';
import FormInput from '../common/FormInput.jsx';
import { updateCampaign } from '../../services/api.js';
import { Loader } from 'lucide-react';

export default function EditCampaignModal({ isOpen, campaign, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({ name: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({ name: campaign.name });
      setErrors({});
    }
  }, [campaign, isOpen]);

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
    if (!campaign) return;

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const updated = await updateCampaign(campaign._id, { name: formData.name.trim() });
      onSuccess?.(updated);
      onClose();
    } catch (error) {
      onError?.(error.response?.data?.error || 'Failed to update campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Campaign">
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
            className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
            Update Campaign
          </button>
        </div>
      </form>
    </Modal>
  );
}
