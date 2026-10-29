import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkX } from 'lucide-react';
import toast from 'react-hot-toast';
import EventCard, { EventCardSkeleton } from '../EventCard.jsx';
import Button from '../ui/Button.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Pagination from '../ui/Pagination.jsx';
import { Select } from '../ui/form.jsx';
import { useApi } from '../../hooks/useApi.js';
import { bookmarkService } from '../../services/bookmarkService.js';
import { errorMessage } from '../../services/api.js';
import { REMINDER_OPTIONS } from '../../utils/constants.js';

export default function SavedEvents() {
    const [page, setPage] = useState(1);
    const { data: res, loading, error, reload, setData } = useApi((s) => bookmarkService.list({ page, limit: 9 }, s), [page]);
    const items = res?.data || [];

    const remove = async (ev) => {
        try {
            await bookmarkService.remove(ev._id);
            toast('Removed from saved events');
            if (items.length === 1 && page > 1) setPage((p) => p - 1);
            else reload();
        } catch (err) {
            toast.error(errorMessage(err));
        }
    };

    const setReminder = async (ev, value) => {
        try {
            if (value) await bookmarkService.setReminder(ev._id, Number(value));
            else await bookmarkService.removeReminder(ev._id);
            setData((r) => ({
                ...r,
                data: r.data.map((x) => (x._id === ev._id ? { ...x, reminder: value ? { remindBeforeHours: Number(value), sent: false } : null } : x)),
            }));
            toast.success(value ? 'Reminder set' : 'Reminder removed');
        } catch (err) {
            toast.error(errorMessage(err));
        }
    };

    if (error) return <ErrorState error={error} onRetry={reload} />;

    if (loading) {
        return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <EventCardSkeleton key={i} />)}</div>;
    }

    if (!items.length) {
        return (
            <EmptyState
                icon={Bookmark}
                title="No saved events yet"
                description="Tap “Save event” on any bhandara to keep it here and get reminders."
                action={<Button as={Link} to="/bhandaras">Browse bhandaras</Button>}
            />
        );
    }

    return (
        <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((ev) => (
                    <div key={ev._id} className="flex flex-col gap-2">
                        <EventCard event={ev} className="flex-1" />
                        <div className="card flex flex-wrap items-end gap-2 p-3">
                            {ev.lifecycle === 'upcoming' && (
                                <Select
                                    label="Email reminder"
                                    wrapperClassName="min-w-[160px] flex-1"
                                    value={ev.reminder?.remindBeforeHours ?? ''}
                                    onChange={(e) => setReminder(ev, e.target.value)}
                                >
                                    <option value="">None</option>
                                    {REMINDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </Select>
                            )}
                            <Button variant="secondary" size="md" onClick={() => remove(ev)}>
                                <BookmarkX className="h-4 w-4" aria-hidden="true" /> Remove
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <Pagination className="mt-8" page={res.meta.page} totalPages={res.meta.totalPages} onChange={setPage} />
        </>
    );
}