import { cx } from '../../utils/cx.js';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
    return (
        <div className={cx('flex flex-col items-center px-4 py-12 text-center', className)}>
            {Icon && (
                <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
            )}
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="mt-1 max-w-md text-stone-600 dark:text-stone-400">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}