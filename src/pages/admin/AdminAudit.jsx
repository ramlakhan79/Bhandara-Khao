import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { DebouncedInput } from '../../components/explore/FilterPanel.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { formatDateTime } from '../../utils/format.js';

export default function AdminAudit() {
    const [action, setAction] = useState('');
    const [page, setPage] = useState(1);
    const { data: res, loading, error, reload } = useApi((s) => adminService.auditLogs({ action, page, limit: 20 }, s), [action, page]);
    const items = res?.data || [];

    return (
        <div>
            <h2 className="mb-4 text-xl font-bold">Audit log</h2>
            <DebouncedInput
                label="Filter by action"
                placeholder="e.g. user. or event.hide"
                hint="Matches the start of the action name."
                wrapperClassName="mb-5 max-w-sm"
                value={action}
                onCommit={(v) => { setAction(v); setPage(1); }}
            />

            {error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : loading ? (
                <div className="space-y-2">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : !items.length ? (
                <EmptyState icon={ScrollText} title="No entries" description="Sensitive admin actions are recorded here." />
            ) : (
                <>
                    <div className="card overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <caption className="sr-only">Administrative actions</caption>
                            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-800">
                                <tr>
                                    <th scope="col" className="px-4 py-3">When</th>
                                    <th scope="col" className="px-4 py-3">Admin</th>
                                    <th scope="col" className="px-4 py-3">Action</th>
                                    <th scope="col" className="px-4 py-3">Target</th>
                                    <th scope="col" className="px-4 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                {items.map((l) => (
                                    <tr key={l._id} className="align-top">
                                        <td className="whitespace-nowrap px-4 py-3">{formatDateTime(l.createdAt)}</td>
                                        <td className="px-4 py-3">{l.actor?.name || 'Unknown'}<br /><span className="text-xs text-stone-500">{l.actor?.email}</span></td>
                                        <td className="px-4 py-3 font-mono text-xs font-semibold">{l.action}</td>
                                        <td className="px-4 py-3">{l.targetType}</td>
                                        <td className="max-w-xs break-words px-4 py-3 text-xs text-stone-600 dark:text-stone-400">
                                            {l.metadata ? JSON.stringify(l.metadata).slice(0, 200) : ''}
                                            {l.ip && <span className="block text-stone-500">IP {l.ip}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination className="mt-6" page={res.meta.page} totalPages={res.meta.totalPages} onChange={setPage} />
                </>
            )}
        </div>
    );
}