import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import AuthCard, { FormError } from '../components/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';
import { Input } from '../components/ui/form.jsx';
import { forgotSchema } from '../utils/validation.js';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';

export default function ForgotPassword() {
    const [sentTo, setSentTo] = useState('');
    const [formError, setFormError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async ({ email }) => {
        setFormError('');
        try {
            await authService.forgotPassword(email);
            setSentTo(email);
        } catch (err) {
            setFormError(errorMessage(err));
        }
    };

    return (
        <AuthCard
            title="Forgot your password?"
            subtitle={sentTo ? undefined : "Enter your email and we'll send you a reset link."}
            footer={<Link to="/login" className="link">Back to log in</Link>}
        >
            <Seo title="Forgot password" noindex />
            {sentTo ? (
                <div role="status" className="text-center">
                    <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-leaf-100 text-leaf-800 dark:bg-leaf-900/40 dark:text-leaf-200">
                        <MailCheck className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <p className="font-semibold">Check your inbox</p>
                    <p className="mt-1 text-stone-600 dark:text-stone-400">
                        If an account exists for <strong>{sentTo}</strong>, a reset link is on its way. It is valid for 1 hour. Check your spam folder if you don't see it.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    <FormError>{formError}</FormError>
                    <Input label="Email" type="email" autoComplete="email" inputMode="email" required error={errors.email?.message} {...register('email')} />
                    <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Send reset link</Button>
                </form>
            )}
        </AuthCard>
    );
}