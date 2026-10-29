import { useState } from 'react';
import { cx } from '../../utils/cx.js';

export default function Avatar({ user, size = 36, className }) {
    const [failed, setFailed] = useState(false);
    const url = user?.profileImage?.url;
    const initials = (user?.name || '?').split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
    const style = { width: size, height: size, fontSize: Math.max(12, size * 0.38) };

    if (url && !failed) {
        return (
            <img
                src={url}
                alt=""
                width={size}
                height={size}
                style={style}
                referrerPolicy="no-referrer"
                onError={() => setFailed(true)}
                className={cx('shrink-0 rounded-full object-cover', className)}
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            style={style}
            className={cx(
                'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-900 dark:bg-brand-900/50 dark:text-brand-200',
                className
            )}
        >
            {initials}
        </span>
    );
}