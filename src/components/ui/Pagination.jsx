import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utils/cx.js';

function pageList(page, total) {
    const set = new Set([1, total, page, page - 1, page + 1]);
    const pages = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
    const out = [];
    pages.forEach((p, i) => {
        if (i && p - pages[i - 1] > 1) out.push(`gap-${p}`);
        out.push(p);
    });
    return out;
}

export default function Pagination({ page, totalPages, onChange, className }) {
    if (!totalPages || totalPages <= 1) return null;

    const btn =
        'inline-flex h-11 min-w-[44px] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors';
    const idle =
        'border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800';

    return (
        <nav aria-label="Pagination" className={cx('flex flex-wrap items-center justify-center gap-2', className)}>
            <button type="button" className={cx(btn, idle, 'disabled:opacity-50')} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {pageList(page, totalPages).map((p) =>
                typeof p === 'string' ? (
                    <span key={p} className="px-1 text-stone-500" aria-hidden="true">…</span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onChange(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                        className={cx(btn, p === page ? 'border-brand-700 bg-brand-700 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-stone-950' : idle)}
                    >
                        {p}
                    </button>
                )
            )}

            <button type="button" className={cx(btn, idle, 'disabled:opacity-50')} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
        </nav>
    );
}