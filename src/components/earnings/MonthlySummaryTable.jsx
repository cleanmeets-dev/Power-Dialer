import { Wallet } from "lucide-react";

export default function MonthlySummaryTable({ monthlyData }) {
  return (
    <div className="overflow-x-auto">
      {monthlyData.length > 0 ? (
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 font-medium">Month</th>
              <th className="px-6 py-4 font-medium">Total Qualifications</th>
              <th className="px-6 py-4 font-medium">Total Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {monthlyData.map((row) => (
              <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                  {row._id}
                </td>
                <td className="px-6 py-4">{row.totalQualifications} leads</td>
                <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                  Rs {row.totalEarnings?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          <Wallet className="mx-auto mb-3 h-10 w-10 opacity-50" />
          No monthly earnings history found.
        </div>
      )}
    </div>
  );
}
