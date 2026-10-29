import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BadgeCheck, Camera, LogOut, MailCheck, MailWarning, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../ui/Avatar.jsx';
import Badge from '../ui/Badge.jsx';
import Button from '../ui/Button.jsx';
import PasswordStrength from '../ui/PasswordStrength.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { Input, PasswordInput, Textarea } from '../ui/form.jsx';
import { FormError } from '../AuthCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { authService } from '../../services/authService.js';
import { userService } from '../../services/userService.js';
import { errorMessage } from '../../services/api.js';
import { applyServerErrors } from '../../utils/forms.js';
import { passwordSchema } from '../../utils/validation.js';
import { ALLOWED_IMAGE_TYPES, MAX_SOURCE_BYTES, MAX_UPLOAD_BYTES, compressImage } from '../../utils/compressImage.js';

const Panel = ({ title, id, children }) => (
    <section aria-labelledby={id} className="card p-5 sm:p-6">
        <h2 id={id} className="mb-4 text-lg font-bold">{title}</h2>
        {children}
    </section>
);

const profileSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    phone: z.string().trim().refine((v) => v === '' || /^\+?[0-9\s-]{7,15}$/.test(v), 'Enter a valid phone number'),
});

const passwordFormSchema = z
    .object({ currentPassword: z.string(), password: passwordSchema, confirmPassword: z.string().min(1, 'Confirm your password') })
    .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

/* ---------------------------------- profile --------------------------------- */
function ProfileForm() {
    const { user, updateUser } = useAuth();
    const { register, handleSubmit, setError, formState: { errors, isSubmitting, isDirty } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user.name, phone: user.phone || '' },
    });

    const onSubmit = async (v) => {
        try {
            const u = await userService.updateProfile({ name: v.name, phone: v.phone });
            updateUser(u);
            toast.success('Profile updated');
        } catch (err) {
            if (!applyServerErrors(err, setError)) toast.error(errorMessage(err));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input label="Full name" required autoComplete="name" error={errors.name?.message} {...register('name')} />
            <Input label="Phone (optional)" type="tel" inputMode="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save profile</Button>
        </form>
    );
}

/* ----------------------------------- avatar --------------------------------- */
function AvatarSection() {
    const { user, updateUser } = useAuth();
    const input = useRef(null);
    const [busy, setBusy] = useState(false);

    const choose = async (file) => {
        if (!file) return;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return toast.error('Please choose a JPEG, PNG or WebP image');
        if (file.size > MAX_SOURCE_BYTES) return toast.error('That image is too large (max 20 MB)');
        setBusy(true);
        try {
            const small = await compressImage(file, { maxDim: 800 });
            if (small.size > MAX_UPLOAD_BYTES) throw new Error('Image is larger than 5 MB');
            updateUser(await userService.uploadAvatar(small));
            toast.success('Profile photo updated');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setBusy(false);
        }
        return undefined;
    };

    const remove = async () => {
        setBusy(true);
        try {
            updateUser(await userService.removeAvatar());
            toast('Profile photo removed');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            <Avatar user={user} size={80} />
            <div className="flex flex-wrap gap-2">
                <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="avatar-input" onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ''; }} />
                <Button variant="secondary" onClick={() => input.current?.click()} loading={busy}><Camera className="h-4 w-4" aria-hidden="true" /> Change photo</Button>
                {user.profileImage?.url && <Button variant="ghost" onClick={remove} disabled={busy}><Trash2 className="h-4 w-4" aria-hidden="true" /> Remove</Button>}
            </div>
        </div>
    );
}

/* ------------------------------ email verification --------------------------- */
function EmailStatus() {
    const { user } = useAuth();
    const [sending, setSending] = useState(false);
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
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
                <p className="truncate font-semibold">{user.email}</p>
                {user.isEmailVerified ? (
                    <Badge tone="green" className="mt-1"><MailCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified</Badge>
                ) : (
                    <Badge tone="brand" className="mt-1"><MailWarning className="h-3.5 w-3.5" aria-hidden="true" /> Not verified</Badge>
                )}
            </div>
            {!user.isEmailVerified && <Button variant="secondary" onClick={resend} loading={sending}>Resend verification email</Button>}
        </div>
    );
}

