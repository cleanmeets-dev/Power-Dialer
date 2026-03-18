import { Clock, Phone, CheckCircle, AlertCircle, User } from 'lucide-react';

export default function ActiveCalls({ calls, isLoading }) {
  const getStatusIcon = (status) => {
    const lowerStatus = (status || '').toLowerCase();
    if (lowerStatus.includes('connect')) return <Phone className="w-4 h-4" />;
    if (lowerStatus.includes('fail')) return <AlertCircle className="w-4 h-4" />;
    if (lowerStatus.includes('complet')) return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusClass = (status) => {
    const lowerStatus = (status || '').toLowerCase();
    if (lowerStatus.includes('connect')) return 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300';
    if (lowerStatus.includes('fail')) return 'bg-rose-900/30 border-rose-500/50 text-rose-300';
    if (lowerStatus.includes('complet')) return 'bg-blue-900/30 border-blue-500/50 text-blue-300';
    return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300';
  };

  const getCallDuration = (startTime, endTime) => {
    if (!startTime) return null;
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end - start) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">
        Active Calls ({calls?.length || 0})
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {!calls || calls.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No active calls</p>
        ) : (
          calls.map((call, idx) => (
            <div
              key={call._id || call.callSid || idx}
              className={`p-3 rounded-lg border transition ${getStatusClass(
                call.outcome || call.status || 'pending'
              )}`}
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(call.outcome || call.status)}
                
                <div className="flex-1 min-w-0">
                  {/* Phone Number */}
                  <p className="font-semibold text-sm">
                    {call.lead?.phoneNumber || call.phoneNumber || 'Unknown'}
                  </p>
                  
                  {/* Business Name */}
                  {call.businessName && (
                    <p className="text-xs text-slate-300 opacity-75">
                      {call.businessName}
                    </p>
                  )}
                  
                  {/* Status and Duration */}
                  <p className="text-xs capitalize opacity-75 mt-1">
                    {call.outcome || call.status || 'pending'}
                    {getCallDuration(call.startTime, call.endTime) && 
                      ` - ${getCallDuration(call.startTime, call.endTime)}`
                    }
                  </p>
                </div>

                {/* Agent Info */}
                {call.agentName && (
                  <div className="flex items-center gap-1 text-xs bg-slate-900/40 px-2 py-1 rounded whitespace-nowrap">
                    <User className="w-3 h-3" />
                    <span>{call.agentName}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
