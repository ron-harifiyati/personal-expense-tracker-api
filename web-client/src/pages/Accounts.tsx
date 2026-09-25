import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { money } from '../lib/format';
import { IconGlyph } from '../lib/icons';
import { PageLoader, EmptyState, Modal, Spinner } from '../components/ui';
import { ColorPicker, IconPicker } from '../components/Pickers';
import type { Account } from '../types';

const blank = { title: '', amount: '0', icon: 'wallet', color: '#6366f1' };

export default function Accounts() {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';

    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<Account | null>(null);
    const [form, setForm] = useState(blank);
    const [busy, setBusy] = useState(false);

    async function load() {
        try {
            const { data } = await api.get('/accounts');
            setAccounts(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);

    function openCreate() {
        setEditing(null);
        setForm(blank);
        setModal(true);
    }
    function openEdit(a: Account) {
        setEditing(a);
        setForm({ title: a.title, amount: String(a.amount), icon: a.icon, color: a.color });
        setModal(true);
    }

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        try {
            const payload = { ...form, amount: parseFloat(form.amount) || 0 };
            if (editing) {
                await api.patch(`/accounts/${editing.id}`, payload);
                toast.success('Account updated');
            } else {
                await api.post('/accounts', payload);
                toast.success('Account created');
            }
            setModal(false);
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setBusy(false);
        }
    }

    async function remove(a: Account) {
        if (!confirm(`Delete "${a.title}"? All its transactions will be removed and balances reconciled.`)) return;
        try {
            await api.delete(`/accounts/${a.id}`);
            toast.success('Account deleted');
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    }

    if (loading) return <PageLoader />;

    const total = accounts.reduce((s, a) => s + parseFloat(a.amount), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
                    <p className="text-sm text-slate-500">Total balance {money(total, currency)}</p>
                </div>
                <button onClick={openCreate} className="btn-primary">
                    <Plus className="h-4 w-4" /> New account
                </button>
            </div>

            {accounts.length === 0 ? (
                <EmptyState
                    title="No accounts yet"
                    subtitle="Add your first account to start tracking."
                    action={
                        <button onClick={openCreate} className="btn-primary">
                            <Plus className="h-4 w-4" /> New account
                        </button>
                    }
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {accounts.map((a) => (
                        <div key={a.id} className="card group relative overflow-hidden p-5">
                            <div
                                className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full opacity-10"
                                style={{ background: a.color }}
                            />
                            <div className="flex items-start justify-between">
                                <div
                                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                                    style={{ background: a.color }}
                                >
                                    <IconGlyph name={a.icon} className="h-6 w-6" />
                                </div>
                                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                                    <button onClick={() => openEdit(a)} className="btn-ghost !px-2 !py-2" title="Edit">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => remove(a)} className="btn-ghost !px-2 !py-2 text-rose-500" title="Delete">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="mt-4 text-sm font-medium text-slate-500">{a.title}</p>
                            <p className="text-2xl font-bold tracking-tight">{money(a.amount, currency)}</p>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={modal}
                onClose={() => setModal(false)}
                title={editing ? 'Edit account' : 'New account'}
                footer={
                    <>
                        <button onClick={() => setModal(false)} className="btn-secondary">
                            Cancel
                        </button>
                        <button onClick={save} className="btn-primary" disabled={busy}>
                            {busy && <Spinner />} {editing ? 'Save' : 'Create'}
                        </button>
                    </>
                }
            >
                <form onSubmit={save} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: form.color }}>
                            <IconGlyph name={form.icon} className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <label className="label">Title</label>
                            <input
                                className="input"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Savings"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Current balance</label>
                        <input
                            className="input"
                            type="number"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        />
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <Wallet className="h-3 w-3" /> Set the starting/opening balance for this account.
                        </p>
                    </div>
                    <div>
                        <label className="label">Colour</label>
                        <ColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
                    </div>
                    <div>
                        <label className="label">Icon</label>
                        <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
                    </div>
                </form>
            </Modal>
        </div>
    );
}
