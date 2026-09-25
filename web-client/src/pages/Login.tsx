import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiggyBank, TrendingUp, Wallet, Target, Settings2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl, setApiBaseUrl } from '../lib/api';
import { Spinner } from '../components/ui';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'ZAR', 'KES', 'NGN', 'ZWL', 'INR', 'JPY', 'CAD', 'AUD'];

export default function Login() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [busy, setBusy] = useState(false);
    const [showApi, setShowApi] = useState(false);

    const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'USD' });
    const [apiUrl, setApiUrl] = useState(
        (getApiBaseUrl() || '').replace(/\/api$/, '')
    );

    const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
                toast.success('Welcome back!');
            } else {
                await register(form.name, form.email, form.password, form.currency);
                toast.success('Account created — welcome!');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed');
        } finally {
            setBusy(false);
        }
    }

    function saveApi() {
        setApiBaseUrl(apiUrl.trim());
        toast.success('API URL saved');
        setShowApi(false);
    }

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Brand panel */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/15 p-2.5">
                        <PiggyBank className="h-7 w-7" />
                    </div>
                    <span className="text-xl font-bold">Personal Expense Tracker</span>
                </div>
                <div className="space-y-8">
                    <h1 className="max-w-md text-4xl font-extrabold leading-tight">
                        Know exactly where your money goes.
                    </h1>
                    <div className="space-y-5">
                        {[
                            { icon: Wallet, t: 'Multi-account tracking', d: 'Cash, bank, mobile money — all in one place.' },
                            { icon: TrendingUp, t: 'Real-time net worth', d: 'Balances update the moment you log a transaction.' },
                            { icon: Target, t: 'Budgets & insights', d: 'Set limits and see spending trends at a glance.' },
                        ].map(({ icon: Icon, t, d }) => (
                            <div key={t} className="flex items-start gap-3">
                                <div className="rounded-lg bg-white/15 p-2">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">{t}</p>
                                    <p className="text-sm text-white/70">{d}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-sm text-white/60">Your data stays in your own backend.</p>
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
            </div>

            {/* Form panel */}
            <div className="flex items-center justify-center p-6 sm:p-10">
                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                        <div className="rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 p-2 text-white">
                            <PiggyBank className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-bold">Expense Tracker</span>
                    </div>

                    <h2 className="text-2xl font-bold">{mode === 'login' ? 'Sign in' : 'Create your account'}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {mode === 'login' ? 'Welcome back. Enter your details.' : 'Start tracking in under a minute.'}
                    </p>

                    <form onSubmit={submit} className="mt-6 space-y-4">
                        {mode === 'register' && (
                            <div>
                                <label className="label">Name</label>
                                <input
                                    className="input"
                                    value={form.name}
                                    onChange={(e) => update('name', e.target.value)}
                                    placeholder="Jane Doe"
                                    required
                                />
                            </div>
                        )}
                        <div>
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                value={form.email}
                                onChange={(e) => update('email', e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input
                                className="input"
                                type="password"
                                value={form.password}
                                onChange={(e) => update('password', e.target.value)}
                                placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                                minLength={8}
                                required
                            />
                        </div>
                        {mode === 'register' && (
                            <div>
                                <label className="label">Currency</label>
                                <select
                                    className="input"
                                    value={form.currency}
                                    onChange={(e) => update('currency', e.target.value)}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full !py-3" disabled={busy}>
                            {busy && <Spinner />}
                            {mode === 'login' ? 'Sign in' : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="font-semibold text-brand-600 hover:underline"
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>

                    {/* API URL config for static deployments */}
                    <div className="mt-8 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
                        <button
                            onClick={() => setShowApi((s) => !s)}
                            className="flex w-full items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            <Settings2 className="h-4 w-4" />
                            Connection settings
                        </button>
                        {showApi && (
                            <div className="mt-3 space-y-2">
                                <label className="label">API base URL</label>
                                <input
                                    className="input"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    placeholder="https://your-api.onrender.com"
                                />
                                <p className="text-xs text-slate-400">
                                    Point this at your deployed Personal Expense Tracker API.
                                </p>
                                <button onClick={saveApi} className="btn-secondary w-full">
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
