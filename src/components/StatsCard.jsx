import { Upload, Phone, CheckCircle, Clock } from 'lucide-react';

const ICONS = {
  Upload,
  Phone,
  CheckCircle,
  Clock,
};

export default function StatsCard({ label, value, icon, color }) {
  const Icon = ICONS[icon];
  const colorMap = {
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    emerald: 'text-emerald-400',
    blue: 'text-blue-400',
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg shadow-lg p-6 border border-slate-700 hover:border-cyan-500 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{label}</p>
          <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
        </div>
        {Icon && <Icon className={`w-10 h-10 ${colorMap[color]}`} />}
      </div>
    </div>
  );
}
