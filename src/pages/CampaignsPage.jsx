import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Plus, Edit2, Trash2, TrendingUp } from "lucide-react";
import api, { getCampaigns } from "../services/api";
import { isManager as checkIsManager, getRoleHomeRoute } from "../utils/roleUtils";
import CreateCampaignModal from "../components/modals/CreateCampaignModal";
import EditCampaignModal from "../components/modals/EditCampaignModal";
import { useAuth } from "../hooks/useAuth";

export default function CampaignsPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (user && !checkIsManager(user?.role)) {
      showNotification(
        "You do not have permission to access this page",
        "error",
      );
      const roleHome = getRoleHomeRoute(user?.role);
      navigate(roleHome);
    }
  }, [user, navigate, showNotification]);

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const response = await getCampaigns();
      setCampaigns(Array.isArray(response) ? response : []);
    } catch (error) {
      showNotification("Failed to load campaigns", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadCampaigns();
    setShowCreateModal(false);
    showNotification("Campaign created successfully", "success");
  };

  const handleEditClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    loadCampaigns();
    setShowEditModal(false);
    showNotification("Campaign updated successfully", "success");
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this campaign?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await api.delete(`/campaigns/${id}`);

      // Remove campaign from UI immediately
      setCampaigns((prev) => prev.filter((c) => c._id !== id));

      showNotification("Campaign deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showNotification("Failed to delete campaign", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your calling campaigns</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign._id}
            className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-primary-400">
                {campaign.name}
              </h3>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    campaign.status === "active"
                      ? "bg-emerald-900/50 text-emerald-400"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {campaign.status}
                </span>
              </div>

              {/* <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Leads:</span>
                <span className="text-slate-900 dark:text-primary-400 font-semibold">
                  {campaign.totalLeads || 0}
                </span>
              </div> */}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(campaign)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded transition text-sm cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>

              <button
                disabled={deletingId === campaign._id}
                onClick={() => handleDelete(campaign._id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded transition text-sm disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {deletingId === campaign._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No campaigns yet</p>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create First Campaign
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditCampaignModal
        isOpen={showEditModal}
        campaign={selectedCampaign}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCampaign(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
