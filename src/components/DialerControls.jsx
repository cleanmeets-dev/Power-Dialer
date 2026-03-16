import { Play, Square } from 'lucide-react';
import { startDialing, stopDialing } from '../services/api';

export default function DialerControls({
  campaignId,
  isDialing,
  setIsDialing,
  onError,
  onSuccess,
  totalLeads,
  isLoading
}) {
  const handleStartDialer = async () => {
    if (!campaignId) {
      onError('Please select a campaign first');
      return;
    }

    if (totalLeads === 0) {
      onError('Please upload leads first');
      return;
    }

    try {
      await startDialing(campaignId);
      setIsDialing(true);
      onSuccess('Dialing started');
    } catch (error) {
      onError(error.response?.data?.error || 'Failed to start dialing');
      console.error(error);
    }
  };

  const handleStopDialer = async () => {
    try {
      await stopDialing(campaignId);
      setIsDialing(false);
      onSuccess('Dialing stopped');
    } catch (error) {
      onError(error.response?.data?.error || 'Failed to stop dialing');
      console.error(error);
    }
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">Dialer Controls</h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleStartDialer}
          disabled={isDialing || !campaignId || totalLeads === 0 || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
            isDialing || !campaignId || totalLeads === 0 || isLoading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/50'
          }`}
        >
          <Play className="w-5 h-5" />
          Start Dialer
        </button>

        <button
          onClick={handleStopDialer}
          disabled={!isDialing || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
            !isDialing || isLoading
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-linear-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-rose-500/50'
          }`}
        >
          <Square className="w-5 h-5" />
          Stop Dialer
        </button>
      </div>

      {isDialing && (
        <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-blue-400 font-semibold">Dialer is running...</span>
        </div>
      )}
    </div>
  );
}
