import { TrendingUp, PhoneCall, CheckCircle, BarChart3 } from 'lucide-react';

export default function CampaignMetricsDisplay({ campaign }) {
  if (!campaign) return null;

  const successRate = campaign.totalLeads > 0 
    ? Math.round((campaign.connectedCalls / campaign.totalLeads) * 100)
    : 0;

  const dialedRate = campaign.totalLeads > 0
    ? Math.round((campaign.dialedLeads / campaign.totalLeads) * 100)
    : 0;

  const STATUS_COLORS = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  };

  return (
    <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 border border-slate-200 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{campaign.name}</h3>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${STATUS_COLORS[campaign.status] || 'bg-slate-600 text-slate-300 border-slate-600'}`}>
              {campaign.status}
            </span>
            {campaign.totalLeads > 0 && (
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {campaign.dialedLeads} / {campaign.totalLeads} leads dialed
              </span>
            )}
          </div>
        </div>
        <div className="bg-linear-to-r from-primary-500/20 to-secondary-500/20 p-3 rounded-lg border border-primary-500/20">
          <BarChart3 className="w-6 h-6 text-primary-500" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Leads */}
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-300 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-600 transition">
          <div className="text-slate-600 dark:text-slate-400 text-xs uppercase font-semibold mb-2 tracking-wide">
            Total Leads
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{campaign.totalLeads}</span>
            <span className="text-xs text-slate-500">leads</span>
          </div>
        </div>

        {/* Dialed Leads */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-slate-600 transition">
          <div className="text-slate-400 text-xs uppercase font-semibold mb-2 tracking-wide flex items-center gap-1">
            <PhoneCall className="w-3 h-3" /> Dialed
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-primary-500">{campaign.dialedLeads}</span>
            <div className="w-full bg-slate-800 rounded-full h-1">
              <div
                className="bg-linear-to-r from-primary-500 to-secondary-500 h-1 rounded-full transition-all"
                style={{ width: `${dialedRate}%` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400">{dialedRate}% completion</span>
          </div>
        </div>

        {/* Connected Calls */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-slate-600 transition">
          <div className="text-slate-400 text-xs uppercase font-semibold mb-2 tracking-wide flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Connected
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-emerald-400">{campaign.connectedCalls}</span>
            <span className="text-xs text-slate-400">successful calls</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-slate-600 transition">
          <div className="text-slate-400 text-xs uppercase font-semibold mb-2 tracking-wide flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Success Rate
          </div>
          <div className="flex flex-col gap-1">
            <span className={`text-2xl font-bold ${successRate >= 50 ? 'text-emerald-400' : successRate >= 25 ? 'text-yellow-400' : 'text-rose-400'}`}>
              {successRate}%
            </span>
            <span className="text-xs text-slate-400">conversion rate</span>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="bg-slate-700/50 rounded-lg border border-slate-600/50 p-4">
        <h4 className="text-sm font-semibold text-slate-300 mb-4">Campaign Progress</h4>
        
        <div className="space-y-3">
          {/* Total Leads Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Total Leads Distribution</span>
            </div>
            <div className="flex gap-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              {/* Dialed */}
              <div
                className="bg-linear-to-r from-primary-500 to-secondary-500 transition-all"
                style={{ width: `${dialedRate}%` }}
                title={`Dialed: ${campaign.dialedLeads}`}
              />
              {/* Remaining */}
              <div
                className="bg-slate-700"
                style={{ width: `${100 - dialedRate}%` }}
                title={`Remaining: ${campaign.totalLeads - campaign.dialedLeads}`}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Dialed: {campaign.dialedLeads}</span>
              <span>Remaining: {campaign.totalLeads - campaign.dialedLeads}</span>
            </div>
          </div>

          {/* Connected Rate Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">Connection Success</span>
            </div>
            <div className="flex gap-1 h-3 bg-slate-800 rounded-full overflow-hidden">
              {/* Connected */}
              <div
                className="bg-linear-to-r from-emerald-500 to-teal-500 transition-all"
                style={{ width: `${successRate}%` }}
                title={`Connected: ${campaign.connectedCalls}`}
              />
              {/* Not Connected */}
              <div
                className="bg-slate-700"
                style={{ width: `${100 - successRate}%` }}
                title={`Not Connected: ${campaign.dialedLeads - campaign.connectedCalls}`}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Connected: {campaign.connectedCalls}</span>
              <span>Not Connected: {Math.max(0, campaign.dialedLeads - campaign.connectedCalls)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Created</p>
          <p className="text-sm text-slate-300">
            {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide mb-1">Last Updated</p>
          <p className="text-sm text-slate-300">
            {new Date(campaign.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
