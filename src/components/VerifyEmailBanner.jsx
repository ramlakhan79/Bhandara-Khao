import { useState } from 'react';
import toast from 'react-hot-toast';
import { MailWarning } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';

export default function VerifyEmailBanner() {
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    if (!user || user.isEmailVerified) return null;

    const resend = async () => {
        setSending(true);
        try {
            await authService.resendVerification();
            setSent(true);
            toast.success('Verification email sent. Please check your inbox.');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-brand-100 text-brand-950 dark:bg-brand-900/30 dark:text-brand-100">
            <div className="container-page flex flex-col items-center justify-between gap-2 py-2.5 text-sm sm:flex-row">
                <p className="flex items-center gap-2 font-medium">
                    <MailWarning className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Please verify your email ({user.email}) to publish bhandaras.
                </p>
                <button
                    type="button"
                    onClick={resend}
                    disabled={sending || sent}
                    className="min-h-[36px] rounded-md px-3 font-bold underline underline-offset-2 disabled:no-underline disabled:opacity-70"
                >
                    {sent ? 'Email sent' : sending ? 'Sending…' : 'Resend email'}
                </button>
            </div>
        </div>
    );
}