import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Utensils } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { optimizeImage, imageSrcSet } from '../../utils/image.js';
import { cx } from '../../utils/cx.js';

export default function Gallery({ images, title }) {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const count = images.length;

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % count);
            if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + count) % count);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, count]);

    if (!count) {
        return (
            <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-brand-50 text-brand-700/60 dark:bg-stone-800 dark:text-brand-400/50" role="img" aria-label="No photos provided">
                <Utensils className="h-16 w-16" aria-hidden="true" />
            </div>
        );
    }

    const current = images[index];

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={`Open photo ${index + 1} of ${count} full screen`}
                className="group relative block aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100 dark:bg-stone-800"
            >
                <img
                    src={optimizeImage(current.url, { w: 1280, h: 720 })}
                    srcSet={imageSrcSet(current.url, [480, 800, 1280], 0.5625)}
                    sizes="(min-width:1024px) 800px, 100vw"
                    alt={`${title}, photo ${index + 1} of ${count}`}
                    width="1280"
                    height="720"
                    className="h-full w-full object-cover"
                />
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/65 px-3 py-1.5 text-sm font-semibold text-white">
                    <Maximize2 className="h-4 w-4" aria-hidden="true" /> {count > 1 ? `${index + 1}/${count}` : 'View'}
                </span>
            </button>

            {count > 1 && (
                <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Photo thumbnails">
                    {images.map((img, i) => (
                        <li key={img.publicId} className="shrink-0">
                            <button
                                type="button"
                                onClick={() => setIndex(i)}
                                aria-label={`Show photo ${i + 1}`}
                                aria-current={i === index}
                                className={cx(
                                    'block h-16 w-24 overflow-hidden rounded-lg border-2',
                                    i === index ? 'border-brand-700 dark:border-brand-400' : 'border-transparent opacity-80 hover:opacity-100'
                                )}
                            >
                                <img src={optimizeImage(img.url, { w: 192, h: 128 })} alt="" loading="lazy" width="96" height="64" className="h-full w-full object-cover" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Modal open={open} onClose={() => setOpen(false)} title={`Photo ${index + 1} of ${count}`} size="xl">
                <img
                    src={optimizeImage(current.url, { w: 1600 })}
                    alt={`${title}, photo ${index + 1} of ${count}`}
                    className="mx-auto max-h-[68vh] w-auto rounded-lg object-contain"
                />
                {count > 1 && (
                    <div className="mt-4 flex justify-center gap-3">
                        <Button variant="secondary" onClick={() => setIndex((i) => (i - 1 + count) % count)}>
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Previous
                        </Button>
                        <Button variant="secondary" onClick={() => setIndex((i) => (i + 1) % count)}>
                            Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}