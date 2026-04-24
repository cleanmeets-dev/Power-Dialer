import React, { useState, useMemo, useEffect } from "react";
import { Trash2, Loader2, ChevronDown } from "lucide-react";
import { formatSessionLabel, getProgressValue } from "../utils/scraperUtils";

const STATUS_STYLES = {
  queued:  "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  running: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  done:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  error:   "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function ScrapeSessionsList({
  sessions,
  selectedSessionId,
  setSelectedSessionId,
  handleDeleteSession,
  handleCancelSession,
  isLoadingSessions,
  isLoadingResults,
  agents = [],
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [datePreset, setDatePreset] = useState("all");
  const [creatorFilter, setCreatorFilter] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filteredSessions = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];

    return sessions.filter((s) => {
      const created = new Date(s.createdAt);

      // SEARCH
      if (debouncedSearch) {
        const q = debouncedSearch;
        const label = (formatSessionLabel(s) || "").toLowerCase();
        const status = (s.status || "").toLowerCase();
        if (!label.includes(q) && !status.includes(q)) return false;
      }

      // DATE PRESET
      if (datePreset !== "all") {
        const now = new Date();

        if (datePreset === "today") {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          if (created < start) return false;
        }

        if (datePreset === "7d") {
          const past = new Date();
          past.setDate(now.getDate() - 7);
          if (created < past) return false;
        }

        if (datePreset === "30d") {
          const past = new Date();
          past.setDate(now.getDate() - 30);
          if (created < past) return false;
        }
      }

      // CREATED BY (manager) filter
      if (creatorFilter && creatorFilter !== "all") {
        const creatorId = creatorFilter;
        const sessionCreatorId = s?.createdBy?._id || s?.createdBy;
        if (!sessionCreatorId) return false;
        if (String(sessionCreatorId) !== String(creatorId)) return false;
      }

      return true;
    });
  }, [sessions, debouncedSearch, datePreset, creatorFilter]);

  const managers = useMemo(() => {
    const found = agents.filter((a) => (a?.role || "").toString().toLowerCase() === "manager");
    return found.length ? found : agents;
  }, [agents]);

  useEffect(() => {    
    if (selectedSessionId && !filteredSessions.some((s) => s._id === selectedSessionId)) {
      setSelectedSessionId?.(null);
    }
  }, [filteredSessions, selectedSessionId, setSelectedSessionId]);

  const formatAgentLabel = (a) => {
    if (!a) return "";
    // common string fields
    if (typeof a.name === "string") return a.name;
    if (typeof a.fullName === "string") return a.fullName;
    // name may be an object with parts
    if (a.name && typeof a.name === "object") {
      const n = a.name;
      const parts = [n.first, n.firstName, n.givenName, n.last, n.lastName, n.familyName].filter(Boolean);
      if (parts.length) return parts.join(" ");
      try {
        return JSON.stringify(n);
      } catch (e) {
        return String(a._id || a.id || a.email || "");
      }
    }
    // fallback to other common fields
    if (a.firstName || a.lastName) return `${a.firstName || ""} ${a.lastName || ""}`.trim();
    if (a.email) return a.email;
    return String(a._id || a.id || "");
  };

  return (
    <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
      <div className="mb-4 space-y-3">

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Newest scrape jobs appear here.</p>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
            className="flex-1 min-w-[180px] text-sm px-3 py-2 border rounded-md bg-white dark:bg-slate-900/20 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-primary-400 outline-none"
          />

          {/* Date Preset Dropdown */}
          <div className="relative inline-block">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="text-sm pr-8 pl-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-600 appearance-none"
            >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>

            {/* Created By (Managers) Dropdown */}
            <div className="relative inline-block">
              <select
                value={creatorFilter}
                onChange={(e) => setCreatorFilter(e.target.value)}
                className="text-sm pr-8 pl-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:focus:ring-cyan-600 appearance-none"
              >
                <option value="all">All creators</option>
                {managers.map((m) => (
                  <option key={m._id || m.id} value={m._id || m.id}>{formatAgentLabel(m)}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            </div>

          {/* Clear */}
          {(search || datePreset !== "all" || creatorFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setDatePreset("all");
                setCreatorFilter("all");
              }}
              className="text-sm text-slate-500 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}

        </div>
      </div>
      <div className="space-y-3 max-h-[42rem] overflow-auto pr-1">
        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-slate-600 dark:text-slate-400">
            {isLoadingSessions ? "Loading sessions..." : "No scraper sessions yet."}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-slate-600 dark:text-slate-400">
            No sessions match the current filters.
          </div>
        ) : (
          filteredSessions.map((session) => (
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
                {selectedSessionId === session._id && isLoadingResults ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-300" />
                      <p className="font-semibold text-slate-900 dark:text-white">Loading...</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[session.status] || STATUS_STYLES.running}`}>
                      {session.status}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{formatSessionLabel(session)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(session.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">By {session?.createdBy.name}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[session.status] || STATUS_STYLES.running}`}>
                      {session.status}
                    </span>
                  </div>
                )}
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                  Requested {session.maxResults} | Skipped {session.skipResults || 0} | Found {session.totalFound || 0} | Imported {session.importedCount || 0}
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
                <div className="flex items-center gap-3">
                  {session.status === "running" && (
                    <button
                      type="button"
                      onClick={() => handleCancelSession?.(session._id)}
                      className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:underline text-sm"
                    >
                      Stop
                    </button>
                  )}

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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
