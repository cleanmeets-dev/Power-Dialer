import { Download, Calendar as CalendarIcon } from 'lucide-react';

export default function AttendanceHeader({ canExport, isLoading, hasLogs, onExport }) {
  return (
    <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="bg-linear-to-r from-cyan-500 to-blue-500 p-3 rounded-lg">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Timesheets & Logs</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Historical agent attendance reporting</p>
        </div>
        <div className="ml-auto">
          {canExport && (
            <button
              onClick={onExport}
              disabled={isLoading || !hasLogs}
              className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl shadow-md hover:shadow-lg disabled:shadow-none transition-all duration-300 font-bold"
            >
              <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> 
              Export CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
