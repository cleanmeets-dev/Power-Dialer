import { ArrowUpRight } from "lucide-react";

export default function ScrapeResultsTable({ results, isLoadingResults }) {
  return (
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
  );
}
