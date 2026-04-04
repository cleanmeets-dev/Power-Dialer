import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LeadsProvider } from "./context/LeadsContext";
import { AuthProvider } from "./context/AuthContext";
import { getRoleHomeRoute, AGENT_ROLES } from "./utils/roleUtils";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./pages/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import LeadsPage from "./pages/LeadsPage";
import FollowupPage from "./pages/FollowupPage";
import CallLogsPage from "./pages/CallLogsPage";
import CampaignsPage from "./pages/CampaignsPage";
import AgentAvailabilityPage from "./pages/AgentAvailabilityPage";
import AttendanceHistoryPage from "./pages/AttendanceHistoryPage";
import MyAvailabilityPage from "./pages/MyAvailabilityPage";
import AutoDialerPage from "./pages/AutoDialerPage";
import DirectDialerPage from "./pages/DirectDialerPage";
import PowerDialerPage from "./pages/PowerDialerPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleHomeRedirect from "./routes/RoleHomeRedirect";
import React from "react";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <LeadsProvider campaignId="">
                  <DashboardLayout />
                </LeadsProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="followups" element={<FollowupPage />} />
            <Route path="call-logs" element={<CallLogsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="agents" element={<AgentAvailabilityPage />} />
            <Route path="attendance" element={<AttendanceHistoryPage />} />
          </Route>

          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedRoles={AGENT_ROLES}>
                <LeadsProvider campaignId="">
                  <DashboardLayout />
                </LeadsProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="leads" element={<PowerDialerPage />} />
            {/* <Route path="call-logs" element={<CallLogsPage />} /> */}
            <Route path="auto-dialer" element={<AutoDialerPage />} />
            <Route path="direct-dialer" element={<DirectDialerPage />} />
          </Route>

          <Route path="/dashboard" element={<RoleHomeRedirect />} />

          <Route path="/" element={<RoleHomeRedirect />} />

          <Route path="*" element={<RoleHomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
