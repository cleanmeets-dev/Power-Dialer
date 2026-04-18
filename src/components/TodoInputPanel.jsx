import React from "react";
import { Plus } from "lucide-react";

export default function TodoInputPanel({ todoInput, setTodoInput, onInputKeyDown, addTodo, completedCount, pendingCount, todos, clearCompleted }) {
  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <input
          type="text"
          value={todoInput}
          onChange={event => setTodoInput(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Add a task (e.g., Call follow-up leads from Campaign A)"
          className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-100 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">Total</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{todos.length}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">Pending</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400">Completed</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{completedCount}</p>
        </div>
        <button
          onClick={clearCompleted}
          disabled={completedCount === 0}
          className="rounded-lg p-3 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/60 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Clear Completed
        </button>
      </div>
    </div>
  );
}
