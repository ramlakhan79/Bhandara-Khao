import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Eye, FilePlus2, Pencil, Trash2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import ConfirmDialog from '../ui/ConfirmDialog.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { Textarea } from '../ui/form.jsx';
import LifecycleBadge from '../LifecycleBadge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { bhandaraService } from '../../services/bhandaraService.js';
import { errorMessage } from '../../services/api.js';
import { formatEventWhen, formatRelative } from '../../utils/format.js';
import { optimizeImage } from '../../utils/image.js';
import { cx } from '../../utils/cx.js';

const SUBS = [
    ['all', 'All'], ['published', 'Published'], ['drafts', 'Drafts'],
    ['upcoming', 'Upcoming'], ['completed', 'Completed'], ['cancelled', 'Cancelled'],
];

function ModerationBadge({ ev }) {
    if (ev.status === 'draft') return null;
    if (ev.moderationStatus === 'pending') return <Badge tone="brand">Awaiting review</Badge>;
    if (ev.moderationStatus === 'rejected') return <Badge tone="red">Not approved</Badge>;
    if (ev.moderationStatus === 'hidden') return <Badge tone="red">Hidden</Badge>;
    return null;
}

export default function MyEvents({ sub, onSubChange }) {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [reason, setReason] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [dupId, setDupId] = useState(null);

    const { data: res, loading, error, reload } = useApi(
        (s) => bhandaraService.mine({ tab: sub, page, limit: 8 }, s),
        [sub, page]
    );
    const items = res?.data || [];
    const counts = res?.counts || {};

    const changeSub = (s) => { setPage(1); onSubChange(s); };

    const duplicate = async (ev) => {
        setDupId(ev._id);
        try {
            const copy = await bhandaraService.duplicate(ev._id);
            toast.success('Draft copy created. Set the new date and publish.');
            navigate(`/bhandaras/${copy.slug}/edit`);
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setDupId(null);
        }
    };

    const doCancel = async () => {
        try {
            await bhandaraService.cancel(cancelTarget._id, reason.trim() || undefined);
            toast.success('Event cancelled. People who saved it were notified.');
            reload();
        } catch (err) {
            toast.error(errorMessage(err));
            throw err;
        }
    };

    const doDelete = async () => {
        try {
            await bhandaraService.remove(deleteTarget._id);
            toast.success('Event deleted');
            if (items.length === 1 && page > 1) setPage((p) => p - 1);
            else reload();
        } catch (err) {
            toast.error(errorMessage(err));
            throw err;
        }
    };

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter my events">
                    {SUBS.map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={sub === key}
                            onClick={() => changeSub(key)}
                            className={cx(
                                'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-sm font-semibold',
                                sub === key
                                    ? 'border-brand-700 bg-brand-700 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-stone-950'
                                    : 'border-stone-300 bg-white hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800'
                            )}
                        >
                            {label}
                            {counts[key] !== undefined && <span className="opacity-80">({counts[key]})</span>}
                        </button>
                    ))}
                </div>
                <Button as={Link} to="/bhandaras/create"><FilePlus2 className="h-4 w-4" aria-hidden="true" /> New</Button>
            </div>

            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
            ) : items.length === 0 ? (
                <EmptyState
                    icon={FilePlus2}
                    title={sub === 'all' ? "You haven't posted any bhandaras yet" : 'Nothing here'}
                    description={sub === 'all' ? 'Share your first bhandara with the community.' : 'Events matching this filter will appear here.'}
                    action={sub === 'all' && <Button as={Link} to="/bhandaras/create">Post a Bhandara</Button>}
                />
            ) : (
                <>
                    <ul className="space-y-3">
                        {items.map((ev) => {
                            const canCancel = ev.status === 'published' && ['upcoming', 'ongoing'].includes(ev.lifecycle);
                            return (
                                <li key={ev._id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                                    <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800 sm:w-36">
                                        {ev.coverImage?.url && (
                                            <img src={optimizeImage(ev.coverImage.url, { w: 288, h: 192 })} alt="" loading="lazy" className="h-full w-full object-cover" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <LifecycleBadge lifecycle={ev.lifecycle} />
                                            <ModerationBadge ev={ev} />
                                        </div>
                                        <h3 className="mt-1 truncate text-lg font-bold">
                                            <Link to={`/bhandaras/${ev.slug}`} className="hover:underline">{ev.title}</Link>
                                        </h3>
                                        <p className="text-sm text-stone-600 dark:text-stone-400">
                                            {formatEventWhen(ev.startDateTime, ev.endDateTime)} · {ev.city}
                                        </p>
                                        <p className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-stone-600 dark:text-stone-400">
                                            <span className="inline-flex items-center gap-1"><Eye className="h-4 w-4" aria-hidden="true" /> {ev.viewCount ?? 0} views</span>
                                            <span>Updated {formatRelative(ev.updatedAt)}</span>
                                        </p>
                                        {ev.moderationNote && ['rejected', 'hidden'].includes(ev.moderationStatus) && (
                                            <p className="mt-2 rounded-lg bg-red-50 p-2 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-100">Moderator note: {ev.moderationNote}</p>
                                        )}
                                        {ev.status === 'cancelled' && ev.cancelReason && (
                                            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">Cancelled: {ev.cancelReason}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 sm:w-44 sm:flex-col">
                                        <Button as={Link} to={`/bhandaras/${ev.slug}/edit`} variant="secondary" size="sm"><Pencil className="h-4 w-4" aria-hidden="true" /> Edit</Button>
                                        <Button variant="secondary" size="sm" onClick={() => duplicate(ev)} loading={dupId === ev._id}><Copy className="h-4 w-4" aria-hidden="true" /> Duplicate</Button>
                                        {canCancel && (
                                            <Button variant="secondary" size="sm" onClick={() => { setReason(''); setCancelTarget(ev); }}><XCircle className="h-4 w-4" aria-hidden="true" /> Cancel event</Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="text-red-700 dark:text-red-400" onClick={() => setDeleteTarget(ev)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Delete</Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <Pagination className="mt-6" page={res.meta.page} totalPages={res.meta.totalPages} onChange={setPage} />
                </>
            )}

            <ConfirmDialog
                open={!!cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={doCancel}
                title="Cancel this event?"
                confirmLabel="Cancel event"
                description={`"${cancelTarget?.title}" will be marked as cancelled and anyone who saved it will be notified.`}
            >
                <Textarea label="Reason (optional, shown to visitors)" rows={2} maxLength={500} className="mt-4" value={reason} onChange={(e) => setReason(e.target.value)} />
            </ConfirmDialog>

            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={doDelete}
                title="Delete this event?"
                confirmLabel="Delete permanently"
                description={`"${deleteTarget?.title}" and its photos will be permanently deleted. This can't be undone. If the event is just off, cancel it instead.`}
            />
        </div>
    );
}