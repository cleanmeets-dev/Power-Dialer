import { useState } from 'react';
import { LogOut, User, UserPlus } from 'lucide-react';
import AdminCreateUserModal from './AdminCreateUserModal';

export default function Navbar({ user, onLogout, onShowNotification }) {
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const isManager = user?.role === 'manager';

  const handleUserCreated = (message) => {
    onShowNotification(message, 'success');
    setShowCreateUserModal(false);
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Power Dialer
                </h1>
                {isManager && (
                  <p className="text-xs text-purple-400 font-semibold">Manager</p>
                )}
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* Manager Create User Button */}
              {isManager && (
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
                  title="Create new user"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-semibold">New User</span>
                </button>
              )}

              {/* User Info */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
                <User className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-300 text-sm">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <AdminCreateUserModal
          onClose={() => setShowCreateUserModal(false)}
          onSuccess={handleUserCreated}
        />
      )}
    </>
  );
}
