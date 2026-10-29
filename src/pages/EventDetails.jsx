import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    AlertTriangle, BadgeCheck, Bookmark, BookmarkCheck, CalendarPlus, Check, Clock, Copy, Eye, EyeOff,
    Flag, Info, Mail, MapPin, Navigation, Pencil, Phone, QrCode, Repeat, Share2, Users, Utensils,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import Gallery from '../components/event/Gallery.jsx';
import ReportModal from '../components/event/ReportModal.jsx';
import QrModal from '../components/event/QrModal.jsx';
import LifecycleBadge from '../components/LifecycleBadge.jsx';
import EventCard, { EventGrid } from '../components/EventCard.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { Select } from '../components/ui/form.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { bhandaraService } from '../services/bhandaraService.js';
import { bookmarkService } from '../services/bookmarkService.js';
import { errorMessage } from '../services/api.js';
import { copyText, directionsUrl, eventUrl, googleCalendarUrl, nativeShare, whatsappShareUrl } from '../utils/share.js';
import { telUrl, whatsappChatUrl, formatHHMM } from '../utils/contact.js';
import { DIET_LABEL, MEAL_LABEL, REMINDER_OPTIONS } from '../utils/constants.js';
import { formatDate, formatEventWhen, formatLongDate, formatTime } from '../utils/format.js';
import { optimizeImage } from '../utils/image.js';
import { SITE } from '../utils/site.js';

const EventsMap = lazy(() => import('../components/map/EventsMap.jsx'));

