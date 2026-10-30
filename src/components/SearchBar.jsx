import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Search, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { bhandaraService } from '../services/bhandaraService.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { useRecentSearches } from '../hooks/useRecentSearches.js';
import Button from './ui/Button.jsx';
import { cx } from '../utils/cx.js';

export default function SearchBar({ className, placeholder = 'Search by city, area, pincode or bhandara name' }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const listId = useId();
    const boxRef = useRef(null);
    const [value, setValue] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [suggestions, setSuggestions] = useState(null);
    const recent = useRecentSearches();

    const term = value.trim();
    const debounced = useDebounce(term, 300);
    useClickOutside(boxRef, () => setOpen(false), open);

    useEffect(() => {
        if (debounced.length < 2) {
            setSuggestions(null);
            return undefined;
        }
        const controller = new AbortController();
        bhandaraService.suggest(debounced, controller.signal).then(setSuggestions).catch(() => { });
        return () => controller.abort();
    }, [debounced]);

    const submit = (text) => {
        const t = text.trim();
        setOpen(false);
        if (!t) return navigate('/bhandaras');
        recent.add(t);
        return navigate(`/bhandaras?q=${encodeURIComponent(t)}`);
    };

    const options = useMemo(() => {
        if (term.length < 2) {
            return recent.items.map((r) => ({ key: `r-${r}`, icon: Clock, label: r, hint: 'Recent', run: () => submit(r) }));
        }
        if (!suggestions) return [];
        const go = (path) => { setOpen(false); navigate(path); };
        return [
            ...suggestions.cities.map((c) => ({ key: `c-${c}`, icon: MapPin, label: c, hint: 'City', run: () => go(`/bhandaras?city=${encodeURIComponent(c)}`) })),
            ...suggestions.localities.map((l) => ({ key: `l-${l}`, icon: MapPin, label: l, hint: 'Area', run: () => go(`/bhandaras?locality=${encodeURIComponent(l)}`) })),
            ...suggestions.events.map((e) => ({ key: `e-${e._id}`, icon: Utensils, label: e.title, hint: e.city, run: () => go(`/bhandaras/${e.slug}`) })),
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [term, suggestions, recent.items]);

    useEffect(() => setActive(-1), [options.length, term]);

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, -1));
        } else if (e.key === 'Enter' && open && active >= 0 && options[active]) {
            e.preventDefault();
            options[active].run();
        }
    };

    const showList = open && options.length > 0;

    return (
        <form
            role="search"
            ref={boxRef}
            onSubmit={(e) => {
                e.preventDefault();
                submit(value);
            }}
            className={cx('relative', className)}
        >
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <label htmlFor={`${listId}-input`} className="sr-only">Search bhandaras</label>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" aria-hidden="true" />
                    <input
                        id={`${listId}-input`}
                        type="search"
                        role="combobox"
                        aria-expanded={showList}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
                        autoComplete="off"
                        value={value}
                        placeholder={t('home.searchPlaceholder')}
                        onChange={(e) => { setValue(e.target.value); setOpen(true); }}
                        onFocus={() => setOpen(true)}
                        onKeyDown={onKeyDown}
                        className="block min-h-[52px] w-full rounded-xl border border-stone-300 bg-white py-3 pl-11 pr-3 text-base text-stone-900 placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-400 dark:focus-visible:ring-brand-400"
                    />
                </div>
                <Button type="submit" size="lg" className="sm:min-w-[120px]">{t('home.searchButtton')}</Button>
            </div>

            {showList && (
                <div className="card absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto py-1 sm:right-[132px]">
                    {term.length < 2 && (
                        <div className="flex items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Recent searches
                            <button type="button" onClick={recent.clear} className="min-h-[32px] normal-case underline">Clear</button>
                        </div>
                    )}
                    <ul id={listId} role="listbox" aria-label="Search suggestions">
                        {options.map((o, i) => (
                            <li
                                key={o.key}
                                id={`${listId}-${i}`}
                                role="option"
                                aria-selected={i === active}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={o.run}
                                className={cx(
                                    'flex min-h-[44px] cursor-pointer items-center gap-3 px-4 py-2',
                                    i === active ? 'bg-brand-100 dark:bg-brand-900/30' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                                )}
                            >
                                <o.icon className="h-4 w-4 shrink-0 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                                <span className="min-w-0 flex-1 truncate font-medium">{o.label}</span>
                                <span className="shrink-0 text-xs text-stone-500">{o.hint}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
    );
}