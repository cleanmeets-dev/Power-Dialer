import ScrapeForm from "../components/ScrapeForm";
import ScrapeResultsTable from "../components/ScrapeResultsTable";
import ScrapeImportPanel from "../components/ScrapeImportPanel";
import ScrapeSessionsList from "../components/ScrapeSessionsList";
import { useEffect, useState } from "react";
import { MapPinned, RefreshCw } from "lucide-react";
import {
  formatSessionLabel,
  csvEscape,
  normalizeExportPhone,
  getProgressValue,
} from "../utils/scraperUtils";
import useScraperStats from "../hooks/useScraperStats";
import { useOutletContext } from "react-router-dom";
import {
  deleteScrapeSession,
  getAllAgents,
  getCampaigns,
  getScrapeSession,
  getScrapeSessionResults,
  getScrapeSessions,
  importScrapeSessionResults,
  startScrapeSession,
} from "../services/api";

const DEFAULT_FORM = {
  businessType: "",
  location: "",
  maxResults: 20,
  skipResults: 0,
  strictLocation: true,
};

const STATUS_STYLES = {
  queued:  "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  running: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  done:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  error:   "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function ScraperPage() {
  const { showNotification } = useOutletContext();

  const [form, setForm] = useState(DEFAULT_FORM);
  const [isStarting, setIsStarting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const canImport = Boolean(selectedSessionId) && results.length > 0 && selectedCampaignId;

  // Poll whenever ANY session is queued or running — not just running
  const hasActiveSession = sessions.some(
    (s) => s.status === "running" || s.status === "queued",
  );

  const stats = useScraperStats(results);

  const loadReferenceData = async () => {
    try {
      const [campaignData, agentData] = await Promise.all([getCampaigns(), getAllAgents()]);
      const normalizedCampaigns = Array.isArray(campaignData) ? campaignData : campaignData?.data || [];
      setCampaigns(normalizedCampaigns);
      setAgents(agentData || []);
    } catch (error) {
      console.error("Failed to load scraper reference data:", error);
      showNotification?.("Failed to load campaigns or agents", "error");
    }
  };

  const loadSessions = async (preferredSessionId = null, options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) setIsLoadingSessions(true);
      const sessionList = await getScrapeSessions();
      setSessions(sessionList);
      const nextSelected = preferredSessionId || selectedSessionId || sessionList[0]?._id || null;
      if (nextSelected) setSelectedSessionId(nextSelected);
    } catch (error) {
      console.error("Failed to load scrape sessions:", error);
      showNotification?.("Failed to load scrape sessions", "error");
    } finally {
      if (!silent) setIsLoadingSessions(false);
    }
  };

  const loadSessionResults = async (sessionId) => {
    if (!sessionId) {
      setSelectedSession(null);
      setResults([]);
      return;
    }
    try {
      setIsLoadingResults(true);
      const data = await getScrapeSessionResults(sessionId);
      setSelectedSession(data.session);
      setResults(data.results || []);
    } catch (error) {
      console.error("Failed to load scrape results:", error);
      showNotification?.("Failed to load scrape results", "error");
      setSelectedSession(null);
      setResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  };

  useEffect(() => {
    void loadReferenceData();
    void loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadSessionResults(selectedSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  // Interval 1: Refresh session list while any session is queued or running
  useEffect(() => {
    if (!hasActiveSession) return undefined;

    const interval = window.setInterval(async () => {
      try {
        await loadSessions(selectedSessionId, { silent: true });
      } catch (error) {
        console.error("Failed to refresh active scrape sessions:", error);
      }
    }, 2500);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveSession, selectedSessionId]);

  // Interval 2: Poll selected session detail while it's queued OR running
  useEffect(() => {
    const status = selectedSession?.status;
    if (!selectedSessionId || (status !== "running" && status !== "queued")) {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        const latestSession = await getScrapeSession(selectedSessionId);
        setSelectedSession(latestSession);
        setSessions((prev) =>
          prev.map((s) =>
            s._id === latestSession._id ? { ...s, ...latestSession } : s,
          ),
        );

        // Only fetch results while running (queued sessions have no results yet)
        if (latestSession.status === "running") {
          const latestResults = await getScrapeSessionResults(selectedSessionId);
          setResults(latestResults.results || []);
        }

        if (latestSession.status !== "running" && latestSession.status !== "queued") {
          window.clearInterval(interval);
          await loadSessions(selectedSessionId);
          await loadSessionResults(selectedSessionId);
          if (latestSession.status === "done") {
            showNotification?.(
              `Scrape complete. ${latestSession.totalFound || 0} results collected.`,
              "success",
            );
          } else if (latestSession.status === "error") {
            showNotification?.(latestSession.error || "Scrape failed", "error");
          }
        }
      } catch (error) {
        console.error("Failed to poll scrape session:", error);
      }
    }, 2500);

    return () => window.clearInterval(interval);
  }, [selectedSession?.status, selectedSessionId, showNotification]);

  const handleStartScrape = async (event) => {
    event.preventDefault();
    const businessType = form.businessType.trim();
    const location = form.location.trim();
    if (!businessType || !location) {
      showNotification?.("Business type and location are required", "error");
      return;
    }
    try {
      setIsStarting(true);
      const response = await startScrapeSession({
        businessType,
        location,
        maxResults: Number(form.maxResults),
        skipResults: Number(form.skipResults) || 0,
        strictLocation: Boolean(form.strictLocation),
      });
      setForm((prev) => ({ ...prev, businessType: "", location: "" }));
      setSelectedSessionId(response.sessionId);
      await loadSessions(response.sessionId);
      await loadSessionResults(response.sessionId);
      const msg = response.queuePosition > 1
        ? `Queued at position ${response.queuePosition}`
        : "Scrape job started";
      showNotification?.(msg, "success");
    } catch (error) {
      console.error("Failed to start scrape:", error);
      showNotification?.(error.response?.data?.error || "Failed to start scrape job", "error");
    } finally {
      setIsStarting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedSessionId || !selectedCampaignId) {
      showNotification?.("Select a campaign before importing", "error");
      return;
    }
    try {
      setIsImporting(true);
      const payload = { campaignId: selectedCampaignId };
      if (selectedAgentId) payload.agentId = selectedAgentId;
      const response = await importScrapeSessionResults(selectedSessionId, payload);
      showNotification?.(response.message || "Results imported successfully", "success");
      await loadSessions(selectedSessionId);
      await loadSessionResults(selectedSessionId);
    } catch (error) {
      console.error("Failed to import scrape results:", error);
      showNotification?.(error.response?.data?.error || "Failed to import scrape results", "error");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const confirmed = window.confirm("Delete this scrape session and its stored results?");
    if (!confirmed) return;
    try {
      await deleteScrapeSession(sessionId);
      const fallbackSessionId = sessionId === selectedSessionId ? null : selectedSessionId;
      if (sessionId === selectedSessionId) {
        setSelectedSessionId(null);
        setSelectedSession(null);
        setResults([]);
      }
      await loadSessions(fallbackSessionId);
      showNotification?.("Scrape session deleted", "success");
    } catch (error) {
      console.error("Failed to delete scrape session:", error);
      showNotification?.(error.response?.data?.error || "Failed to delete scrape session", "error");
    }
  };

  const handleExportCsv = () => {
    if (!results.length) return;
    const headers = ["name", "phone", "address", "website", "mapUrl"];
    const rows = [
      headers.join(","),
      ...results.map((row) =>
        headers
          .map((h) => (h === "phone" ? csvEscape(normalizeExportPhone(row.phone)) : csvEscape(row[h])))
          .join(","),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrape-${selectedSessionId || Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
              <MapPinned className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Google Maps Scraper</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Run Google Maps scraper, review the results, then import into CRM campaign.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { void loadReferenceData(); void loadSessions(selectedSessionId); }}
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSessions ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-6">
        <div className="space-y-6">
          <ScrapeForm
            form={form}
            setForm={setForm}
            isStarting={isStarting}
            onSubmit={handleStartScrape}
          />

          <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Scrape Results</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Review what the scraper found before importing anything into the lead queue.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={!results.length}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Results</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalResults}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">With Phone</p>
                <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.withPhone}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">With Website</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{stats.withWebsite}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Rated</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.rated}</p>
              </div>
            </div>

            {selectedSession && (
              <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedSession.businessType} in {selectedSession.location}
                  </p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[selectedSession.status] || STATUS_STYLES.queued}`}>
                    {selectedSession.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Created {new Date(selectedSession.createdAt).toLocaleString()} | Requested {selectedSession.maxResults} | Skipped {selectedSession.skipResults || 0} | Found {selectedSession.totalFound || 0} | Imported {selectedSession.importedCount || 0}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mode: {selectedSession.strictLocation === false ? "Nearby areas allowed" : "Strict city match"}
                </p>

                {selectedSession.status === "done" && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Completed at {selectedSession.completedAt
                      ? new Date(selectedSession.completedAt).toLocaleString()
                      : selectedSession.updatedAt
                      ? new Date(selectedSession.updatedAt).toLocaleString()
                      : "-"}
                    {selectedSession.createdAt && (selectedSession.completedAt || selectedSession.updatedAt) && (() => {
                      const start = new Date(selectedSession.createdAt);
                      const end = new Date(selectedSession.completedAt || selectedSession.updatedAt);
                      const ms = end - start;
                      if (ms > 0) {
                        const sec = Math.floor(ms / 1000) % 60;
                        const min = Math.floor(ms / 60000) % 60;
                        const hr = Math.floor(ms / 3600000);
                        return ` | Duration: ${hr ? hr + "h " : ""}${min ? min + "m " : ""}${sec}s`;
                      }
                      return "";
                    })()}
                  </p>
                )}

                {/* Show progress bar for both queued and running */}
                {(selectedSession.status === "running" || selectedSession.status === "queued") && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span>{selectedSession.progressMessage || "Waiting in queue..."}</span>
                      {selectedSession.status === "running" && (
                        <span>{getProgressValue(selectedSession)}%</span>
                      )}
                    </div>
                    {selectedSession.status === "running" && (
                      <>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${getProgressValue(selectedSession)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Processed {selectedSession.processedCount || 0} / {selectedSession.maxResults || 0} | Successful {selectedSession.successCount || 0} | Discovered {selectedSession.discoveredCount || 0}
                        </p>
                      </>
                    )}
                  </div>
                )}

                {selectedSession.error && (
                  <p className="text-sm text-rose-600 dark:text-rose-300 mt-2">{selectedSession.error}</p>
                )}
              </div>
            )}

            <ScrapeResultsTable results={results} isLoadingResults={isLoadingResults} />
          </div>
        </div>

        <div className="space-y-6">
          <ScrapeImportPanel
            campaigns={campaigns}
            agents={agents}
            selectedCampaignId={selectedCampaignId}
            setSelectedCampaignId={setSelectedCampaignId}
            selectedAgentId={selectedAgentId}
            setSelectedAgentId={setSelectedAgentId}
            canImport={canImport}
            isImporting={isImporting}
            selectedSession={selectedSession}
            handleImport={handleImport}
          />
          <ScrapeSessionsList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            setSelectedSessionId={setSelectedSessionId}
            handleDeleteSession={handleDeleteSession}
            isLoadingSessions={isLoadingSessions}
          />
        </div>
      </div>
    </div>
  );
}