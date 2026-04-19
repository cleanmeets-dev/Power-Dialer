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
    <div className="backdrop-blur-md bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-700/50 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-sm">
      <div className="flex-1 w-full relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search agents by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-colors"
        />
      </div>

      <div className="w-full md:w-auto">
        <select
          value={agentFilter}
          onChange={(e) => onAgentFilterChange(e.target.value)}
          className="w-full md:w-56 px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none font-medium transition-colors"
        >
          <option className="dark:bg-slate-800 font-medium" value="all">All Agents</option>
          {agentsList.map((agent) => (
            <option className="dark:bg-slate-800 font-medium" key={agent._id} value={agent._id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full md:w-auto">
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="w-full md:w-48 px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none font-medium transition-colors"
        >
          <option className="dark:bg-slate-800 font-medium" value="today">Today</option>
          <option className="dark:bg-slate-800 font-medium" value="7days">Last 7 Days</option>
          <option className="dark:bg-slate-800 font-medium" value="30days">Last 30 Days</option>
          <option className="dark:bg-slate-800 font-medium" value="custom">Custom Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-colors"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-200 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-colors"
          />
        </div>
      )}
    </div>
  );
}
