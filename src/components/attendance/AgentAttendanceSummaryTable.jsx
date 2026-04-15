export default function AgentAttendanceSummaryTable({
  rows,
  selectedAgentId,
  onSelectAgent,
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-xl dark:shadow-slate-900/30">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Present vs Absent By Agent</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Click an agent to filter history below. Counts are shift-days only, excluding Saturday and Sunday.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Agent</th>
              <th className="px-6 py-4 font-semibold">Present</th>
              <th className="px-6 py-4 font-semibold">Absent</th>
              <th className="px-6 py-4 font-semibold">Working Days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-slate-600 dark:text-slate-400">No summary data available for this selection.</td>
              </tr>
            ) : (
              rows.map((item) => (
                <tr
                  key={item.agentId}
                  onClick={() => onSelectAgent(item.agentId)}
                  className={`transition cursor-pointer ${selectedAgentId === item.agentId ? 'bg-cyan-100 dark:bg-cyan-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-700/30'}`}
                  title="Click to view this agent's history"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold">
                      {item.presentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-semibold">
                      {item.absentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{item.workingDays}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
