import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, LayoutGrid, Map as MapIcon, Plus, SearchX, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { useTranslation } from 'react-i18next';
import FilterPanel from '../components/explore/FilterPanel.jsx';
import EventCard, { EventCardSkeleton } from '../components/EventCard.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { Select } from '../components/ui/form.jsx';
import { useApi } from '../hooks/useApi.js';
import { useGeolocation } from '../hooks/useGeolocation.js';
import { bhandaraService } from '../services/bhandaraService.js';
import { DATE_RANGES, DIET_OPTIONS, MEAL_LABEL, SORT_OPTIONS, STATUS_FILTERS } from '../utils/constants.js';
import { formatNumber } from '../utils/format.js';
import { cx } from '../utils/cx.js';

const EventsMap = lazy(() => import('../components/map/EventsMap.jsx'));
const LIST_LIMIT = 12;
const MAP_LIMIT = 100;

export default function Explore() {
    const { t } = useTranslation();
    const [sp, setSp] = useSearchParams();
    const geo = useGeolocation();
    const topRef = useRef(null);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const view = sp.get('view') === 'map' ? 'map' : 'list';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
    const hasGeo = !!(sp.get('lat') && sp.get('lng'));

    const cities = useApi((s) => bhandaraService.cities(s), [], { initialData: [] });
    const categories = useApi((s) => bhandaraService.categories(s), [], { initialData: [] });

    /** Update URL params. Empty values remove the param. Changing a filter resets to page 1. */
    const update = useCallback(
        (changes, { keepPage = false, replace = true } = {}) => {
            setSp(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    Object.entries(changes).forEach(([k, v]) => {
                        if (v === undefined || v === null || v === '' || v === false) next.delete(k);
                        else next.set(k, String(v));
                    });
                    if (!keepPage) next.delete('page');
                    return next;
                },
                { replace }
            );
        },
        [setSp]
    );

    const params = useMemo(() => {
        const g = (k) => sp.get(k) || undefined;
        const range = g('range');
        return {
            q: g('q'), city: g('city'), locality: g('locality'), pincode: g('pincode'), category: g('category'),
            when: g('when') || 'active',
            range,
            from: range === 'custom' ? g('from') : undefined,
            to: range === 'custom' ? g('to') : undefined,
            mealType: g('mealType'), diet: g('diet'), free: g('free'), verified: g('verified'),
            lat: g('lat'), lng: g('lng'), radius: g('radius'),
            sort: g('sort') || 'date',
            page: view === 'map' ? 1 : page,
            limit: view === 'map' ? MAP_LIMIT : LIST_LIMIT,
        };
    }, [sp, view, page]);

    const { data: res, loading, error, reload } = useApi(
        (signal) => bhandaraService.list(params, signal),
        [JSON.stringify(params)]
    );

    const items = res?.data || [];
    const meta = res?.meta;

    const useMyLocation = async () => {
        const coords = await geo.request();
        if (coords) update({ lat: coords.lat, lng: coords.lng, radius: sp.get('radius') || 25, sort: 'nearest' });
        else toast.error('Could not get your location. You can type a city instead.');
    };

    /* ---------- active filter chips ---------- */
    const chips = [];
    const addChip = (key, label, clear) => chips.push({ key, label, clear });
    const catName = categories.data.find((c) => c.slug === sp.get('category'))?.name || sp.get('category');
    if (sp.get('q')) addChip('q', `“${sp.get('q')}”`, { q: '' });
    if (sp.get('city')) addChip('city', sp.get('city'), { city: '' });
    if (sp.get('locality')) addChip('locality', sp.get('locality'), { locality: '' });
    if (sp.get('category')) addChip('category', catName, { category: '' });
    if (sp.get('range') === 'custom') addChip('range', `${sp.get('from') || '…'} to ${sp.get('to') || '…'}`, { range: '', from: '', to: '' });
    else if (sp.get('range')) addChip('range', DATE_RANGES.find((r) => r.value === sp.get('range'))?.label, { range: '' });
    if (sp.get('when') && sp.get('when') !== 'active') addChip('when', STATUS_FILTERS.find((s) => s.value === sp.get('when'))?.label, { when: '' });
    if (sp.get('mealType')) addChip('mealType', MEAL_LABEL[sp.get('mealType')], { mealType: '' });
    if (sp.get('diet')) addChip('diet', DIET_OPTIONS.find((d) => d.value === sp.get('diet'))?.label, { diet: '' });
    if (sp.get('free') === 'true') addChip('free', 'Free food', { free: '' });
    if (sp.get('verified') === 'true') addChip('verified', 'Verified organizers', { verified: '' });
    if (hasGeo) addChip('geo', sp.get('radius') ? `Within ${sp.get('radius')} km of you` : 'Near you', { lat: '', lng: '', radius: '', sort: sp.get('sort') === 'nearest' ? '' : sp.get('sort') });

    const clearAll = () => setSp(view === 'map' ? { view: 'map' } : {}, { replace: true });
    const hasFilters = chips.length > 0;

    const goToPage = (p) => {
        update({ page: p }, { keepPage: true, replace: false });
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const onSort = (v) => {
        if (v === 'nearest' && !hasGeo) useMyLocation();
        else update({ sort: v === 'date' ? '' : v });
    };

    const mappable = items.filter((e) => e.location?.coordinates?.length === 2);
    const seoTitle = sp.get('city') ? `Bhandaras in ${sp.get('city')}` : 'Find Bhandaras';

    const panel = (
        <FilterPanel
            sp={sp}
            update={update}
            cities={cities.data}
            categories={categories.data}
            onUseLocation={useMyLocation}
            locating={geo.status === 'loading'}
            onClearAll={clearAll}
            hasFilters={hasFilters}
        />
    );

    return (
        <div className="container-page py-8">
            <Seo
                title={seoTitle}
                description={`Browse bhandaras, langars and free community meals${sp.get('city') ? ` in ${sp.get('city')}` : ' across India'}. Filter by date, distance, meal type and more.`}
                noindex={hasFilters || page > 1}
                canonical={undefined}
            />

            <div ref={topRef} className="scroll-mt-20">
                <h1 className="text-3xl font-extrabold tracking-tight">{t('footer.findLink')}</h1>
                <p className="mt-1 text-stone-600 dark:text-stone-400">{t('home.findDescription')}</p>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
                {/* Desktop filters */}
                <aside className="hidden lg:block" aria-label="Filters">
                    <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-4">{panel}</div>
                </aside>

                <section aria-label="Results" className="min-w-0">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                            <Filter className="h-4 w-4" aria-hidden="true" /> Filters{hasFilters ? ` (${chips.length})` : ''}
                        </Button>

                        <p className="flex-1 text-sm font-medium text-stone-700 dark:text-stone-300" role="status" aria-live="polite">
                            {loading ? 'Searching…' : error ? '' : `${formatNumber(meta?.total)} ${meta?.total === 1 ? 'result' : 'results'}`}
                        </p>

                        <Select
                            aria-label="Sort by"
                            wrapperClassName="w-44"
                            value={params.sort === 'nearest' && !hasGeo ? 'date' : params.sort}
                            onChange={(e) => onSort(e.target.value)}
                        >
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Select>

                        <div className="inline-flex overflow-hidden rounded-lg border border-stone-300 dark:border-stone-700" role="group" aria-label="View">
                            {[
                                { v: 'list', label: 'List', icon: LayoutGrid },
                                { v: 'map', label: 'Map', icon: MapIcon },
                            ].map(({ v, label, icon: Icon }) => (
                                <button
                                    key={v}
                                    type="button"
                                    aria-pressed={view === v}
                                    onClick={() => update({ view: v === 'list' ? '' : v }, { keepPage: true })}
                                    className={cx(
                                        'inline-flex min-h-[44px] items-center gap-1.5 px-3 text-sm font-semibold',
                                        view === v ? 'bg-brand-700 text-white dark:bg-brand-400 dark:text-stone-950' : 'bg-white hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-800'
                                    )}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" /> {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active filters */}
                    {hasFilters && (
                        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Active filters">
                            {chips.map((c) => (
                                <li key={c.key}>
                                    <button
                                        type="button"
                                        onClick={() => update(c.clear)}
                                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-brand-100 px-3 text-sm font-semibold text-brand-900 hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-200"
                                        aria-label={`Remove filter: ${c.label}`}
                                    >
                                        {c.label} <X className="h-3.5 w-3.5" aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button type="button" onClick={clearAll} className="min-h-[36px] px-2 text-sm font-semibold underline">
                                    {t('buttonText.clearFilters')}
                                </button>
                            </li>
                        </ul>
                    )}

                    {/* Results */}
                    <div className="mt-6">
                        {error ? (
                            <>
                                <ErrorState error={error} onRetry={reload} />
                                {hasFilters && <div className="text-center"><Button variant="secondary" onClick={clearAll}>Clear filters</Button></div>}
                            </>
                        ) : loading ? (
                            view === 'map' ? (
                                <Skeleton className="h-[60vh] w-full rounded-2xl" />
                            ) : (
                                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {Array.from({ length: 6 }, (_, i) => <EventCardSkeleton key={i} />)}
                                </div>
                            )
                        ) : items.length === 0 ? (
                            page > 1 ? (
                                <EmptyState
                                    icon={SearchX}
                                    title="No results on this page"
                                    action={<Button onClick={() => goToPage(1)}>Go to the first page</Button>}
                                />
                            ) : (
                                <EmptyState
                                    icon={SearchX}
                                    title="No bhandaras match your search"
                                    description={
                                        hasFilters
                                            ? 'Try removing a filter or searching a wider area.'
                                            : 'There are no bhandaras listed right now. Be the first to share one!'
                                    }
                                    action={
                                        <div className="flex flex-wrap justify-center gap-3">
                                            {hasFilters && <Button variant="secondary" onClick={clearAll}>Clear filters</Button>}
                                            <Button as={Link} to="/bhandaras/create"><Plus className="h-4 w-4" aria-hidden="true" />{t('footer.postLink')}</Button>
                                        </div>
                                    }
                                />
                            )
                        ) : view === 'map' ? (
                            <>
                                {mappable.length > 0 ? (
                                    <Suspense fallback={<Skeleton className="h-[60vh] w-full rounded-2xl" />}>
                                        <EventsMap
                                            events={mappable}
                                            userLocation={hasGeo ? { lat: +sp.get('lat'), lng: +sp.get('lng') } : undefined}
                                            className="h-[65vh] min-h-[360px]"
                                            scrollWheelZoom
                                        />
                                    </Suspense>
                                ) : (
                                    <EmptyState icon={MapIcon} title="No map locations for these results" description="The organizers did not add a map pin. Switch to the list view to see them." />
                                )}
                                <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                                    Showing {mappable.length} on the map
                                    {items.length > mappable.length && ` (${items.length - mappable.length} without a map pin)`}
                                    {meta.total > items.length && `. Narrow your search to see all ${formatNumber(meta.total)} results`}.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                    {items.map((ev) => <EventCard key={ev._id} event={ev} />)}
                                </div>
                                <Pagination className="mt-8" page={meta.page} totalPages={meta.totalPages} onChange={goToPage} />
                            </>
                        )}
                    </div>
                </section>
            </div>

            {/* Mobile filter sheet */}
            <Modal
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                title="Filters"
                footer={<Button onClick={() => setFiltersOpen(false)} className="w-full sm:w-auto">Show {meta ? formatNumber(meta.total) : ''} results</Button>}
            >
                {panel}
            </Modal>
        </div>
    );
}