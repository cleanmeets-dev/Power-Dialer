import React from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";

export default function TodoList({ todos, toggleTodo, deleteTodo }) {
  if (todos.length === 0) {
    return (
      <div className="py-12 text-center rounded-lg bg-slate-100 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700">
        <p className="text-slate-700 dark:text-slate-300 font-medium">No tasks yet</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Add your first task to get started.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center gap-3 rounded-lg px-4 py-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700"
        >
          <button
            onClick={() => toggleTodo(todo.id)}
            className="text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
            title={todo.completed ? 'Mark as pending' : 'Mark as complete'}
          >
            {todo.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p
              className={`truncate ${
                todo.completed
                  ? 'text-slate-500 dark:text-slate-400 line-through'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {todo.text}
            </p>
          </div>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="p-2 rounded hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-700 dark:text-rose-400 transition"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
