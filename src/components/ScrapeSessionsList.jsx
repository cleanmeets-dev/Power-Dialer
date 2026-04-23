import { Trash2, Loader2 } from "lucide-react";
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
}) {
  return (
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
