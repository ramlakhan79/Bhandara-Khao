import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../services/notificationService.js';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { formatRelative } from '../utils/format.js';
import { cx } from '../utils/cx.js';
import Spinner from './ui/Spinner.jsx';

export default function NotificationBell() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const ref = useRef(null);
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useClickOutside(ref, () => setOpen(false), open);
    useEffect(() => setOpen(false), [pathname]);

    const refreshCount = useCallback(async (signal) => {
        try {
            const res = await notificationService.list({ limit: 1, unreadOnly: 'true' }, signal);
            setUnread(res.unreadCount ?? 0);
        } catch { /* silent: the bell is non-critical */ }
    }, []);

    // Poll for new notifications while the tab is visible
    useEffect(() => {
        const controller = new AbortController();
        refreshCount(controller.signal);
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') refreshCount();
        }, 60000);
        return () => {
            controller.abort();
            clearInterval(id);
        };
    }, [refreshCount]);

    useEffect(() => {
        if (!open) return undefined;
        const controller = new AbortController();
        setLoading(true);
        notificationService
            .list({ limit: 8 }, controller.signal)
            .then((res) => {
                setItems(res.data);
                setUnread(res.unreadCount ?? 0);
            })
            .catch(() => { })
            .finally(() => !controller.signal.aborted && setLoading(false));
        return () => controller.abort();
    }, [open]);

    const openItem = async (n) => {
        if (!n.isRead) {
            setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
            setUnread((u) => Math.max(0, u - 1));
            notificationService.markRead(n._id).catch(() => { });
        }
        if (n.link?.startsWith('/')) navigate(n.link);
        setOpen(false);
    };

    const markAll = async () => {
        setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
        setUnread(0);
        notificationService.markAllRead().catch(() => { });
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
                aria-expanded={open}
                aria-haspopup="true"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unread > 0 && (
                    <span className="absolute right-1 top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-700 px-1 text-[11px] font-bold leading-[18px] text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="card fixed inset-x-2 top-16 z-50 max-h-[75vh] overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
                    <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
                        <h2 className="font-bold">Notifications</h2>
                        <button
                            type="button"
                            onClick={markAll}
                            disabled={!unread}
                            className="inline-flex min-h-[36px] items-center gap-1 rounded-md px-2 text-sm font-semibold text-brand-700 hover:bg-stone-100 disabled:opacity-50 dark:text-brand-400 dark:hover:bg-stone-800"
                        >
                            <CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all read
                        </button>
                    </div>

                    <div className="max-h-[55vh] overflow-y-auto">
                        {loading && !items.length ? (
                            <div className="flex justify-center py-8"><Spinner /></div>
                        ) : items.length === 0 ? (
                            <p className="px-4 py-8 text-center text-stone-600 dark:text-stone-400">You're all caught up.</p>
                        ) : (
                            <ul>
                                {items.map((n) => (
                                    <li key={n._id} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                                        <button
                                            type="button"
                                            onClick={() => openItem(n)}
                                            className={cx('flex w-full gap-3 px-4 py-3 text-left hover:bg-stone-50 dark:hover:bg-stone-800/60', !n.isRead && 'bg-brand-50/60 dark:bg-brand-900/10')}
                                        >
                                            <span className={cx('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.isRead ? 'bg-transparent' : 'bg-brand-700 dark:bg-brand-400')} aria-hidden="true" />
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold">{n.title}</span>
                                                <span className="mt-0.5 block text-sm text-stone-600 dark:text-stone-400">{n.message}</span>
                                                <span className="mt-1 block text-xs text-stone-500">{formatRelative(n.createdAt)}</span>
                                            </span>
                                            {!n.isRead && <span className="sr-only">Unread</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link
                        to="/dashboard?tab=notifications"
                        className="block border-t border-stone-200 px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-stone-50 dark:border-stone-800 dark:text-brand-400 dark:hover:bg-stone-800/60"
                    >
                        View all &amp; settings
                    </Link>
                </div>
            )}
        </div>
    );
}