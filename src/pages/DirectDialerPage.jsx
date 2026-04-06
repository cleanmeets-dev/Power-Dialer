import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Phone, PhoneOff, Keyboard } from 'lucide-react';

const formatDisplayNumber = (value) => String(value || '').replace(/[^\d+]/g, '');

export default function DirectDialerPage() {
  const { showNotification, twilioDialer } = useOutletContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDialing, setIsDialing] = useState(false);

  const statusText = useMemo(() => {
    return isDialing ? 'Calling...' : 'Ready to dial';
  }, [isDialing]);

  const appendDigit = (digit) => {
    setPhoneNumber((prev) => `${prev}${digit}`.slice(0, 20));
  };

  const clearNumber = () => setPhoneNumber('');

  const handleDial = async () => {
    if (!phoneNumber) return;

    setIsDialing(true);
    try {
      // Zoom Phone Integration
      window.open(`zoomphonecall://${phoneNumber}`, '_self');
      showNotification(`Calling ${phoneNumber} via Zoom`, 'success');
    } catch (error) {
      showNotification('Failed to launch Zoom Phone', 'error');
    } finally {
      setIsDialing(false);
    }
  };

  const handleHangup = () => {
    // Twilio - Power Dial Only
    // Zoom calls are handled externally
    showNotification('Not applicable for Zoom Phone', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-primary-400">Direct Dialer</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Call any number directly from your browser</p>
      </div>

      <div className="max-w-md mx-auto bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-2xl dark:shadow-slate-900/30 border border-slate-200 dark:border-slate-700 p-6">
        <div className="mb-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/40 px-4 py-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Status</p>
          <p className="text-sm font-semibold text-cyan-300">{statusText}</p>
        </div>

        <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(formatDisplayNumber(e.target.value))}
          placeholder="+1 405 555 1212"
          className="w-full mb-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
        />

        <div className="grid grid-cols-3 gap-2 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
            <button
              key={digit}
              onClick={() => appendDigit(digit)}
              className="rounded-lg bg-slate-200 dark:bg-slate-700/80 py-3 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              type="button"
            >
              {digit}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={clearNumber}
            type="button"
            className="rounded-lg bg-slate-300 dark:bg-slate-600/60 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-400 dark:hover:bg-slate-600"
          >
            Clear
          </button>
          <button
            onClick={handleDial}
            disabled={!phoneNumber || isDialing}
            type="button"
            className="rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400"
          >
            <span className="inline-flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {isDialing ? 'Calling...' : 'Call (Zoom)'}
            </span>
          </button>
        </div>

        <button
          onClick={handleHangup}
          disabled={true} // Zoom doesn't support remote hangup from browser
          type="button"
          className="mt-3 w-full rounded-lg bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400"
        >
          <span className="inline-flex items-center gap-2">
            <PhoneOff className="w-4 h-4" />
            Hang Up
          </span>
        </button>

        <div className="mt-4 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Keyboard className="w-4 h-4" />
          Browser mic permission is required for audio.
        </div>
      </div>
    </div>
  );
}
