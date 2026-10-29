import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '../utils/storage.js';

const KEY = 'bk-theme';
const ThemeContext = createContext(null);

const systemPrefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

function getInitial() {
    const saved = storage.get(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return systemPrefersDark() ? 'dark' : 'light';
}

function applyTheme(theme) {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0c0a09' : '#faf8f5');
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(getInitial);
    const hasSaved = useRef(storage.get(KEY) === 'light' || storage.get(KEY) === 'dark');

    useEffect(() => applyTheme(theme), [theme]);

    // Follow the device theme until the user makes an explicit choice
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
        if (!mq) return undefined;
        const onChange = (e) => {
            if (!hasSaved.current) setThemeState(e.matches ? 'dark' : 'light');
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const setTheme = useCallback((next) => {
        hasSaved.current = true;
        storage.set(KEY, next);
        setThemeState(next);
    }, []);

    const toggleTheme = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

    const value = useMemo(() => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}