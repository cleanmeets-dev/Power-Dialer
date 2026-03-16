import { Clock, Phone, CheckCircle, AlertCircle } from 'lucide-react';

export default function ActiveCalls({ calls, isLoading }) {
  const getStatusIcon = (status) => {
    switch(status) {
      case 'connecting': return <Clock className="w-4 h-4" />;
      case 'connected': return <Phone className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'connecting': return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300';
      case 'connected': return 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300';
      case 'completed': return 'bg-blue-900/30 border-blue-500/50 text-blue-300';
      case 'failed': return 'bg-rose-900/30 border-rose-500/50 text-rose-300';
      default: return 'bg-slate-700/50 border-slate-600 text-slate-300';
    }
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">
        Active Calls ({calls.length})
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {calls.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No active calls</p>
        ) : (
          calls.map((call, idx) => (
            <div
              key={call._id || idx}
              className={`p-3 rounded-lg border transition ${getStatusClass(
                call.outcome || call.status || 'pending'
              )}`}
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(call.outcome || call.status || 'pending')}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {call.lead?.phoneNumber || call.phoneNumber || 'Unknown'}
                  </p>
                  <p className="text-xs capitalize opacity-75">
                    {call.outcome || call.status || 'pending'}
                    {call.duration && ` - ${call.duration}s`}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
