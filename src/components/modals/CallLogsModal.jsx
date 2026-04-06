import { useEffect, useState } from 'react';
import Modal from '../common/Modal.jsx';
import { getCallLogs } from '../../services/api.js';
import { Phone, Clock, CheckCircle, XCircle, Calendar, Star, MessageSquare, Smile } from 'lucide-react';

const OUTCOME_STYLES = {
  'connected': 'bg-emerald-500/20 text-emerald-400',
  'no-answer': 'bg-slate-500/20 text-slate-400',
  'failed': 'bg-rose-500/20 text-rose-400',
};

const SENTIMENT_ICONS = {
  'positive': { color: 'text-emerald-400', label: 'Positive', icon: '😊' },
  'neutral': { color: 'text-slate-400', label: 'Neutral', icon: '😐' },
  'negative': { color: 'text-rose-400', label: 'Negative', icon: '😞' },
};

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  );
};

export default function CallLogsModal({ isOpen, campaignId, onClose }) {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && campaignId) {
      loadCallLogs();
    }
  }, [isOpen, campaignId]);

  const loadCallLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getCallLogs(campaignId);
      setCalls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load call logs:', error);
      setCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Call Logs" maxWidth="max-w-2xl">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
        </div>
      ) : calls.length === 0 ? (
        <div className="text-center py-8">
          <Phone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No calls yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {calls.map((call, idx) => (
            <div key={call._id || idx} className="border border-slate-300 dark:border-slate-700 rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-cyan-400" />
                    <p className="font-semibold text-slate-900 dark:text-white">{call.phoneNumber || 'Unknown'}</p>
                  </div>
                  {call.businessName && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">{call.businessName}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize block mb-2 ${OUTCOME_STYLES[call.outcome] || 'bg-slate-600 text-slate-300'}`}>
                    {call.outcome || 'pending'}
                  </span>
                </div>
              </div>

              {/* Call Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(call.startTime || call.createdAt)}</span>
                </div>
                {call.duration !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDuration(call.duration)}</span>
                  </div>
                )}
              </div>

              {/* Sentiment & Quality Row */}
              {(call.sentiment || call.callQuality) && (
                <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                  {call.sentiment && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-500">Sentiment:</span>
                      <span className={`text-sm font-medium ${SENTIMENT_ICONS[call.sentiment]?.color}`}>
                        {SENTIMENT_ICONS[call.sentiment]?.icon} {SENTIMENT_ICONS[call.sentiment]?.label}
                      </span>
                    </div>
                  )}
                  {call.callQuality && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-500">Quality:</span>
                      <StarRating rating={call.callQuality} />
                    </div>
                  )}
                </div>
              )}

              {/* Agent Notes */}
              {call.agentNotes && (
                <div className="flex gap-2 text-sm mb-2">
                  <MessageSquare className="w-3 h-3 text-slate-500 dark:text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 p-2 rounded flex-1 text-xs">{call.agentNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={loadCallLogs}
          className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition"
        >
          Refresh
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
