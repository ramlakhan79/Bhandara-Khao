import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { Select, Textarea } from '../../components/ui/form.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { errorMessage } from '../../services/api.js';

const KEYS = [
    ['guidelines', 'Community guidelines', '/guidelines'],
    ['about', 'About', '/about'],
    ['contact', 'Contact', '/contact'],
    ['privacy', 'Privacy Policy', '/privacy'],
    ['terms', 'Terms of Use', '/terms'],
];

export default function AdminContent() {
    const { data: settings, loading, error, reload, setData } = useApi((s) => adminService.settings(s), []);
    const [key, setKey] = useState('guidelines');
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (settings) setText(settings[key] || '');
    }, [settings, key]);

    const save = async () => {
        setBusy(true);
        try {
            await adminService.saveSetting(key, text);
            setData((s) => ({ ...s, [key]: text }));
            toast.success('Saved. The page is updated.');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setBusy(false);
        }
    };

    if (error) return <ErrorState error={error} onRetry={reload} />;
    if (loading) return <Skeleton className="h-96 w-full" />;

    const label = KEYS.find(([k]) => k === key);
    const dirty = text !== (settings[key] || '');

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Site content</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
                Edit the text of the public pages. Formatting: <code># Heading</code>, <code>## Subheading</code>, lines starting with <code>- </code> become bullets, and a blank line starts a new paragraph. Leave a page empty to show the built-in default.
            </p>
            <Select label="Page" wrapperClassName="max-w-xs" value={key} onChange={(e) => setKey(e.target.value)}>
                {KEYS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </Select>
            <Textarea label={label[1]} rows={18} maxLength={20000} value={text} onChange={(e) => setText(e.target.value)} hint={`${text.length.toLocaleString()} / 20,000 characters. Public page: ${label[2]}`} className="font-mono text-sm" />
            <div className="flex gap-3">
                <Button onClick={save} loading={busy} disabled={!dirty}>Save</Button>
                <Button variant="secondary" onClick={() => setText(settings[key] || '')} disabled={!dirty || busy}>Discard changes</Button>
            </div>
        </div>
    );
}