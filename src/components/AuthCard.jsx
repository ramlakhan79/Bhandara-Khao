import Logo from './Logo.jsx';

export default function AuthCard({ title, subtitle, children, footer }) {
    return (
        <div className="container-page flex justify-center py-10 sm:py-14">
            <div className="w-full max-w-md">
                <div className="mb-6 flex justify-center"><Logo /></div>
                <div className="card p-6 sm:p-8">
                    <h1 className="text-2xl font-extrabold">{title}</h1>
                    {subtitle && <p className="mt-1 text-stone-600 dark:text-stone-400">{subtitle}</p>}
                    <div className="mt-6">{children}</div>
                </div>
                {footer && <p className="mt-5 text-center text-stone-700 dark:text-stone-300">{footer}</p>}
            </div>
        </div>
    );
}

export function OrDivider() {
    return (
        <div className="my-5 flex items-center gap-3 text-sm text-stone-500" role="separator" aria-label="or">
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
            or
            <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
        </div>
    );
}

export function FormError({ children }) {
    if (!children) return null;
    return (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {children}
        </p>
    );
}