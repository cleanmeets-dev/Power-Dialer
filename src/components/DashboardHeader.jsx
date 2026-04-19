import React from "react";
import { LayoutGrid } from "lucide-react";

export default function DashboardHeader({ managerView, role }) {
  return (
    <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-3">
          <LayoutGrid className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {managerView ? `${role} Dashboard` : 'Agent Dashboard'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {managerView
              ? 'Track live agent shift metrics and daily call activity.'
              : 'Welcome to your agent dashboard! Access the dialers from the sidebar.'}
          </p>
        </div>
      </div>
    </div>
  );
}
