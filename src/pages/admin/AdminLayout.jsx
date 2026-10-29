import { NavLink, Outlet } from 'react-router-dom';
import { BadgeCheck, CalendarCheck, FileText, Flag, LayoutDashboard, ScrollText, Tags, Users } from 'lucide-react';
import Seo from '../../components/Seo.jsx';
import { cx } from '../../utils/cx.js';

const NAV = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/events', label: 'Events', icon: CalendarCheck },
    { to: '/admin/reports', label: 'Reports', icon: Flag },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/organizers', label: 'Organizers', icon: BadgeCheck },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
    { to: '/admin/content', label: 'Site content', icon: FileText },
];

export default function AdminLayout() {
    return (
        <div className="container-page py-8">
            <Seo title="Admin" noindex />
            <h1 className="mb-5 text-3xl font-extrabold">Admin panel</h1>
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <nav aria-label="Admin sections" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
                    <ul className="flex gap-1 lg:flex-col">
                        {NAV.map(({ to, label, icon: Icon, end }) => (
                            <li key={to} className="shrink-0">
                                <NavLink
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        cx(
                                            'flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-semibold',
                                            isActive
                                                ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-200'
                                                : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                                        )
                                    }
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="min-w-0"><Outlet /></div>
            </div>
        </div>
    );
}