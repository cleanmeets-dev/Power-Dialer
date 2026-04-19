export default function DetailedLogsTable({
  detailedData,
  isManagerUser,
  pagination,
  setPagination,
}) {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Lead Info</th>
              <th className="px-6 py-4 font-medium">Campaign</th>
              {isManagerUser && <th className="px-6 py-4 font-medium">Agent</th>}
              <th className="px-6 py-4 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {detailedData.length > 0 ? (
              detailedData.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    {new Date(row.earnedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {row.lead?.businessName || "Unknown Lead"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {row.lead?.appointmentStatus || "Qualified"}
                    </p>
                  </td>
                  <td className="px-6 py-4">{row.campaign?.name || "N/A"}</td>
                  {isManagerUser && (
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {row.agent?.name}
                      </p>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    Rs {row.amount?.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isManagerUser ? 5 : 4} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  No detailed transaction logs found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-700">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Showing page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
