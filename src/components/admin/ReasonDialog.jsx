import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Textarea } from '../ui/form.jsx';
import { errorMessage } from '../../services/api.js';

/** Dialog that asks for a note, then calls `onSubmit(note)`. Stays open and shows the error on failure. */
export default function ReasonDialog({
    open, onClose, onSubmit, title, description, label = 'Note', required = false, confirmLabel = 'Confirm', danger = false, children,
}) {
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (open) { setNote(''); setError(''); }
    }, [open]);

    const submit = async (e) => {
        e.preventDefault();
        if (required && !note.trim()) return setError('Please add a short note');
        setBusy(true);
        try {
            await onSubmit(note.trim());
            onClose();
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusy(false);
        }
        return undefined;
    };

    return (
        <Modal
            open={open}
            onClose={busy ? undefined : onClose}
            dismissible={!busy}
            title={title}
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
                    <Button type="submit" form="reason-form" variant={danger ? 'danger' : 'primary'} loading={busy}>{confirmLabel}</Button>
                </>
            }
        >
            <form id="reason-form" onSubmit={submit} noValidate className="space-y-4">
                {description && <p className="text-sm text-stone-700 dark:text-stone-300">{description}</p>}
                <Textarea label={label} rows={3} maxLength={500} required={required} value={note} onChange={(e) => { setNote(e.target.value); setError(''); }} data-autofocus />
                {children}
                {error && <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}
            </form>
        </Modal>
    );
}