import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { errorMessage } from '../services/api.js';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** Renders Google's official button. Renders nothing when VITE_GOOGLE_CLIENT_ID is not set. */
export default function GoogleSignInButton({ text = 'continue_with', onSuccess }) {
    const { loginWithGoogle } = useAuth();
    const { isDark } = useTheme();
    const holder = useRef(null);
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;
    const [ready, setReady] = useState(!!window.google?.accounts?.id);

    // The Google script loads async, so wait for it
    useEffect(() => {
        if (ready || !CLIENT_ID) return undefined;
        const poll = setInterval(() => {
            if (window.google?.accounts?.id) {
                setReady(true);
                clearInterval(poll);
            }
        }, 300);
        const stop = setTimeout(() => clearInterval(poll), 15000);
        return () => {
            clearInterval(poll);
            clearTimeout(stop);
        };
    }, [ready]);

    useEffect(() => {
        if (!ready || !CLIENT_ID || !holder.current) return;

        window.google.accounts.id.initialize({
            client_id: CLIENT_ID,
            ux_mode: 'popup',
            callback: async (response) => {
                try {
                    const user = await loginWithGoogle(response.credential);
                    toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
                    onSuccessRef.current?.(user);
                } catch (err) {
                    toast.error(errorMessage(err));
                }
            },
        });

        holder.current.innerHTML = '';
        window.google.accounts.id.renderButton(holder.current, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            text,
            shape: 'rectangular',
            logo_alignment: 'center',
            width: Math.min(400, Math.max(200, holder.current.offsetWidth || 300)),
        });
    }, [ready, isDark, text, loginWithGoogle]);

    if (!CLIENT_ID) return null;
    return <div ref={holder} className="flex min-h-[44px] w-full justify-center" />;
}