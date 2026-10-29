import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/form.jsx';
import Button from '../ui/Button.jsx';

export default function TagInput({ label, value = [], onChange, max = 40, placeholder, hint, error }) {
    const [text, setText] = useState('');

    const add = (raw) => {
        const items = raw.split(',').map((s) => s.trim()).filter(Boolean);
        if (!items.length) return;
        const next = [...value];
        items.forEach((it) => {
            if (next.length < max && it.length <= 80 && !next.some((v) => v.toLowerCase() === it.toLowerCase())) next.push(it);
        });
        onChange(next);
        setText('');
    };

    return (
        <div>
            <div className="flex items-end gap-2">
                <Input
                    label={label}
                    wrapperClassName="flex-1"
                    value={text}
                    placeholder={placeholder}
                    hint={hint}
                    error={error}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            add(text);
                        }
                    }}
                />
                <Button variant="secondary" onClick={() => add(text)} disabled={!text.trim() || value.length >= max} className="mb-0">
                    Add
                </Button>
            </div>
            {value.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${label}, added`}>
                    {value.map((v) => (
                        <li key={v}>
                            <span className="inline-flex min-h-[36px] items-center gap-1 rounded-full bg-brand-100 py-1 pl-3 pr-1 text-sm font-semibold text-brand-900 dark:bg-brand-900/40 dark:text-brand-200">
                                {v}
                                <button
                                    type="button"
                                    onClick={() => onChange(value.filter((x) => x !== v))}
                                    aria-label={`Remove ${v}`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-brand-200 dark:hover:bg-brand-800"
                                >
                                    <X className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}