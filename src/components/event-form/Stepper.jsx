import { Check } from 'lucide-react';
import { cx } from '../../utils/cx.js';

export default function Stepper({ steps, current, onSelect, maxReached }) {
    const pct = Math.round(((current + 1) / steps.length) * 100);
    return (
        <nav aria-label="Form progress" className="mb-8">
            {/* Phones: compact progress bar */}
            <div className="sm:hidden">
                <p className="mb-2 text-sm font-semibold">
                    Step {current + 1} of {steps.length}: {steps[current].title}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Form progress">
                    <div className="h-full rounded-full bg-brand-700 transition-all dark:bg-brand-400" style={{ width: `${pct}%` }} />
                </div>
            </div>

            {/* Larger screens: numbered steps */}
            <ol className="hidden items-center sm:flex">
                {steps.map((s, i) => {
                    const done = i < current;
                    const active = i === current;
                    const reachable = i <= maxReached;
                    return (
                        <li key={s.id} className={cx('flex items-center', i < steps.length - 1 && 'flex-1')}>
                            <button
                                type="button"
                                onClick={() => reachable && onSelect(i)}
                                disabled={!reachable}
                                aria-current={active ? 'step' : undefined}
                                className="group flex min-h-[44px] items-center gap-2 rounded-lg pr-2 disabled:cursor-not-allowed"
                            >
                                <span
                                    className={cx(
                                        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold',
                                        active && 'border-brand-700 bg-brand-700 text-white dark:border-brand-400 dark:bg-brand-400 dark:text-stone-950',
                                        done && 'border-leaf-600 bg-leaf-600 text-white dark:border-leaf-400 dark:bg-leaf-400 dark:text-stone-950',
                                        !active && !done && 'border-stone-300 text-stone-600 dark:border-stone-600 dark:text-stone-400'
                                    )}
                                >
                                    {done ? <Check className="h-5 w-5" aria-hidden="true" /> : i + 1}
                                </span>
                                <span className={cx('hidden text-sm font-semibold lg:inline', active ? 'text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400')}>
                                    {s.title}
                                </span>
                            </button>
                            {i < steps.length - 1 && <span className={cx('mx-2 h-0.5 flex-1 rounded', done ? 'bg-leaf-500' : 'bg-stone-200 dark:bg-stone-800')} aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}