/* ----------------------------------- password -------------------------------- */
function PasswordForm() {
    const [formError, setFormError] = useState('');
    const { register, handleSubmit, reset, watch, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(passwordFormSchema),
        mode: 'onTouched',
        defaultValues: { currentPassword: '', password: '', confirmPassword: '' },
    });

    const onSubmit = async (v) => {
        setFormError('');
        try {
            await userService.changePassword({ currentPassword: v.currentPassword || undefined, password: v.password, confirmPassword: v.confirmPassword });
            toast.success('Password changed');
            reset();
        } catch (err) {
            if (!applyServerErrors(err, setError)) setFormError(errorMessage(err));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormError>{formError}</FormError>
            <PasswordInput
                label="Current password"
                autoComplete="current-password"
                hint="Signed up with Google and never set a password? Leave this blank."
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
            />
            <div>
                <PasswordInput label="New password" autoComplete="new-password" required error={errors.password?.message} {...register('password')} />
                <PasswordStrength value={watch('password')} />
            </div>
            <PasswordInput label="Confirm new password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <Button type="submit" loading={isSubmitting}>Change password</Button>
        </form>
    );
}

/* ------------------------------ organizer verification ----------------------- */
const isHttpUrl = (s) => { try { return /^https?:$/.test(new URL(s).protocol); } catch { return false; } };

function OrganizerVerification() {
    const { data, loading, reload } = useApi((s) => userService.getOrganizerVerification(s), []);
    const [org, setOrg] = useState('');
    const [desc, setDesc] = useState('');
    const [links, setLinks] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (loading) return <Skeleton className="h-24 w-full" />;

    const v = data?.verification;
    if (data?.isVerifiedOrganizer || v?.status === 'approved') {
        return <p className="flex items-center gap-2 font-semibold text-leaf-700 dark:text-leaf-300"><BadgeCheck className="h-5 w-5" aria-hidden="true" /> You are a verified organizer. Your events show the verified badge.</p>;
    }
    if (v?.status === 'pending') {
        return <p role="status">Your request for <strong>{v.organizationName}</strong> is awaiting review.</p>;
    }

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        const proofLinks = links.split('\n').map((s) => s.trim()).filter(Boolean);
        if (org.trim().length < 2) return setError('Enter your organization name');
        if (proofLinks.some((l) => !isHttpUrl(l))) return setError('Each link must start with http:// or https://');
        setBusy(true);
        try {
            await userService.requestOrganizerVerification({ organizationName: org.trim(), description: desc.trim() || undefined, proofLinks });
            toast.success('Request submitted');
            reload();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
        return undefined;
    };

    return (
        <form onSubmit={submit} noValidate className="space-y-4">
            {v?.status === 'rejected' && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-100">
                    Your last request wasn't approved{v.reviewNote ? `: ${v.reviewNote}` : '.'} You can apply again.
                </p>
            )}
            <p className="text-sm text-stone-600 dark:text-stone-400">Verified organizers get a badge on their events, which builds trust with visitors.</p>
            <FormError>{error}</FormError>
            <Input label="Organization / temple / group name" required value={org} onChange={(e) => setOrg(e.target.value)} />
            <Textarea label="About your organization (optional)" rows={3} maxLength={1000} value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Textarea label="Links that show who you are (optional)" rows={3} hint="One per line: a website, social page or news article." value={links} onChange={(e) => setLinks(e.target.value)} />
            <Button type="submit" loading={busy}>Request verification</Button>
        </form>
    );
}

/* ------------------------------------ main ----------------------------------- */
export default function ProfileSettings() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
                <Panel id="photo-h" title="Profile photo"><AvatarSection /></Panel>
                <Panel id="profile-h" title="Profile"><ProfileForm /></Panel>
                <Panel id="email-h" title="Email"><EmailStatus /></Panel>
            </div>
            <div className="space-y-6">
                <Panel id="password-h" title="Change password"><PasswordForm /></Panel>
                <Panel id="organizer-h" title="Organizer verification"><OrganizerVerification /></Panel>
                <Panel id="session-h" title="Session">
                    <Button variant="secondary" onClick={async () => { await logout(); toast.success('Logged out'); navigate('/'); }}>
                        <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
                    </Button>
                </Panel>
            </div>
        </div>
    );
}