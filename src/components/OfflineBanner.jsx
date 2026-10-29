import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

export default function OfflineBanner() {
    const online = useOnlineStatus();
    if (online) return null;
    return (
        <div role="status" className="flex items-center justify-center gap-2 bg-stone-900 px-4 py-2 text-center text-sm font-medium text-white">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
            You're offline. Event details may be out of date until you reconnect.
        </div>
    );
}