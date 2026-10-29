import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '../../utils/cx.js';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

/** Accessible dialog: focus trap, Esc to close, scroll lock. Renders as a bottom sheet on phones. */
export default function Modal({ open, onClose, title, children, footer, size = 'md', dismissible = true }) {
    const titleId = useId();
    const panelRef = useRef(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => {
        if (!open) return undefined;
        const previouslyFocused = document.activeElement;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const panel = panelRef.current;
        (panel?.querySelector('[data-autofocus]') || panel?.querySelector(FOCUSABLE) || panel)?.focus();

        const onKey = (e) => {
            if (e.key === 'Escape' && dismissible) {
                e.stopPropagation();
                closeRef.current?.();
            }
            if (e.key === 'Tab' && panel) {
                const els = [...panel.querySelectorAll(FOCUSABLE)];
                if (!els.length) return e.preventDefault();
                const first = els[0];
                const last = els[els.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
            return undefined;
        };
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            previouslyFocused?.focus?.();
        };
    }, [open, dismissible]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && dismissible) closeRef.current?.();
            }}
        >
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                tabIndex={-1}
                className={cx(
                    'flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl outline-none dark:bg-stone-900 sm:rounded-2xl',
                    sizes[size]
                )}
            >
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
                    <h2 id={titleId} className="text-lg font-bold">{title}</h2>
                    {dismissible && (
                        <button
                            type="button"
                            onClick={() => closeRef.current?.()}
                            aria-label="Close dialog"
                            className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    )}
                </div>
                <div className="overflow-y-auto px-5 py-4">{children}</div>
                {footer && (
                    <div className="flex flex-col-reverse gap-2 border-t border-stone-200 px-5 py-4 dark:border-stone-800 sm:flex-row sm:justify-end">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}