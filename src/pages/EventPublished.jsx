import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, Copy, QrCode, Share2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import QrModal from '../components/event/QrModal.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { useApi } from '../hooks/useApi.js';
import { bhandaraService } from '../services/bhandaraService.js';
import { copyText, eventUrl, nativeShare, whatsappShareUrl } from '../utils/share.js';
import { formatEventWhen } from '../utils/format.js';

export default function EventPublished() {
    const { slug } = useParams();
    const { data: event, loading, error, reload } = useApi((s) => bhandaraService.bySlug(slug, s), [slug]);
    const [qrOpen, setQrOpen] = useState(false);

    if (loading) return <div className="container-page max-w-2xl py-12"><Skeleton className="h-72 w-full" /></div>;
    if (error) return <div className="container-page py-12"><ErrorState error={error} onRetry={reload} /></div>;

    const url = eventUrl(event.slug);
    const live = event.status === 'published' && event.moderationStatus === 'approved';
    const pending = event.status === 'published' && event.moderationStatus === 'pending';
    const when = formatEventWhen(event.startDateTime, event.endDateTime);

    const copy = async () => ((await copyText(url)) ? toast.success('Link copied') : toast.error('Could not copy the link'));
    const share = async () => {
        const used = await nativeShare({ title: event.title, text: `${event.title}, ${when}`, url });
        if (!used) copy();
    };

    return (
        <div className="container-page max-w-2xl py-10">
            <Seo title="Published" noindex />
            <div className="card p-6 text-center sm:p-10">
                {pending ? (
                    <Clock className="mx-auto h-16 w-16 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                ) : (
                    <CheckCircle2 className="mx-auto h-16 w-16 text-leaf-600 dark:text-leaf-400" aria-hidden="true" />
                )}
                <h1 className="mt-4 text-3xl font-extrabold">{pending ? 'Submitted for review' : 'Your bhandara is live!'}</h1>
                <p className="mt-2 text-stone-700 dark:text-stone-300">
                    <strong>{event.title}</strong>
                    <br />{when}
                </p>
                {pending && (
                    <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm dark:bg-brand-900/20" role="status">
                        A moderator will review your event shortly. We'll notify you when it is approved. Until then only you can see it.
                    </p>
                )}

                <div className="mt-6 rounded-xl bg-stone-100 p-3 text-left dark:bg-stone-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Event link</p>
                    <p className="break-all font-medium">{url}</p>
                </div>

                {live && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        <Button variant="secondary" onClick={copy}><Copy className="h-4 w-4" aria-hidden="true" /> Copy link</Button>
                        {typeof navigator !== 'undefined' && navigator.share && (
                            <Button variant="secondary" onClick={share}><Share2 className="h-4 w-4" aria-hidden="true" /> Share</Button>
                        )}
                        <Button as="a" variant="leaf" href={whatsappShareUrl({ title: `${event.title}, ${when}`, url })} target="_blank" rel="noopener noreferrer">
                            Share on WhatsApp
                        </Button>
                        <Button variant="secondary" onClick={() => setQrOpen(true)}><QrCode className="h-4 w-4" aria-hidden="true" /> QR code</Button>
                    </div>
                )}

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button as={Link} to={`/bhandaras/${event.slug}`}>View event page</Button>
                    <Button as={Link} to="/dashboard" variant="secondary">Go to dashboard</Button>
                    <Button as={Link} to="/bhandaras/create" variant="ghost">Post another</Button>
                </div>
            </div>
            <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={url} title={event.title} />
        </div>
    );
}