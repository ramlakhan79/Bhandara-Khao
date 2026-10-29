import { forwardRef } from 'react';
import { cx } from '../../utils/cx.js';
import Spinner from './Spinner.jsx';

const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
    primary: 'bg-brand-700 text-white hover:bg-brand-800 dark:bg-brand-400 dark:text-stone-950 dark:hover:bg-brand-300',
    secondary:
        'border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800',
    ghost: 'text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800',
    danger: 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-500 dark:text-stone-950 dark:hover:bg-red-400',
    leaf: 'bg-leaf-700 text-white hover:bg-leaf-800 dark:bg-leaf-400 dark:text-stone-950 dark:hover:bg-leaf-300',
};

const sizes = {
    sm: 'min-h-[36px] px-3 text-sm',
    md: 'min-h-[44px] px-4 text-sm',
    lg: 'min-h-[48px] px-6 text-base',
    icon: 'h-11 w-11',
};

/** Pass `as={Link} to="/x"` to render a router link that looks like a button. */
const Button = forwardRef(function Button(
    { as: Comp = 'button', variant = 'primary', size = 'md', loading = false, className, children, disabled, type, ...props },
    ref
) {
    const isButton = Comp === 'button';
    return (
        <Comp
            ref={ref}
            {...(isButton ? { type: type || 'button', disabled: disabled || loading } : {})}
            aria-busy={loading || undefined}
            className={cx(base, variants[variant], sizes[size], className)}
            {...props}
        >
            {loading && <Spinner className="h-4 w-4" label="" />}
            {children}
        </Comp>
    );
});

export default Button;