import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
	LayoutGrid,
	Megaphone,
	FileText,
	Phone,
	Users,
	Clock,
	PhoneCall,
	CalendarDays,
	Repeat2
} from 'lucide-react';

function getSidebarItems(role) {
	if (role === 'manager' || role === 'admin') {
		return [
			{ id: 'overview', label: 'Dashboard', icon: LayoutGrid, path: '/manager' },
			{ id: 'campaigns', label: 'Campaigns', icon: Megaphone, path: '/manager/campaigns' },
			// { id: 'leads', label: 'Leads', icon: FileText, path: '/manager/leads' },
			{ id: 'followups', label: 'Lead Status/Followups', icon: Repeat2, path: '/manager/followups' },
			// { id: 'call-logs', label: 'Call Logs', icon: Phone, path: '/manager/call-logs' },
			{ id: 'agents', label: 'Agents (Live)', icon: Users, path: '/manager/agents' },
			{ id: 'attendance', label: 'Attendance Logs', icon: CalendarDays, path: '/manager/attendance' },
		];
	}

	return [
		{ id: 'overview', label: 'Dashboard', icon: LayoutGrid, path: '/agent' },
		// { id: 'leads', label: 'View Leads', icon: FileText, path: '/agent/leads' },
		{ id: 'auto-dialer', label: 'Auto Dialer', icon: PhoneCall, path: '/agent/auto-dialer' },
		{ id: 'direct-dialer', label: 'Direct Dialer', icon: Phone, path: '/agent/direct-dialer' },
		// { id: 'power-dialer', label: 'Power Dialer', icon: PhoneCall, path: '/agent/power-dialer' },
		// { id: 'call-logs', label: 'Call Logs', icon: Phone, path: '/agent/call-logs' },
		{ id: 'followups', label: 'Lead Status/Followups', icon: Repeat2, path: '/agent/followups' },
	];
}

export default function Sidebar({ user, isOpen, onClose }) {
	const { theme } = useAuth();
	const navItems = getSidebarItems(user?.role);

	const navClassName = ({ isActive }) =>
		`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
			isActive
				? 'bg-primary-600 text-white shadow-lg'
				: `text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-white`
		}`;

	return (
		<>
			<aside className="hidden md:block w-72 shrink-0">
				<div className="sticky top-24 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 backdrop-blur p-4">
					<p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">Navigation</p>
					<nav className="space-y-2">
						{navItems.map(({ id, label, icon: Icon, path }) => (
							<NavLink key={id} to={path} end={id === 'overview'} className={navClassName}>
								<Icon className="w-4 h-4" />
								<span className="text-sm font-medium">{label}</span>
							</NavLink>
						))}
					</nav>
				</div>
			</aside>

			{isOpen && (
				<div className="md:hidden fixed inset-0 z-40">
					<button
						type="button"
						className="absolute inset-0 bg-black/50"
						onClick={onClose}
						aria-label="Close navigation"
					/>
					<aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4">
						<p className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">Navigation</p>
						<nav className="space-y-2">
							{navItems.map(({ id, label, icon: Icon, path }) => (
								<NavLink
									key={id}
									to={path}
									end={id === 'overview'}
									className={navClassName}
									onClick={onClose}
								>
									<Icon className="w-4 h-4" />
									<span className="text-sm font-medium">{label}</span>
								</NavLink>
							))}
						</nav>
					</aside>
				</div>
			)}
		</>
	);
}
