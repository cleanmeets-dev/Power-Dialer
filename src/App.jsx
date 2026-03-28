import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LeadsProvider } from './context/LeadsContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import LeadsPage from './pages/LeadsPage';
import CallLogsPage from './pages/CallLogsPage';
import CampaignsPage from './pages/CampaignsPage';
import AgentAvailabilityPage from './pages/AgentAvailabilityPage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import MyAvailabilityPage from './pages/MyAvailabilityPage';
import AutoDialerPage from './pages/AutoDialerPage';
import DirectDialerPage from './pages/DirectDialerPage';
import PowerDialerPage from './pages/PowerDialerPage';
import ProtectedRoute from './routes/ProtectedRoute';

function RoleHomeRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roleHome = user?.role === 'manager' ? '/manager' : '/agent';
  return <Navigate to={roleHome} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <LeadsProvider campaignId="">
                <DashboardLayout />
              </LeadsProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="call-logs" element={<CallLogsPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="agents" element={<AgentAvailabilityPage />} />
          <Route path="attendance" element={<AttendanceHistoryPage />} />
        </Route>

        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={['agent']}>
              <LeadsProvider campaignId="">
                <DashboardLayout />
              </LeadsProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="leads" element={<PowerDialerPage />} />
          <Route path="call-logs" element={<CallLogsPage />} />
          <Route path="my-availability" element={<MyAvailabilityPage />} />
          <Route path="auto-dialer" element={<AutoDialerPage />} />
          <Route path="direct-dialer" element={<DirectDialerPage />} />
        </Route>

        <Route path="/dashboard" element={<RoleHomeRedirect />} />

        {/* Root Route - Redirect to role dashboard */}
        <Route path="/" element={<RoleHomeRedirect />} />

        {/* Catch-all - Redirect to role dashboard */}
        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;