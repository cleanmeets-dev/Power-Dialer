import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Download,
  LoaderCircle,
  MapPinned,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
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
  strictLocation: true,
};

const STATUS_STYLES = {
  running: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  error: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

function formatSessionLabel(session) {
  return `${session.businessType} in ${session.location}`;
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function normalizeExportPhone(phone) {
  if (!phone) return "";

  const normalized = String(phone)
    .normalize("NFKC")
    .replace(/^\uFEFF/, "")
    .replace(/^'+/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Extract the first likely phone-like segment and drop stray icon/mojibake chars.
  const phoneLikeMatch = normalized.match(/\+?\d[\d\s().-]{6,}\d/);
  const candidate = phoneLikeMatch ? phoneLikeMatch[0] : normalized;

  return candidate
    .replace(/[^\d+().\-\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getProgressValue(session) {
  return Number.isFinite(Number(session?.progressPercent))
    ? Math.max(0, Math.min(100, Number(session.progressPercent)))
    : 0;
}

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

  const canImport = Boolean(selectedSessionId) && results.length > 0 && selectedCampaignId && selectedAgentId;
  const hasRunningSessions = sessions.some((session) => session.status === "running");

  const stats = useMemo(() => {
    return {
      totalResults: results.length,
      withPhone: results.filter((item) => item.phone).length,
      withWebsite: results.filter((item) => item.website).length,
      rated: results.filter((item) => item.rating).length,
    };
  }, [results]);

  const loadReferenceData = async () => {
    try {
      const [campaignData, agentData] = await Promise.all([getCampaigns(), getAllAgents()]);
      const normalizedCampaigns = Array.isArray(campaignData) ? campaignData : campaignData?.data || [];
      setCampaigns(normalizedCampaigns);
      setAgents(agentData || []);

      if (!selectedCampaignId && normalizedCampaigns.length) {
        setSelectedCampaignId(normalizedCampaigns[0]._id);
      }
      if (!selectedAgentId && agentData?.length) {
        setSelectedAgentId(agentData[0]._id);
      }
    } catch (error) {
      console.error("Failed to load scraper reference data:", error);
      showNotification?.("Failed to load campaigns or agents", "error");
    }
  };

  const loadSessions = async (preferredSessionId = null, options = {}) => {
    const { silent = false } = options;

    try {
      if (!silent) {
        setIsLoadingSessions(true);
      }
      const sessionList = await getScrapeSessions();
      setSessions(sessionList);

      const nextSelected =
        preferredSessionId ||
        selectedSessionId ||
        sessionList[0]?._id ||
        null;

      if (nextSelected) {
        setSelectedSessionId(nextSelected);
      }
    } catch (error) {
      console.error("Failed to load scrape sessions:", error);
      showNotification?.("Failed to load scrape sessions", "error");
    } finally {
      if (!silent) {
        setIsLoadingSessions(false);
      }
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

  useEffect(() => {
    if (!hasRunningSessions) {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        await loadSessions(selectedSessionId, { silent: true });
      } catch (error) {
        console.error("Failed to refresh running scrape sessions:", error);
      }
    }, 2500);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRunningSessions, selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId || selectedSession?.status !== "running") {
      return undefined;
    }

    const interval = window.setInterval(async () => {
      try {
        const latestSession = await getScrapeSession(selectedSessionId);
        setSelectedSession(latestSession);
        setSessions((previous) =>
          previous.map((session) =>
            session._id === latestSession._id ? { ...session, ...latestSession } : session,
          ),
        );

        const latestResults = await getScrapeSessionResults(selectedSessionId);
        setResults(latestResults.results || []);

        if (latestSession.status !== "running") {
          window.clearInterval(interval);
          await loadSessions(selectedSessionId);
          await loadSessionResults(selectedSessionId);
          if (latestSession.status === "done") {
            showNotification?.(`Scrape complete. ${latestSession.totalFound || 0} results collected.`, "success");
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
        strictLocation: Boolean(form.strictLocation),
      });

      setForm((previous) => ({ ...previous, businessType: "", location: "" }));
      setSelectedSessionId(response.sessionId);
      await loadSessions(response.sessionId);
      await loadSessionResults(response.sessionId);
      showNotification?.("Scrape job started", "success");
    } catch (error) {
      console.error("Failed to start scrape:", error);
      showNotification?.(error.response?.data?.error || "Failed to start scrape job", "error");
    } finally {
      setIsStarting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedSessionId || !selectedCampaignId || !selectedAgentId) {
      showNotification?.("Select a campaign and agent before importing", "error");
      return;
    }

    try {
      setIsImporting(true);
      const response = await importScrapeSessionResults(selectedSessionId, {
        campaignId: selectedCampaignId,
        agentId: selectedAgentId,
      });

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

    const headers = [
      "name",
      "phone",
      "address",
      "website",
      "mapUrl",
    ];

    const rows = [
      headers.join(","),
      ...results.map((row) =>
        headers
          .map((header) => {
            if (header === "phone") {
              return csvEscape(normalizeExportPhone(row.phone));
            }
            return csvEscape(row[header]);
          })
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
          <div className="flex items-start gap-3">
            <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
              <MapPinned className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Google Maps Scraper</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Run Google Maps lead discovery, review the results, then import qualified businesses straight into a CRM campaign.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadReferenceData();
              void loadSessions(selectedSessionId);
            }}
            className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSessions ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] gap-6">
        <div className="space-y-6">
          <form
            onSubmit={handleStartScrape}
            className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Start New Scrape</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Type</span>
                <input
                  value={form.businessType}
                  onChange={(event) => setForm((previous) => ({ ...previous, businessType: event.target.value }))}
                  placeholder='e.g. "cleaning company"'
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</span>
                <input
                  value={form.location}
                  onChange={(event) => setForm((previous) => ({ ...previous, location: event.target.value }))}
                  placeholder='e.g. "Houston, Texas"'
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Results</span>
                <select
                  value={form.maxResults}
                  onChange={(event) => setForm((previous) => ({ ...previous, maxResults: Number(event.target.value) }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  {[10, 20, 40, 60, 100, 120, 150, 200].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-4 inline-flex items-start gap-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5">
              <input
                type="checkbox"
                checked={Boolean(form.strictLocation)}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    strictLocation: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Strict city match (exclude nearby areas)
              </span>
            </label>

            <div className="mt-5 flex flex-col md:items-center md:justify-between gap-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Scrapes run in the background. You can leave this page open and import available results anytime.
              </p>

              <button
                type="submit"
                disabled={isStarting}
                className="w-full px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-semibold transition inline-flex items-center justify-center gap-2"
              >
                {isStarting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isStarting ? "Starting..." : "Start Scrape"}
              </button>
            </div>
          </form>

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
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
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
              <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 dark:text-white">{formatSessionLabel(selectedSession)}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[selectedSession.status] || STATUS_STYLES.running}`}>
                      {selectedSession.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Created {new Date(selectedSession.createdAt).toLocaleString()} | Requested {selectedSession.maxResults} | Found {selectedSession.totalFound || 0} | Imported {selectedSession.importedCount || 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mode: {selectedSession.strictLocation === false ? "Nearby areas allowed" : "Strict city match"}
                  </p>
                  {selectedSession.status === "done" && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Completed at {selectedSession.completedAt ? new Date(selectedSession.completedAt).toLocaleString() : selectedSession.updatedAt ? new Date(selectedSession.updatedAt).toLocaleString() : "-"}
                      {selectedSession.createdAt && (selectedSession.completedAt || selectedSession.updatedAt) && (
                        (() => {
                          const start = new Date(selectedSession.createdAt);
                          const end = new Date(selectedSession.completedAt || selectedSession.updatedAt);
                          const ms = end - start;
                          if (ms > 0) {
                            const sec = Math.floor(ms / 1000) % 60;
                            const min = Math.floor(ms / 60000) % 60;
                            const hr = Math.floor(ms / 3600000);
                            return ` | Duration: ${hr ? hr + 'h ' : ''}${min ? min + 'm ' : ''}${sec}s`;
                          }
                          return '';
                        })()
                      )}
                    </p>
                  )}
                  {selectedSession.status === "running" ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span>{selectedSession.progressMessage || "Scraping in progress..."}</span>
                        <span>{getProgressValue(selectedSession)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${getProgressValue(selectedSession)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Processed {selectedSession.processedCount || 0} / {selectedSession.maxResults || 0} | Successful {selectedSession.successCount || 0} | Discovered {selectedSession.discoveredCount || 0}
                      </p>
                    </div>
                  ) : null}
                  {selectedSession.error ? (
                    <p className="text-sm text-rose-600 dark:text-rose-300 mt-2">{selectedSession.error}</p>
                  ) : null}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="max-h-[32rem] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-200/70 dark:bg-slate-900/50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Business</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Phone</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Address</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Website</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {isLoadingResults ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                          Loading scrape results...
                        </td>
                      </tr>
                    ) : results.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                          Select a session to review results.
                        </td>
                      </tr>
                    ) : (
                      results.map((row) => (
                        <tr key={row._id} className="bg-white dark:bg-slate-900/20 align-top">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900 dark:text-slate-100">{row.name || "Untitled business"}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{row.phone || "-"}</td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.address || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              {row.website ? (
                                <a
                                  href={row.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-cyan-700 dark:text-cyan-300 hover:underline"
                                >
                                  Website
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400">-</span>
                              )}
                              {row.mapUrl ? (
                                <a
                                  href={row.mapUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300 hover:underline"
                                >
                                  Maps
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import Into CRM</h2>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Campaign</span>
                <select
                  value={selectedCampaignId}
                  onChange={(event) => setSelectedCampaignId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  <option value="">Select a campaign...</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign._id} value={campaign._id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assign Imported Leads To</span>
                <select
                  value={selectedAgentId}
                  onChange={(event) => setSelectedAgentId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                >
                  <option value="">Select an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 p-4 text-sm text-slate-600 dark:text-slate-300">
                Imports skip rows without a business name or phone number, and they also skip duplicates already present in the selected campaign by phone number.
              </div>

              {selectedSession?.status === "running" ? (
                <div className="rounded-lg border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                  This session is still running. Import will include only results discovered so far.
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleImport}
                disabled={!canImport || isImporting}
                className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 text-white font-semibold transition inline-flex items-center justify-center gap-2"
              >
                {isImporting ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isImporting ? "Importing..." : "Import Available Results"}
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Newest scrape jobs appear here.</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[42rem] overflow-auto pr-1">
              {sessions.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-slate-600 dark:text-slate-400">
                  {isLoadingSessions ? "Loading sessions..." : "No scraper sessions yet."}
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`rounded-lg border p-4 transition ${
                      selectedSessionId === session._id
                        ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedSessionId(session._id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{formatSessionLabel(session)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {new Date(session.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[session.status] || STATUS_STYLES.running}`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                        Requested {session.maxResults} | Found {session.totalFound || 0} | Imported {session.importedCount || 0}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {session.strictLocation === false ? "Nearby areas allowed" : "Strict city match"}
                      </p>
                      {session.status === "running" ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                            <span className="truncate">{session.progressMessage || "Scraping in progress..."}</span>
                            <span>{getProgressValue(session)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                              style={{ width: `${getProgressValue(session)}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </button>

                    <div className="mt-3 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(session._id)}
                        className="inline-flex items-center gap-2 text-rose-700 dark:text-rose-300 hover:underline text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
