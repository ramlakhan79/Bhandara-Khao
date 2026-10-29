import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cx } from '../../utils/cx.js';

const control =
    'block w-full min-h-[44px] rounded-lg border bg-white px-3 py-2.5 text-base text-stone-900 placeholder:text-stone-400 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 ' +
    'dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus-visible:ring-brand-400 disabled:opacity-60';
const ok = 'border-stone-300 dark:border-stone-700';
const bad = 'border-red-600 dark:border-red-400';

const describedBy = (id, error, hint) => [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

function Shell({ id, label, error, hint, required, children, className }) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
                    {label}
                    {required && <span className="ml-0.5 text-red-700 dark:text-red-400" aria-hidden="true"> *</span>}
                </label>
            )}
            {children}
            {hint && !error && (
                <p id={`${id}-hint`} className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">{hint}</p>
            )}
            {error && (
                <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}

export const Input = forwardRef(function Input({ label, error, hint, required, id, className, wrapperClassName, ...props }, ref) {
    const auto = useId();
    const inputId = id || auto;
    return (
        <Shell id={inputId} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
            <input
                ref={ref}
                id={inputId}
                aria-invalid={!!error}
                aria-required={required || undefined}
                aria-describedby={describedBy(inputId, error, hint)}
                className={cx(control, error ? bad : ok, className)}
                {...props}
            />
        </Shell>
    );
});

export const PasswordInput = forwardRef(function PasswordInput({ label, error, hint, required, id, className, wrapperClassName, ...props }, ref) {
    const auto = useId();
    const inputId = id || auto;
    const [show, setShow] = useState(false);
    return (
        <Shell id={inputId} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
            <div className="relative">
                <input
                    ref={ref}
                    id={inputId}
                    type={show ? 'text' : 'password'}
                    aria-invalid={!!error}
                    aria-required={required || undefined}
                    aria-describedby={describedBy(inputId, error, hint)}
                    className={cx(control, 'pr-12', error ? bad : ok, className)}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    aria-pressed={show}
                    className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                    {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                </button>
            </div>
        </Shell>
    );
});

export const Textarea = forwardRef(function Textarea({ label, error, hint, required, id, className, wrapperClassName, rows = 4, ...props }, ref) {
    const auto = useId();
    const inputId = id || auto;
    return (
        <Shell id={inputId} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
            <textarea
                ref={ref}
                id={inputId}
                rows={rows}
                aria-invalid={!!error}
                aria-required={required || undefined}
                aria-describedby={describedBy(inputId, error, hint)}
                className={cx(control, 'resize-y', error ? bad : ok, className)}
                {...props}
            />
        </Shell>
    );
});

export const Select = forwardRef(function Select({ label, error, hint, required, id, className, wrapperClassName, children, ...props }, ref) {
    const auto = useId();
    const inputId = id || auto;
    return (
        <Shell id={inputId} label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
            <select
                ref={ref}
                id={inputId}
                aria-invalid={!!error}
                aria-required={required || undefined}
                aria-describedby={describedBy(inputId, error, hint)}
                className={cx(control, error ? bad : ok, className)}
                {...props}
            >
                {children}
            </select>
        </Shell>
    );
});

export const Checkbox = forwardRef(function Checkbox({ label, error, hint, id, className, children, ...props }, ref) {
    const auto = useId();
    const inputId = id || auto;
    return (
        <div className={className}>
            <label htmlFor={inputId} className="flex min-h-[44px] cursor-pointer items-start gap-3 py-2">
                <input
                    ref={ref}
                    id={inputId}
                    type="checkbox"
                    aria-invalid={!!error}
                    aria-describedby={describedBy(inputId, error, hint)}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-stone-400 text-brand-700 accent-brand-700 dark:accent-brand-400"
                    {...props}
                />
                <span className="text-sm leading-snug">{label || children}</span>
            </label>
            {hint && !error && <p id={`${inputId}-hint`} className="-mt-1 pl-8 text-sm text-stone-600 dark:text-stone-400">{hint}</p>}
            {error && <p id={`${inputId}-err`} role="alert" className="pl-8 text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}
        </div>
    );
});