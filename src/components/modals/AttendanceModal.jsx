import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Coffee, LogIn, LogOut, Phone } from 'lucide-react';
import Modal from '../common/Modal';
import { checkIn, checkOut, endBreak, getCurrentUser, getMyAttendance, startBreak } from '../../services/api';

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const formatBreakMinutes = (totalBreakMs = 0, breakStartedAt = null, onBreak = false) => {
  let currentTotal = totalBreakMs || 0;
  if (onBreak && breakStartedAt) {
    const started = new Date(breakStartedAt).getTime();
    if (!Number.isNaN(started)) {
      currentTotal += Math.max(0, Date.now() - started);
    }
  }
  return Math.round(currentTotal / 60000);
};

export default function AttendanceModal({ isOpen, onClose, onAttendanceChanged }) {
  const [agent, setAgent] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadAgent = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [data, attendance] = await Promise.all([
        getCurrentUser(),
        getMyAttendance(),
      ]);
      setAgent(data || null);
      setAttendanceData(attendance || null);
      onAttendanceChanged?.(data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load attendance info');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadAgent();
  }, [isOpen]);

  const attendance = attendanceData || {};
  const isCheckedIn = Boolean(attendance.isCheckedIn);
  const onBreakNow = Boolean(attendance.onBreak);
  const isOnCall = Boolean(agent?.activeLead);

  const currentStatus = useMemo(() => {
    if (isOnCall) return 'On Call';
    if (!isCheckedIn) return 'Checked Out';
    if (onBreakNow) return 'On Break';
    if (agent?.isAvailable) return 'Available';
    return 'Unavailable';
  }, [agent?.isAvailable, isCheckedIn, onBreakNow, isOnCall]);

  const runAction = async (action) => {
    try {
      setIsSubmitting(true);
      setError('');
      await action();
      await loadAgent();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attendance" maxWidth="max-w-2xl">
      {error && (
        <div className="mb-4 rounded-lg border border-rose-500/50 bg-rose-900/30 px-3 py-2 text-sm text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="text-slate-300">Loading attendance...</div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-600 bg-slate-700/40 p-3">
              <p className="text-xs text-slate-400">Current Status</p>
              <p className="text-lg font-semibold text-cyan-300">{currentStatus}</p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-700/40 p-3">
              <p className="text-xs text-slate-400">Breaks Taken</p>
              <p className="text-lg font-semibold text-white">{attendance.breaksTaken || 0}</p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-700/40 p-3">
              <p className="text-xs text-slate-400">Checked In At</p>
              <p className="text-sm font-medium text-slate-200">{formatDateTime(attendance.checkedInAt)}</p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-700/40 p-3">
              <p className="text-xs text-slate-400">Checked Out At</p>
              <p className="text-sm font-medium text-slate-200">{formatDateTime(attendance.checkedOutAt)}</p>
            </div>
            <div className="rounded-lg border border-slate-600 bg-slate-700/40 p-3 md:col-span-2">
              <p className="text-xs text-slate-400">Total Break Minutes</p>
              <p className="text-lg font-semibold text-white">
                {formatBreakMinutes(attendance.totalBreakMs, attendance.breakStartedAt, onBreakNow)} min
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => runAction(checkIn)}
              disabled={isSubmitting || isCheckedIn}
              className="rounded-lg border border-emerald-500 bg-emerald-600 px-4 py-2 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Check In
            </button>

            <button
              onClick={() => runAction(checkOut)}
              disabled={isSubmitting || !isCheckedIn || isOnCall}
              className="rounded-lg border border-rose-500 bg-rose-600 px-4 py-2 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Check Out
            </button>

            <button
              onClick={() => runAction(startBreak)}
              disabled={isSubmitting || !isCheckedIn || onBreakNow || isOnCall}
              className="rounded-lg border border-amber-500 bg-amber-600 px-4 py-2 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              Start Break
            </button>

            <button
              onClick={() => runAction(endBreak)}
              disabled={isSubmitting || !isCheckedIn || !onBreakNow}
              className="rounded-lg border border-cyan-500 bg-cyan-600 px-4 py-2 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              End Break
            </button>
          </div>

          <div className="rounded-lg border border-slate-600 bg-slate-800/40 p-3 text-xs text-slate-300 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Calls are assigned only when checked in, not on break, and not currently on a call.
          </div>
        </div>
      )}
    </Modal>
  );
}
