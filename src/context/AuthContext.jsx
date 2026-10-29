import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const userRef = useRef(null);
    userRef.current = user;

    // Restore the session on page load (the cookie is HttpOnly, so ask the server)
    useEffect(() => {
        const controller = new AbortController();
        authService
            .me(controller.signal)
            .then((d) => setUser(d.user))
            .catch(() => setUser(null))
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, []);

    // The API layer fires this when any request returns 401 while we think we're logged in
    useEffect(() => {
        const onUnauthorized = () => {
            if (userRef.current) {
                setUser(null);
                toast.error('Your session has expired. Please log in again.');
            }
        };
        window.addEventListener('bk:unauthorized', onUnauthorized);
        return () => window.removeEventListener('bk:unauthorized', onUnauthorized);
    }, []);

    const login = useCallback(async (body) => {
        const { user: u } = await authService.login(body);
        setUser(u);
        return u;
    }, []);

    const register = useCallback(async (body) => {
        const { user: u } = await authService.register(body);
        setUser(u);
        return u;
    }, []);

    const loginWithGoogle = useCallback(async (credential) => {
        const { user: u } = await authService.google(credential);
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch { /* clear local state regardless */ }
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        const { user: u } = await authService.me();
        setUser(u);
        return u;
    }, []);

    const value = useMemo(
        () => ({ user, loading, isAdmin: user?.role === 'admin', login, register, loginWithGoogle, logout, refreshUser, updateUser: setUser }),
        [user, loading, login, register, loginWithGoogle, logout, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}