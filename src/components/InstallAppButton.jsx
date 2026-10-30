import { useState, useSyncExternalStore } from 'react';
import { Download, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Button from './ui/Button.jsx';
import Modal from './ui/Modal.jsx';
import { detectPlatform, getSnapshot, isStandalone, promptInstall, subscribe } from '../utils/pwaInstall.js';

export default function InstallAppButton({ className }) {
    const { t } = useTranslation();
    const { event, installed } = useSyncExternalStore(subscribe, getSnapshot);
    const [open, setOpen] = useState(false);

    // Already running as an installed app: nothing to show
    if (installed || isStandalone()) return null;

    const onClick = async () => {
        if (event) {
            const outcome = await promptInstall();
            if (outcome === 'accepted') toast.success(t('install.success', { defaultValue: 'App installed!' }));
            return;
        }
        setOpen(true); // no native prompt available (iPhone, in-app browser, Firefox...), so show the guide
    };

    const { iOS, inApp } = detectPlatform();
    const steps = iOS
        ? [
            t('install.ios1', { defaultValue: 'Tap the Share button in Safari’s toolbar.' }),
            t('install.ios2', { defaultValue: 'Scroll down and tap “Add to Home Screen”.' }),
            t('install.ios3', { defaultValue: 'Tap “Add” in the top corner.' }),
        ]
        : [
            t('install.and1', { defaultValue: 'Tap the menu (⋮) at the top right of your browser.' }),
            t('install.and2', { defaultValue: 'Tap “Install app” or “Add to Home screen”.' }),
            t('install.and3', { defaultValue: 'Confirm by tapping Install.' }),
        ];

    return (
        <>
            <Button variant="secondary" onClick={onClick} className={className}>
                <Download className="h-4 w-4" aria-hidden="true" />
                {t('install.button', { defaultValue: 'Install app' })}
            </Button>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={t('install.modalTitle', { defaultValue: 'Install Bhandara Khao' })}
                size="sm"
                footer={<Button onClick={() => setOpen(false)}>{t('install.close', { defaultValue: 'Got it' })}</Button>}
            >
                {inApp ? (
                    <p>
                        {t('install.inApp', {
                            defaultValue: 'This page is open inside another app. Open the menu and choose “Open in browser” (Chrome or Safari), then tap Install app again.',
                        })}
                    </p>
                ) : (
                    <>
                        <ol className="list-decimal space-y-3 pl-5">
                            {steps.map((s) => <li key={s}>{s}</li>)}
                        </ol>
                        {iOS && (
                            <p className="mt-4 inline-flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                                <Share className="h-4 w-4" aria-hidden="true" />
                                {t('install.iosHint', { defaultValue: 'The Share button looks like a square with an arrow pointing up.' })}
                            </p>
                        )}
                        {!iOS && (
                            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
                                {t('install.already', { defaultValue: 'Already installed? Open Bhandara Khao from your home screen.' })}
                            </p>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
}