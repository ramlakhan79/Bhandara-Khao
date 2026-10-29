import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
    BadgeCheck, CalendarPlus, HandHeart, Heart, MapPin, Search, Users, UtensilsCrossed,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { LogoMark } from '../components/Logo.jsx';
import EventSection, { Section, asItems } from '../components/home/EventSection.jsx';
import NearYou from '../components/home/NearYou.jsx';
import Button from '../components/ui/Button.jsx';
import Skeleton from '../components/ui/Skeleton.jsx';
import { useApi } from '../hooks/useApi.js';
import { bhandaraService } from '../services/bhandaraService.js';
import { formatNumber } from '../utils/format.js';
import { SITE } from '../utils/site.js';

const EventsMap = lazy(() => import('../components/map/EventsMap.jsx'));

const emptyBox = (children) => (
    <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center dark:border-stone-700">{children}</div>
);

export default function Home() {
    const { t } = useTranslation();
    const cities = useApi((s) => bhandaraService.cities(s), []);
    const categories = useApi((s) => bhandaraService.categories(s), []);
    const stats = useApi((s) => bhandaraService.stats(s), []);
    const mapEvents = useApi((s) => asItems(bhandaraService.list({ when: 'active', limit: 100 }, s)), []);

    const postCta = (
        <Button as={Link} to="/bhandaras/create" className="mt-4">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Post a Bhandara
        </Button>
    );

    const mappable = (mapEvents.data || []).filter((e) => e.location?.coordinates?.length === 2);
    const activeCities = cities.data || [];
    const activeCategories = (categories.data || []).filter((c) => c.activeCount > 0);

    return (
        <>
            <Seo />

            {/* ---------------------------- Hero ---------------------------- */}
            <section className="border-b border-stone-200 bg-brand-50 dark:border-stone-800 dark:bg-stone-900">
                <div className="container-page grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_auto]">
                    <div>
                        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-800 shadow-soft dark:bg-stone-800 dark:text-brand-300">
                            <Heart className="h-4 w-4" aria-hidden="true" /> {t('home.badge')}
                        </p>
                        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                            {t('brand.tagline')}
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-stone-700 dark:text-stone-300">
                            {t('home.intro')}
                        </p>

                        <SearchBar className="mt-7 max-w-3xl" />

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Button as={Link} to="/bhandaras" size="lg">
                                <Search className="h-5 w-5" aria-hidden="true" /> {t('nav.find')}...
                            </Button>
                            <Button as={Link} to="/bhandaras/create" size="lg" variant="secondary">
                                <CalendarPlus className="h-5 w-5" aria-hidden="true" /> {t('nav.post')}...
                            </Button>
                        </div>

                        {activeCities.length > 0 && (
                            <div className="mt-6">
                                <p className="mb-2 text-sm font-semibold text-stone-600 dark:text-stone-400">{t('home.popularCities')}</p>
                                <ul className="flex flex-wrap gap-2">
                                    {activeCities.slice(0, 6).map((c) => (
                                        <li key={c.name}>
                                            <Link
                                                to={`/bhandaras?city=${encodeURIComponent(c.name)}`}
                                                className="inline-flex min-h-[44px] items-center rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold hover:border-brand-600 dark:border-stone-700 dark:bg-stone-800"
                                            >
                                                {c.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <LogoMark className="hidden h-44 w-44 drop-shadow-lg lg:block" />
                </div>
            </section>

            {/* ------------------------- Happening today ------------------------- */}
            <EventSection
                id="today"
                title="Happening today"
                subtitle="Bhandaras you can join today."
                to="/bhandaras?range=today"
                fetcher={(s) => asItems(bhandaraService.list({ range: 'today', when: 'active', limit: 6, sort: 'date' }, s))}
                empty={emptyBox(
                    <>
                        <p className="font-semibold">No bhandaras are listed for today yet.</p>
                        <p className="mt-1 text-stone-600 dark:text-stone-400">Know of one? Share it so others can join.</p>
                        {postCta}
                    </>
                )}
            />

            <NearYou cities={activeCities} />

            {/* ----------------------------- Upcoming ----------------------------- */}
            <EventSection
                id="upcoming"
                tint
                title="Upcoming bhandaras"
                subtitle="Plan ahead and mark your calendar."
                to="/bhandaras?when=upcoming"
                fetcher={(s) => asItems(bhandaraService.list({ when: 'upcoming', limit: 6, sort: 'date' }, s))}
                empty={emptyBox(
                    <>
                        <p className="font-semibold">No upcoming bhandaras yet.</p>
                        <p className="mt-1 text-stone-600 dark:text-stone-400">Be the first to announce one in your community.</p>
                        {postCta}
                    </>
                )}
            />

            {/* ------------------------ Featured / verified ------------------------ */}
            <EventSection
                id="featured"
                title="Featured & verified"
                subtitle="Events from verified organizers and community picks."
                fetcher={(s) => bhandaraService.featured(6, s)}
                hideWhenEmpty
            />

            {/* --------------------------- Browse by city --------------------------- */}
            {activeCities.length > 0 && (
                <Section id="cities" tint title="Browse by city" subtitle="Cities with bhandaras coming up.">
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {activeCities.map((c) => (
                            <li key={c.name}>
                                <Link
                                    to={`/bhandaras?city=${encodeURIComponent(c.name)}`}
                                    className="card flex min-h-[64px] items-center justify-between gap-2 px-4 py-3 transition-shadow hover:shadow-lg"
                                >
                                    <span className="flex min-w-0 items-center gap-2 font-semibold">
                                        <MapPin className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                                        <span className="truncate">{c.name}</span>
                                    </span>
                                    <span className="shrink-0 text-sm text-stone-600 dark:text-stone-400">{c.count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* ------------------------- Browse by category ------------------------- */}
            {(categories.data || []).length > 0 && (
                <Section id="categories" title="Browse by category" subtitle="From temple bhandaras to community meals.">
                    <ul className="flex flex-wrap gap-3">
                        {categories.data.map((c) => (
                            <li key={c.slug}>
                                <Link
                                    to={`/bhandaras?category=${c.slug}`}
                                    className="card inline-flex min-h-[48px] items-center gap-2 px-5 font-semibold transition-shadow hover:shadow-lg"
                                >
                                    <UtensilsCrossed className="h-4 w-4 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                                    {c.name}
                                    {activeCategories.some((a) => a.slug === c.slug) && (
                                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-900 dark:bg-brand-900/40 dark:text-brand-200">
                                            {c.activeCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {/* ------------------------------ Map preview ------------------------------ */}
            {mapEvents.loading ? (
                <Section id="map" tint title="Bhandaras on the map">
                    <Skeleton className="h-80 w-full rounded-2xl" />
                </Section>
            ) : (
                mappable.length > 0 && (
                    <Section id="map" tint title="Bhandaras on the map" subtitle="Tap a pin to see details." to="/bhandaras?view=map" linkLabel="Open full map">
                        <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
                            <EventsMap events={mappable} className="h-80 sm:h-96" />
                        </Suspense>
                    </Section>
                )
            )}

            {/* ---------------------------- Recently added ---------------------------- */}
            <EventSection
                id="recent"
                title="Recently added"
                subtitle="Fresh announcements from the community."
                to="/bhandaras?sort=newest"
                fetcher={(s) => asItems(bhandaraService.list({ sort: 'newest', when: 'active', limit: 6 }, s))}
                hideWhenEmpty
            />

            {/* ----------------------------- How it works ----------------------------- */}
            <Section id="how-it-works" tint title="How it works" subtitle="Simple for everyone, from first-time visitors to experienced organizers.">
                <ol className="grid gap-5 md:grid-cols-3">
                    {[
                        { icon: Search, title: 'Find', text: 'Search by city, area or pincode, or let the map show what is nearby.' },
                        { icon: MapPin, title: 'Go', text: 'Check the date, time, menu and address. One tap opens directions in Google Maps.' },
                        { icon: HandHeart, title: 'Share seva', text: 'Organizing a bhandara? Post it in minutes so more people can join.' },
                    ].map((s, i) => (
                        <li key={s.title} className="card p-6">
                            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
                                <s.icon className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <h3 className="text-lg font-bold"><span className="text-brand-700 dark:text-brand-400">{i + 1}.</span> {s.title}</h3>
                            <p className="mt-1 text-stone-700 dark:text-stone-300">{s.text}</p>
                        </li>
                    ))}
                </ol>
            </Section>

            {/* ---------------------------- Community stats ---------------------------- */}
            <Section id="stats" title="Our community" subtitle="Live numbers from the platform.">
                {stats.loading ? (
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
                    </div>
                ) : stats.error ? null : (
                    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {[
                            { label: 'Bhandaras shared', value: stats.data.eventsShared, icon: UtensilsCrossed },
                            { label: 'Coming up', value: stats.data.upcoming, icon: CalendarPlus },
                            { label: 'Cities', value: stats.data.cities, icon: MapPin },
                            { label: 'Organizers', value: stats.data.organizers, icon: Users },
                        ].map((s) => (
                            <div key={s.label} className="card p-5">
                                <s.icon className="mb-2 h-5 w-5 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                                <dd className="text-3xl font-extrabold">{formatNumber(s.value)}</dd>
                                <dt className="text-sm text-stone-600 dark:text-stone-400">{s.label}</dt>
                            </div>
                        ))}
                    </dl>
                )}
            </Section>

            {/* ---------------------------- Organizer CTA ---------------------------- */}
            <section className="pb-4 pt-2" aria-labelledby="organize-h">
                <div className="container-page">
                    <div className="rounded-3xl bg-brand-700 px-6 py-10 text-white dark:bg-brand-900 sm:px-10">
                        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
                            <div>
                                <h2 id="organize-h" className="text-2xl font-extrabold sm:text-3xl">Organizing a bhandara?</h2>
                                <p className="mt-2 max-w-2xl text-brand-50">
                                    Let your community know. Add the date, menu, location and photos, and we will help people find you.
                                    {' '}<BadgeCheck className="inline h-5 w-5 align-text-bottom" aria-hidden="true" /> Trusted organizers can apply for a verified badge.
                                </p>
                            </div>
                            <Button as={Link} to="/bhandaras/create" size="lg" className="bg-white !text-brand-900 hover:bg-brand-50 dark:bg-white dark:!text-brand-900">
                                Post a Bhandara
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}