import { cx } from '../../utils/cx.js';

export default function Spinner({ className, label = 'Loading' }) {
    return (
        <span role={label ? 'status' : undefined} aria-hidden={label ? undefined : true} className="inline-flex">
            <svg className={cx('h-5 w-5 animate-spin', className)} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            {label && <span className="sr-only">{label}</span>}
        </span>
    );
}