import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { useClickOutside } from '../hooks/useClickOutside.js';
import Avatar from './ui/Avatar.jsx';

export default function UserMenu() {
    const { user, isAdmin, logout } = useAuth();    
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const ref = useRef(null);
    const [open, setOpen] = useState(false);

    useClickOutside(ref, () => setOpen(false), open);
    useEffect(() => setOpen(false), [pathname]);

    const item = 'flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800';

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="Account menu"
                className="inline-flex h-11 items-center gap-1.5 rounded-lg px-1.5 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
                <Avatar user={user} size={32} />
                <ChevronDown className="h-4 w-4 text-stone-500" aria-hidden="true" />
            </button>

            {open && (
                <div className="card absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden py-1">
                    <div className="border-b border-stone-200 px-4 py-3 dark:border-stone-800">
                        <p className="truncate font-semibold">{user.name}</p>
                        <p className="truncate text-sm text-stone-600 dark:text-stone-400">{user.email}</p>
                    </div>
                    <Link to="/dashboard" className={item}>
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
                    </Link>
                    {isAdmin && (
                        <Link to="/admin" className={item}>
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin panel
                        </Link>
                    )}
                    <button
                        type="button"
                        className={item}
                        onClick={async () => {
                            await logout();
                            toast.success('Logged out');
                            navigate('/');
                        }}
                    >
                        <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
                    </button>
                </div>
            )}
        </div>
    );
}