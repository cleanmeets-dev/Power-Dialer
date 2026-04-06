import { useState } from "react";
import { LogOut, Users, UserPlus, Menu, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isManager as checkIsManager } from "../utils/roleUtils";
import AdminCreateUserModal from "./AdminCreateUserModal";
import AgentListModal from "./modals/AgentListModal.jsx";
import api from "../services/api.js";

export default function Navbar({
  user,
  onLogout,
  onShowNotification,
  onToggleSidebar,
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAuth();
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAgentListModal, setShowAgentListModal] = useState(false);
  const isManager = checkIsManager(user?.role);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleUserCreated = (message) => {
    setShowCreateUserModal(false);
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      await api.delete(`/auth/agents/${agentId}`);
      onShowNotification?.("Agent deleted successfully", "success");
      setShowAgentListModal(false);
    } catch (error) {
      console.error("Failed to delete agent:", error);
      onShowNotification?.("Failed to delete agent", "error");
    }
  };

  return (
    <>
      <nav className="dark:bg-linear-to-r dark:from-slate-900 dark:to-slate-800 bg-linear-to-r from-slate-50 to-slate-100 dark:border-b dark:border-slate-700 border-b border-slate-200 sticky top-0 z-40 shadow-md dark:shadow-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="md:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg transition"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Logo Section */}
            <div className="flex items-center gap-3 shrink-0">
              {theme === "dark" ? (
                <img
                  src={"/logo-text-white.png"}
                  alt="CleanMeets Logo"
                  className="h-12 w-auto transform-gpu scale-150 origin-left"
                />
              ) : (
                <img
                  src={"/logo-text.png"}
                  alt="CleanMeets Logo"
                  className="h-11 w-auto transform-gpu scale-200 origin-left"
                />
              )}
              {isManager && (
                <span className="text-xs font-semibold px-2 py-1 bg-secondary-500/20 dark:bg-secondary-500/20 text-secondary-600 dark:text-secondary-400 rounded-full">
                  Manager
                </span>
              )}
            </div>

            {/* Manager Actions & User Menu */}
            <div className="flex items-center gap-2 ml-auto">
              {isManager && (
                <>
                  <button
                    onClick={() => setShowAgentListModal(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-secondary-500/20 dark:bg-secondary-500/20 text-secondary-600 dark:text-secondary-400 rounded-lg hover:bg-secondary-500/30 dark:hover:bg-secondary-500/40 transition text-sm cursor-pointer"
                    title="View agents"
                  >
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Agents</span>
                  </button>
                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="flex items-center gap-1 px-3 py-2 bg-secondary-500/20 dark:bg-secondary-500/20 text-secondary-500 dark:text-secondary-400 rounded-lg hover:bg-secondary-500/30 dark:hover:bg-secondary-500/40 transition text-sm cursor-pointer"
                    title="Create new user"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add User</span>
                  </button>
                </>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg transition text-slate-700 dark:text-slate-300"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {user?.email}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700/50 rounded-lg transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
