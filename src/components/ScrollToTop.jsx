import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top on navigation, or to the #anchor once its (possibly lazy-loaded) section exists. */
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (!hash) {
            window.scrollTo({ top: 0, left: 0 });
            return undefined;
        }
        const id = decodeURIComponent(hash.slice(1));
        let tries = 0;
        const timer = setInterval(() => {
            const el = document.getElementById(id);
            tries += 1;
            if (el || tries > 30) {
                clearInterval(timer);
                el?.scrollIntoView({ block: 'start' });
            }
        }, 100);
        return () => clearInterval(timer);
    }, [pathname, hash]);

    return null;
}