function Card({ title, icon: Icon, children, id }) {
    return (
        <section id={id} className="card p-5 sm:p-6" aria-labelledby={`${id}-h`}>
            <h2 id={`${id}-h`} className="mb-4 flex items-center gap-2 text-xl font-bold">
                {Icon && <Icon className="h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden="true" />} {title}
            </h2>
            {children}
        </section>
    );
}

function Fact({ label, children }) {
    return (
        <div>
            <dt className="text-sm font-semibold text-stone-600 dark:text-stone-400">{label}</dt>
            <dd className="mt-0.5">{children}</dd>
        </div>
    );
}

function Banner({ tone, icon: Icon, children }) {
    const tones = {
        red: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100',
        neutral: 'border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100',
        brand: 'border-brand-300 bg-brand-50 text-brand-950 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-100',
    };
    return (
        <div role="alert" className={`flex items-start gap-3 rounded-xl border p-4 ${tones[tone]}`}>
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="text-sm font-medium">{children}</div>
        </div>
    );
}

function DetailSkeleton() {
    return (
        <div className="container-page space-y-6 py-8" aria-hidden="true">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            <div className="grid gap-6 lg:grid-cols-3">
                <Skeleton className="h-72 lg:col-span-2" />
                <Skeleton className="h-72" />
            </div>
        </div>
    );
}

export default function EventDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    const { data: event, loading, error, reload, setData } = useApi(
        (signal) => bhandaraService.bySlug(slug, signal),
        [slug, user?._id],
        { enabled: !authLoading }
    );

    const isPublic = !!event && event.status !== 'draft' && event.moderationStatus === 'approved';

    const related = useApi((signal) => bhandaraService.related(slug, signal), [slug], { enabled: isPublic });

    const [saving, setSaving] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);

    // Count the view once per event load (the server de-duplicates repeat visits)
    useEffect(() => {
        if (event?._id && isPublic) bhandaraService.trackView(event._id);
    }, [event?._id, isPublic]);

    const images = useMemo(() => {
        if (!event?.images?.length) return [];
        const coverId = event.coverImage?.publicId;
        return [...event.images].sort((a, b) => (a.publicId === coverId ? -1 : b.publicId === coverId ? 1 : a.order - b.order));
    }, [event]);

    const requireLogin = () => {
        toast('Please log in to continue');
        navigate('/login', { state: { from: location } });
    };

    const toggleBookmark = async () => {
        if (!user) return requireLogin();
        setSaving(true);
        try {
            if (event.isBookmarked) {
                await bookmarkService.remove(event._id);
                setData((e) => ({ ...e, isBookmarked: false, reminder: null }));
                toast('Removed from saved events');
            } else {
                await bookmarkService.add(event._id);
                setData((e) => ({ ...e, isBookmarked: true }));
                toast.success('Saved to your dashboard');
            }
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
        return undefined;
    };

    const changeReminder = async (value) => {
        try {
            if (value) {
                await bookmarkService.setReminder(event._id, Number(value));
                setData((e) => ({ ...e, reminder: { remindBeforeHours: Number(value) } }));
                toast.success('Reminder set. We will email you.');
            } else {
                await bookmarkService.removeReminder(event._id);
                setData((e) => ({ ...e, reminder: null }));
                toast('Reminder removed');
            }
        } catch (err) {
            toast.error(errorMessage(err));
        }
    };

    const shareEvent = async () => {
        const url = eventUrl(event.slug);
        const used = await nativeShare({
            title: event.title,
            text: `${event.title}, ${formatEventWhen(event.startDateTime, event.endDateTime)} at ${event.venueName}, ${event.city}`,
            url,
        });
        if (!used) {
            (await copyText(url)) ? toast.success('Link copied') : toast.error('Could not copy the link');
        }
    };

    const copyLink = async () => ((await copyText(eventUrl(event.slug))) ? toast.success('Link copied') : toast.error('Could not copy the link'));

    /* ------------------------------ states ------------------------------ */
    if (loading || authLoading) return <DetailSkeleton />;

    if (error) {
        const notFound = error.response?.status === 404;
        return (
            <div className="container-page py-16">
                <Seo title={notFound ? 'Bhandara not found' : 'Error'} noindex />
                {notFound ? (
                    <div className="mx-auto max-w-md text-center">
                        <h1 className="text-2xl font-bold">This bhandara isn't available</h1>
                        <p className="mt-2 text-stone-600 dark:text-stone-400">It may have been removed, or the link is incorrect.</p>
                        <Button as={Link} to="/bhandaras" className="mt-6">Browse bhandaras</Button>
                    </div>
                ) : (
                    <ErrorState error={error} onRetry={reload} />
                )}
            </div>
        );
    }
    if (!event) return null;

    const coords = event.location?.coordinates;
    const hasCoords = coords?.length === 2;
    const lifecycle = event.lifecycle;
    const contact = event.contact || {};
    const hasContact = !!(contact.phone || contact.email);
    const hiddenContact = (contact.hiddenFields || []).length > 0;
    const recurring = event.recurrence?.frequency && event.recurrence.frequency !== 'none';
    const organizer = event.organizer;
    const url = eventUrl(event.slug);
    const food = event.foodAvailability || {};
    const cover = event.coverImage?.url;

    return (
        <article className="container-page py-6 sm:py-8">
            <Seo
                title={`${event.title}, ${event.city}`}
                description={`${event.title} on ${formatLongDate(event.startDateTime)} at ${event.venueName}, ${event.locality}, ${event.city}. ${event.description}`.slice(0, 200)}
                image={cover ? optimizeImage(cover, { w: 1200, h: 630 }) : undefined}
                canonical={`${SITE.url}/bhandaras/${event.slug}`}
                noindex={!isPublic}
                type="article"
            />

            <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-600 dark:text-stone-400">
                <Link to="/bhandaras" className="link">Bhandaras</Link> <span aria-hidden="true">/</span>{' '}
                <Link to={`/bhandaras?city=${encodeURIComponent(event.city)}`} className="link">{event.city}</Link>
            </nav>

            {/* Status banners */}
            <div className="mb-5 space-y-3 empty:hidden">
                {lifecycle === 'cancelled' && (
                    <Banner tone="red" icon={AlertTriangle}>
                        This event has been cancelled.{event.cancelReason ? ` Reason: ${event.cancelReason}` : ''} Please do not travel to the venue.
                    </Banner>
                )}
                {lifecycle === 'completed' && <Banner tone="neutral" icon={Clock}>This event has already ended.</Banner>}
                {event.status === 'draft' && <Banner tone="brand" icon={EyeOff}>This is a draft. Only you (and admins) can see it. Publish it from the editor.</Banner>}
                {event.status !== 'draft' && event.moderationStatus === 'pending' && (
                    <Banner tone="brand" icon={Info}>This event is awaiting review and is not visible to the public yet.</Banner>
                )}
                {['rejected', 'hidden'].includes(event.moderationStatus) && (
                    <Banner tone="red" icon={EyeOff}>
                        This event is {event.moderationStatus} and not visible to the public.{event.moderationNote ? ` Moderator note: ${event.moderationNote}` : ''}
                    </Banner>
                )}
            </div>

            {/* Header */}
            <header className="mb-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <LifecycleBadge lifecycle={lifecycle} />
                    {event.isFree && <Badge tone="green">Free</Badge>}
                    <Badge>{event.category.replace(/-/g, ' ')}</Badge>
                    {event.occasion && <Badge tone="brand">{event.occasion}</Badge>}
                </div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{event.title}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-600 dark:text-stone-400">
                    <span className="inline-flex items-center gap-1.5">
                        By {event.organizationName}
                        {organizer?.isVerifiedOrganizer && <BadgeCheck className="h-5 w-5 text-leaf-600 dark:text-leaf-400" aria-label="Verified organizer" />}
                    </span>
                    <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" aria-hidden="true" /> {event.viewCount} views</span>
                </p>
            </header>

            <Gallery images={images} title={event.title} />

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {/* Sidebar (comes first on phones) */}
                <aside className="order-1 space-y-4 lg:order-2" aria-label="Event summary and actions">
                    <div className="card space-y-4 p-5 lg:sticky lg:top-20">
                        <div className="flex gap-3">
                            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                            <div>
                                <p className="font-bold">{formatLongDate(event.startDateTime)}</p>
                                <p className="text-stone-700 dark:text-stone-300">
                                    {formatTime(event.startDateTime)} – {formatTime(event.endDateTime)}
                                    {formatDate(event.startDateTime) !== formatDate(event.endDateTime) && ` (until ${formatDate(event.endDateTime)})`}
                                </p>
                                {recurring && (
                                    <p className="mt-1 inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
                                        <Repeat className="h-4 w-4" aria-hidden="true" /> Repeats {event.recurrence.frequency}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                            <address className="not-italic">
                                <p className="font-bold">{event.venueName}</p>
                                <p className="text-stone-700 dark:text-stone-300">
                                    {event.address}, {event.locality}, {event.city}, {event.state} {event.pincode}
                                </p>
                            </address>
                        </div>

                        <div className="grid gap-2 border-t border-stone-200 pt-4 dark:border-stone-800">
                            <Button as="a" href={directionsUrl(event)} target="_blank" rel="noopener noreferrer">
                                <Navigation className="h-4 w-4" aria-hidden="true" /> Get directions
                            </Button>
                            {lifecycle !== 'completed' && lifecycle !== 'cancelled' && (
                                <Button as="a" href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" variant="secondary">
                                    <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to Google Calendar
                                </Button>
                            )}
                            {isPublic && (
                                <Button variant="secondary" onClick={toggleBookmark} loading={saving} aria-pressed={event.isBookmarked}>
                                    {event.isBookmarked ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
                                    {event.isBookmarked ? 'Saved' : 'Save event'}
                                </Button>
                            )}
                            {event.canManage && (
                                <Button as={Link} to={`/bhandaras/${event.slug}/edit`} variant="ghost">
                                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit event
                                </Button>
                            )}
                        </div>

                        {event.isBookmarked && lifecycle === 'upcoming' && (
                            <Select
                                label="Email me a reminder"
                                value={event.reminder?.remindBeforeHours ?? ''}
                                onChange={(e) => changeReminder(e.target.value)}
                            >
                                <option value="">No reminder</option>
                                {REMINDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </Select>
                        )}

                        {isPublic && (
                            <div className="border-t border-stone-200 pt-4 dark:border-stone-800">
                                <p className="mb-2 text-sm font-bold">Share</p>
                                <div className="flex flex-wrap gap-2">
                                    {typeof navigator !== 'undefined' && navigator.share && (
                                        <Button variant="secondary" size="sm" onClick={shareEvent}><Share2 className="h-4 w-4" aria-hidden="true" /> Share</Button>
                                    )}
                                    <Button variant="secondary" size="sm" onClick={copyLink}><Copy className="h-4 w-4" aria-hidden="true" /> Copy link</Button>
                                    <Button as="a" variant="secondary" size="sm" href={whatsappShareUrl({ title: `${event.title}, ${formatEventWhen(event.startDateTime, event.endDateTime)}`, url })} target="_blank" rel="noopener noreferrer">
                                        WhatsApp
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => setQrOpen(true)}><QrCode className="h-4 w-4" aria-hidden="true" /> QR</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main column */}
                <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
                    <Card id="about" title="About this bhandara">
                        <p className="whitespace-pre-line leading-relaxed text-stone-800 dark:text-stone-200">{event.description}</p>
                        {event.specialInstructions && (
                            <div className="mt-4 rounded-xl bg-brand-50 p-4 dark:bg-brand-900/20">
                                <p className="mb-1 text-sm font-bold">Special instructions</p>
                                <p className="whitespace-pre-line text-sm">{event.specialInstructions}</p>
                            </div>
                        )}
                    </Card>

                    <Card id="food" title="Food & facilities" icon={Utensils}>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <Fact label="Cost">{event.isFree ? 'Free for everyone' : 'Paid / contribution'}</Fact>
                            {event.dietType && event.dietType !== 'not-specified' && <Fact label="Menu type">{DIET_LABEL[event.dietType]}</Fact>}
                            {event.mealTypes?.length > 0 && <Fact label="Meals">{event.mealTypes.map((m) => MEAL_LABEL[m] || m).join(', ')}</Fact>}
                            {(food.startTime || food.endTime) && (
                                <Fact label="Food served">{[formatHHMM(food.startTime), formatHHMM(food.endTime)].filter(Boolean).join(' – ')}</Fact>
                            )}
                            {event.expectedAttendees > 0 && (
                                <Fact label="Expected to be served">
                                    <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4" aria-hidden="true" /> about {event.expectedAttendees.toLocaleString('en-IN')} people</span>
                                </Fact>
                            )}
                        </dl>

                        {event.menuItems?.length > 0 && (
                            <div className="mt-5">
                                <p className="mb-2 text-sm font-semibold text-stone-600 dark:text-stone-400">Menu</p>
                                <ul className="flex flex-wrap gap-2">
                                    {event.menuItems.map((m) => <li key={m}><Badge tone="brand" className="!text-sm">{m}</Badge></li>)}
                                </ul>
                            </div>
                        )}

                        {(event.drinkingWater || event.seating) && (
                            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                                {event.drinkingWater && <li className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-leaf-600" aria-hidden="true" /> Drinking water available</li>}
                                {event.seating && <li className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-leaf-600" aria-hidden="true" /> Seating available</li>}
                            </ul>
                        )}

                        {(event.accessibilityInfo || event.parkingInfo || event.transportInfo) && (
                            <dl className="mt-5 grid gap-4 border-t border-stone-200 pt-5 dark:border-stone-800 sm:grid-cols-2">
                                {event.accessibilityInfo && <Fact label="Accessibility">{event.accessibilityInfo}</Fact>}
                                {event.parkingInfo && <Fact label="Parking">{event.parkingInfo}</Fact>}
                                {event.transportInfo && <Fact label="Public transport">{event.transportInfo}</Fact>}
                            </dl>
                        )}
                    </Card>

                    <Card id="location" title="Location" icon={MapPin}>
                        <address className="mb-4 not-italic text-stone-800 dark:text-stone-200">
                            {event.venueName}, {event.address}, {event.locality}, {event.city}, {event.state} {event.pincode}
                        </address>
                        {hasCoords ? (
                            <Suspense fallback={<Skeleton className="h-72 w-full rounded-2xl" />}>
                                <EventsMap events={[event]} className="h-72" />
                            </Suspense>
                        ) : (
                            <p className="rounded-xl bg-stone-100 p-4 text-sm dark:bg-stone-800">
                                The organizer did not add a map pin. Use the directions button to search by address.
                            </p>
                        )}
                        <Button as="a" href={directionsUrl(event)} target="_blank" rel="noopener noreferrer" variant="secondary" className="mt-4">
                            <Navigation className="h-4 w-4" aria-hidden="true" /> Open in Google Maps
                        </Button>
                    </Card>

                    <Card id="organizer" title="Organizer">
                        <div className="flex items-center gap-4">
                            <Avatar user={organizer} size={52} />
                            <div className="min-w-0">
                                <p className="flex items-center gap-1.5 font-bold">
                                    {event.organizationName}
                                    {organizer?.isVerifiedOrganizer && <BadgeCheck className="h-5 w-5 text-leaf-600 dark:text-leaf-400" aria-label="Verified organizer" />}
                                </p>
                                <p className="text-sm text-stone-600 dark:text-stone-400">
                                    Posted by {organizer?.name}
                                    {organizer?.createdAt && ` · member since ${formatDate(organizer.createdAt)}`}
                                </p>
                                {organizer?.isVerifiedOrganizer && <Badge tone="green" className="mt-1">Verified organizer</Badge>}
                            </div>
                        </div>

                        <div className="mt-5 border-t border-stone-200 pt-5 dark:border-stone-800">
                            <h3 className="mb-3 font-bold">Contact</h3>
                            {hasContact ? (
                                <div className="flex flex-wrap gap-2">
                                    {contact.phone && (
                                        <>
                                            <Button as="a" href={telUrl(contact.phone)} variant={contact.preferredMethod === 'phone' ? 'primary' : 'secondary'}>
                                                <Phone className="h-4 w-4" aria-hidden="true" /> Call {contact.phone}
                                            </Button>
                                            <Button as="a" href={whatsappChatUrl(contact.phone)} target="_blank" rel="noopener noreferrer" variant={contact.preferredMethod === 'whatsapp' ? 'primary' : 'secondary'}>
                                                WhatsApp
                                            </Button>
                                        </>
                                    )}
                                    {contact.email && (
                                        <Button as="a" href={`mailto:${contact.email}`} variant={contact.preferredMethod === 'email' ? 'primary' : 'secondary'}>
                                            <Mail className="h-4 w-4" aria-hidden="true" /> Email
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                !hiddenContact && <p className="text-stone-600 dark:text-stone-400">The organizer has not shared public contact details.</p>
                            )}
                            {hiddenContact && !user && (
                                <p className="mt-3 text-sm text-stone-700 dark:text-stone-300">
                                    Some contact details are visible to logged-in members only.{' '}
                                    <button type="button" onClick={requireLogin} className="link">Log in to view</button>
                                </p>
                            )}
                        </div>
                    </Card>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600 dark:text-stone-400">
                        <p>Last updated {formatDate(event.updatedAt)}</p>
                        {isPublic && !event.isOwner && (
                            <button
                                type="button"
                                onClick={() => (user ? setReportOpen(true) : requireLogin())}
                                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                <Flag className="h-4 w-4" aria-hidden="true" /> Report this event
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Related */}
            {related.data?.nearby?.length > 0 && (
                <section className="mt-12" aria-labelledby="nearby-h">
                    <h2 id="nearby-h" className="mb-5 text-2xl font-extrabold">Similar events nearby</h2>
                    <EventGrid>{related.data.nearby.map((e) => <EventCard key={e._id} event={e} />)}</EventGrid>
                </section>
            )}
            {related.data?.upcoming?.length > 0 && (
                <section className="mt-12" aria-labelledby="upcoming-h">
                    <h2 id="upcoming-h" className="mb-5 text-2xl font-extrabold">More upcoming events</h2>
                    <EventGrid>{related.data.upcoming.map((e) => <EventCard key={e._id} event={e} />)}</EventGrid>
                </section>
            )}

            <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} eventId={event._id} />
            <QrModal open={qrOpen} onClose={() => setQrOpen(false)} url={url} title={event.title} />
        </article>
    );
}