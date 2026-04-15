import { Search } from 'lucide-react';

export default function AttendanceFilters({
  searchTerm,
  onSearchTermChange,
  agentFilter,
  onAgentFilterChange,
  agentsList,
  dateRange,
  onDateRangeChange,
  customStart,
  onCustomStartChange,
  customEnd,
  onCustomEndChange,
}) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1 w-full relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search agents by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
        />
      </div>

      <div className="w-full md:w-auto">
        <select
          value={agentFilter}
          onChange={(e) => onAgentFilterChange(e.target.value)}
          className="w-full md:w-48 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none"
        >
          <option value="all">All Agents</option>
          {agentsList.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full md:w-auto">
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
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
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
