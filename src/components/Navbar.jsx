import { useEffect, useState } from "react";
import { LogOut, Users, Menu, Moon, Sun, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isManager as checkIsManager } from "../utils/roleUtils";
import AgentListModal from "./modals/AgentListModal.jsx";
import api, { getPowerHourStatus, startPowerHour, stopPowerHour } from "../services/api.js";

const POWER_HOUR_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240, 300];

const formatRemainingTime = (totalSeconds) => {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function Navbar({
  user,
  onLogout,
  onShowNotification,
  onToggleSidebar,
}) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAuth();
  const [powerHourActive, setPowerHourActive] = useState(false);
  const [isStartingPowerHour, setIsStartingPowerHour] = useState(false);
  const [isStoppingPowerHour, setIsStoppingPowerHour] = useState(false);
  const [selectedPowerHourMinutes, setSelectedPowerHourMinutes] = useState(60);
  const [powerHourEndsAt, setPowerHourEndsAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const isManager = checkIsManager(user?.role);

  useEffect(() => {
    const loadPowerHourStatus = async () => {
      if (!isManager) return;
      try {
        const status = await getPowerHourStatus();
        const isActive = Boolean(status?.isActive);
        const endsAt = status?.session?.endsAt ? new Date(status.session.endsAt) : null;

        setPowerHourActive(isActive);
        setPowerHourEndsAt(isActive ? endsAt : null);

        if (isActive && endsAt) {
          const nextRemaining = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
          setRemainingSeconds(nextRemaining);
        } else {
          setRemainingSeconds(0);
        }
      } catch {
        // Keep navbar resilient if status endpoint fails.
        setPowerHourActive(false);
        setPowerHourEndsAt(null);
        setRemainingSeconds(0);
      }
    };

    loadPowerHourStatus();

    // Keep navbar timer in sync with backend session state.
    const statusPollId = setInterval(loadPowerHourStatus, 30000);
    return () => clearInterval(statusPollId);
  }, [isManager]);

  useEffect(() => {
    if (!powerHourActive || !powerHourEndsAt) {
      setRemainingSeconds(0);
      return undefined;
    }

    const tick = () => {
      const nextRemaining = Math.max(0, Math.floor((powerHourEndsAt.getTime() - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0) {
        setPowerHourActive(false);
        setPowerHourEndsAt(null);
      }
    };

    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [powerHourActive, powerHourEndsAt]);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const handleStartPowerHour = async () => {
    try {
      setIsStartingPowerHour(true);
      const session = await startPowerHour(selectedPowerHourMinutes, "all");
      setPowerHourActive(true);
      const endsAt = session?.endsAt ? new Date(session.endsAt) : null;
      setPowerHourEndsAt(endsAt);
      if (endsAt) {
        const nextRemaining = Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
        setRemainingSeconds(nextRemaining);
      }
      onShowNotification?.(`Power Hour started for all agents (${selectedPowerHourMinutes} min)`, "success");
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to start Power Hour";
      onShowNotification?.(message, "error");
    } finally {
      setIsStartingPowerHour(false);
    }
  };

  const handleStopPowerHour = async () => {
    try {
      setIsStoppingPowerHour(true);
      await stopPowerHour();
      setPowerHourActive(false);
      setPowerHourEndsAt(null);
      setRemainingSeconds(0);
      onShowNotification?.("Power Hour ended manually", "success");
    } catch (error) {
      const message = error?.response?.data?.error || "Failed to stop Power Hour";
      onShowNotification?.(message, "error");
    } finally {
      setIsStoppingPowerHour(false);
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
         
            </div>

            {/* Manager Actions & User Menu */}
            <div className="flex items-center gap-2 ml-auto">
              {isManager && (
                <>
                                    <select
                    value={selectedPowerHourMinutes}
                    onChange={(event) => setSelectedPowerHourMinutes(Number(event.target.value))}
                    disabled={powerHourActive || isStartingPowerHour}
                    className="px-2 py-2 rounded-lg border border-amber-300/60 dark:border-amber-400/30 bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 text-sm disabled:opacity-50"
                    title="Select Power Hour duration"
                  >
                    {POWER_HOUR_DURATION_OPTIONS.map((minutes) => (
                      <option key={minutes} value={minutes}>{minutes} min</option>
                    ))}
                  </select>
                  {!powerHourActive && (
                    <button
                      onClick={handleStartPowerHour}
                      disabled={isStartingPowerHour || isStoppingPowerHour}
                      className="flex items-center gap-1 px-3 py-2 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-500/30 transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Start Power Hour for all agents"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {isStartingPowerHour ? "Starting..." : "Start Power Hour"}
                      </span>
                    </button>
                  )}
                  {powerHourActive && (
                    <button
                      onClick={handleStopPowerHour}
                      disabled={isStoppingPowerHour || isStartingPowerHour}
                      className="flex items-center gap-1 px-3 py-2 bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded-lg hover:bg-rose-500/30 transition text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="End Power Hour manually"
                    >
                      <span className="hidden sm:inline">
                        {isStoppingPowerHour ? "Ending..." : "End Power Hour"}
                      </span>
                    </button>
                  )}
                  {powerHourActive && (
                    <div
                      className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-semibold"
                      title="Power Hour countdown"
                    >
                      {formatRemainingTime(remainingSeconds)}
                    </div>
                  )}
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

      </>
  );
}
