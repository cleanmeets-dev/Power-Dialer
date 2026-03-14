import { Trash2 } from 'lucide-react';
import { deleteLead } from '../services/api';

export default function LeadsTable({ leads, isLoading, onLeadDeleted }) {
  const handleDeleteLead = async (leadId) => {
    if (!confirm('Delete this lead?')) return;

    try {
      await deleteLead(leadId);
      if (onLeadDeleted) {
        onLeadDeleted(leadId);
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-2xl p-6 mt-6 border border-slate-700">
      <h2 className="text-xl font-bold mb-4 text-cyan-400">
        Uploaded Leads ({leads.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-cyan-400 font-semibold">#</th>
              <th className="text-left py-2 px-3 text-cyan-400 font-semibold">
                Business Name
              </th>
              <th className="text-left py-2 px-3 text-cyan-400 font-semibold">
                Phone
              </th>
              <th className="text-left py-2 px-3 text-cyan-400 font-semibold">
                Email
              </th>
              <th className="text-left py-2 px-3 text-cyan-400 font-semibold">
                Location
              </th>
              <th className="text-left py-2 px-3 text-cyan-400 font-semibold">
                Status
              </th>
              <th className="text-center py-2 px-3 text-cyan-400 font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 20).map((lead, idx) => (
              <tr
                key={lead._id}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
              >
                <td className="py-2 px-3 text-slate-300">{idx + 1}</td>
                <td className="py-2 px-3 text-slate-200 max-w-xs truncate">
                  {lead.businessName || '—'}
                </td>
                <td className="py-2 px-3 text-slate-200 font-mono text-xs">
                  {lead.phoneNumber}
                </td>
                <td className="py-2 px-3 text-slate-300 text-xs truncate max-w-xs">
                  {lead.email || '—'}
                </td>
                <td className="py-2 px-3 text-slate-400 text-xs">
                  {lead.city ? `${lead.city}${lead.state ? ', ' + lead.state : ''}` : '—'}
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold capitalize inline-block ${
                      lead.status === 'pending'
                        ? 'bg-slate-700 text-cyan-400'
                        : lead.status === 'dialing'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : lead.status === 'connected'
                        ? 'bg-emerald-900/50 text-emerald-400'
                        : lead.status === 'failed'
                        ? 'bg-rose-900/50 text-rose-400'
                        : lead.status === 'completed'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    disabled={isLoading}
                    className="text-rose-400 hover:text-rose-300 disabled:text-slate-600 transition"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {leads.length > 20 && (
          <p className="text-slate-500 text-sm mt-4 text-center">
            Showing 20 of {leads.length} leads
          </p>
        )}
      </div>
    </div>
  );
}
