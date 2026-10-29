import { AlertTriangle } from 'lucide-react';
import Button from './Button.jsx';
import { errorMessage } from '../../services/api.js';

export default function ErrorState({ error, message, onRetry }) {
    return (
        <div role="alert" className="flex flex-col items-center px-4 py-12 text-center">
            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </span>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="mt-1 max-w-md text-stone-600 dark:text-stone-400">{message || errorMessage(error)}</p>
            {onRetry && (
                <Button variant="secondary" className="mt-5" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}