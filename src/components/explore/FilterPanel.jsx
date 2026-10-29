import { useEffect, useRef, useState } from 'react';
import { Crosshair, X } from 'lucide-react';
import Button from '../ui/Button.jsx';
import { Checkbox, Input, Select } from '../ui/form.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { DATE_RANGES, DIET_OPTIONS, MEAL_TYPES, STATUS_FILTERS } from '../../utils/constants.js';

/** Text input that updates the URL only after the user pauses typing. */
export function DebouncedInput({ value, onCommit, delay = 450, ...props }) {
    const [local, setLocal] = useState(value || '');
    const debounced = useDebounce(local, delay);
    const committed = useRef((value || '').trim());

    // Adopt changes that came from outside (e.g. "Clear all"), but never overwrite what is being typed
    useEffect(() => {
        const incoming = (value || '').trim();
        if (incoming !== committed.current) {
            committed.current = incoming;
            setLocal(value || '');
        }
    }, [value]);

    // Commit once typing pauses
    useEffect(() => {
        const trimmed = debounced.trim();
        if (debounced === local && trimmed !== committed.current) {
            committed.current = trimmed;
            onCommit(trimmed);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced, local]);

    return <Input value={local} onChange={(e) => setLocal(e.target.value)} {...props} />;
}

const RADII = [5, 10, 25, 50, 100, 250];

function Group({ title, children }) {
    return (
        <fieldset className="space-y-3 border-0 p-0">
            <legend className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500">{title}</legend>
            {children}
        </fieldset>
    );
}

export default function FilterPanel({ sp, update, cities, categories, onUseLocation, locating, onClearAll, hasFilters }) {
    const hasGeo = !!(sp.get('lat') && sp.get('lng'));
    const range = sp.get('range') || '';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Filters</h2>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={onClearAll}>
                        <X className="h-4 w-4" aria-hidden="true" /> Clear all
                    </Button>
                )}
            </div>

            <DebouncedInput label="Search" type="search" placeholder="Name, area or pincode" value={sp.get('q')} onCommit={(v) => update({ q: v })} />

            <Group title="Where">
                <Input
                    label="City"
                    list="bk-city-options"
                    placeholder="e.g. Jabalpur"
                    autoComplete="off"
                    defaultValue={sp.get('city') || ''}
                    key={`city-${sp.get('city') || ''}`}
                    onBlur={(e) => e.target.value.trim() !== (sp.get('city') || '') && update({ city: e.target.value.trim() })}
                    onKeyDown={(e) => e.key === 'Enter' && update({ city: e.currentTarget.value.trim() })}
                />
                <datalist id="bk-city-options">
                    {cities.map((c) => <option key={c.name} value={c.name} />)}
                </datalist>
                <DebouncedInput label="Area / locality" placeholder="e.g. Civil Lines" value={sp.get('locality')} onCommit={(v) => update({ locality: v })} />

                {hasGeo ? (
                    <div className="space-y-2 rounded-lg bg-leaf-50 p-3 dark:bg-leaf-900/20">
                        <p className="text-sm font-semibold text-leaf-800 dark:text-leaf-200">Using your location</p>
                        <Select label="Within" value={sp.get('radius') || ''} onChange={(e) => update({ radius: e.target.value })}>
                            <option value="">Any distance</option>
                            {RADII.map((r) => <option key={r} value={r}>{r} km</option>)}
                        </Select>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => update({ lat: '', lng: '', radius: '', sort: sp.get('sort') === 'nearest' ? '' : sp.get('sort') })}
                        >
                            Remove location
                        </Button>
                    </div>
                ) : (
                    <Button variant="secondary" className="w-full" onClick={onUseLocation} loading={locating}>
                        <Crosshair className="h-4 w-4" aria-hidden="true" /> Use my location
                    </Button>
                )}
            </Group>

            <Group title="When">
                <Select
                    label="Date"
                    value={range}
                    onChange={(e) => {
                        const v = e.target.value;
                        update({ range: v, from: v === 'custom' ? sp.get('from') : '', to: v === 'custom' ? sp.get('to') : '' });
                    }}
                >
                    {DATE_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </Select>
                {range === 'custom' && (
                    <div className="grid grid-cols-2 gap-2">
                        <Input label="From" type="date" value={sp.get('from') || ''} onChange={(e) => update({ from: e.target.value })} />
                        <Input label="To" type="date" min={sp.get('from') || undefined} value={sp.get('to') || ''} onChange={(e) => update({ to: e.target.value })} />
                    </div>
                )}
                <Select
                    label="Status"
                    value={sp.get('when') || 'active'}
                    onChange={(e) => update({ when: e.target.value === 'active' ? '' : e.target.value })}
                >
                    {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
            </Group>

            <Group title="Food">
                <Select label="Category" value={sp.get('category') || ''} onChange={(e) => update({ category: e.target.value })}>
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </Select>
                <Select label="Meal type" value={sp.get('mealType') || ''} onChange={(e) => update({ mealType: e.target.value })}>
                    <option value="">Any meal</option>
                    {MEAL_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Select>
                <Select label="Menu" value={sp.get('diet') || ''} onChange={(e) => update({ diet: e.target.value })}>
                    <option value="">Any</option>
                    {DIET_OPTIONS.filter((d) => d.value === 'vegetarian' || d.value === 'non-vegetarian').map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                </Select>
                <Checkbox label="Free food only" checked={sp.get('free') === 'true'} onChange={(e) => update({ free: e.target.checked ? 'true' : '' })} />
            </Group>

            <Group title="Organizer">
                <Checkbox label="Verified organizers only" checked={sp.get('verified') === 'true'} onChange={(e) => update({ verified: e.target.checked ? 'true' : '' })} />
            </Group>
        </div>
    );
}