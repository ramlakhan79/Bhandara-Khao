import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import AuthCard, { FormError, OrDivider } from '../components/AuthCard.jsx';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';
import Button from '../components/ui/Button.jsx';
import PasswordStrength from '../components/ui/PasswordStrength.jsx';
import { Input, PasswordInput } from '../components/ui/form.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { registerSchema } from '../utils/validation.js';
import { errorMessage } from '../services/api.js';
import { applyServerErrors } from '../utils/forms.js';

const GOOGLE_ENABLED = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Register() {
    const { register: signUp } = useAuth();
    const [formError, setFormError] = useState('');
    const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched',
        defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    });
    const password = watch('password');

    const onSubmit = async (values) => {
        setFormError('');
        try {
            await signUp(values);
            toast.success('Account created! Please check your email to verify your address.', { duration: 6000 });
        } catch (err) {
            if (!applyServerErrors(err, setError)) setFormError(errorMessage(err));
        }
    };

    return (
        <AuthCard
            title="Create your account"
            subtitle="Join the community to post bhandaras and save events."
            footer={<>Already have an account? <Link to="/login" className="link">Log in</Link></>}
        >
            <Seo title="Sign up" noindex />
            {GOOGLE_ENABLED && (
                <>
                    <GoogleSignInButton text="signup_with" />
                    <OrDivider />
                </>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <FormError>{formError}</FormError>
                <Input label="Full name" autoComplete="name" required error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" autoComplete="email" inputMode="email" required error={errors.email?.message} {...register('email')} />
                <Input
                    label="Phone number (optional)"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    hint="Only used if you choose to share it on an event."
                    error={errors.phone?.message}
                    {...register('phone')}
                />
                <div>
                    <PasswordInput label="Password" autoComplete="new-password" required error={errors.password?.message} {...register('password')} />
                    <PasswordStrength value={password} />
                </div>
                <PasswordInput label="Confirm password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                <p className="text-sm text-stone-600 dark:text-stone-400">
                    By creating an account you agree to our <Link to="/terms" className="link">Terms</Link> and <Link to="/privacy" className="link">Privacy Policy</Link>.
                </p>
                <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Create account</Button>
            </form>
        </AuthCard>
    );
}