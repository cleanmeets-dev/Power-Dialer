import React from "react";
import { ClipboardList } from "lucide-react";

export default function DashboardHeader({ managerView }) {
  return (
    <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
          <ClipboardList className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {managerView ? 'Manager Dashboard' : 'My Tasks'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {managerView
              ? 'Track agent daily call activity and manage your task list.'
              : 'Track daily agent tasks and clear completed work.'}
          </p>
        </div>
      </div>
    </div>
  );
}
