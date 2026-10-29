import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Button from '../components/ui/Button.jsx';

export default function Pending({ title = 'This page' }) {
    return (
        <div className="container-page py-16">
            <Seo title={title} noindex />
            <EmptyState
                icon={Hammer}
                title={`${title} is coming in the next part`}
                description="Everything else on the site is already live."
                action={<Button as={Link} to="/bhandaras">Browse bhandaras</Button>}
            />
        </div>
    );
}