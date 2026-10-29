import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, ImagePlus, RotateCw, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { bhandaraService } from '../../services/bhandaraService.js';
import { errorMessage, isCancel } from '../../services/api.js';
import { ALLOWED_IMAGE_TYPES, MAX_SOURCE_BYTES, MAX_UPLOAD_BYTES, compressImage } from '../../utils/compressImage.js';
import { optimizeImage } from '../../utils/image.js';
import { cx } from '../../utils/cx.js';

export const MAX_IMAGES = 8;

/** Wraps an image already saved on an event (edit mode). */
export const existingItem = (img) => ({
    id: img.publicId,
    existing: true,
    status: 'done',
    progress: 100,
    preview: optimizeImage(img.url, { w: 480, h: 360 }),
    data: { url: img.url, publicId: img.publicId, width: img.width, height: img.height },
});

const newId = () => `n-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;

export default function ImageUploader({ items, setItems, coverId, setCoverId }) {
    const [dragging, setDragging] = useState(false);
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const removed = useRef(new Set());
    const controllers = useRef(new Map());
    const queue = useRef(Promise.resolve());

    // Abort in-flight uploads and free preview memory when leaving the page
    useEffect(
        () => () => {
            controllers.current.forEach((c) => c.abort());
            itemsRef.current.forEach((i) => i.preview?.startsWith('blob:') && URL.revokeObjectURL(i.preview));
        },
        []
    );

    const patch = (id, changes) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));

    const uploadItem = async (item) => {
        if (removed.current.has(item.id)) return;
        const controller = new AbortController();
        controllers.current.set(item.id, controller);
        patch(item.id, { status: 'uploading', progress: 0, error: null });
        try {
            const res = await bhandaraService.uploadImages([item.file], {
                signal: controller.signal,
                onProgress: (p) => patch(item.id, { progress: p }),
            });
            const up = res.uploaded?.[0];
            if (!up) throw new Error(res.failed?.[0]?.message || 'Upload failed');
            if (removed.current.has(item.id)) {
                bhandaraService.deleteUploadedImage(up.publicId).catch(() => { });
                return;
            }
            patch(item.id, { status: 'done', progress: 100, data: up });
        } catch (err) {
            if (isCancel(err) || removed.current.has(item.id)) return;
            patch(item.id, { status: 'error', error: errorMessage(err) });
        } finally {
            controllers.current.delete(item.id);
        }
    };

    const enqueue = (item) => {
        queue.current = queue.current.then(() => uploadItem(item));
    };

    const addFiles = async (fileList) => {
        const files = [...fileList];
        if (!files.length) return;
        let room = MAX_IMAGES - itemsRef.current.length;
        if (room <= 0) return toast.error(`You can add up to ${MAX_IMAGES} photos`);
        if (files.length > room) toast(`Only ${room} more photo${room === 1 ? '' : 's'} can be added`);

        for (const original of files) {
            if (room <= 0) break;
            if (!ALLOWED_IMAGE_TYPES.includes(original.type)) {
                toast.error(`${original.name}: only JPEG, PNG or WebP photos are allowed`);
                continue;
            }
            if (original.size > MAX_SOURCE_BYTES) {
                toast.error(`${original.name} is too large (max 20 MB)`);
                continue;
            }
            // eslint-disable-next-line no-await-in-loop
            const file = await compressImage(original);
            if (file.size > MAX_UPLOAD_BYTES) {
                toast.error(`${original.name} is still over 5 MB after compression. Please choose a smaller photo.`);
                continue;
            }
            const item = { id: newId(), existing: false, status: 'uploading', progress: 0, file, name: original.name, preview: URL.createObjectURL(file) };
            room -= 1;
            setItems((prev) => [...prev, item]);
            enqueue(item);
        }
        return undefined;
    };

    const remove = (item) => {
        removed.current.add(item.id);
        controllers.current.get(item.id)?.abort();
        if (item.preview?.startsWith('blob:')) URL.revokeObjectURL(item.preview);
        // Photos uploaded in this session but never saved are deleted from Cloudinary right away
        if (!item.existing && item.status === 'done') bhandaraService.deleteUploadedImage(item.data.publicId).catch(() => { });
        setItems((prev) => prev.filter((i) => i.id !== item.id));
    };

    const move = (index, dir) =>
        setItems((prev) => {
            const next = [...prev];
            const j = index + dir;
            if (j < 0 || j >= next.length) return prev;
            [next[index], next[j]] = [next[j], next[index]];
            return next;
        });

    const retry = (item) => enqueue(item);

    const effectiveCover = items.find((i) => i.status === 'done' && i.data.publicId === coverId)?.data.publicId
        || items.find((i) => i.status === 'done')?.data.publicId;

    const btn = 'inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-stone-800 shadow hover:bg-white disabled:opacity-40 dark:bg-stone-900/95 dark:text-stone-100';

    return (
        <div>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                className={cx(
                    'relative rounded-2xl border-2 border-dashed p-6 text-center transition-colors',
                    dragging ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20' : 'border-stone-300 dark:border-stone-700'
                )}
            >
                <input
                    id="photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="peer sr-only"
                    onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                    disabled={items.length >= MAX_IMAGES}
                />
                <label
                    htmlFor="photo-input"
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-600 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-60 dark:bg-brand-400 dark:text-stone-950"
                >
                    <ImagePlus className="h-5 w-5" aria-hidden="true" /> Choose photos
                </label>
                <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
                    or drag and drop. JPEG, PNG or WebP, up to {MAX_IMAGES} photos. Large photos are resized automatically.
                </p>
            </div>

            {items.length > 0 && (
                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((item, i) => {
                        const isCover = item.status === 'done' && item.data.publicId === effectiveCover;
                        return (
                            <li key={item.id} className="card overflow-hidden">
                                <div className="relative aspect-[4/3] bg-stone-100 dark:bg-stone-800">
                                    <img src={item.preview} alt={`Photo ${i + 1}${isCover ? ' (cover)' : ''}`} className={cx('h-full w-full object-cover', item.status !== 'done' && 'opacity-60')} />
                                    {isCover && (
                                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-700 px-2.5 py-1 text-xs font-bold text-white">
                                            <Star className="h-3 w-3" aria-hidden="true" /> Cover
                                        </span>
                                    )}

                                    {item.status === 'uploading' && (
                                        <div className="absolute inset-x-0 bottom-0 p-2" role="status">
                                            <div className="h-2 overflow-hidden rounded-full bg-black/40" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading photo ${i + 1}`}>
                                                <div className="h-full bg-white transition-all" style={{ width: `${item.progress}%` }} />
                                            </div>
                                            <span className="sr-only">Uploading {item.progress}%</span>
                                        </div>
                                    )}
                                    {item.status === 'error' && (
                                        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-2 text-center text-xs font-semibold text-white">
                                            <AlertCircle className="h-5 w-5" aria-hidden="true" />
                                            <span className="line-clamp-2">{item.error}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-1 p-2">
                                    <div className="flex gap-1">
                                        <button type="button" className={btn} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`}>
                                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                        <button type="button" className={btn} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move photo ${i + 1} later`}>
                                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div className="flex gap-1">
                                        {item.status === 'error' && (
                                            <button type="button" className={btn} onClick={() => retry(item)} aria-label={`Retry uploading photo ${i + 1}`}>
                                                <RotateCw className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        )}
                                        {item.status === 'done' && !isCover && (
                                            <button type="button" className={btn} onClick={() => setCoverId(item.data.publicId)} aria-label={`Make photo ${i + 1} the cover`}>
                                                <Star className="h-4 w-4" aria-hidden="true" />
                                            </button>
                                        )}
                                        <button type="button" className={btn} onClick={() => remove(item)} aria-label={`Remove photo ${i + 1}`}>
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            <p className="mt-3 text-sm text-stone-600 dark:text-stone-400" aria-live="polite">
                {items.length} of {MAX_IMAGES} photos. The cover photo is shown on cards and share previews.
            </p>
        </div>
    );
}