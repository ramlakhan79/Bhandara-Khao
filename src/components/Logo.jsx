import { Link } from 'react-router-dom';
import { cx } from '../utils/cx.js';

export function LogoMark({ className = 'h-9 w-9' }) {
    return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
            <rect width="64" height="64" rx="16" fill="#c74c07" />
            <path d="M23 15c-2.4 3.4 2.4 5 0 9M32 11c-2.4 3.4 2.4 5 0 9M41 15c-2.4 3.4 2.4 5 0 9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <circle cx="32" cy="38" r="19" fill="#fff" />
            <circle cx="32" cy="38" r="14" fill="none" stroke="#f06606" strokeWidth="2.4" />
            <path d="M21.5 38h21a10.5 10.5 0 0 1-21 0z" fill="#339a5f" />
        </svg>
    );
}

export default function Logo({ className, showText = true }) {
    return (
        <Link to="/" className={cx('inline-flex items-center gap-2.5 rounded-lg', className)} aria-label="Bhandara Khao, home">
            <LogoMark />
            {showText && (
                <span className="text-lg font-extrabold tracking-tight">
                    Bhandara <span className="text-brand-700 dark:text-brand-400">Khao</span>
                </span>
            )}
        </Link>
    );
}