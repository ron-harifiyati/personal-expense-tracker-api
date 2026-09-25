import { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Server, Palette } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getApiBaseUrl, setApiBaseUrl } from '../lib/api';
import { Spinner } from '../components/ui';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'ZAR', 'KES', 'NGN', 'ZWL', 'INR', 'JPY', 'CAD', 'AUD'];

export default function Settings() {
    const { user, updateProfile } = useAuth();
    const { theme, toggle } = useTheme();

    const [name, setName] = useState(user?.name || '');
    const [currency, setCurrency] = useState(user?.currency || 'USD');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);

    const [apiUrl, setApiUrl] = useState((getApiBaseUrl() || '').replace(/\/api$/, ''));

    async function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        try {
            const payload: { name: string; currency: string; password?: string } = { name, currency };
            if (password) payload.password = password;
            await updateProfile(payload);
            setPassword('');
            toast.success('Profile updated');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update');
        } finally {
            setBusy(false);
        }
    }

    function saveApi() {
        setApiBaseUrl(apiUrl.trim());
        toast.success('API URL saved — reload to apply everywhere.');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-sm text-slate-500">Manage your profile and preferences.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Profile */}
                <form onSubmit={saveProfile} className="card space-y-4 p-5">
                    <h3 className="font-semibold">Profile</h3>
                    <div>
                        <label className="label">Name</label>
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="label">Email</label>
                        <input className="input" value={user?.email || ''} disabled />
                    </div>
                    <div>
                        <label className="label">Currency</label>
                        <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            {CURRENCIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">New password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Leave blank to keep current"
                            minLength={8}
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={busy}>
                        {busy ? <Spinner /> : <Save className="h-4 w-4" />} Save changes
                    </button>
                </form>

                <div className="space-y-6">
                    {/* Appearance */}
                    <div className="card p-5">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold">
                            <Palette className="h-4 w-4" /> Appearance
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Dark mode</p>
                                <p className="text-xs text-slate-400">Switch between light and dark themes.</p>
                            </div>
                            <button
                                onClick={toggle}
                                className={`relative h-6 w-11 rounded-full transition ${
                                    theme === 'dark' ? 'bg-brand-600' : 'bg-slate-300'
                                }`}
                                aria-label="Toggle dark mode"
                            >
                                <span
                                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                                        theme === 'dark' ? 'left-[22px]' : 'left-0.5'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Connection */}
                    <div className="card p-5">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold">
                            <Server className="h-4 w-4" /> API connection
                        </h3>
                        <label className="label">API base URL</label>
                        <input className="input" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
                        <p className="mt-1 text-xs text-slate-400">
                            The backend this app talks to. Change it to point at your own deployment.
                        </p>
                        <button onClick={saveApi} className="btn-secondary mt-3">
                            Save API URL
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
