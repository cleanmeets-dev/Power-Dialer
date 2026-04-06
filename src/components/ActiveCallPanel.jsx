import { Phone, PhoneOff, Mic, MicOff, User, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ActiveCallPanel({ activeCall, callStatus, callDirection }) {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  if (!activeCall && callStatus === 'idle') return null;

  const handleMuteToggle = () => {
    if (activeCall) {
      const newMutedState = !isMuted;
      activeCall.mute(newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const handleAcceptCall = () => {
    if (activeCall && callStatus === 'ringing') {
      try {
        activeCall.accept();
      } catch (err) {
        console.error('Failed to accept call:', err);
      }
    }
  };

  const handleEndCall = () => {
    if (activeCall) {
      activeCall.disconnect();
    }
  };

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const customPhoneNumber = activeCall?.customParameters?.get?.('phoneNumber');
  const customBusinessName = activeCall?.customParameters?.get?.('businessName');
  const displayPhoneNumber =
    customPhoneNumber ||
    activeCall?.parameters?.To ||
    activeCall?.parameters?.From ||
    'Unknown caller';
  const displayBusinessName =
    customBusinessName ||
    activeCall?.parameters?.businessName ||
    'Connected via Dialer';
  const isIncoming = callDirection !== 'outgoing';

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-slate-900/40 border border-cyan-500/30 overflow-hidden z-50">
      <div className="bg-cyan-600/20 px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {callStatus === 'ringing' && isIncoming ? (
            <Phone className="w-5 h-5 text-amber-400 animate-pulse" />
          ) : (
            <Phone className="w-5 h-5 text-emerald-400 animate-pulse" />
          )}
          <span className="font-semibold text-slate-900 dark:text-white">
            {callStatus === 'ringing' && isIncoming ? 'Incoming Call...' : callStatus === 'ringing' ? 'Calling...' : 'Active Call'}
          </span>
        </div>
        {callStatus === 'connected' && (
          <div className="flex items-center gap-1 text-cyan-300 text-sm font-mono bg-cyan-900/40 px-2 py-1 rounded">
            <Clock className="w-3 h-3" />
            {formatDuration(duration)}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-slate-200 dark:bg-slate-700 p-3 rounded-full">
            <User className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {displayPhoneNumber}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {displayBusinessName}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {callStatus === 'ringing' && isIncoming ? (
            <button
              onClick={handleAcceptCall}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors font-medium border border-emerald-500"
            >
              <Phone className="w-4 h-4" />
              Accept
            </button>
          ) : (
            <>
              <button
                onClick={handleMuteToggle}
                className={`flex-1 py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors font-medium border ${isMuted
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-400 dark:border-slate-600 hover:bg-slate-400 dark:hover:bg-slate-600'
                  }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isMuted ? 'Muted' : 'Mute'}
              </button>

              <button
                onClick={handleEndCall}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg flex justify-center items-center gap-2 transition-colors font-medium border border-rose-500"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
