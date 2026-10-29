import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n/index.js';

export default function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    return (
        <label className="relative inline-flex h-11 items-center">
            <span className="sr-only">{t('nav.language')}</span>
            <Languages className="pointer-events-none absolute left-3 h-4 w-4" aria-hidden="true" />
            <select
                value={i18n.resolvedLanguage}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="h-11 cursor-pointer appearance-none rounded-lg bg-transparent pl-9 pr-3 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
            >
                {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} lang={l.code} className="bg-white text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                        {l.label}
                    </option>
                ))}
            </select>
        </label>
    );
}