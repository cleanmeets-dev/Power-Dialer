import { Clock, Coffee, CheckCircle, User } from 'lucide-react';

export default function AttendanceHistoryTable({
  agentFilter,
  isLoading,
  logs,
  onClearAgentFilter,
  formatDateKey,
  formatTime,
  formatDurationMs,
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-xl dark:shadow-slate-900/30">
      {agentFilter !== 'all' && (
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-between">
          <p className="text-sm text-cyan-700 dark:text-cyan-300 font-medium">Showing history for selected agent only</p>
          <button
            type="button"
            onClick={onClearAgentFilter}
            className="text-xs px-3 py-1 rounded border border-cyan-400/50 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-800/40"
          >
            Clear Filter
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Agent</th>
              <th className="px-6 py-4 font-semibold">Check In</th>
              <th className="px-6 py-4 font-semibold">Check Out</th>
              <th className="px-6 py-4 font-semibold">Net Worked Time</th>
              <th className="px-6 py-4 font-semibold text-center">Breaks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading timesheets...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                  No attendance records found for this date range.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-100 dark:hover:bg-slate-700/30 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-200">{formatDateKey(log.dateKey)}</div>
                    <div className="text-xs text-slate-500">
                      Status: <span className="capitalize">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hidden sm:block">
                        <User className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-200">{log.agent?.name || 'Unknown Agent'}</p>
                        <p className="text-xs text-slate-500">{log.agent?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{formatTime(log.checkInAt)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span className={!log.checkOutAt ? 'text-cyan-700 dark:text-cyan-400 italic font-medium text-xs' : ''}>
                        {log.checkOutAt ? formatTime(log.checkOutAt) : 'Still active'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded font-semibold text-sm border border-cyan-800">
                      {formatDurationMs(log.shiftDurationMs)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1 text-yellow-400 font-medium bg-yellow-900/20 px-2 py-0.5 rounded text-xs mb-1">
                        <Coffee className="w-3 h-3" />
                        {formatDurationMs(log.totalBreakMs)}
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        {log.breaksTaken} breaks
                      </span>
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
