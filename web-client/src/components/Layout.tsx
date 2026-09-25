import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    Tags,
    Target,
    Settings,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    PiggyBank,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/accounts', label: 'Accounts', icon: Wallet },
    { to: '/categories', label: 'Categories', icon: Tags },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const initials = (user?.name || '?')
        .split(' ')
        .map((s) => s[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const NavItems = () => (
        <nav className="flex flex-1 flex-col gap-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                            isActive
                                ? 'bg-brand-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`
                    }
                >
                    <Icon className="h-5 w-5" />
                    {label}
                </NavLink>
            ))}
        </nav>
    );

    const SidebarInner = () => (
        <div className="flex h-full flex-col gap-6 p-4">
            <div className="flex items-center gap-2.5 px-2">
                <div className="rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 p-2 text-white">
                    <PiggyBank className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight">Expenses</span>
            </div>
            <NavItems />
            <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-3 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{user?.name}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="btn-ghost !px-2 !py-2"
                        title="Log out"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen">
            {/* Desktop sidebar */}
            <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
                <SidebarInner />
            </aside>

            {/* Mobile drawer */}
            {open && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <aside className="animate-fade-in absolute left-0 top-0 h-full w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <SidebarInner />
                    </aside>
                </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:px-8 dark:border-slate-800 dark:bg-slate-950/80">
                    <button onClick={() => setOpen(true)} className="btn-ghost !px-2 !py-2 lg:hidden" aria-label="Open menu">
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="lg:hidden" />
                    <button onClick={toggle} className="btn-secondary !px-2.5 !py-2.5" title="Toggle theme" aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </button>
                </header>

                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
                    <Outlet />
                </main>
            </div>

            {/* Close button spacer for mobile a11y */}
            {open && (
                <button className="sr-only" onClick={() => setOpen(false)}>
                    <X /> Close menu
                </button>
            )}
        </div>
    );
}
