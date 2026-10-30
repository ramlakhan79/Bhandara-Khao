import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo.jsx';
import { SITE } from '../utils/site.js';
import InstallAppButton from './InstallAppButton.jsx';

const socials = [
    { key: 'instagram', label: 'Instagram', icon: Instagram },
    { key: 'facebook', label: 'Facebook', icon: Facebook },
    { key: 'x', label: 'X (Twitter)', icon: Twitter },
    { key: 'youtube', label: 'YouTube', icon: Youtube },
].filter((s) => SITE.social[s.key]);

const col = 'flex flex-col gap-1';
const a = 'inline-flex min-h-[36px] items-center text-stone-600 hover:text-brand-700 dark:text-stone-400 dark:hover:text-brand-400';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="mt-16 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
            <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <Logo />
                    <p className="mt-3 max-w-xs text-stone-600 dark:text-stone-400">{t('brand.tagline')}</p>
                    {socials.length > 0 && (
                        <ul className="mt-4 flex gap-1" aria-label={t('a11y.social')}>
                            {socials.map(({ key, label, icon: Icon }) => (
                                <li key={key}>
                                    <a
                                        href={SITE.social[key]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                                    >
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="mt-5">
                    <p className="mb-2 text-sm font-semibold">{t('install.title', { defaultValue: 'Get the app' })}</p>
                    <InstallAppButton />
                </div>
                <nav aria-label={t('footer.explore')} className={col}>
                    <h2 className="mb-1 font-bold">{t('footer.explore')}</h2>
                    <Link to="/bhandaras" className={a}>{t('footer.findLink')}</Link>
                    <Link to="/bhandaras/create" className={a}>{t('footer.postLink')}</Link>
                    <Link to="/#how-it-works" className={a}>{t('footer.how')}</Link>
                </nav>

                <nav aria-label={t('footer.community')} className={col}>
                    <h2 className="mb-1 font-bold">{t('footer.community')}</h2>
                    <Link to="/about" className={a}>{t('footer.about')}</Link>
                    <Link to="/guidelines" className={a}>{t('footer.guidelines')}</Link>
                    <Link to="/contact" className={a}>{t('footer.contact')}</Link>
                </nav>

                <nav aria-label={t('footer.legal')} className={col}>
                    <h2 className="mb-1 font-bold">{t('footer.legal')}</h2>
                    <Link to="/privacy" className={a}>{t('footer.privacy')}</Link>
                    <Link to="/terms" className={a}>{t('footer.terms')}</Link>
                </nav>
            </div>
            <div className="border-t border-stone-200 py-5 text-center text-sm text-stone-500 dark:border-stone-800">
                © {new Date().getFullYear()} {SITE.name}. {t('footer.made')}
            </div>
        </footer>
    );
}