import { Download, Calendar as CalendarIcon } from 'lucide-react';

export default function AttendanceHeader({ canExport, isLoading, hasLogs, onExport }) {
  return (
    <div className="backdrop-blur-md bg-white/70 dark:bg-slate-900/60 rounded-2xl shadow-sm p-6 border border-slate-200/50 dark:border-slate-700/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-cyan-600 dark:text-cyan-400 drop-shadow-xs" />
            Timesheets & Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Historical agent attendance reporting</p>
        </div>
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
  );
}
