import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, EyeOff, RotateCcw, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { Select } from '../../components/ui/form.jsx';
import { DebouncedInput } from '../../components/explore/FilterPanel.jsx';
import ReasonDialog from '../../components/admin/ReasonDialog.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { errorMessage } from '../../services/api.js';
import { formatDateTime } from '../../utils/format.js';

const MOD_TONE = { pending: 'brand', approved: 'green', rejected: 'red', hidden: 'red' };

export default function AdminEvents() {
    const [sp, setSp] = useSearchParams();
    const [page, setPage] = useState(1);
    const [dialog, setDialog] = useState(null); // { ev, action }

    const filters = { q: sp.get('q') || '', moderationStatus: sp.get('mod') || '', status: sp.get('status') || '', flagged: sp.get('flagged') || '' };
    const setFilter = (key, value) => {
        setPage(1);
        setSp((prev) => {
            const n = new URLSearchParams(prev);
            if (value) n.set(key, value); else n.delete(key);
            return n;
        }, { replace: true });
    };

    const { data: res, loading, error, reload } = useApi((s) => adminService.events({ ...filters, page, limit: 15 }, s), [JSON.stringify(filters), page]);
    const items = res?.data || [];

    const act = async (ev, action, note) => {
        try {
            await adminService.moderate(ev._id, { action, note: note || undefined });
            toast.success('Updated');
            reload();
        } catch (err) {
            toast.error(errorMessage(err));
            throw err;
        }
    };

    const quick = (ev, action) => act(ev, action).catch(() => { });

    return (
        <div>
            <h2 className="mb-4 text-xl font-bold">Events &amp; moderation</h2>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DebouncedInput label="Search" type="search" placeholder="Title, city or organizer" value={filters.q} onCommit={(v) => setFilter('q', v)} />
                <Select label="Moderation" value={filters.moderationStatus} onChange={(e) => setFilter('mod', e.target.value)}>
                    <option value="">All</option>
                    <option value="pending">Pending review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="hidden">Hidden</option>
                </Select>
                <Select label="Status" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                    <option value="">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                </Select>
                <Select label="Reports" value={filters.flagged} onChange={(e) => setFilter('flagged', e.target.value)}>
                    <option value="">All</option>
                    <option value="true">Reported only</option>
                </Select>
            </div>

            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
            ) : !items.length ? (
                <EmptyState title="No events match" description="Try changing the filters." />
            ) : (
                <>
                    <ul className="space-y-3">
                        {items.map((ev) => {
                            const isDraft = ev.status === 'draft';
                            return (
                                <li key={ev._id} className="card p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex flex-wrap gap-2">
                                                {isDraft ? <Badge tone="blue">Draft</Badge> : <Badge tone={MOD_TONE[ev.moderationStatus]}>{ev.moderationStatus}</Badge>}
                                                {ev.status === 'cancelled' && <Badge tone="red">Cancelled</Badge>}
                                                {ev.isFeatured && <Badge tone="brand"><Star className="h-3 w-3" aria-hidden="true" /> Featured</Badge>}
                                                {ev.reportCount > 0 && <Badge tone="red">{ev.reportCount} open report{ev.reportCount > 1 ? 's' : ''}</Badge>}
                                            </div>
                                            <h3 className="font-bold"><Link to={`/bhandaras/${ev.slug}`} className="hover:underline">{ev.title}</Link></h3>
                                            <p className="text-sm text-stone-600 dark:text-stone-400">
                                                {ev.city} · {formatDateTime(ev.startDateTime)} · {ev.viewCount} views
                                            </p>
                                            <p className="text-sm text-stone-600 dark:text-stone-400">
                                                By {ev.organizer?.name} ({ev.organizer?.email}){ev.organizer?.isVerifiedOrganizer ? ', verified' : ''}
                                            </p>
                                            {ev.moderationNote && <p className="mt-1 text-sm italic">Note: {ev.moderationNote}</p>}
                                        </div>

                                        {!isDraft && (
                                            <div className="flex flex-wrap gap-2">
                                                {['pending', 'rejected'].includes(ev.moderationStatus) && (
                                                    <Button size="sm" variant="leaf" onClick={() => quick(ev, 'approve')}><Check className="h-4 w-4" aria-hidden="true" /> Approve</Button>
                                                )}
                                                {ev.moderationStatus === 'pending' && (
                                                    <Button size="sm" variant="secondary" onClick={() => setDialog({ ev, action: 'reject' })}><X className="h-4 w-4" aria-hidden="true" /> Reject</Button>
                                                )}
                                                {ev.moderationStatus === 'approved' && (
                                                    <Button size="sm" variant="secondary" onClick={() => setDialog({ ev, action: 'hide' })}><EyeOff className="h-4 w-4" aria-hidden="true" /> Hide</Button>
                                                )}
                                                {ev.moderationStatus === 'hidden' && (
                                                    <Button size="sm" variant="secondary" onClick={() => quick(ev, 'restore')}><RotateCcw className="h-4 w-4" aria-hidden="true" /> Restore</Button>
                                                )}
                                                {ev.moderationStatus === 'approved' && (
                                                    <Button size="sm" variant="ghost" onClick={() => quick(ev, ev.isFeatured ? 'unfeature' : 'feature')}>
                                                        <Star className="h-4 w-4" aria-hidden="true" /> {ev.isFeatured ? 'Unfeature' : 'Feature'}
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <Pagination className="mt-6" page={res.meta.page} totalPages={res.meta.totalPages} onChange={setPage} />
                </>
            )}

            <ReasonDialog
                open={!!dialog}
                onClose={() => setDialog(null)}
                required
                danger
                title={dialog?.action === 'reject' ? 'Reject this event' : 'Hide this event'}
                description={`The organizer of "${dialog?.ev.title}" will be notified with your note.`}
                label="Reason for the organizer"
                confirmLabel={dialog?.action === 'reject' ? 'Reject' : 'Hide'}
                onSubmit={(note) => act(dialog.ev, dialog.action, note)}
            />
        </div>
    );
}