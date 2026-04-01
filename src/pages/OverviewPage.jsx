import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, PhoneOff, CheckCircle, Clock } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import CampaignSelector from '../components/CampaignSelector';
import { getCampaigns } from '../services/api';

export default function OverviewPage() {
  const { showNotification } = useOutletContext();
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalCalls: 0,
    successfulCalls: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const campaigns = await getCampaigns();
      const campaignList = Array.isArray(campaigns) ? campaigns : [];
      
      setStats({
        totalCampaigns: campaignList.length,
        activeCampaigns: campaignList.filter(c => c.status === 'active').length,
        totalCalls: campaignList.reduce((sum, c) => sum + (c.dialedCount || 0), 0),
        successfulCalls: campaignList.reduce((sum, c) => sum + (c.successCount || 0), 0),
      });
    } catch (error) {
      showNotification('Failed to load overview stats', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
        <h1 className="text-3xl font-bold text-cyan-400">Dashboard Overview</h1>
        <p className="text-slate-400 mt-2">Call center performance summary</p>
      </div>

      {/* Stats Grid */}
      {/* {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Campaigns"
            value={stats.totalCampaigns}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <StatsCard
            label="Active Campaigns"
            value={stats.activeCampaigns}
            icon={<Clock className="w-6 h-6" />}
          />
          <StatsCard
            label="Total Calls"
            value={stats.totalCalls}
            icon={<PhoneOff className="w-6 h-6" />}
          />
          <StatsCard
            label="Successful Calls"
            value={stats.successfulCalls}
            icon={<CheckCircle className="w-6 h-6" />}
          />
        </div>
      )} */}

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Navigation Info */}
        <div className="bg-linear-to-br from-slate-800 to-slate-700 rounded-lg shadow-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Navigation</h2>
          <div className="space-y-2 text-slate-300 text-sm">
            <p>📋 <strong>Campaigns</strong> - Create and manage dialing campaigns</p>
            <p>👥 <strong>Leads</strong> - Upload and manage contact lists</p>
            <p>📞 <strong>Power Dialer</strong> - Auto-dial with agent involvement</p>
            <p>☎️ <strong>Direct Dialer</strong> - Manual single-number calls</p>
            <p>🤖 <strong>Auto Dialer</strong> - Fully automated dialing campaigns</p>
            <p>📊 <strong>Call Logs</strong> - View completed calls and call history</p>
            <p>📅 <strong>Attendance</strong> - Track agent attendance records</p>
            <p>👤 <strong>My Availability</strong> - Toggle your agent status</p>
            <p>👥 <strong>Agent Availability</strong> - View all agents and their status</p>
            <p>✅ <strong>Lead Followups</strong> - Track engaged leads (Manager only)</p>
          </div>
        </div>

        {/* Quick Help */}
        <div className="bg-linear-to-br from-blue-900 to-blue-800 rounded-lg shadow-xl p-6 border border-blue-700">
          <h2 className="text-xl font-bold text-blue-300 mb-4">Getting Started</h2>
          <div className="space-y-2 text-blue-100 text-sm">
            <p><strong>For Managers:</strong></p>
            <p>1️⃣ Create campaigns in <strong>Campaigns</strong> page (status: paused/active)</p>
            <p>2️⃣ Upload leads via <strong>Leads</strong> page</p>
            <p>3️⃣ Assign agents and configure dialer settings</p>
            <p>4️⃣ Monitor engaged leads in <strong>Lead Followups</strong></p>
            <p>5️⃣ Review performance in <strong>Call Logs</strong></p>
            <br/>
            <p><strong>For Agents:</strong></p>
            <p>1️⃣ Set your availability in <strong>My Availability</strong></p>
            <p>2️⃣ Choose a dialing mode (Power/Direct/Auto Dialer)</p>
            <p>3️⃣ Update lead status and disposition after calls</p>
            <p>4️⃣ Schedule callbacks as needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
