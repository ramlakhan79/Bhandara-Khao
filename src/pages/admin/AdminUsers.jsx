import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ban, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { Select } from '../../components/ui/form.jsx';
import { DebouncedInput } from '../../components/explore/FilterPanel.jsx';
import ReasonDialog from '../../components/admin/ReasonDialog.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { errorMessage } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';

export default function AdminUsers() {
    const { user: me } = useAuth();
    const [sp, setSp] = useSearchParams();
    const [page, setPage] = useState(1);
    const [suspend, setSuspend] = useState(null);
    const [reactivate, setReactivate] = useState(null);

    const filters = { q: sp.get('q') || '', accountStatus: sp.get('status') || '', role: sp.get('role') || '' };
    const setFilter = (k, v) => {
        setPage(1);
        setSp((prev) => { const n = new URLSearchParams(prev); if (v) n.set(k, v); else n.delete(k); return n; }, { replace: true });
    };

    const { data: res, loading, error, reload } = useApi((s) => adminService.users({ ...filters, page, limit: 15 }, s), [JSON.stringify(filters), page]);
    const items = res?.data || [];

    const setStatus = async (u, accountStatus, reason) => {
        try {
            await adminService.setUserStatus(u._id, { accountStatus, reason: reason || undefined });
            toast.success(accountStatus === 'suspended' ? 'Account suspended' : 'Account reactivated');
            reload();
        } catch (err) {
            toast.error(errorMessage(err));
            throw err;
        }
    };

    return (
        <div>
            <h2 className="mb-4 text-xl font-bold">Users</h2>
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
                <DebouncedInput label="Search" type="search" placeholder="Name or email" value={filters.q} onCommit={(v) => setFilter('q', v)} />
                <Select label="Account status" value={filters.accountStatus} onChange={(e) => setFilter('status', e.target.value)}>
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </Select>
                <Select label="Role" value={filters.role} onChange={(e) => setFilter('role', e.target.value)}>
                    <option value="">All</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                </Select>
            </div>

            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
            ) : !items.length ? (
                <EmptyState title="No users match" />
            ) : (
                <>
                    <ul className="space-y-3">
                        {items.map((u) => (
                            <li key={u._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <Avatar user={u} size={44} />
                                    <div className="min-w-0">
                                        <p className="flex flex-wrap items-center gap-2 font-bold">
                                            <span className="truncate">{u.name}</span>
                                            {u.role === 'admin' && <Badge tone="brand">Admin</Badge>}
                                            {u.isVerifiedOrganizer && <Badge tone="green">Verified organizer</Badge>}
                                            {u.accountStatus === 'suspended' && <Badge tone="red">Suspended</Badge>}
                                        </p>
                                        <p className="truncate text-sm text-stone-600 dark:text-stone-400">{u.email}{u.isEmailVerified ? '' : ' (unverified)'}</p>
                                        <p className="text-xs text-stone-500">Joined {formatDate(u.createdAt)} · {u.eventCount} event{u.eventCount === 1 ? '' : 's'}</p>
                                        {u.suspensionReason && <p className="text-xs italic">Reason: {u.suspensionReason}</p>}
                                    </div>
                                </div>
                                {u.role !== 'admin' && u._id !== me._id && (
                                    u.accountStatus === 'active' ? (
                                        <Button size="sm" variant="secondary" onClick={() => setSuspend(u)}><Ban className="h-4 w-4" aria-hidden="true" /> Suspend</Button>
                                    ) : (
                                        <Button size="sm" variant="leaf" onClick={() => setReactivate(u)}><UserCheck className="h-4 w-4" aria-hidden="true" /> Reactivate</Button>
                                    )
                                )}
                            </li>
                        ))}
                    </ul>
                    <Pagination className="mt-6" page={res.meta.page} totalPages={res.meta.totalPages} onChange={setPage} />
                </>
            )}

            <ReasonDialog
                open={!!suspend}
                onClose={() => setSuspend(null)}
                danger
                title="Suspend this account?"
                description={`${suspend?.name} will be logged out of access and their approved events will be hidden until you reactivate the account.`}
                label="Reason (kept in the audit log)"
                confirmLabel="Suspend"
                onSubmit={(reason) => setStatus(suspend, 'suspended', reason)}
            />
            <ConfirmDialog
                open={!!reactivate}
                onClose={() => setReactivate(null)}
                tone="primary"
                title="Reactivate this account?"
                confirmLabel="Reactivate"
                description={`${reactivate?.name} will be able to log in again and their hidden events will be restored.`}
                onConfirm={() => setStatus(reactivate, 'active')}
            />
        </div>
    );
}