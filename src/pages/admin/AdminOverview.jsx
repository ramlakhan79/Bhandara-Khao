import { Link } from 'react-router-dom';
import Skeleton from '../../components/ui/Skeleton.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { formatNumber } from '../../utils/format.js';

export default function AdminOverview() {
    const { data, loading, error, reload } = useApi((s) => adminService.dashboard(s), []);

    if (error) return <ErrorState error={error} onRetry={reload} />;
    if (loading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>;

    const { stats, eventsPerDay, topCities } = data;
    const cards = [
        { label: 'Pending review', value: stats.pendingEvents, to: '/admin/events?mod=pending', urgent: stats.pendingEvents > 0 },
        { label: 'Open reports', value: stats.openReports, to: '/admin/reports', urgent: stats.openReports > 0 },
        { label: 'Organizer requests', value: stats.pendingVerifications, to: '/admin/organizers', urgent: stats.pendingVerifications > 0 },
        { label: 'Hidden events', value: stats.hiddenEvents, to: '/admin/events?mod=hidden' },
        { label: 'Live events', value: stats.published, to: '/admin/events?mod=approved' },
        { label: 'All events', value: stats.eventsTotal, to: '/admin/events' },
        { label: 'Users', value: stats.users, to: '/admin/users', note: `${formatNumber(stats.newUsers)} new this week` },
        { label: 'Suspended users', value: stats.suspendedUsers, to: '/admin/users?status=suspended' },
    ];
    const max = Math.max(1, ...eventsPerDay.map((d) => d.count));

    return (
        <div className="space-y-8">
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((c) => (
                    <li key={c.label}>
                        <Link to={c.to} className={`card block p-4 transition-shadow hover:shadow-lg ${c.urgent ? 'ring-2 ring-brand-600 dark:ring-brand-400' : ''}`}>
                            <p className="text-3xl font-extrabold">{formatNumber(c.value)}</p>
                            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">{c.label}</p>
                            {c.note && <p className="text-xs text-stone-500">{c.note}</p>}
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="card p-5" aria-labelledby="perday-h">
                    <h2 id="perday-h" className="mb-4 font-bold">Events created, last 14 days</h2>
                    {eventsPerDay.length === 0 ? (
                        <p className="text-stone-600 dark:text-stone-400">No events were created in this period.</p>
                    ) : (
                        <ul className="space-y-2">
                            {eventsPerDay.map((d) => (
                                <li key={d.date} className="flex items-center gap-3 text-sm">
                                    <span className="w-24 shrink-0 text-stone-600 dark:text-stone-400">{d.date}</span>
                                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                                        <span className="block h-full rounded-full bg-brand-600 dark:bg-brand-400" style={{ width: `${(d.count / max) * 100}%` }} />
                                    </span>
                                    <span className="w-6 text-right font-semibold">{d.count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="card p-5" aria-labelledby="cities-h">
                    <h2 id="cities-h" className="mb-4 font-bold">Top cities (live events)</h2>
                    {topCities.length === 0 ? (
                        <p className="text-stone-600 dark:text-stone-400">No live events yet.</p>
                    ) : (
                        <ol className="space-y-2">
                            {topCities.map((c, i) => (
                                <li key={c.name} className="flex justify-between border-b border-stone-100 pb-2 last:border-0 dark:border-stone-800">
                                    <span>{i + 1}. {c.name}</span>
                                    <span className="font-semibold">{c.count}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
            </div>
        </div>
    );
}