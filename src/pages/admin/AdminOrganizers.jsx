import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { Select } from '../../components/ui/form.jsx';
import ReasonDialog from '../../components/admin/ReasonDialog.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { errorMessage } from '../../services/api.js';
import { formatDateTime } from '../../utils/format.js';
import { safeHref } from '../../utils/safeHref.js';

const TONE = { pending: 'brand', approved: 'green', rejected: 'red' };

export default function AdminOrganizers() {
    const [status, setStatus] = useState('pending');
    const [page, setPage] = useState(1);
    const [dialog, setDialog] = useState(null); // { item, status }

    const { data: res, loading, error, reload } = useApi((s) => adminService.organizers({ status, page, limit: 15 }, s), [status, page]);
    const items = res?.data || [];

    const review = async (note) => {
        try {
            await adminService.reviewOrganizer(dialog.item._id, { status: dialog.status, note: note || undefined });
            toast.success(dialog.status === 'approved' ? 'Organizer verified' : 'Request rejected');
            reload();
        } catch (err) {
            toast.error(errorMessage(err));
            throw err;
        }
    };

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-xl font-bold">Organizer verification</h2>
                <Select label="Show" wrapperClassName="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="all">All</option>
                </Select>
            </div>

            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}</div>
            ) : !items.length ? (
                <EmptyState icon={BadgeCheck} title="No requests" description="Verification requests from organizers appear here." />
            ) : (
                <>
                    <ul className="space-y-3">
                        {items.map((v) => (
                            <li key={v._id} className="card p-4">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <Badge tone={TONE[v.status]} className="mb-1">{v.status}</Badge>
                                        <h3 className="font-bold">{v.organizationName}</h3>
                                        <p className="text-sm text-stone-600 dark:text-stone-400">{v.user?.name} ({v.user?.email}) · requested {formatDateTime(v.createdAt)}</p>
                                        {v.description && <p className="mt-2 whitespace-pre-line text-sm">{v.description}</p>}
                                        {v.proofLinks?.length > 0 && (
                                            <ul className="mt-2 space-y-1 text-sm">
                                                {v.proofLinks.map((l) => {
                                                    const href = safeHref(l);
                                                    return (
                                                        <li key={l} className="break-all">
                                                            {href ? <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="link">{l}</a> : <span>{l} (not a web link)</span>}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                        {v.reviewNote && <p className="mt-2 text-sm italic">Review note: {v.reviewNote}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        {v.status !== 'approved' && <Button size="sm" variant="leaf" onClick={() => setDialog({ item: v, status: 'approved' })}>Approve</Button>}
                                        {v.status !== 'rejected' && <Button size="sm" variant="secondary" onClick={() => setDialog({ item: v, status: 'rejected' })}>{v.status === 'approved' ? 'Revoke' : 'Reject'}</Button>}
                                    </div>
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
                required={dialog?.status === 'rejected'}
                danger={dialog?.status === 'rejected'}
                title={dialog?.status === 'approved' ? 'Verify this organizer' : 'Reject / revoke verification'}
                description={`${dialog?.item.organizationName}: the organizer is notified.`}
                label={dialog?.status === 'approved' ? 'Note (optional)' : 'Reason for the organizer'}
                confirmLabel={dialog?.status === 'approved' ? 'Verify' : 'Reject'}
                onSubmit={review}
            />
        </div>
    );
}