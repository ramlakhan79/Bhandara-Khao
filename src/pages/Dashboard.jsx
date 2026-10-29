import { Link, useSearchParams } from 'react-router-dom';
import { Bell, Bookmark, CalendarDays, Plus, UserCog } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import MyEvents from '../components/dashboard/MyEvents.jsx';
import SavedEvents from '../components/dashboard/SavedEvents.jsx';
import NotificationsPanel from '../components/dashboard/NotificationsPanel.jsx';
import ProfileSettings from '../components/dashboard/ProfileSettings.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cx } from '../utils/cx.js';

const TABS = [
    { key: 'events', label: 'My events', icon: CalendarDays },
    { key: 'saved', label: 'Saved', icon: Bookmark },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'profile', label: 'Profile & settings', icon: UserCog },
];

export default function Dashboard() {
    const { user } = useAuth();
    const [sp, setSp] = useSearchParams();
    const tab = TABS.some((t) => t.key === sp.get('tab')) ? sp.get('tab') : 'events';
    const sub = sp.get('sub') || 'all';

    const setTab = (key) => setSp(key === 'events' ? {} : { tab: key });
    const setSub = (s) => setSp(s === 'all' ? { tab: 'events' } : { tab: 'events', sub: s }, { replace: true });

    return (
        <div className="container-page py-8">
            <Seo title="Dashboard" noindex />

            <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                    <Avatar user={user} size={56} />
                    <div className="min-w-0">
                        <h1 className="truncate text-2xl font-extrabold">Hello, {user.name.split(' ')[0]}</h1>
                        <p className="flex flex-wrap items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                            <span className="truncate">{user.email}</span>
                            {user.isEmailVerified ? <Badge tone="green">Email verified</Badge> : <Badge tone="brand">Email not verified</Badge>}
                            {user.isVerifiedOrganizer && <Badge tone="green">Verified organizer</Badge>}
                        </p>
                    </div>
                </div>
                <Button as={Link} to="/bhandaras/create"><Plus className="h-4 w-4" aria-hidden="true" /> Post a Bhandara</Button>
            </header>

            <nav aria-label="Dashboard sections" className="-mx-4 mb-6 overflow-x-auto border-b border-stone-200 px-4 dark:border-stone-800">
                <ul className="flex min-w-max gap-1">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <li key={key}>
                            <button
                                type="button"
                                onClick={() => setTab(key)}
                                aria-current={tab === key ? 'page' : undefined}
                                className={cx(
                                    'inline-flex min-h-[48px] items-center gap-2 border-b-2 px-4 text-sm font-semibold',
                                    tab === key
                                        ? 'border-brand-700 text-brand-800 dark:border-brand-400 dark:text-brand-300'
                                        : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                                )}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {tab === 'events' && <MyEvents sub={sub} onSubChange={setSub} />}
            {tab === 'saved' && <SavedEvents />}
            {tab === 'notifications' && <NotificationsPanel />}
            {tab === 'profile' && <ProfileSettings />}
        </div>
    );
}