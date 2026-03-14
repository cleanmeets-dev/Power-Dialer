import { useState } from 'react';
import { Upload, Play, Square, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';

function App() {
  const [leads, setLeads] = useState([]);
  const [isDialing, setIsDialing] = useState(false);
  const [agentStatus, setAgentStatus] = useState('available');
  const [activeCalls, setActiveCalls] = useState([
    { id: 1, number: '+1234567890', status: 'connecting', agent: null },
    { id: 2, number: '+0987654321', status: 'connected', agent: 'John' }
  ]);
  const [dialedCount, setDialedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(1);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      
      const newLeads = rows.map((phone, idx) => ({
        id: idx,
        phone: phone.trim(),
        status: 'pending',
        attempts: 0,
        lastAttempt: null
      }));
      
      setLeads(newLeads);
    };
    
    reader.readAsText(file);
  };

  const handleStartDialer = () => {
    if (leads.length === 0) {
      alert('Please upload leads first');
      return;
    }
    setIsDialing(true);
    setDialedCount(0);
    setSuccessCount(0);
  };

  const handleStopDialer = () => {
    setIsDialing(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'connecting': return 'text-yellow-600 bg-yellow-50';
      case 'connected': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'connecting': return <Clock className="w-4 h-4" />;
      case 'connected': return <Phone className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mb-6 border border-slate-700">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">Power Dialer Dashboard</h1>
          <p className="text-slate-300">Upload leads and start automated calling</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-lg p-6 border border-slate-700 hover:border-cyan-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Leads</p>
                <p className="text-3xl font-bold text-cyan-400">{leads.length}</p>
              </div>
              <Upload className="w-10 h-10 text-cyan-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-lg p-6 border border-slate-700 hover:border-yellow-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Dialed</p>
                <p className="text-3xl font-bold text-yellow-400">{dialedCount}</p>
              </div>
              <Phone className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-lg p-6 border border-slate-700 hover:border-emerald-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Successful</p>
                <p className="text-3xl font-bold text-emerald-400">{successCount}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-lg p-6 border border-slate-700 hover:border-purple-500 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Agent Status</p>
                <p className={`text-lg font-bold capitalize ${agentStatus === 'available' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {agentStatus}
                </p>
              </div>
              <div className={`w-4 h-4 rounded-full ${agentStatus === 'available' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Upload Leads</h2>
              
              <div className="border-2 border-dashed border-cyan-500 rounded-lg p-8 text-center bg-slate-900/50 hover:bg-slate-900 transition cursor-pointer relative group">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-slate-100 font-semibold">Drag and drop your leads file</p>
                <p className="text-slate-400 text-sm">or click to select (CSV or TXT)</p>
                <p className="text-slate-500 text-xs mt-2">One phone number per line</p>
              </div>

              {leads.length > 0 && (
                <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded">
                  <p className="text-emerald-400 font-semibold">✓ {leads.length} leads uploaded successfully</p>
                </div>
              )}
            </div>

            {/* Dialer Controls */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Dialer Controls</h2>
              
              <div className="flex gap-4 mb-4">
                <button
                  onClick={handleStartDialer}
                  disabled={isDialing || leads.length === 0}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    isDialing || leads.length === 0
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/50'
                  }`}
                >
                  <Play className="w-5 h-5" />
                  Start Dialer
                </button>
                
                <button
                  onClick={handleStopDialer}
                  disabled={!isDialing}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    !isDialing
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-rose-500/50'
                  }`}
                >
                  <Square className="w-5 h-5" />
                  Stop Dialer
                </button>
              </div>

              {isDialing && (
                <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-400 font-semibold">Dialer is running...</span>
                </div>
              )}
            </div>

            {/* Agent Status Control */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">Agent Status</h2>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setAgentStatus('available')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    agentStatus === 'available'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Available
                </button>
                
                <button
                  onClick={() => setAgentStatus('busy')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    agentStatus === 'busy'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Busy
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Active Calls */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Active Calls ({activeCalls.length})</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeCalls.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No active calls</p>
              ) : (
                activeCalls.map((call) => (
                  <div key={call.id} className={`p-3 rounded-lg border transition ${
                    call.status === 'connecting' ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300' :
                    call.status === 'connected' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-300' :
                    call.status === 'completed' ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' :
                    call.status === 'failed' ? 'bg-rose-900/30 border-rose-500/50 text-rose-300' :
                    'bg-slate-700/50 border-slate-600 text-slate-300'
                  }`}>
                    <div className="flex items-start gap-2">
                      {getStatusIcon(call.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{call.number}</p>
                        <p className="text-xs capitalize opacity-75">
                          {call.status}
                          {call.agent && ` - ${call.agent}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Leads List */}
        {leads.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mt-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Uploaded Leads</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-4 text-cyan-400 font-semibold">#</th>
                    <th className="text-left py-2 px-4 text-cyan-400 font-semibold">Phone Number</th>
                    <th className="text-left py-2 px-4 text-cyan-400 font-semibold">Status</th>
                    <th className="text-left py-2 px-4 text-cyan-400 font-semibold">Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 10).map((lead, idx) => (
                    <tr key={lead.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                      <td className="py-2 px-4 text-slate-300">{idx + 1}</td>
                      <td className="py-2 px-4 text-slate-200 font-mono">{lead.phone}</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-cyan-400 capitalize">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-slate-300">{lead.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {leads.length > 10 && (
                <p className="text-slate-500 text-sm mt-4 text-center">
                  Showing 10 of {leads.length} leads
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;