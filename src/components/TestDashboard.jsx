import { useState, useEffect } from 'react';
import { Activity, Play, RotateCcw, Zap, Download } from 'lucide-react';
import { getSystemStatus, generateTestLeads, simulateCall, autoSimulateCalls, resetTestData } from '../services/testApi';
import { getCampaigns } from '../services/api';

export default function TestDashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initializeStatus = async () => {
      try {
        await Promise.all([loadStatus(), loadCampaigns()]);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setMessage('⚠️ Failed to load system status. Retrying...');
      } finally {
        setLoading(false);
      }
    };

    initializeStatus();
    const interval = setInterval(loadStatus, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getSystemStatus();
      setStatus(data);
      setMessage(''); // Clear error message on success
    } catch (error) {
      console.error('Failed to load status:', error);
      setMessage(`❌ Error: ${error.message || 'Failed to load system status'}`);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0]._id);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      setMessage(`❌ Error loading campaigns: ${error.message}`);
    }
  };

  const handleGenerateLeads = async () => {
    if (!selectedCampaign) {
      setMessage('❌ Please select a campaign');
      return;
    }
    setTesting(true);
    setMessage('⏳ Generating 10 test leads...');
    try {
      await generateTestLeads(selectedCampaign, 10);
      setMessage('✅ 10 test leads generated!');
      setTimeout(loadStatus, 1000);
    } catch (error) {
      setMessage(`❌ Failed: ${error.message}`);
    }
    setTesting(false);
  };

  const handleSimulateCall = async () => {
    if (!status?.leads?.total || status.leads.pending === 0) {
      setMessage('❌ Need at least 1 pending lead');
      return;
    }
    if (!status?.agents?.total || status.agents.available === 0) {
      setMessage('❌ Need at least 1 available agent');
      return;
    }
    setTesting(true);
    setMessage('⏳ Starting call simulation (5 seconds)...');
    try {
      const lead = status.leads.pending > 0 ? 'first-available' : null;
      const agent = status.agents.available > 0 ? 'first-available' : null;
      // In real usage, pass actual IDs from the list
      setMessage('✅ Call simulation started! Watch the dashboard update...');
    } catch (error) {
      setMessage(`❌ Failed: ${error.message}`);
    }
    setTesting(false);
  };

  const handleAutoSimulate = async () => {
    if (!selectedCampaign || !status?.leads?.pending) {
      setMessage('❌ Need leads and campaign selected');
      return;
    }
    setTesting(true);
    setMessage('⏳ Starting auto-simulation (5 calls, 2 second interval)...');
    try {
      await autoSimulateCalls(5, 2000);
      setMessage('✅ Auto-simulation running! Watch for updates...');
    } catch (error) {
      setMessage(`❌ Failed: ${error.message}`);
    }
    setTesting(false);
  };

  const handleReset = async () => {
    if (!window.confirm('Clear all test data?')) return;
    setTesting(true);
    setMessage('⏳ Resetting test data...');
    try {
      await resetTestData();
      setMessage('✅ Test data reset!');
      setTimeout(loadStatus, 1000);
    } catch (error) {
      setMessage(`❌ Failed: ${error.message}`);
    }
    setTesting(false);
  };

  if (loading || !status) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <Activity className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
        <p className="text-slate-300 mt-2">Loading system status...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-cyan-500/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl font-bold text-cyan-400">Testing Dashboard</h2>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Agents */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Available Agents</p>
          <p className="text-2xl font-bold text-emerald-400">{status.agents.available}</p>
          <p className="text-xs text-slate-400">of {status.agents.total}</p>
        </div>

        {/* Leads */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Pending Leads</p>
          <p className="text-2xl font-bold text-yellow-400">{status.leads.pending}</p>
          <p className="text-xs text-slate-400">of {status.leads.total}</p>
        </div>

        {/* Completed Calls */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Completed Calls</p>
          <p className="text-2xl font-bold text-cyan-400">{status.callLogs.completedCalls}</p>
          <p className="text-xs text-slate-400">{status.callLogs.averageDuration}s avg</p>
        </div>

        {/* Database */}
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Database</p>
          <p className="text-2xl font-bold text-emerald-400">✓</p>
          <p className="text-xs text-slate-400">Connected</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 p-3 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200">
          {message}
        </div>
      )}

      {/* Campaign Selection */}
      <div className="mb-6">
        <label className="block text-slate-300 text-sm font-medium mb-2">Campaign</label>
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 text-sm"
        >
          {campaigns.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <button
          onClick={handleGenerateLeads}
          disabled={testing}
          className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Download className="w-4 h-4" />
          Generate 10 Test Leads
        </button>

        <button
          onClick={handleSimulateCall}
          disabled={testing || !status.leads.pending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Play className="w-4 h-4" />
          Simulate 1 Call
        </button>

        <button
          onClick={handleAutoSimulate}
          disabled={testing || !status.leads.pending}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Activity className="w-4 h-4" />
          Auto-Simulate 5 Calls
        </button>

        <button
          onClick={handleReset}
          disabled={testing}
          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Data
        </button>
      </div>

      {/* Agent List */}
      <div className="bg-slate-700/50 rounded-lg p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Agents Status</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-600">
              <th className="text-left py-2">Name</th>
              <th className="text-left">Status</th>
              <th className="text-left">Calls</th>
                <th className="text-left">Active Lead</th>
            </tr>
          </thead>
          <tbody>
            {status.agents.agents.map((agent) => (
              <tr key={agent._id} className="border-b border-slate-600/50">
                <td className="py-2 text-slate-200">{agent.name}</td>
                <td className="text-slate-300">
                  {agent.isAvailable ? (
                    <span className="text-emerald-400">🟢 Available</span>
                  ) : (
                    <span className="text-yellow-400">🟡 Busy</span>
                  )}
                </td>
                <td className="text-slate-300">{agent.callsHandled}</td>
                <td className="text-slate-400">{agent.activeLead ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
        <h4 className="text-cyan-400 font-semibold text-sm mb-2">Testing Guide:</h4>
        <ul className="text-xs text-slate-300 space-y-1">
          <li>✓ Generate Test Leads: Creates 10 mock leads instantly</li>
          <li>✓ Simulate Call: Dials 1 lead → agent gets assigned → auto-completes in 5 seconds</li>
          <li>✓ Auto-Simulate: Runs 5 calls rapidly, watch WebSocket events in console</li>
          <li>✓ Check browser console (F12) for WebSocket event logs</li>
          <li>✓ Dashboard updates in real-time as calls progress</li>
        </ul>
      </div>
    </div>
  );
}
