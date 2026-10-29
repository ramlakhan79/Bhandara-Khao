import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { Select, Textarea } from '../ui/form.jsx';
import { reportService } from '../../services/reportService.js';
import { errorMessage } from '../../services/api.js';
import { REPORT_REASONS } from '../../utils/constants.js';

export default function ReportModal({ open, onClose, eventId }) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const close = () => {
        if (busy) return;
        setReason(''); setDetails(''); setError('');
        onClose();
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!reason) return setError('Please choose a reason');
        setBusy(true);
        try {
            await reportService.create({ eventId, reason, details: details.trim() || undefined });
            toast.success('Thank you. Our moderators will review this report.');
            setReason(''); setDetails(''); setError('');
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
            onClose={close}
            title="Report this event"
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={close} disabled={busy}>Cancel</Button>
                    <Button type="submit" form="report-form" loading={busy}>Submit report</Button>
                </>
            }
        >
            <form id="report-form" onSubmit={submit} className="space-y-4" noValidate>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                    Reports are reviewed by moderators. Events are not removed automatically.
                </p>
                <Select label="What's wrong?" required value={reason} onChange={(e) => { setReason(e.target.value); setError(''); }} data-autofocus>
                    <option value="">Choose a reason</option>
                    {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </Select>
                <Textarea label="More details (optional)" rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} />
                {error && <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>}
            </form>
        </Modal>
    );
}