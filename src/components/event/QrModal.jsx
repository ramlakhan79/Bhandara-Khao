import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

export default function QrModal({ open, onClose, url, title }) {
    const holder = useRef(null);

    const download = () => {
        const canvas = holder.current?.querySelector('canvas');
        if (!canvas) return;
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `${(title || 'bhandara').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-qr.png`;
        a.click();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="QR code"
            size="sm"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                    <Button onClick={download}><Download className="h-4 w-4" aria-hidden="true" /> Download</Button>
                </>
            }
        >
            <div ref={holder} className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-xl bg-white p-3">
                    <QRCodeCanvas value={url} size={240} level="M" marginSize={1} />
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Scan to open this bhandara. Print it for notice boards or temple gates.</p>
            </div>
        </Modal>
    );
}