// AutoDialerPage.jsx
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAutoDialer } from "../hooks/useAutoDialer";
import SmartCampaignSelector from "../components/SmartCampaignSelector";
import { LeadsProvider } from "../context/LeadsContext";
import LeadsTable from "../components/LeadsTable";
import { PhoneCall, Phone, Square } from "lucide-react";
import SelectCampaignMsg from "../components/common/SelectCampaignMsg";

export default function AutoDialerPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const {
    isDialing,
    callActive,
    currentLead,
    lastError,
    callHistory,
    startDialer,
    stopDialer,
  } = useAutoDialer(selectedCampaignId, user?._id);

  const handleStartAutoDialer = async () => {
    try {
      await startDialer();
      showNotification("Auto-dialer started", "success");
    } catch (err) {
      showNotification("Failed to start auto-dialer: " + err.message, "error");
    }
  };

  const handleStopAutoDialer = async () => {
    try {
      await stopDialer();
      showNotification("Auto-dialer stopped", "success");
    } catch (err) {
      showNotification("Failed to stop auto-dialer: " + err.message, "error");
    }
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
              Auto Dialer
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
                {lastError && (
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded border border-rose-200 dark:border-rose-800">
                    <p className="text-sm text-rose-700 dark:text-rose-300">
                      Last dial error
                    </p>
                    <p className="text-rose-900 dark:text-rose-100 font-medium">
                      {lastError}
                    </p>
                  </div>
                )}

                {/* Current Lead Info */}
                {currentLead && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Current Lead From Backend
                    </p>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {currentLead.businessName || currentLead.contactName || "Unknown"} -{" "}
                      {currentLead.phoneNumber || "No phone number"}
                    </p>
                  </div>
                )}

                {/* Call Status */}
                {callActive && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800 flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Call in progress
                      </p>
                      <p className="text-green-900 dark:text-green-100 font-medium">
                        Dialing {currentLead?.businessName || currentLead?.contactName || "lead"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Controls */}
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
                      {isDialing ? "Active" : "Idle"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Leads Queue */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-4 px-1">
                Campaign Queue
              </h2>
              <LeadsTable showNotification={showNotification} />
            </div>
          </LeadsProvider>
        )}

        {!selectedCampaignId && <SelectCampaignMsg />}
      </div>
    </div>
  );
}
