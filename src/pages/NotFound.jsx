import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
    return (
        <div className="container-page py-20 text-center">
            <Seo title="Page not found" noindex />
            <p className="text-6xl font-extrabold text-brand-700 dark:text-brand-400">404</p>
            <h1 className="mt-3 text-2xl font-bold">We couldn't find that page</h1>
            <p className="mt-2 text-stone-600 dark:text-stone-400">The link may be broken, or the page may have moved.</p>
            <div className="mt-6 flex justify-center gap-3">
                <Button as={Link} to="/">Go home</Button>
                <Button as={Link} to="/bhandaras" variant="secondary">Find a Bhandara</Button>
            </div>
        </div>
    );
}