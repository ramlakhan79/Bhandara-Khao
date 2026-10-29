import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export function FullPageSpinner() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Spinner className="h-8 w-8 text-brand-700 dark:text-brand-400" />
        </div>
    );
}

/** Logged-in users only. Redirects to /login and returns here afterwards. */
export function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <FullPageSpinner />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    return <Outlet />;
}

/** Admins only. The real check is on the server; this just avoids showing a dead-end UI. */
export function AdminRoute() {
    const { user, isAdmin, loading } = useAuth();
    const location = useLocation();
    if (loading) return <FullPageSpinner />;
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return <Outlet />;
}

/** Login/register pages: logged-in users are sent to where they were headed (or the dashboard). */
export function GuestRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <FullPageSpinner />;
    if (user) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
    return <Outlet />;
}