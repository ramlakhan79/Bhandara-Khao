import { Link, useParams } from 'react-router-dom';
import EventForm from '../components/event-form/EventForm.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Button from '../components/ui/Button.jsx';
import { useApi } from '../hooks/useApi.js';
import { bhandaraService } from '../services/bhandaraService.js';

export default function EditEvent() {
    const { slug } = useParams();
    const { data: event, loading, error, reload } = useApi((s) => bhandaraService.bySlug(slug, s), [slug]);

    if (loading) {
        return <div className="container-page max-w-3xl space-y-4 py-8"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96 w-full" /></div>;
    }
    if (error) {
        return <div className="container-page py-12"><ErrorState error={error} onRetry={reload} /></div>;
    }
    if (!event.canManage) {
        return (
            <div className="container-page py-16 text-center">
                <h1 className="text-2xl font-bold">You can't edit this event</h1>
                <p className="mt-2 text-stone-600 dark:text-stone-400">Only the organizer can make changes.</p>
                <Button as={Link} to={`/bhandaras/${slug}`} className="mt-5">View event</Button>
            </div>
        );
    }
    return <EventForm event={event} />;
}