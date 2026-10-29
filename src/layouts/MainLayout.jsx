import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';
import VerifyEmailBanner from '../components/VerifyEmailBanner.jsx';

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <a href="#main" className="skip-link">Skip to main content</a>
            <OfflineBanner />
            <VerifyEmailBanner />
            <Navbar />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}