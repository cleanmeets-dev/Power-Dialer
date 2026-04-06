import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, Circle, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function getTodoStorageKey(user) {
  const userIdentifier = user?._id || user?.email || 'anonymous';
  return `crm.todos.${userIdentifier}`;
}

export default function OverviewPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();

  const [todoInput, setTodoInput] = useState('');
  const [todos, setTodos] = useState([]);

  const storageKey = useMemo(() => getTodoStorageKey(user), [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setTodos([]);
        return;
      }

      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setTodos(parsed);
      } else {
        setTodos([]);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      setTodos([]);
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }, [todos, storageKey]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const pendingCount = todos.length - completedCount;

  const addTodo = () => {
    const text = todoInput.trim();
    if (!text) {
      showNotification?.('Please enter a task first', 'error');
      return;
    }

    const newTodo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setTodoInput('');
    showNotification?.('Task added', 'success');
  };

  const onInputKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTodo();
    }
  };

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    showNotification?.('Task deleted', 'success');
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
    showNotification?.('Completed tasks removed', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Track daily agent tasks and clear completed work.</p>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row gap-3 mb-5">
          <input
            type="text"
            value={todoInput}
            onChange={(event) => setTodoInput(event.target.value)}
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

        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="py-12 text-center rounded-lg bg-slate-100 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-300 font-medium">No tasks yet</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Add your first task to get started.</p>
            </div>
          ) : (
            todos.map((todo) => (
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
            ))
          )}
        </div>
      </div>

    </div>
  );
}
