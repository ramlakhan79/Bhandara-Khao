import { useState } from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/** `onConfirm` may be async. If it throws, the dialog stays open (the caller shows the error toast). */
export default function ConfirmDialog({
    open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', tone = 'danger', children,
}) {
    const [busy, setBusy] = useState(false);

    const handleConfirm = async () => {
        setBusy(true);
        try {
            await onConfirm();
            onClose();
        } catch { /* keep open */ } finally {
            setBusy(false);
        }
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
                    <Button variant="secondary" onClick={onClose} disabled={busy} data-autofocus>
                        Cancel
                    </Button>
                    <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} loading={busy}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            {description && <p className="text-stone-700 dark:text-stone-300">{description}</p>}
            {children}
        </Modal>
    );
}