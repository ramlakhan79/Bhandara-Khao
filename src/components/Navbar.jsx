import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import NotificationBell from './NotificationBell.jsx';
import UserMenu from './UserMenu.jsx';
import Button from './ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { cx } from '../utils/cx.js';

const linkClass = ({ isActive }) =>
    cx(
        'inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold transition-colors',
        isActive
            ? 'text-brand-700 dark:text-brand-400'
            : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
    );

export default function Navbar() {
    const { t } = useTranslation();
    const { user, isAdmin, loading } = useAuth();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);

    const links = [
        { to: '/', label: t('nav.home'), end: true },
        { to: '/bhandaras', label: t('nav.find') },
        { to: '/about', label: t('nav.about') },
    ];

    useEffect(() => setOpen(false), [pathname]);
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
            <div className="container-page flex h-16 items-center justify-between gap-3">
                <Logo />

                <nav aria-label={t('a11y.mainNav')} className="hidden items-center gap-1 md:flex">
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden sm:block"><LanguageSwitcher /></div>
                    <ThemeToggle />
                    {user && <NotificationBell />}

                    <Button as={Link} to="/bhandaras/create" className="hidden md:inline-flex">
                        <Plus className="h-4 w-4" aria-hidden="true" /> {t('nav.post')}
                    </Button>

                    <div className="hidden items-center gap-1 md:flex">
                        {loading ? null : user ? (
                            <UserMenu />
                        ) : (
                            <>
                                <Button as={Link} to="/login" variant="ghost">{t('nav.login')}</Button>
                                <Button as={Link} to="/register" variant="secondary">{t('nav.signup')}</Button>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 md:hidden"
                        aria-label={open ? t('a11y.closeMenu') : t('a11y.openMenu')}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen((o) => !o)}
                    >
                        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {open && (
                <div id="mobile-menu" className="border-t border-stone-200 bg-white px-4 pb-5 pt-3 dark:border-stone-800 dark:bg-stone-950 md:hidden">
                    <nav aria-label={t('a11y.mobileNav')} className="flex flex-col gap-1">
                        {links.map((l) => (
                            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                                {l.label}
                            </NavLink>
                        ))}
                        {user && <NavLink to="/dashboard" className={linkClass}>{t('nav.dashboard')}</NavLink>}
                        {isAdmin && <NavLink to="/admin" className={linkClass}>{t('nav.admin')}</NavLink>}
                    </nav>
                    <div className="mt-3 sm:hidden"><LanguageSwitcher /></div>
                    <div className="mt-4 flex flex-col gap-2">
                        <Button as={Link} to="/bhandaras/create" size="lg">
                            <Plus className="h-5 w-5" aria-hidden="true" /> {t('nav.post')}
                        </Button>
                        {!loading && !user && (
                            <div className="grid grid-cols-2 gap-2">
                                <Button as={Link} to="/login" variant="secondary">{t('nav.login')}</Button>
                                <Button as={Link} to="/register" variant="secondary">{t('nav.signup')}</Button>
                            </div>
                        )}
                        {user && <UserMenuInline />}
                    </div>
                </div>
            )}
        </header>
    );
}

function UserMenuInline() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    return (
        <div className="mt-1 flex items-center justify-between rounded-lg border border-stone-200 px-4 py-2 dark:border-stone-800">
            <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>{t('nav.logout')}</Button>
        </div>
    );
}