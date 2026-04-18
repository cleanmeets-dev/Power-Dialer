import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isManager } from '../utils/roleUtils';
import { getDailyAgentCallCounts } from '../services/api';
import useWebSocket from '../hooks/useWebSocket';
import DashboardHeader from '../components/DashboardHeader';
import AgentCallStatsPanel from '../components/AgentCallStatsPanel';
import TodoInputPanel from '../components/TodoInputPanel';
import TodoList from '../components/TodoList';

function getTodoStorageKey(user) {
  const userIdentifier = user?._id || user?.email || 'anonymous';
  return `crm.todos.${userIdentifier}`;
}

export default function OverviewPage() {
  const { showNotification } = useOutletContext();
  const { user } = useAuth();
  const managerView = isManager(user?.role);

  const [todoInput, setTodoInput] = useState('');
  const [todos, setTodos] = useState([]);
  const [windowHours] = useState(12);
  const [selectedDate, setSelectedDate] = useState('');
  const [dailyCallData, setDailyCallData] = useState({
    windowHours: 12,
    windowStart: null,
    windowEnd: null,
    agents: [],
    summary: { totalAgents: 0, activeAgents: 0, totalCalls: 0 },
  });
  const [isDailyCallsLoading, setIsDailyCallsLoading] = useState(false);
  const [dailyCallsError, setDailyCallsError] = useState('');

  const storageKey = useMemo(() => getTodoStorageKey(user), [user]);

  useWebSocket({
    onAgentCallCompleted: () => {
      if (managerView) {
        loadDailyCallCounts();
      }
    },
    onCallCompleted: () => {
      if (managerView) {
        // Debounce or just load to capture manually logged calls and single-dialer calls
        loadDailyCallCounts();
      }
    }
  });

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

  const loadDailyCallCounts = async () => {
    if (!managerView) return;

    try {
      setIsDailyCallsLoading(true);
      setDailyCallsError('');
      const result = await getDailyAgentCallCounts(windowHours, selectedDate || null);
      setDailyCallData(result);
    } catch (error) {
      console.error('Failed to load daily call counts:', error);
      setDailyCallsError('Failed to load daily agent call counts');
      showNotification?.('Failed to load daily agent call counts', 'error');
    } finally {
      setIsDailyCallsLoading(false);
    }
  };

  useEffect(() => {
    if (!managerView) return;
    loadDailyCallCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerView, windowHours, selectedDate]);

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

  // Utility for max date (today, local timezone)
  const maxDate = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <DashboardHeader managerView={managerView} />
      {managerView && (
        <AgentCallStatsPanel
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isDailyCallsLoading={isDailyCallsLoading}
          loadDailyCallCounts={loadDailyCallCounts}
          dailyCallData={dailyCallData}
          dailyCallsError={dailyCallsError}
          maxDate={maxDate}
        />
      )}
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
        />
      </div>
    </div>
  );
}
