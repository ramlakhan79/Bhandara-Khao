import { lazy, Suspense } from 'react';
import { CalendarDays, MapPin, Phone, Utensils } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import { DIET_LABEL, MEAL_LABEL } from '../../utils/constants.js';
import { formatEventWhen } from '../../utils/format.js';
import { formatHHMM } from '../../utils/contact.js';
import { fromDateTimeLocal } from '../../utils/format.js';

const EventsMap = lazy(() => import('../map/EventsMap.jsx'));

/** "This is how your event will look" summary shown before publishing. */
export default function EventPreview({ values: v, cover, categoryName }) {
    const start = v.startDate && v.startTime ? fromDateTimeLocal(`${v.startDate}T${v.startTime}`) : null;
    const end = v.endDate && v.endTime ? fromDateTimeLocal(`${v.endDate}T${v.endTime}`) : null;
    const lat = parseFloat(v.latitude);
    const lng = parseFloat(v.longitude);
    const hasPin = Number.isFinite(lat) && Number.isFinite(lng);

    return (
        <div className="space-y-4">
            {cover ? (
                <img src={cover} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
            ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-brand-50 text-brand-700/60 dark:bg-stone-800" aria-hidden="true">
                    <Utensils className="h-12 w-12" />
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {v.isFree && <Badge tone="green">Free</Badge>}
                {categoryName && <Badge>{categoryName}</Badge>}
                {v.occasion && <Badge tone="brand">{v.occasion}</Badge>}
            </div>

            <div>
                <h3 className="text-2xl font-extrabold">{v.title || 'Untitled event'}</h3>
                <p className="text-stone-600 dark:text-stone-400">By {v.organizationName || 'organizer'}</p>
            </div>

            <p className="flex gap-2"><CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />{start ? formatEventWhen(start, end) : 'Date not set'}</p>
            <p className="flex gap-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                <span>{[v.venueName, v.address, v.locality, v.city, v.state, v.pincode].filter(Boolean).join(', ')}</span>
            </p>

            <p className="whitespace-pre-line">{v.description}</p>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {v.menuItems.length > 0 && <div className="sm:col-span-2"><dt className="font-semibold">Menu</dt><dd>{v.menuItems.join(', ')}</dd></div>}
                {v.mealTypes.length > 0 && <div><dt className="font-semibold">Meals</dt><dd>{v.mealTypes.map((m) => MEAL_LABEL[m] || m).join(', ')}</dd></div>}
                {(v.foodStart || v.foodEnd) && <div><dt className="font-semibold">Food served</dt><dd>{[formatHHMM(v.foodStart), formatHHMM(v.foodEnd)].filter(Boolean).join(' – ')}</dd></div>}
                <div><dt className="font-semibold">Menu type</dt><dd>{DIET_LABEL[v.dietType]}</dd></div>
                <div><dt className="font-semibold">Facilities</dt><dd>{[v.drinkingWater && 'Drinking water', v.seating && 'Seating'].filter(Boolean).join(', ') || 'None listed'}</dd></div>
            </dl>

            {(v.contactPhone || v.contactEmail) && (
                <p className="flex items-start gap-2 text-sm">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                        {[v.contactPhone && `${v.contactPhone} (${v.phoneVisibility === 'public' ? 'public' : v.phoneVisibility === 'loggedIn' ? 'members only' : 'hidden'})`,
                        v.contactEmail && `${v.contactEmail} (${v.emailVisibility === 'public' ? 'public' : v.emailVisibility === 'loggedIn' ? 'members only' : 'hidden'})`]
                            .filter(Boolean).join(' · ')}
                    </span>
                </p>
            )}

            {hasPin && (
                <Suspense fallback={null}>
                    <EventsMap events={[{ _id: 'preview', title: v.title, slug: '', startDateTime: start, endDateTime: end, venueName: v.venueName, locality: v.locality, city: v.city, location: { coordinates: [lng, lat] } }]} className="h-56" />
                </Suspense>
            )}
        </div>
    );
}