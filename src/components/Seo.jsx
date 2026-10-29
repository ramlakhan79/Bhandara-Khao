import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE } from '../utils/site.js';

function setMeta(attr, key, content) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!content) return el?.remove();
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    return el.setAttribute('content', content);
}

function setLink(rel, href) {
    let el = document.head.querySelector(`link[rel="${rel}"]`);
    if (!href) return el?.remove();
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
    }
    return el.setAttribute('href', href);
}

/**
 * Sets the title and meta tags for the current page (for browsers and the share sheet).
 * Crawlers and link-preview bots get the server-rendered version from /seo/bhandaras/:slug.
 */
export default function Seo({ title, description, image, canonical, noindex = false, type = 'website' }) {
    const { pathname } = useLocation();

    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE.name}` : `${SITE.name}: ${SITE.tagline}`;
        const desc = description || 'Find bhandaras, free community meals and food seva events near you across India.';
        const url = canonical || `${SITE.url}${pathname}`;

        document.title = fullTitle;
        setMeta('name', 'description', desc);
        setMeta('name', 'robots', noindex ? 'noindex,nofollow' : '');
        setMeta('property', 'og:site_name', SITE.name);
        setMeta('property', 'og:type', type);
        setMeta('property', 'og:title', fullTitle);
        setMeta('property', 'og:description', desc);
        setMeta('property', 'og:url', url);
        setMeta('property', 'og:image', image);
        setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
        setMeta('name', 'twitter:title', fullTitle);
        setMeta('name', 'twitter:description', desc);
        setMeta('name', 'twitter:image', image);
        setLink('canonical', url);
    }, [title, description, image, canonical, noindex, type, pathname]);

    return null;
}