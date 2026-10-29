import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo.jsx';
import AuthCard, { FormError, OrDivider } from '../components/AuthCard.jsx';
import GoogleSignInButton from '../components/GoogleSignInButton.jsx';
import Button from '../components/ui/Button.jsx';
import { Input, PasswordInput } from '../components/ui/form.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { loginSchema } from '../utils/validation.js';
import { errorMessage } from '../services/api.js';
import { applyServerErrors } from '../utils/forms.js';

const GOOGLE_ENABLED = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [formError, setFormError] = useState('');
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (values) => {
        setFormError('');
        try {
            const user = await login(values);
            toast.success(t('auth.welcomeBack', { name: user.name.split(' ')[0] }));
        } catch (err) {
            if (!applyServerErrors(err, setError)) setFormError(errorMessage(err));
        }
    };

    return (
        <AuthCard
            title={t('auth.loginTitle')}
            subtitle={t('auth.loginSubtitle')}
            footer={<>{t('auth.newHere')} <Link to="/register" className="link">{t('auth.createAccount')}</Link></>}
        >
            <Seo title={t('auth.loginTitle')} noindex />
            {GOOGLE_ENABLED && (
                <>
                    <GoogleSignInButton text="signin_with" />
                    <OrDivider />
                </>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <FormError>{formError}</FormError>
                <Input label={t('auth.email')} type="email" autoComplete="email" inputMode="email" required error={errors.email?.message} {...register('email')} />
                <PasswordInput label={t('auth.password')} autoComplete="current-password" required error={errors.password?.message} {...register('password')} />
                <div className="text-right">
                    <Link to="/forgot-password" className="link text-sm">{t('auth.forgot')}</Link>
                </div>
                <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>{t('auth.loginTitle')}</Button>
            </form>
        </AuthCard>
    );
}