import { Crosshair, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApi } from '../../hooks/useApi.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { useSavedLocation } from '../../hooks/useSavedLocation.js';
import { bhandaraService } from '../../services/bhandaraService.js';
import EventCard, { EventGrid } from '../EventCard.jsx';
import { SkeletonGrid } from './EventSection.jsx';
import ErrorState from '../ui/ErrorState.jsx';
import Button from '../ui/Button.jsx';
import { Select } from '../ui/form.jsx';
import { Link } from 'react-router-dom';

export default function NearYou({ cities = [] }) {
    const [loc, setLoc] = useSavedLocation();
    const geo = useGeolocation();

    const { data, loading, error, reload } = useApi(
        (signal) =>
            loc.type === 'coords'
                ? bhandaraService.nearby({ lat: loc.lat, lng: loc.lng, radius: 25, limit: 6 }, signal)
                : bhandaraService.list({ city: loc.city, when: 'active', limit: 6 }, signal),
        [JSON.stringify(loc)],
        { enabled: !!loc }
    );

    const useMyLocation = async () => {
        const coords = await geo.request();
        if (coords) setLoc({ type: 'coords', ...coords });
        else toast.error('Could not get your location. Please choose a city instead.');
    };

    const items = data?.data || [];
    const seeAll = !loc
        ? '/bhandaras'
        : loc.type === 'coords'
            ? `/bhandaras?lat=${loc.lat}&lng=${loc.lng}&radius=25&sort=nearest`
            : `/bhandaras?city=${encodeURIComponent(loc.city)}`;

    return (
        <section id="near-you" aria-labelledby="near-you-h" className="py-10 sm:py-12">
            <div className="container-page">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 id="near-you-h" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Bhandaras near you</h2>
                        <p className="mt-1 text-stone-600 dark:text-stone-400">
                            {loc?.type === 'coords' && 'Within 25 km of your current location.'}
                            {loc?.type === 'city' && `Happening in ${loc.city}.`}
                            {!loc && 'Share your location or pick a city to see what is close to you.'}
                        </p>
                    </div>
                    {loc && <Link to={seeAll} className="link inline-flex min-h-[44px] items-center">View all</Link>}
                </div>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <Button variant="secondary" onClick={useMyLocation} loading={geo.status === 'loading'}>
                        <Crosshair className="h-4 w-4" aria-hidden="true" /> Use my location
                    </Button>
                    {cities.length > 0 && (
                        <Select
                            label="Or choose a city"
                            wrapperClassName="sm:w-64"
                            value={loc?.type === 'city' ? loc.city : ''}
                            onChange={(e) => setLoc(e.target.value ? { type: 'city', city: e.target.value } : null)}
                        >
                            <option value="">Select a city</option>
                            {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </Select>
                    )}
                    {loc && (
                        <Button variant="ghost" onClick={() => setLoc(null)}>
                            <X className="h-4 w-4" aria-hidden="true" /> Clear
                        </Button>
                    )}
                </div>

                {geo.error && geo.status === 'denied' && (
                    <p role="status" className="mb-4 text-sm text-stone-600 dark:text-stone-400">{geo.error}</p>
                )}

                {!loc ? null : loading ? (
                    <SkeletonGrid />
                ) : error ? (
                    <ErrorState error={error} onRetry={reload} />
                ) : items.length ? (
                    <EventGrid>{items.map((ev) => <EventCard key={ev._id} event={ev} />)}</EventGrid>
                ) : (
                    <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-stone-600 dark:border-stone-700 dark:text-stone-400">
                        No bhandaras found here right now. Try another city, or check back soon.
                    </p>
                )}
            </div>
        </section>
    );
}