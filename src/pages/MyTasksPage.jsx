import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ClipboardList } from "lucide-react";
import TodoInputPanel from "../components/TodoInputPanel";
import TodoList from "../components/TodoList";

function getTodoStorageKey(user) {
  const userIdentifier = user?._id; 
  return `crm_todos_${userIdentifier}`;
}

export default function MyTasksPage() {
  const { showNotification } = useOutletContext() || {};
  const { user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  // 1️⃣ LOAD TODOS (safe hydration)
  useEffect(() => {
    if (!user?._id) return;

    const key = getTodoStorageKey(user);

    try {
      const saved = localStorage.getItem(key);

      if (saved) {
        setTodos(JSON.parse(saved));
      } else {
        setTodos([]);
      }
    } catch (err) {
      console.error("Failed to load tasks", err);
      setTodos([]);
    }

    setIsHydrated(true);
  }, [user]);

  // 2️⃣ SAVE TODOS (only after hydration)
  useEffect(() => {
    if (!user?._id || !isHydrated) return;

    const key = getTodoStorageKey(user);

    try {
      localStorage.setItem(key, JSON.stringify(todos));
    } catch (err) {
      console.error("Failed to save tasks", err);
    }
  }, [todos, user, isHydrated]);

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;

  // 3️⃣ ADD TODO
  const addTodo = () => {
    if (!todoInput.trim()) return;

    const newTodo = {
      id: crypto.randomUUID(),
      text: todoInput.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setTodoInput("");
    showNotification?.("Task added", "success");
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTodo();
    }
  };

  // 4️⃣ TOGGLE TODO
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  // 5️⃣ DELETE TODO
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    showNotification?.("Task deleted", "success");
  };

  // 5.1️⃣ EDIT TODO
  const editTodo = (id, newText) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
    showNotification?.("Task updated", "success");
  };

  // 6️⃣ CLEAR COMPLETED
  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
    showNotification?.("Completed tasks removed", "success");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-r from-cyan-500 to-blue-500 rounded p-2">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              My Tasks
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track daily tasks and clear completed work.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <TodoInputPanel
          todoInput={todoInput}
          setTodoInput={setTodoInput}
          onInputKeyDown={onInputKeyDown}
          addTodo={addTodo}
          completedCount={completedCount}
          pendingCount={pendingCount}
          todos={todos}
          clearCompleted={clearCompleted}
        />

        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          editTodo={editTodo}
        />
      </div>
    </div>
  );
}