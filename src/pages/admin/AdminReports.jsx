import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { Checkbox, Select } from '../../components/ui/form.jsx';
import ReasonDialog from '../../components/admin/ReasonDialog.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { errorMessage } from '../../services/api.js';
import { REPORT_REASONS } from '../../utils/constants.js';
import { formatDateTime } from '../../utils/format.js';

const REASON = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label]));
const TONE = { open: 'brand', resolved: 'green', dismissed: 'neutral' };

export default function AdminReports() {
    const [status, setStatus] = useState('open');
    const [page, setPage] = useState(1);
    const [dialog, setDialog] = useState(null); // { report, status }
    const [hideEvent, setHideEvent] = useState(false);

    const { data: res, loading, error, reload } = useApi((s) => adminService.reports({ status, page, limit: 15 }, s), [status, page]);
    const items = res?.data || [];

    const submit = async (note) => {
        try {
            await adminService.updateReport(dialog.report._id, {
                status: dialog.status,
                resolutionNote: note || undefined,
                hideEvent: dialog.status === 'resolved' && hideEvent,
            });
            toast.success('Report updated');
            reload();
        } catch (err) {
            toast.error(errorMessage(err));
            throw err;
        }
    };

    const openDialog = (report, st) => { setHideEvent(false); setDialog({ report, status: st }); };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-xl font-bold">Reported events</h2>
                <Select label="Show" wrapperClassName="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="all">All</option>
                </Select>
            </div>

            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
            ) : !items.length ? (
                <EmptyState icon={Flag} title="No reports here" description="Community reports will appear in this queue." />
            ) : (
                <>
                    <ul className="space-y-3">
                        {items.map((r) => (
                            <li key={r._id} className="card p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap gap-2">
                                            <Badge tone={TONE[r.status]}>{r.status}</Badge>
                                            <Badge tone="red">{REASON[r.reason] || r.reason}</Badge>
                                            {r.event && <Badge>{r.event.moderationStatus}</Badge>}
                                        </div>
                                        {r.event ? (
                                            <h3 className="font-bold"><Link to={`/bhandaras/${r.event.slug}`} className="hover:underline">{r.event.title}</Link> <span className="font-normal text-stone-600 dark:text-stone-400">· {r.event.city}</span></h3>
                                        ) : (
                                            <h3 className="font-bold">Event no longer exists</h3>
                                        )}
                                        {r.details && <p className="mt-1 whitespace-pre-line text-sm">“{r.details}”</p>}
                                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                                            Reported by {r.reporter?.name} ({r.reporter?.email}) · {formatDateTime(r.createdAt)}
                                        </p>
                                        {r.resolutionNote && <p className="mt-1 text-sm italic">Resolution: {r.resolutionNote}</p>}
                                    </div>
                                    {r.status === 'open' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => openDialog(r, 'dismissed')}>Dismiss</Button>
                                            <Button size="sm" onClick={() => openDialog(r, 'resolved')}>Resolve</Button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Pagination className="mt-6" page={res.meta.page} totalPages={res.meta.totalPages} onChange={setPage} />
                </>
            )}

            <ReasonDialog
                open={!!dialog}
                onClose={() => setDialog(null)}
                title={dialog?.status === 'resolved' ? 'Resolve report' : 'Dismiss report'}
                description={dialog?.status === 'resolved' ? 'Confirm the report was valid.' : 'The report will be closed without action.'}
                label="Resolution note (optional)"
                confirmLabel={dialog?.status === 'resolved' ? 'Resolve' : 'Dismiss'}
                onSubmit={submit}
            >
                {dialog?.status === 'resolved' && dialog.report.event && (
                    <Checkbox label="Also hide this event and notify the organizer" checked={hideEvent} onChange={(e) => setHideEvent(e.target.checked)} />
                )}
            </ReasonDialog>
        </div>
    );
}