import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Calendar as CalendarIcon, Clock, Coffee, CheckCircle, Search, User } from 'lucide-react';
import { getAttendanceHistory, getAllAgents } from '../services/api';

export default function AttendanceHistoryPage() {
  const { showNotification } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [agentsList, setAgentsList] = useState([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load agents for the dropdown once
      if (agentsList.length === 0) {
        const agents = await getAllAgents();
        setAgentsList(agents || []);
      }
      let start, end;
      const today = new Date();
      
      if (dateRange === 'today') {
        start = new Date(today.setHours(0,0,0,0)).toISOString();
        end = new Date(today.setHours(23,59,59,999)).toISOString();
      } else if (dateRange === '7days') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString();
        end = new Date().toISOString();
      } else if (dateRange === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = d.toISOString();
        end = new Date().toISOString();
      } else if (dateRange === 'custom' && customStart && customEnd) {
        start = new Date(customStart).toISOString();
        end = new Date(new Date(customEnd).setHours(23,59,59,999)).toISOString();
      }

      if (start && end) {
        const data = await getAttendanceHistory(start, end);
        setLogs(data || []);
      }
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
      showNotification('Failed to load timesheets', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (dateRange !== 'custom' || (dateRange === 'custom' && customStart && customEnd)) {
      loadData();
    }
  }, [dateRange, customStart, customEnd]);

  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDurationMs = (ms) => {
    if (!ms || ms <= 0) return '0h 0m';
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showNotification('No data to export', 'error');
      return;
    }

    const headers = ['Date', 'Agent Name', 'Email', 'Check In', 'Check Out', 'Total Shift (excluding breaks)', 'Break Time', 'Breaks Taken'];
    const csvRows = filteredLogs.map(log => [
      log.dateKey,
      log.agent?.name || 'Unknown',
      log.agent?.email || '',
      formatTime(log.checkInAt),
      formatTime(log.checkOutAt) || (log.status === 'checked-in' ? 'Still working...' : '—'),
      formatDurationMs(log.shiftDurationMs),
      formatDurationMs(log.totalBreakMs),
      log.breaksTaken || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheets-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Timesheets exported successfully', 'success');
  };

  const filteredLogs = logs.filter(log => {
    // 1. Search term
    const matchesSearch = log.agent?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.agent?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Agent filter dropdown
    let matchesAgent = true;
    if (agentFilter !== 'all') {
      matchesAgent = log.agent?._id === agentFilter;
    }

    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-cyan-700 dark:text-cyan-400" />
              Timesheets & Logs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Historical agent attendance reporting</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={isLoading || filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition font-semibold"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search agents by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Agents</option>
            {agentsList.map(agent => (
              <option key={agent._id} value={agent._id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="w-full md:w-auto">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full md:w-48 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-xl dark:shadow-slate-900/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Agent</th>
                <th className="px-6 py-4 font-semibold">Check In</th>
                <th className="px-6 py-4 font-semibold">Check Out</th>
                <th className="px-6 py-4 font-semibold">Net Worked Time</th>
                <th className="px-6 py-4 font-semibold text-center">Breaks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading timesheets...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-600 dark:text-slate-400">
                    No attendance records found for this date range.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-100 dark:hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200">{formatDate(log.dateKey)}</div>
                      <div className="text-xs text-slate-500">
                        Status: <span className="capitalize">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full hidden sm:block">
                          <User className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">{log.agent?.name || 'Unknown Agent'}</p>
                          <p className="text-xs text-slate-500">{log.agent?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{formatTime(log.checkInAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-rose-400" />
                        <span className={!log.checkOutAt ? "text-cyan-700 dark:text-cyan-400 italic font-medium text-xs" : ""}>
                          {log.checkOutAt ? formatTime(log.checkOutAt) : 'Still active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded font-semibold text-sm border border-cyan-800">
                        {formatDurationMs(log.shiftDurationMs)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-1 text-yellow-400 font-medium bg-yellow-900/20 px-2 py-0.5 rounded text-xs mb-1">
                          <Coffee className="w-3 h-3" />
                          {formatDurationMs(log.totalBreakMs)}
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {log.breaksTaken} breaks
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
