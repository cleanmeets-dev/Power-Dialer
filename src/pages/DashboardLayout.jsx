import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { useTwilioDevice } from '../hooks/useTwilioDevice';
import { useWebSocket } from '../hooks/useWebSocket';
import Navbar from '../components/Navbar';
import NotificationSystem from '../components/NotificationSystem';
import ActiveCallPanel from '../components/modals/ActiveCallPanel';
import CompleteCallModal from '../components/modals/CompleteCallModal';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { successMessage, errorMessage, showNotification } = useNotification();

  // Initialize Twilio Voice SDK for agent browsers (receiving calls)
  const { 
    isReady: isTwilioReady, 
    error: twilioError,
    incomingCall,
    activeCall,
    isMuted,
    acceptCall,
    rejectCall,
    hangupCall,
    toggleMute
  } = useTwilioDevice(user?.role === 'agent');

  // Wrap-up modal state
  const [completeCallData, setCompleteCallData] = useState(null);

  // Listen for agent-call-completed to show the wrap up modal gobally
  useWebSocket({
    onAgentCallCompleted: (data) => {
      // Only open if it is meant for this exact logged in agent
      if (user?.role === 'agent' && (data.agentId === user._id || data.agentId === user.id)) {
        setCompleteCallData({
          lead: data.lead,
          callLogId: data.callLogId
        });
        showNotification('Call ended. Entering Wrap Up mode (30s).', 'info');
      }
    }
  });

  // Surface Twilio device issues to the user (non-blocking)
  if (user?.role === 'agent' && twilioError) {
    // Avoid spamming notifications every render by relying on NotificationSystem state
    // eslint-disable-next-line no-console
    console.error('Twilio Device init error:', twilioError);
  }

  // Determine active page based on current route
  const getActivePage = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'overview';
    if (path.includes('leads')) return 'leads';
    if (path.includes('call-logs')) return 'call-logs';
    if (path.includes('campaigns')) return 'campaigns';
    if (path.includes('my-availability')) return 'my-availability';
    if (path.includes('agents')) return 'agents';
    return 'overview';
  };

  const activePage = getActivePage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (pageId) => {
    switch (pageId) {
      case 'overview':
        navigate('/dashboard');
        break;
      case 'leads':
        navigate('/dashboard/leads');
        break;
      case 'call-logs':
        navigate('/dashboard/call-logs');
        break;
      case 'campaigns':
        navigate('/dashboard/campaigns');
        break;
      case 'my-availability':
        navigate('/dashboard/my-availability');
        break;
      case 'agents':
        navigate('/dashboard/agents');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        activePage={activePage} 
        onNavigate={handleNavigate}
        onShowNotification={showNotification}
      />

      <NotificationSystem successMessage={successMessage} errorMessage={errorMessage} />

      {/* Floating Panel for Live Agent Calls */}
      {user?.role === 'agent' && (
        <ActiveCallPanel 
          incomingCall={incomingCall}
          activeCall={activeCall}
          isMuted={isMuted}
          onAccept={acceptCall}
          onReject={rejectCall}
          onHangup={hangupCall}
          onToggleMute={toggleMute}
        />
      )}

      {/* Global Wrap-Up Modal for Agents post-call */}
      {completeCallData && (
        <CompleteCallModal 
          isOpen={!!completeCallData}
          lead={completeCallData.lead}
          callLog={{ _id: completeCallData.callLogId, agent: user }}
          currentAgent={user}
          onClose={() => setCompleteCallData(null)}
          onSuccess={() => {
            showNotification('Call outcome saved successfully', 'success');
          }}
          onError={(msg) => showNotification(msg, 'error')}
        />
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {user?.role === 'agent' && (
          <div className="mb-4">
            <div className="text-sm text-slate-300">
              Twilio Device:{" "}
              <span className={isTwilioReady ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                {isTwilioReady ? "Ready" : "Initializing..."}
              </span>
            </div>
          </div>
        )}
        <Outlet context={{ showNotification }} />
      </div>
    </div>
  );
}
