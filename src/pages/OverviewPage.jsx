
export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <h1 className="text-3xl font-bold text-primary-500">Dashboard</h1>
        <p className="text-slate-400 mt-2">Your call center overview</p>
      </div>
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <p className="text-slate-400 mt-2">Nothing to show here for now!</p>
      </div>

      {/* <DashboardStats/> */}
    </div>
  );
}
