import { useState } from 'react';
import { LogOut, Users, UserPlus, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isManager as checkIsManager } from '../utils/roleUtils';
import AdminCreateUserModal from './AdminCreateUserModal';
import AgentListModal from './modals/AgentListModal.jsx';
import api from '../services/api.js';

export default function Navbar({ user, onLogout, onShowNotification, onToggleSidebar }) {
  const navigate = useNavigate();
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAgentListModal, setShowAgentListModal] = useState(false);
  const isManager = checkIsManager(user?.role);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleUserCreated = (message) => {
    setShowCreateUserModal(false);
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await api.delete(`/auth/agents/${agentId}`);
      onShowNotification?.('Agent deleted successfully', 'success');
      setShowAgentListModal(false);
    } catch (error) {
      console.error('Failed to delete agent:', error);
      onShowNotification?.('Failed to delete agent', 'error');
    }
  };

  return (
    <>
      <nav className="bg-linear-to-r from-slate-800 to-slate-700 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="md:hidden p-2 hover:bg-slate-700/50 rounded-lg transition"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-linear-to-r from-primary-500 to-secondary-500 p-2 rounded">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  Power Dialer
                </h1>
                {isManager && (
                  <p className="text-xs text-secondary-600 font-semibold">Manager</p>
                )}
              </div>
            </div>

            {/* Manager Actions & User Menu */}
            <div className="flex items-center gap-2 ml-auto">
              {isManager && (
                <>
                  <button
                    onClick={() => setShowAgentListModal(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-secondary-500/20 text-secondary-600 rounded-lg hover:bg-secondary-500/30 transition text-sm cursor-pointer"
                    title="View agents"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Agents</span>
                  </button>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-secondary-500/20 text-secondary-500 rounded-lg hover:bg-secondary-500/30 transition text-sm cursor-pointer"
                    title="Create new user"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add User</span>
                  </button>
                </>
              )}

              {/* User Profile & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-200">{user?.email}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-slate-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AdminCreateUserModal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        onUserCreated={handleUserCreated}
      />
      <AgentListModal
        isOpen={showAgentListModal}
        onClose={() => setShowAgentListModal(false)}
        onDeleteAgent={handleDeleteAgent}
        onShowNotification={onShowNotification}
      />
    </>
  );
}
