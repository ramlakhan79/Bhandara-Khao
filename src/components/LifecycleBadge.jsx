import Badge from './ui/Badge.jsx';
import { LIFECYCLE } from '../utils/constants.js';

export default function LifecycleBadge({ lifecycle, className }) {
    const meta = LIFECYCLE[lifecycle];
    if (!meta) return null;
    return (
        <Badge tone={meta.tone} className={className}>
            {lifecycle === 'ongoing' && (
                <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-leaf-500 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf-600" />
                </span>
            )}
            {meta.label}
        </Badge>
    );
}