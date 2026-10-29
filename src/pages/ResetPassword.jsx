import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import AuthCard, { FormError } from '../components/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';
import PasswordStrength from '../components/ui/PasswordStrength.jsx';
import { PasswordInput } from '../components/ui/form.jsx';
import { resetSchema } from '../utils/validation.js';
import { authService } from '../services/authService.js';
import { errorMessage } from '../services/api.js';
import { applyServerErrors } from '../utils/forms.js';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');
    const [linkExpired, setLinkExpired] = useState(false);
    const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(resetSchema),
        mode: 'onTouched',
        defaultValues: { password: '', confirmPassword: '' },
    });
    const password = watch('password');

    const onSubmit = async (values) => {
        setFormError('');
        try {
            await authService.resetPassword({ token, ...values });
            toast.success('Password updated. Please log in.');
            navigate('/login', { replace: true });
        } catch (err) {
            if (applyServerErrors(err, setError)) return;
            if (err.response?.status === 400) setLinkExpired(true);
            else setFormError(errorMessage(err));
        }
    };

    return (
        <AuthCard title="Choose a new password" footer={<Link to="/login" className="link">Back to log in</Link>}>
            <Seo title="Reset password" noindex />
            {linkExpired ? (
                <div role="alert" className="text-center">
                    <p className="font-semibold">This reset link is invalid or has expired.</p>
                    <Button as={Link} to="/forgot-password" className="mt-4">Request a new link</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    <FormError>{formError}</FormError>
                    <div>
                        <PasswordInput label="New password" autoComplete="new-password" required error={errors.password?.message} {...register('password')} />
                        <PasswordStrength value={password} />
                    </div>
                    <PasswordInput label="Confirm new password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
                    <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Update password</Button>
                </form>
            )}
        </AuthCard>
    );
}