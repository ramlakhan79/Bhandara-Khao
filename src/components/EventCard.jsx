import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarDays, MapPin, Navigation, Utensils } from 'lucide-react';
import LifecycleBadge from './LifecycleBadge.jsx';
import Badge from './ui/Badge.jsx';
import Skeleton from './ui/Skeleton.jsx';
import { formatEventWhen, formatDistance } from '../utils/format.js';
import { optimizeImage, imageSrcSet } from '../utils/image.js';
import { MEAL_LABEL } from '../utils/constants.js';
import { cx } from '../utils/cx.js';

export default function EventCard({ event, className }) {
    const {
        title, slug, coverImage, city, locality, venueName, startDateTime, endDateTime, isFree,
        mealTypes = [], lifecycle, organizer, distanceKm, organizationName,
    } = event;

    const muted = lifecycle === 'completed' || lifecycle === 'cancelled';

    return (
        <article className={cx('card group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg', className)}>
            <div className="relative aspect-[16/10] bg-stone-100 dark:bg-stone-800">
                {coverImage?.url ? (
                    <img
                        src={optimizeImage(coverImage.url, { w: 640, h: 400 })}
                        srcSet={imageSrcSet(coverImage.url)}
                        sizes="(min-width:1024px) 360px, (min-width:640px) 45vw, 100vw"
                        width="640"
                        height="400"
                        alt={`${title} cover photo`}
                        loading="lazy"
                        decoding="async"
                        className={cx('h-full w-full object-cover', muted && 'grayscale')}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-brand-700/60 dark:text-brand-400/50" aria-hidden="true">
                        <Utensils className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <LifecycleBadge lifecycle={lifecycle} className="shadow-sm" />
                </div>
                {isFree && (
                    <Badge tone="green" className="absolute right-3 top-3 shadow-sm">Free</Badge>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-2 text-lg font-bold leading-snug">
                    {/* The link stretches over the whole card, so the entire card is one tap target */}
                    <Link to={`/bhandaras/${slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-2xl">
                        {title}
                    </Link>
                </h3>

                <p className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                    <span>{formatEventWhen(startDateTime, endDateTime)}</span>
                </p>

                <p className="flex items-start gap-2 text-sm text-stone-700 dark:text-stone-300">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                    <span className="line-clamp-2">{[venueName, locality, city].filter(Boolean).join(', ')}</span>
                </p>

                {distanceKm !== undefined && (
                    <p className="flex items-center gap-2 text-sm font-medium text-leaf-700 dark:text-leaf-300">
                        <Navigation className="h-4 w-4" aria-hidden="true" /> {formatDistance(distanceKm)} away
                    </p>
                )}

                {mealTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {mealTypes.slice(0, 3).map((m) => (
                            <Badge key={m}>{MEAL_LABEL[m] || m}</Badge>
                        ))}
                    </div>
                )}

                <p className="mt-auto flex items-center gap-1.5 pt-2 text-sm text-stone-600 dark:text-stone-400">
                    <span className="truncate">By {organizationName || organizer?.name}</span>
                    {organizer?.isVerifiedOrganizer && (
                        <BadgeCheck className="h-4 w-4 shrink-0 text-leaf-600 dark:text-leaf-400" aria-label="Verified organizer" />
                    )}
                </p>
            </div>
        </article>
    );
}

export function EventCardSkeleton() {
    return (
        <div className="card overflow-hidden" aria-hidden="true">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-1/3" />
            </div>
        </div>
    );
}

/** Responsive grid: 1 column on phones, 2 on tablets, 3 on desktops. */
export function EventGrid({ children, className }) {
    return <div className={cx('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)}>{children}</div>;
}