import { useState, useEffect } from 'react';
import { Phone, PhoneOff, PhoneIncoming, Mic, MicOff, User } from 'lucide-react';

export default function ActiveCallPanel({ 
  incomingCall, 
  activeCall, 
  isMuted, 
  onAccept, 
  onReject, 
  onHangup, 
  onToggleMute 
}) {
  const [duration, setDuration] = useState(0);

  // Handle call timer
  useEffect(() => {
    let interval;
    if (activeCall) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // If there's no call to show, render nothing
  if (!incomingCall && !activeCall) return null;

  // Render Incoming Call state
  if (incomingCall && !activeCall) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 bg-linear-to-br from-slate-800 to-slate-700 rounded-xl shadow-2xl border border-cyan-500/50 overflow-hidden animate-in slide-in-from-bottom-5">
        <div className="bg-cyan-500/10 p-4 border-b border-cyan-500/20 flex flex-col items-center">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center animate-pulse mb-3">
            <PhoneIncoming className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-white font-bold text-lg mb-1">Incoming Call</h3>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-900/40 px-3 py-1 rounded-full text-sm">
            <User className="w-4 h-4" />
            <span>{incomingCall.parameters?.From || 'Unknown Lead'}</span>
          </div>
        </div>
        
        <div className="p-4 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 py-3 px-4 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-400 rounded-lg font-semibold transition flex flex-col items-center gap-1"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-xs">Decline</span>
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold shadow-lg shadow-emerald-500/20 transition flex flex-col items-center gap-1"
          >
            <Phone className="w-5 h-5" />
            <span className="text-xs">Answer</span>
          </button>
        </div>
      </div>
    );
  }

  // Render Active / Connected Call state
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-linear-to-br from-slate-800 to-slate-700 rounded-xl shadow-2xl border border-emerald-500/50 overflow-hidden animate-in slide-in-from-bottom-5">
      <div className="bg-emerald-500/10 p-5 border-b border-emerald-500/20 flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center border-2 border-emerald-500/50 mb-3 relative">
          <div className="absolute inset-0 rounded-full border border-emerald-400/30 animate-ping"></div>
          <User className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-1">
          {activeCall.parameters?.From || 'Connected to Lead'}
        </h3>
        <div className="text-emerald-400 font-mono text-xl tracking-wider font-semibold">
          {formatDuration(duration)}
        </div>
      </div>
      
      <div className="p-4 flex gap-3 justify-center">
        <button
          onClick={onToggleMute}
          className={`flex-1 py-3 border rounded-lg transition flex flex-col items-center gap-1 ${
            isMuted 
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30' 
              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white'
          }`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="text-xs font-semibold">{isMuted ? 'Muted' : 'Mute'}</span>
        </button>
        
        <button
          onClick={onHangup}
          className="flex-[2] py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold shadow-lg shadow-rose-500/20 transition flex flex-col items-center gap-1"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs tracking-wide">HANG UP</span>
        </button>
      </div>
    </div>
  );
}
