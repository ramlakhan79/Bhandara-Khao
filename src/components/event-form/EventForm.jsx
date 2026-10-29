import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Eye, Save, Send, Undo2 } from 'lucide-react';
import Seo from '../Seo.jsx';
import Stepper from './Stepper.jsx';
import ImageUploader, { existingItem } from './ImageUploader.jsx';
import EventPreview from './EventPreview.jsx';
import { BasicSection, ContactSection, FoodSection, WhenSection, WhereSection } from './sections.jsx';
import Button from '../ui/Button.jsx';
import Modal from '../ui/Modal.jsx';
import Skeleton from '../ui/Skeleton.jsx';
import { FormError } from '../AuthCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { bhandaraService } from '../../services/bhandaraService.js';
import { errorMessage } from '../../services/api.js';
import {
    LAST_STEP, PHOTOS_STEP, STEPS, emptyValues, eventResolver, mapServerErrors, stepOfField, toPayload, valuesFromEvent,
} from '../../utils/eventForm.js';

const focusFirstInvalid = (root) =>
    setTimeout(() => {
        const el = root?.querySelector('[aria-invalid="true"]');
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el?.focus({ preventScroll: true });
    }, 60);

/** Shared by "Post a Bhandara" (event = null) and "Edit" (event = loaded event). */
export default function EventForm({ event = null }) {
    const isEdit = !!event;
    const navigate = useNavigate();
    const { user } = useAuth();
    const rootRef = useRef(null);
    const savedRef = useRef(false);

    const [step, setStep] = useState(0);
    const [maxReached, setMaxReached] = useState(isEdit ? LAST_STEP : 0);
    const [busy, setBusy] = useState(null);
    const [formError, setFormError] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const catQuery = useApi((s) => bhandaraService.categories(s), [], { initialData: [] });
    const categories = useMemo(() => {
        const list = catQuery.data || [];
        if (event && !list.some((c) => c.slug === event.category)) return [...list, { slug: event.category, name: event.category.replace(/-/g, ' ') }];
        return list;
    }, [catQuery.data, event]);

    const [images, setImages] = useState(() => (event?.images || []).map(existingItem));
    const [coverId, setCoverId] = useState(event?.coverImage?.publicId || null);
    const imagesRef = useRef(images);
    imagesRef.current = images;

    const form = useForm({
        resolver: eventResolver,
        mode: 'onTouched',
        defaultValues: event ? valuesFromEvent(event) : emptyValues,
    });
    const { handleSubmit, trigger, setError, formState: { isDirty } } = form;

    const ready = images.filter((i) => i.status === 'done');
    const effectiveCover = ready.find((i) => i.data.publicId === coverId)?.data.publicId || ready[0]?.data.publicId;
    const dirty = isDirty || images.some((i) => !i.existing);

    // Warn before closing the tab with unsaved work
    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (e) => { if (!savedRef.current) { e.preventDefault(); e.returnValue = ''; } };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    // Photos uploaded but never saved are removed from Cloudinary when leaving the form
    useEffect(
        () => () => {
            if (savedRef.current) return;
            imagesRef.current
                .filter((i) => !i.existing && i.status === 'done')
                .forEach((i) => bhandaraService.deleteUploadedImage(i.data.publicId).catch(() => { }));
        },
        []
    );

    const goTo = (i) => {
        setStep(i);
        setMaxReached((m) => Math.max(m, i));
        rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const next = async () => {
        const ok = await trigger(STEPS[step].fields);
        if (!ok) {
            toast.error('Please fix the highlighted fields');
            return focusFirstInvalid(rootRef.current);
        }
        return goTo(step + 1);
    };

    const onInvalid = (errors) => {
        const idx = STEPS.findIndex((s) => s.fields.some((f) => errors[f]));
        toast.error('Some required details are missing or invalid');
        if (idx >= 0) setStep(idx);
        focusFirstInvalid(rootRef.current);
    };

    const save = async (values, mode) => {
        setFormError('');
        if (images.some((i) => i.status === 'uploading')) {
            toast.error('Please wait for your photos to finish uploading');
            return goTo(PHOTOS_STEP);
        }
        if (images.some((i) => i.status === 'error')) {
            toast.error('Retry or remove the photos that failed to upload');
            return goTo(PHOTOS_STEP);
        }
        if (mode === 'publish') {
            if (!values.acceptTerms) {
                setError('acceptTerms', { type: 'manual', message: 'Please accept the community guidelines to publish' });
                toast.error('Please accept the community guidelines to publish');
                goTo(LAST_STEP);
                return focusFirstInvalid(rootRef.current);
            }
            if (!user.isEmailVerified) {
                setFormError('Please verify your email before publishing. You can save a draft in the meantime.');
                return goTo(LAST_STEP);
            }
        }

        const payload = toPayload(values, {
            images: ready.map((i) => i.data),
            coverPublicId: effectiveCover,
            mode,
            isEdit,
            hadLocation: !!event?.location?.coordinates?.length,
        });

        setBusy(mode);
        try {
            const saved = isEdit ? await bhandaraService.update(event._id, payload) : await bhandaraService.create(payload);
            savedRef.current = true;

            if (mode === 'publish') {
                toast.success(isEdit ? 'Event published' : 'Bhandara published');
                navigate(`/bhandaras/${saved.slug}/published`, { replace: true });
            } else if (mode === 'save') {
                toast.success('Changes saved');
                navigate(`/bhandaras/${saved.slug}`, { replace: true });
            } else {
                toast.success(mode === 'unpublish' ? 'Moved to drafts' : 'Draft saved');
                navigate('/dashboard?tab=events&sub=drafts', { replace: true });
            }
        } catch (err) {
            const mapped = mapServerErrors(err.fieldErrors);
            const names = Object.keys(mapped);
            if (names.length) {
                names.filter((n) => n !== '__images').forEach((n) => setError(n, { type: 'server', message: mapped[n] }));
                const idx = mapped.__images ? PHOTOS_STEP : STEPS.findIndex((s) => s.fields.some((f) => mapped[f]));
                if (idx >= 0) goTo(idx);
                setFormError(mapped.__images || 'Please fix the highlighted fields.');
                focusFirstInvalid(rootRef.current);
            } else {
                setFormError(errorMessage(err));
            }
            toast.error(errorMessage(err));
        } finally {
            setBusy(null);
        }
        return undefined;
    };

    const run = (mode) => handleSubmit((values) => save(values, mode), onInvalid)();

    /* ------------------------------ render ------------------------------ */
    if (catQuery.loading) {
        return <div className="container-page max-w-3xl space-y-4 py-8"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-96 w-full" /></div>;
    }

    const status = event?.status;
    const isPublished = status === 'published';
    const isDraft = !isEdit || status === 'draft';
    const previewValues = previewOpen ? form.getValues() : null;
    const coverPreview = ready.find((i) => i.data.publicId === effectiveCover)?.preview;
    const heading = isEdit ? 'Edit bhandara' : 'Post a Bhandara';

    const sectionTitles = ['Basic information', 'Date and time', 'Location', 'Food details', 'Photos', 'Contact and publication'];
    const sectionHints = [
        'Start with the essentials. A clear title and description help people decide to come.',
        'When does it start and end? You can also mark it as repeating.',
        'Where should people go? A map pin makes finding you easier.',
        'What will be served, and what facilities are there?',
        'Photos make your announcement trustworthy. The first one (or the one you star) is the cover.',
        'Who can people contact, and are you ready to publish?',
    ];

    return (
        <div className="container-page max-w-3xl py-8" ref={rootRef}>
            <Seo title={heading} noindex />
            <h1 className="text-3xl font-extrabold tracking-tight">{heading}</h1>
            <p className="mb-6 mt-1 text-stone-600 dark:text-stone-400">
                {isEdit ? 'Update your announcement. People who saved it are notified of date or location changes.' : 'Share the details so people in your community can join.'}
            </p>

            {isEdit && event.moderationNote && ['rejected', 'hidden'].includes(event.moderationStatus) && (
                <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-900 dark:bg-red-950/40 dark:text-red-100">
                    A moderator marked this event as {event.moderationStatus}: {event.moderationNote}. Edit and republish to send it for review again.
                </p>
            )}

            <Stepper steps={STEPS} current={step} onSelect={goTo} maxReached={maxReached} />

            <form noValidate onSubmit={(e) => e.preventDefault()} className="card p-5 sm:p-7">
                <FormError>{formError}</FormError>

                <section aria-labelledby="step-heading" className={formError ? 'mt-5' : ''}>
                    <h2 id="step-heading" className="text-xl font-bold">{sectionTitles[step]}</h2>
                    <p className="mb-6 mt-1 text-sm text-stone-600 dark:text-stone-400">{sectionHints[step]}</p>

                    {step === 0 && <BasicSection form={form} categories={categories} />}
                    {step === 1 && <WhenSection form={form} />}
                    {step === 2 && <WhereSection form={form} />}
                    {step === 3 && <FoodSection form={form} />}
                    {step === 4 && <ImageUploader items={images} setItems={setImages} coverId={coverId} setCoverId={setCoverId} />}
                    {step === 5 && <ContactSection form={form} isEdit={isEdit} status={status} />}
                </section>

                {/* Navigation + actions */}
                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" onClick={() => (step === 0 ? navigate(-1) : goTo(step - 1))} disabled={!!busy}>
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {step === 0 ? 'Cancel' : 'Back'}
                    </Button>

                    {step < LAST_STEP ? (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            {isDraft && (
                                <Button variant="secondary" onClick={() => run('draft')} loading={busy === 'draft'} disabled={!!busy && busy !== 'draft'}>
                                    <Save className="h-4 w-4" aria-hidden="true" /> Save draft
                                </Button>
                            )}
                            <Button onClick={next} disabled={!!busy}>
                                Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Button variant="secondary" onClick={() => setPreviewOpen(true)} disabled={!!busy}>
                                <Eye className="h-4 w-4" aria-hidden="true" /> Preview
                            </Button>
                            {isPublished && (
                                <Button variant="secondary" onClick={() => run('unpublish')} loading={busy === 'unpublish'} disabled={!!busy && busy !== 'unpublish'}>
                                    <Undo2 className="h-4 w-4" aria-hidden="true" /> Move to drafts
                                </Button>
                            )}
                            {isDraft && (
                                <Button variant="secondary" onClick={() => run('draft')} loading={busy === 'draft'} disabled={!!busy && busy !== 'draft'}>
                                    <Save className="h-4 w-4" aria-hidden="true" /> Save draft
                                </Button>
                            )}
                            {isDraft ? (
                                <Button onClick={() => run('publish')} loading={busy === 'publish'} disabled={!!busy && busy !== 'publish'}>
                                    <Send className="h-4 w-4" aria-hidden="true" /> Publish
                                </Button>
                            ) : (
                                <Button onClick={() => run('save')} loading={busy === 'save'} disabled={!!busy && busy !== 'save'}>
                                    <Save className="h-4 w-4" aria-hidden="true" /> Save changes
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                {isDraft && (
                    <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                        Drafts need the required fields filled in. Only you can see a draft.
                    </p>
                )}
            </form>

            <Modal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                title="Preview"
                size="lg"
                footer={<Button onClick={() => setPreviewOpen(false)}>Back to editing</Button>}
            >
                {previewValues && (
                    <EventPreview
                        values={previewValues}
                        cover={coverPreview}
                        categoryName={categories.find((c) => c.slug === previewValues.category)?.name}
                    />
                )}
            </Modal>
        </div>
    );
}