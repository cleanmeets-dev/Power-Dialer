import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LeadsProvider } from './context/LeadsContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import OverviewPage from './pages/OverviewPage';
import LeadsPage from './pages/LeadsPage';
import CallLogsPage from './pages/CallLogsPage';
import CampaignsPage from './pages/CampaignsPage';
import AgentAvailabilityPage from './pages/AgentAvailabilityPage';
import MyAvailabilityPage from './pages/MyAvailabilityPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
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
          <Route path="my-availability" element={<MyAvailabilityPage />} />
          <Route path="agents" element={<AgentAvailabilityPage />} />
        </Route>

        {/* Root Route - Redirect to dashboard overview */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all - Redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;