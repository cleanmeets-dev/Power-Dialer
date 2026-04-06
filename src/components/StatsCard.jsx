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
    cyan: 'text-cyan-700 dark:text-cyan-400',
    yellow: 'text-yellow-700 dark:text-yellow-400',
    emerald: 'text-emerald-700 dark:text-emerald-400',
    blue: 'text-blue-700 dark:text-blue-400',
  };

  return (
    <div className="bg-linear-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg shadow-lg dark:shadow-slate-900/30 p-6 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{label}</p>
          <p className={`text-3xl font-bold ${colorMap[color] || 'text-slate-900 dark:text-white'}`}>{value}</p>
        </div>
        {Icon && <Icon className={`w-10 h-10 ${colorMap[color] || 'text-slate-500 dark:text-slate-400'}`} />}
      </div>
    </div>
  );
}
