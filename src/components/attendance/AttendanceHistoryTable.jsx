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
    <div className="backdrop-blur-md bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm">
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
              <th className="px-6 py-5 font-semibold">Date</th>
              <th className="px-6 py-5 font-semibold">Agent</th>
              <th className="px-6 py-5 font-semibold">Check In</th>
              <th className="px-6 py-5 font-semibold">Check Out</th>
              <th className="px-6 py-5 font-semibold">Net Worked Time</th>
              <th className="px-6 py-5 font-semibold text-center">Hours Bal.</th>
              <th className="px-6 py-5 font-semibold text-center">Breaks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center text-slate-500 font-medium tracking-wide">
                  <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-cyan-500 rounded-full animate-spin mx-auto mb-3"></div>
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
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-200">{formatDateKey(log.dateKey)}</div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
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
                      {log.isHalfDay ? (
                        <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400">Half-day</span>
                      ) : log.isLate ? (
                        <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Late</span>
                      ) : null}
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
                    {log.lostHours > 0 ? (
                       <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">-{log.lostHours.toFixed(2)}h</span>
                    ) : log.compensationHours > 0 ? (
                       <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+{log.compensationHours.toFixed(2)}h</span>
                    ) : (
                       <span className="text-xs font-medium text-slate-400">—</span>
                    )}
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
