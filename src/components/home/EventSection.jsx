import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi.js';
import EventCard, { EventCardSkeleton, EventGrid } from '../EventCard.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import { cx } from '../../utils/cx.js';

/** For list endpoints that return an envelope: take just the items. */
export const asItems = (promise) => promise.then((r) => r.data);

export function Section({ id, title, subtitle, to, linkLabel = 'View all', tint, children }) {
    return (
        <section id={id} aria-labelledby={`${id}-h`} className={cx('py-10 sm:py-12', tint && 'bg-white dark:bg-stone-900/50')}>
            <div className="container-page">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 id={`${id}-h`} className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
                        {subtitle && <p className="mt-1 text-stone-600 dark:text-stone-400">{subtitle}</p>}
                    </div>
                    {to && (
                        <Link to={to} className="link inline-flex min-h-[44px] items-center gap-1">
                            {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                    )}
                </div>
                {children}
            </div>
        </section>
    );
}

export function SkeletonGrid({ count = 3 }) {
    return (
        <EventGrid>
            {Array.from({ length: count }, (_, i) => <EventCardSkeleton key={i} />)}
        </EventGrid>
    );
}

/**
 * A titled row of event cards loaded from `fetcher(signal)` (must resolve to an array).
 * With hideWhenEmpty the whole section disappears when there is nothing to show.
 */
export default function EventSection({ id, title, subtitle, to, linkLabel, fetcher, deps = [], hideWhenEmpty = false, empty, tint }) {
    const { data, loading, error, reload } = useApi(fetcher, deps);

    if (!loading && !error && hideWhenEmpty && !data?.length) return null;

    return (
        <Section id={id} title={title} subtitle={subtitle} to={to} linkLabel={linkLabel} tint={tint}>
            {loading ? (
                <SkeletonGrid />
            ) : error ? (
                <ErrorState error={error} onRetry={reload} />
            ) : data.length ? (
                <EventGrid>
                    {data.map((ev) => <EventCard key={ev._id} event={ev} />)}
                </EventGrid>
            ) : (
                empty
            )}
        </Section>
    );
}