import { Component } from 'react';

export default class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('UI error:', error, info);
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="max-w-md text-stone-600 dark:text-stone-400">
                    The page hit an unexpected problem. Reloading usually fixes it.
                </p>
                <button
                    type="button"
                    onClick={() => window.location.assign('/')}
                    className="min-h-[44px] rounded-lg bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800 dark:bg-brand-400 dark:text-stone-950"
                >
                    Back to home
                </button>
            </div>
        );
    }
}