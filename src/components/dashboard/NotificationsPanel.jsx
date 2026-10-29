import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { Checkbox } from '../ui/form.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { notificationService } from '../../services/notificationService.js';
import { errorMessage } from '../../services/api.js';
import { formatRelative } from '../../utils/format.js';
import { cx } from '../../utils/cx.js';

export default function NotificationsPanel() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [page, setPage] = useState(1);
    const [savingPref, setSavingPref] = useState(false);
    const { data: res, loading, error, reload, setData } = useApi((s) => notificationService.list({ page, limit: 10 }, s), [page]);

    const items = res?.data || [];
    const prefs = user.notificationPreferences || {};

    const open = async (n) => {
        if (!n.isRead) {
            setData((r) => ({ ...r, unreadCount: Math.max(0, (r.unreadCount || 1) - 1), data: r.data.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)) }));
            notificationService.markRead(n._id).catch(() => { });
        }
        if (n.link?.startsWith('/')) navigate(n.link);
    };

    const markAll = async () => {
        try {
            await notificationService.markAllRead();
            setData((r) => ({ ...r, unreadCount: 0, data: r.data.map((x) => ({ ...x, isRead: true })) }));
        } catch (err) {
            toast.error(errorMessage(err));
        }
    };

    const setPref = async (key, value) => {
        setSavingPref(true);
        try {
            const out = await notificationService.updatePreferences({ [key]: value });
            updateUser({ ...user, notificationPreferences: out.notificationPreferences });
            toast.success('Preferences saved');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setSavingPref(false);
        }
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section aria-labelledby="notif-h">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 id="notif-h" className="text-xl font-bold">
                        Notifications {res?.unreadCount > 0 && <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">({res.unreadCount} unread)</span>}
                    </h2>
                    <Button variant="secondary" size="sm" onClick={markAll} disabled={!res?.unreadCount}>
                        <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all read
                    </Button>
                </div>

                {error ? (
                    <ErrorState error={error} onRetry={reload} />
                ) : loading ? (
                    <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
                ) : !items.length ? (
                    <EmptyState icon={Bell} title="No notifications yet" description="Approvals, cancellations, event changes and reminders show up here." />
                ) : (
                    <>
                        <ul className="card divide-y divide-stone-100 overflow-hidden dark:divide-stone-800">
                            {items.map((n) => (
                                <li key={n._id}>
                                    <button
                                        type="button"
                                        onClick={() => open(n)}
                                        className={cx('flex w-full gap-3 px-4 py-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800/60', !n.isRead && 'bg-brand-50/60 dark:bg-brand-900/10')}
                                    >
                                        <span className={cx('mt-2 h-2.5 w-2.5 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-brand-700 dark:bg-brand-400')} aria-hidden="true" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-semibold">{n.title}{!n.isRead && <span className="sr-only"> (unread)</span>}</span>
                                            <span className="mt-0.5 block text-sm text-stone-600 dark:text-stone-400">{n.message}</span>
                                            <span className="mt-1 block text-xs text-stone-500">{formatRelative(n.createdAt)}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <Pagination className="mt-6" page={res.meta.page} totalPages={res.meta.totalPages} onChange={setPage} />
                    </>
                )}
            </section>

            <aside className="card h-fit p-5" aria-labelledby="pref-h">
                <h2 id="pref-h" className="mb-2 text-lg font-bold">Notification settings</h2>
                <p className="mb-3 text-sm text-stone-600 dark:text-stone-400">Choose what you receive. You can change this any time.</p>
                <Checkbox label="Show notifications in the app" checked={prefs.inApp !== false} disabled={savingPref} onChange={(e) => setPref('inApp', e.target.checked)} />
                <Checkbox label="Email reminders before saved events" checked={prefs.emailReminders !== false} disabled={savingPref} onChange={(e) => setPref('emailReminders', e.target.checked)} />
                <Checkbox label="Email me about event updates and moderation" checked={prefs.emailEventUpdates !== false} disabled={savingPref} onChange={(e) => setPref('emailEventUpdates', e.target.checked)} />
            </aside>
        </div>
    );
}