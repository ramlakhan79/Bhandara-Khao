import { cx } from '../../utils/cx.js';

const tones = {
    neutral: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
    brand: 'bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-200',
    green: 'bg-leaf-100 text-leaf-800 dark:bg-leaf-900/50 dark:text-leaf-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
    blue: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
};

export default function Badge({ tone = 'neutral', className, children, ...props }) {
    return (
        <span
            className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-none', tones[tone], className)}
            {...props}
        >
            {children}
        </span>
    );
}