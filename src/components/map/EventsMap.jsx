import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { pinIcon } from '../../utils/mapIcon.js';
import { formatEventWhen } from '../../utils/format.js';
import { INDIA_CENTER } from '../../utils/constants.js';
import { cx } from '../../utils/cx.js';

function FitBounds({ points }) {
    const map = useMap();
    useEffect(() => {
        if (!points.length) return;
        if (points.length === 1) map.setView(points[0], 14);
        else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    }, [map, points]);
    return null;
}

const toLatLng = (ev) => [ev.location.coordinates[1], ev.location.coordinates[0]];

/**
 * events: list items that may include `location.coordinates: [lng, lat]`.
 * userLocation: { lat, lng } shows a "you are here" dot.
 */
export default function EventsMap({ events = [], userLocation, className = 'h-80', scrollWheelZoom = false }) {
    const mappable = useMemo(() => events.filter((e) => e.location?.coordinates?.length === 2), [events]);

    const points = useMemo(() => {
        const pts = mappable.map(toLatLng);
        if (userLocation) pts.push([userLocation.lat, userLocation.lng]);
        return pts;
    }, [mappable, userLocation]);

    return (
        <div className={cx('bk-map overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800', className)}>
            <MapContainer center={INDIA_CENTER} zoom={5} scrollWheelZoom={scrollWheelZoom} className="h-full w-full" aria-label="Map of bhandaras">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />
                <FitBounds points={points} />

                {userLocation && (
                    <CircleMarker
                        center={[userLocation.lat, userLocation.lng]}
                        radius={9}
                        pathOptions={{ color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
                    >
                        <Popup>You are here</Popup>
                    </CircleMarker>
                )}

                {mappable.map((ev) => (
                    <Marker key={ev._id} position={toLatLng(ev)} icon={pinIcon(ev.lifecycle === 'cancelled' ? '#78716c' : '#c74c07')}>
                        <Popup>
                            <div className="min-w-[180px] space-y-1">
                                <p className="font-bold leading-snug">{ev.title}</p>
                                <p className="text-sm">{formatEventWhen(ev.startDateTime, ev.endDateTime)}</p>
                                <p className="text-sm">{[ev.venueName, ev.locality, ev.city].filter(Boolean).join(', ')}</p>
                                <Link to={`/bhandaras/${ev.slug}`} className="inline-block pt-1 text-sm font-semibold text-brand-700 underline dark:text-brand-400">
                                    View details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}