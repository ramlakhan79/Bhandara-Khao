import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { Crosshair, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button.jsx';
import { pinIcon } from '../../utils/mapIcon.js';
import { INDIA_CENTER } from '../../utils/constants.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';

const round = (n) => +n.toFixed(6);

function ClickToPlace({ onPick }) {
    useMapEvents({ click: (e) => onPick({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) }) });
    return null;
}

/** Pans the map only when the pin moved out of view, so clicking doesn't make the map jump. */
function Recenter({ value }) {
    const map = useMap();
    useEffect(() => {
        if (!value) return;
        const ll = L.latLng(value.lat, value.lng);
        if (!map.getBounds().contains(ll) || map.getZoom() < 12) map.flyTo(ll, Math.max(map.getZoom(), 15), { duration: 0.6 });
    }, [map, value?.lat, value?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
}

async function geocode(query, signal) {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('Search failed');
    const results = await res.json();
    return results[0] ? { lat: round(+results[0].lat), lng: round(+results[0].lon) } : null;
}

/**
 * value: { lat, lng } | null, onChange({lat,lng}|null)
 * searchQuery: address text used by "Find address on map" (OpenStreetMap Nominatim, user-initiated only).
 */
export default function LocationPicker({ value, onChange, searchQuery, height = 'h-80' }) {
    const { request, status } = useGeolocation();
    const [searching, setSearching] = useState(false);
    const abortRef = useRef(null);

    useEffect(() => () => abortRef.current?.abort(), []);

    const findAddress = async () => {
        if (!searchQuery?.trim()) return toast.error('Fill in the address, locality and city first.');
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setSearching(true);
        try {
            const point = await geocode(searchQuery, abortRef.current.signal);
            if (point) {
                onChange(point);
                toast.success('Pin placed. Drag it to adjust.');
            } else {
                toast.error('Could not find that address. Click on the map to place the pin.');
            }
        } catch (err) {
            if (err.name !== 'AbortError') toast.error('Address search is unavailable. Click on the map instead.');
        } finally {
            setSearching(false);
        }
        return undefined;
    };

    const useMyLocation = async () => {
        const coords = await request();
        if (coords) onChange({ lat: round(coords.lat), lng: round(coords.lng) });
        else toast.error('Could not get your location.');
    };

    return (
        <div>
            <div className="mb-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={findAddress} loading={searching}>
                    <Search className="h-4 w-4" aria-hidden="true" /> Find address on map
                </Button>
                <Button variant="secondary" size="sm" onClick={useMyLocation} loading={status === 'loading'}>
                    <Crosshair className="h-4 w-4" aria-hidden="true" /> Use my location
                </Button>
                {value && (
                    <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear pin
                    </Button>
                )}
            </div>

            <div className={`bk-map overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 ${height}`}>
                <MapContainer
                    center={value ? [value.lat, value.lng] : INDIA_CENTER}
                    zoom={value ? 15 : 5}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    aria-label="Map: click to place the event location"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                    />
                    <ClickToPlace onPick={onChange} />
                    <Recenter value={value} />
                    {value && (
                        <Marker
                            position={[value.lat, value.lng]}
                            icon={pinIcon()}
                            draggable
                            eventHandlers={{
                                dragend: (e) => {
                                    const p = e.target.getLatLng();
                                    onChange({ lat: round(p.lat), lng: round(p.lng) });
                                },
                            }}
                        />
                    )}
                </MapContainer>
            </div>

            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400" aria-live="polite">
                {value ? `Pin at ${value.lat}, ${value.lng}. Drag the pin to fine-tune.` : 'Click the map to drop a pin, or use the buttons above.'}
            </p>
        </div>
    );
}