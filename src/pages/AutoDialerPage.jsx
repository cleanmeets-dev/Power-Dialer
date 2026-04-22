import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAutoDialer } from "../hooks/useAutoDialer";
import SmartCampaignSelector from "../components/SmartCampaignSelector";
import { LeadsProvider } from "../context/LeadsContext";
import LeadsTable from "../components/LeadsTable";
import { PhoneCall, Phone, Square, AlertCircle, ChevronRight } from "lucide-react";
  const { showNotification } = useOutletContext();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const {
    isDialing,
    callActive,
    currentLead,
    currentLeadIndex,
    leads,
    callHistory,
    error,
    loading,
    startAutoDialer,
    stopAutoDialer,
    skipCall,
  } = useAutoDialer(selectedCampaignId, user?._id);

  useEffect(() => {
    if (error) {
      showNotification(error, "error");
    }
  }, [error, showNotification]);

  const handleStartAutoDialer = async () => {
    try {
      await startAutoDialer();
      showNotification("Auto-dialer started", "success");
    } catch (err) {
      showNotification(`Failed: ${err.message}`, "error");
    }
  };

  const handleStopAutoDialer = async () => {
    try {
      await stopAutoDialer();
      showNotification("Auto-dialer stopped", "success");
    } catch (err) {
      showNotification(`Failed: ${err.message}`, "error");
    }
  };

  const handleNextCall = async () => {
    skipCall();
    showNotification("Moving to next lead...", "info");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
            <PhoneCall className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Zoom Auto Dialer
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Automatic sequential calling with Zoom
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="space-y-4">
        <SmartCampaignSelector
          value={selectedCampaignId}
          onChange={setSelectedCampaignId}
          onShowNotification={showNotification}
          childDialerType="auto"
          childOnly
        />

        {selectedCampaignId && (
          <LeadsProvider campaignId={selectedCampaignId}>
            {/* Control Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="space-y-4">
<<<<<<< Updated upstream
                {lastError && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded border border-rose-200 dark:border-rose-800">
                    <p className="text-sm text-rose-700 dark:text-rose-300">
                      Last dial error
                    </p>
                    <p className="text-rose-900 dark:text-rose-100 font-medium">
                      {lastError}
                    </p>
=======
                {/* Loading State */}
                {loading && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-600 dark:text-blue-300">Loading leads...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-600 dark:text-red-300 font-medium">Error</p>
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
>>>>>>> Stashed changes
                  </div>
                )}

                {/* Current Lead Info */}
<<<<<<< Updated upstream
                {currentLead && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Current Lead From Backend
                    </p>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {currentLead.businessName || currentLead.contactName || "Unknown"} -{" "}
                      {currentLead.phoneNumber || "No phone number"}
=======
                {currentLead && isDialing && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                      Current Lead ({currentLeadIndex + 1} of {leads.length})
                    </p>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mt-1">
                      {currentLead.businessName || currentLead.contactName || "Unknown"}
                    </p>
                    <p className="text-blue-800 dark:text-blue-200 font-mono text-sm">
                      {currentLead.phoneNumber}
>>>>>>> Stashed changes
                    </p>
                  </div>
                )}

                {/* Call Status */}
                {callActive && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800 flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
<<<<<<< Updated upstream
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Call in progress
                      </p>
                      <p className="text-green-900 dark:text-green-100 font-medium">
                        Dialing {currentLead?.businessName || currentLead?.contactName || "lead"}
=======
                    <div className="flex-1">
                      <p className="text-sm text-green-600 dark:text-green-300 font-medium">
                        Call in Progress
                      </p>
                      <p className="text-green-900 dark:text-green-100 text-sm">
                        Zoom window opened — connect with lead
>>>>>>> Stashed changes
                      </p>
                    </div>
                  </div>
                )}

                {/* Controls */}
<<<<<<< Updated upstream
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleStartAutoDialer}
                    disabled={isDialing}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    <Phone className="w-4 h-4" />
                    {isDialing ? "Auto-Dialing..." : "Start Auto Dialer"}
                  </button>

                  <button
                    onClick={handleStopAutoDialer}
                    disabled={!isDialing}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
=======
                <div className="flex flex-wrap gap-3 pt-4">
                  {!isDialing ? (
                    <button
                      onClick={handleStartAutoDialer}
                      disabled={loading || leads.length === 0}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      <Phone className="w-4 h-4" />
                      Start Auto Dialer
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleNextCall}
                        disabled={!callActive}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Next Call
                      </button>

                      <button
                        onClick={handleStopAutoDialer}
                        className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 font-medium transition"
                      >
                        <Square className="w-4 h-4" />
                        Stop
                      </button>
                    </>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Total Leads
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {leads.length}
                    </p>
                  </div>
>>>>>>> Stashed changes
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Calls Completed
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {callHistory.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Status
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
<<<<<<< Updated upstream
                      {isDialing ? "Active" : "Idle"}
                    </p>
                  </div>
                </div>
=======
                      {isDialing ? "Calling" : "Idle"}
                    </p>
                  </div>
                </div>

                {/* Call History */}
                {callHistory.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-3">
                      Call History
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {callHistory.map((call, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm p-2 bg-slate-100 dark:bg-slate-700 rounded"
                        >
                          <span className="text-slate-600 dark:text-slate-300">
                            {call.leadName}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {call.duration}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
>>>>>>> Stashed changes
              </div>
            </div>

            {/* Leads Queue */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-4 px-1">
                Campaign Queue
              </h2>
              {leads.length > 0 ? (
                <LeadsTable showNotification={showNotification} />
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  {loading ? "Loading leads..." : "No leads available"}
                </div>
              )}
            </div>
          </LeadsProvider>
        )}

        {!selectedCampaignId && <SelectCampaignMsg />}
      </div>
    </div>
  );
}