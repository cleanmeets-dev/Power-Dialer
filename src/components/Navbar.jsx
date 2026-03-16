import { useState } from 'react';
import { LogOut, User, UserPlus, Users, Phone } from 'lucide-react';
import AdminCreateUserModal from './AdminCreateUserModal';
import AgentListModal from './modals/AgentListModal.jsx';
import CallLogsModal from './modals/CallLogsModal.jsx';

export default function Navbar({ user, campaignId, onLogout, onShowNotification }) {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAgentListModal, setShowAgentListModal] = useState(false);
  const [showCallLogsModal, setShowCallLogsModal] = useState(false);
  const isManager = user?.role === 'manager';

  const handleUserCreated = (message) => {
    onShowNotification(message, 'success');
    setShowCreateUserModal(false);
  };

  const handleDeleteAgent = async (agentId) => {
    // In a real app, you'd call deleteAgent API here
    onShowNotification('Agent deletion not yet implemented', 'info');
  };

  return (
    <>
      <nav className="bg-linear-to-r from-slate-800 to-slate-700 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-linear-to-r from-cyan-500 to-blue-500 p-2 rounded">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Power Dialer
                </h1>
                {isManager && (
                  <p className="text-xs text-purple-400 font-semibold">Manager</p>
                )}
              </div>
            </div>

            {/* Manager Actions */}
            {isManager && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCallLogsModal(true)}
                  disabled={!campaignId}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                  title="View call logs"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Calls</span>
                </button>
                <button
                  onClick={() => setShowAgentListModal(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm cursor-pointer"
                  title="Manage agents"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Agents</span>
                </button>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition text-sm cursor-pointer"
                  title="Create new user"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">User</span>
                </button>
              </div>
            )}

            {/* User Info & Logout */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 text-sm">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showCreateUserModal && (
        <AdminCreateUserModal
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={handleUserCreated}
        />
      )}

      <AgentListModal
        isOpen={showAgentListModal}
        onClose={() => setShowAgentListModal(false)}
        onDeleteAgent={handleDeleteAgent}
        onShowNotification={onShowNotification}
      />

      <CallLogsModal
        isOpen={showCallLogsModal}
        campaignId={campaignId}
        onClose={() => setShowCallLogsModal(false)}
      />
    </>
  );
}
