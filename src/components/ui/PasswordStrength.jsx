import { Check, Circle } from 'lucide-react';
import { cx } from '../../utils/cx.js';

const RULES = [
    { test: (v) => v.length >= 8, label: 'At least 8 characters' },
    { test: (v) => /[a-z]/.test(v), label: 'A lowercase letter' },
    { test: (v) => /[A-Z]/.test(v), label: 'An uppercase letter' },
    { test: (v) => /[0-9]/.test(v), label: 'A number' },
];
const LEVELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-stone-300 dark:bg-stone-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-leaf-500'];

export default function PasswordStrength({ value = '' }) {
    const passed = RULES.filter((r) => r.test(value)).length;
    const score = value ? passed : 0;
    const bonus = value.length >= 12 && /[^A-Za-z0-9]/.test(value) && passed === RULES.length;

    return (
        <div className="mt-2" aria-live="polite">
            <div className="flex gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={cx('h-1.5 flex-1 rounded-full', i <= score ? COLORS[score] : 'bg-stone-200 dark:bg-stone-800')} />
                ))}
            </div>
            <p className="mt-1.5 text-sm font-medium">
                Strength: {value ? (bonus ? 'Excellent' : LEVELS[score]) : '-'}
            </p>
            <ul className="mt-1 grid gap-1 text-sm text-stone-600 dark:text-stone-400 sm:grid-cols-2">
                {RULES.map((r) => {
                    const done = r.test(value);
                    return (
                        <li key={r.label} className={cx('flex items-center gap-1.5', done && 'text-leaf-700 dark:text-leaf-300')}>
                            {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Circle className="h-3 w-3" aria-hidden="true" />}
                            <span>{r.label}</span>
                            <span className="sr-only">{done ? ' (met)' : ' (not met yet)'}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}