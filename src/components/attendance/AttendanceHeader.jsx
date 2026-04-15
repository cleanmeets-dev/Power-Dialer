import { Download, Calendar as CalendarIcon } from 'lucide-react';

export default function AttendanceHeader({ canExport, isLoading, hasLogs, onExport }) {
  return (
    <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-cyan-700 dark:text-cyan-400" />
            Timesheets & Logs
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Historical agent attendance reporting</p>
        </div>
        {canExport && (
          <button
            onClick={onExport}
            disabled={isLoading || !hasLogs}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition font-semibold"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>
    </div>
  );
}
