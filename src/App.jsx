import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import { AdminRoute, FullPageSpinner, GuestRoute, ProtectedRoute } from './routes/guards.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Explore = lazy(() => import('./pages/Explore.jsx'));
const EventDetails = lazy(() => import('./pages/EventDetails.jsx'));
const CreateEvent = lazy(() => import('./pages/CreateEvent.jsx'));
const EditEvent = lazy(() => import('./pages/EditEvent.jsx'));
const EventPublished = lazy(() => import('./pages/EventPublished.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'));
const StaticPage = lazy(() => import('./pages/StaticPage.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview.jsx'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents.jsx'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminOrganizers = lazy(() => import('./pages/admin/AdminOrganizers.jsx'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories.jsx'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit.jsx'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent.jsx'));

export default function App() {
    return (
        <ErrorBoundary>
            <ScrollToTop />
            <Suspense fallback={<FullPageSpinner />}>
                <Routes>
                    <Route element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="bhandaras" element={<Explore />} />
                        <Route path="bhandaras/:slug" element={<EventDetails />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="bhandaras/create" element={<CreateEvent />} />
                            <Route path="bhandaras/:slug/edit" element={<EditEvent />} />
                            <Route path="bhandaras/:slug/published" element={<EventPublished />} />
                            <Route path="dashboard" element={<Dashboard />} />
                        </Route>

                        <Route element={<AdminRoute />}>
                            <Route path="admin" element={<AdminLayout />}>
                                <Route index element={<AdminOverview />} />
                                <Route path="events" element={<AdminEvents />} />
                                <Route path="reports" element={<AdminReports />} />
                                <Route path="users" element={<AdminUsers />} />
                                <Route path="organizers" element={<AdminOrganizers />} />
                                <Route path="categories" element={<AdminCategories />} />
                                <Route path="audit" element={<AdminAudit />} />
                                <Route path="content" element={<AdminContent />} />
                            </Route>
                        </Route>

                        <Route element={<GuestRoute />}>
                            <Route path="login" element={<Login />} />
                            <Route path="register" element={<Register />} />
                            <Route path="forgot-password" element={<ForgotPassword />} />
                        </Route>
                        <Route path="reset-password/:token" element={<ResetPassword />} />
                        <Route path="verify-email" element={<VerifyEmail />} />

                        {['about', 'contact', 'guidelines', 'privacy', 'terms'].map((k) => (
                            <Route key={k} path={k} element={<StaticPage pageKey={k} />} />
                        ))}

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}