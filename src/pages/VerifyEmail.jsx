import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import AuthCard from '../components/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get('token');
    const { user, refreshUser } = useAuth();
    const [status, setStatus] = useState(token ? 'verifying' : 'idle');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const started = useRef(false); // the token is single-use, so never call twice (React StrictMode)

    useEffect(() => {
        if (!token || started.current) return;
        started.current = true;
        authService
            .verifyEmail(token)
            .then(() => {
                setStatus('success');
                refreshUser().catch(() => { }); // update the "verify your email" banner if logged in
            })
            .catch((err) => {
                setStatus('error');
                setMessage(errorMessage(err));
            });
    }, [token, refreshUser]);

    const resend = async () => {
        setSending(true);
        try {
            await authService.resendVerification();
            toast.success('Verification email sent');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setSending(false);
        }
    };

    return (
        <AuthCard title="Email verification">
            <Seo title="Verify email" noindex />
            <div className="text-center" role="status" aria-live="polite">
                {status === 'verifying' && (
                    <>
                        <Spinner className="mx-auto h-8 w-8 text-brand-700 dark:text-brand-400" label="Verifying" />
                        <p className="mt-4">Verifying your email…</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="mx-auto h-14 w-14 text-leaf-600 dark:text-leaf-400" aria-hidden="true" />
                        <p className="mt-3 text-lg font-bold">Your email is verified</p>
                        <p className="mt-1 text-stone-600 dark:text-stone-400">You can now publish bhandaras.</p>
                        <Button as={Link} to={user ? '/bhandaras/create' : '/login'} size="lg" className="mt-5">
                            {user ? 'Post a Bhandara' : 'Log in'}
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="mx-auto h-14 w-14 text-red-600 dark:text-red-400" aria-hidden="true" />
                        <p className="mt-3 text-lg font-bold">We couldn't verify your email</p>
                        <p className="mt-1 text-stone-600 dark:text-stone-400">{message}</p>
                        {user && !user.isEmailVerified ? (
                            <Button className="mt-5" onClick={resend} loading={sending}>Send a new link</Button>
                        ) : (
                            <Button as={Link} to={user ? '/dashboard' : '/login'} variant="secondary" className="mt-5">
                                {user ? 'Go to dashboard' : 'Log in to request a new link'}
                            </Button>
                        )}
                    </>
                )}

                {status === 'idle' && (
                    <>
                        <MailCheck className="mx-auto h-14 w-14 text-brand-700 dark:text-brand-400" aria-hidden="true" />
                        {user?.isEmailVerified ? (
                            <>
                                <p className="mt-3 text-lg font-bold">Your email is already verified</p>
                                <Button as={Link} to="/bhandaras/create" className="mt-5">Post a Bhandara</Button>
                            </>
                        ) : (
                            <>
                                <p className="mt-3 text-lg font-bold">Check your inbox</p>
                                <p className="mt-1 text-stone-600 dark:text-stone-400">
                                    We sent a verification link{user ? <> to <strong>{user.email}</strong></> : ''}. Open it to finish setting up.
                                </p>
                                {user ? (
                                    <Button variant="secondary" className="mt-5" onClick={resend} loading={sending}>Resend email</Button>
                                ) : (
                                    <Button as={Link} to="/login" variant="secondary" className="mt-5">Log in</Button>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </AuthCard>
    );
}