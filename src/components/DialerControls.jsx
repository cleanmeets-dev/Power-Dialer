import { useContext, useState, useEffect, useRef } from 'react';
import { Play, Square, Pause, SkipForward, Phone } from 'lucide-react';
import { startDialing, stopDialing, updateLeadStatus } from '../services/api';
import { LeadsContext } from '../context/LeadsContext';

export default function DialerControls({
  campaignId,
  isDialing,
  setIsDialing,
  onError,
  onSuccess,
  totalLeads,
  isLoading,
  mode = 'power',
  agentId = null,
}) {
  const isAgentMode = mode === 'agent';
  const leadsContext = useContext(LeadsContext);
  const leads = leadsContext ? leadsContext.leads : [];

  // Frontend Auto Dialer State (Zoom Integration)
  const [autoDialState, setAutoDialState] = useState({
    active: false,
    currentIndex: 0,
    status: 'idle', // 'idle' | 'calling' | 'paused'
  });
  const currentLead = autoDialState.active ? leads[autoDialState.currentIndex] : null;

  const triggerZoomCall = async (lead) => {
    if (!lead || !lead.phoneNumber) {
      onError("Lead missing phone number");
      return;
    }
    // Clean phone number: remove all characters except digits and +
    const cleanNumber = String(lead.phoneNumber).replace(/[^\d+]/g, '');
    
    // Zoom Phone Integration
    window.open(`zoomphonecall://${cleanNumber}`, '_self');
    onSuccess(`Dialing ${lead.businessName || lead.phoneNumber} via Zoom`);

    try {
      // Update backend status to track progress
      await updateLeadStatus(lead._id, 'dialing');
      // Update local context so Next Up label moves in UI
      if (leadsContext?.updateLead) {
        leadsContext.updateLead({ ...lead, dialerStatus: 'dialing' });
      }
    } catch (e) {
      console.error('Failed to update lead status', e);
    }
  };

  const advanceNextCall = (prevState) => {
    // Find the NEXT pending lead
    const nextPendingIndex = leads.findIndex((l, index) => index > prevState.currentIndex && l.dialerStatus === 'pending');
    if (nextPendingIndex === -1) {
      setIsDialing(false);
      onSuccess("Auto Dialer completed all pending leads on this page.");
      return { active: false, currentIndex: 0, status: 'idle' };
    }
    triggerZoomCall(leads[nextPendingIndex]);
    return { ...prevState, currentIndex: nextPendingIndex };
  };

  // Remove timer effect: user must click Next Call to advance

  // Handle Power Dialer (Twilio Backend)
  const handleStartPowerDialer = async () => {
    if (!campaignId) {
      onError('Please select a campaign first');
      return;
    }
    if (totalLeads === 0) {
      onError('Please upload leads first');
      return;
    }
    try {
      // Twilio - Power Dial Only
      await startDialing(campaignId);
      setIsDialing(true);
      onSuccess('Power dialing started');
    } catch (error) {
      onError(error.response?.data?.error || 'Failed to start dialing');
    }
  };

  const handleStopPowerDialer = async () => {
    try {
      await stopDialing(campaignId);
      setIsDialing(false);
      onSuccess('Power dialing stopped');
    } catch (error) {
      onError(error.response?.data?.error || 'Failed to stop dialing');
    }
  };

  // Handle Agent Auto Dialer (Zoom Frontend)
  const handleStartAutoDialer = () => {
    if (!campaignId) {
      onError('Please select a campaign first');
      return;
    }
    if (leads.length === 0) {
      onError('No leads available on this page to dial');
      return;
    }
    // Find the FIRST pending lead
    const firstPendingIndex = leads.findIndex(l => l.dialerStatus === 'pending');
    if (firstPendingIndex === -1) {
      onError('All leads on this page have been dialed.');
      return;
    }
    setIsDialing(true);
    setAutoDialState({ active: true, currentIndex: firstPendingIndex, status: 'calling' });
    triggerZoomCall(leads[firstPendingIndex]);
  };

  const handleStopAutoDialer = () => {
    setIsDialing(false);
    setAutoDialState({ active: false, currentIndex: 0, status: 'idle' });
    onSuccess('Agent auto dialer stopped');
  };

  const handlePauseResumeAutoDialer = () => {
    setAutoDialState(prev => ({
      ...prev,
      status: prev.status === 'paused' ? 'calling' : 'paused'
    }));
  };

  const handleNextCall = () => {
    setAutoDialState(prev => advanceNextCall(prev));
  };

  return (
    <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">
        {isAgentMode ? 'Agent Auto Dialer' : 'Power Dialer Controls'}
      </h2>

      {!isAgentMode ? (
        // Power Dialer UI
        <div>
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleStartPowerDialer}
              disabled={isDialing || !campaignId || totalLeads === 0 || isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                isDialing || !campaignId || totalLeads === 0 || isLoading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/50'
              }`}
            >
              <Play className="w-5 h-5" />
              Start Power Dialer
            </button>
            <button
              onClick={handleStopPowerDialer}
              disabled={!isDialing || isLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                !isDialing || isLoading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-linear-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-rose-500/50'
              }`}
            >
              <Square className="w-5 h-5" />
              Stop Power Dialer
            </button>
          </div>
          {isDialing && (
            <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 font-semibold">
                Power dialer is running via Twilio...
              </span>
            </div>
          )}
        </div>
      ) : (
        // Agent Auto Dialer UI (Zoom Integration)
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            {!autoDialState.active ? (
              <button
                onClick={handleStartAutoDialer}
                disabled={!campaignId || leads.length === 0 || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  !campaignId || leads.length === 0 || isLoading
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-linear-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-indigo-500/50'
                }`}
              >
                <Play className="w-5 h-5" />
                Start Auto Dialer
              </button>
            ) : (
              <>
                <button
                  onClick={handleStopAutoDialer}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Square className="w-5 h-5" />
                  Stop Sequence
                </button>
                <button
                  onClick={handleNextCall}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <SkipForward className="w-5 h-5" />
                  Next Call
                </button>
              </>
            )}
          </div>

          {autoDialState.active && (
            <div className="p-4 bg-slate-800 border border-slate-600 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${autoDialState.status === 'calling' ? 'bg-indigo-400 animate-pulse' : 'bg-amber-400'}`}></div>
                <div>
                  <p className="text-slate-300 font-medium">
                    Auto Dialing in Progress
                  </p>
                  <p className="text-sm text-slate-400">
                    Lead {autoDialState.currentIndex + 1} of {leads.length}: <span className="text-emerald-400 font-mono">{currentLead?.phoneNumber}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
