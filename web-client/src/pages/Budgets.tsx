import { useEffect, useState } from 'react';
import { Plus, Trash2, Target, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { money } from '../lib/format';
import { IconGlyph } from '../lib/icons';
import { PageLoader, EmptyState, Modal, Spinner } from '../components/ui';
import type { Budget, Category } from '../types';

export default function Budgets() {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';

    const [loading, setLoading] = useState(true);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<Budget | null>(null);
    const [form, setForm] = useState({ categoryId: '', limit: '', period: 'monthly' as Budget['period'] });
    const [busy, setBusy] = useState(false);

    async function load() {
        try {
            const [b, c] = await Promise.all([api.get('/budgets'), api.get('/categories?type=expense')]);
            setBudgets(b.data);
            setCategories(c.data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);

    // Categories that don't yet have a budget (for the create form).
    const available = categories.filter((c) => !budgets.some((b) => b.categoryId === c.id));

    function openCreate() {
        setEditing(null);
        setForm({ categoryId: available[0]?.id || '', limit: '', period: 'monthly' });
        setModal(true);
    }
    function openEdit(b: Budget) {
        setEditing(b);
        setForm({ categoryId: b.categoryId, limit: String(b.limit), period: b.period });
        setModal(true);
    }

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        try {
            if (editing) {
                await api.patch(`/budgets/${editing.id}`, { limit: parseFloat(form.limit), period: form.period });
                toast.success('Budget updated');
            } else {
                await api.post('/budgets', { categoryId: form.categoryId, limit: parseFloat(form.limit), period: form.period });
                toast.success('Budget created');
            }
            setModal(false);
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setBusy(false);
        }
    }

    async function remove(b: Budget) {
        if (!confirm(`Delete the budget for "${b.category?.title}"?`)) return;
        try {
            await api.delete(`/budgets/${b.id}`);
            toast.success('Budget deleted');
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    }

    if (loading) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
                    <p className="text-sm text-slate-500">Set spending limits and track progress.</p>
                </div>
                <button onClick={openCreate} className="btn-primary" disabled={categories.length === 0}>
                    <Plus className="h-4 w-4" /> New budget
                </button>
            </div>

            {budgets.length === 0 ? (
                <EmptyState
                    title="No budgets yet"
                    subtitle={
                        categories.length === 0
                            ? 'Create an expense category first, then set a budget for it.'
                            : 'Set a monthly limit on a category to stay on track.'
                    }
                    action={
                        categories.length > 0 ? (
                            <button onClick={openCreate} className="btn-primary">
                                <Plus className="h-4 w-4" /> New budget
                            </button>
                        ) : undefined
                    }
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {budgets.map((b) => {
                        const pct = Math.min(b.percentUsed, 100);
                        const barColor = b.overBudget ? 'bg-rose-500' : b.percentUsed > 80 ? 'bg-amber-500' : 'bg-brand-500';
                        return (
                            <div key={b.id} className="card group p-5">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                                        style={{ background: b.category?.color || '#64748b' }}
                                    >
                                        <IconGlyph name={b.category?.icon} className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{b.category?.title}</p>
                                        <p className="text-xs capitalize text-slate-400">{b.period}</p>
                                    </div>
                                    <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                                        <button onClick={() => openEdit(b)} className="btn-ghost !px-2 !py-2" title="Edit">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => remove(b)} className="btn-ghost !px-2 !py-2 text-rose-500" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="mb-1.5 flex items-center justify-between text-sm">
                                        <span className="font-semibold">{money(b.spent, currency)}</span>
                                        <span className="text-slate-400">of {money(b.limit, currency)}</span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className={`mt-1.5 text-xs ${b.overBudget ? 'text-rose-600' : 'text-slate-400'}`}>
                                        {b.overBudget
                                            ? `Over by ${money(Math.abs(b.remaining), currency)}`
                                            : `${money(b.remaining, currency)} remaining · ${b.percentUsed}% used`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                open={modal}
                onClose={() => setModal(false)}
                title={editing ? 'Edit budget' : 'New budget'}
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
                    {!editing && (
                        <div>
                            <label className="label">Category</label>
                            <select
                                className="input"
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                required
                            >
                                <option value="" disabled>
                                    Select expense category
                                </option>
                                {available.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.title}
                                    </option>
                                ))}
                            </select>
                            {available.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">Every expense category already has a budget.</p>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="label">Limit</label>
                        <input
                            className="input"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={form.limit}
                            onChange={(e) => setForm({ ...form, limit: e.target.value })}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="label">Period</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['weekly', 'monthly', 'yearly'] as Budget['period'][]).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setForm({ ...form, period: p })}
                                    className={`rounded-xl border py-2.5 text-sm font-medium capitalize transition ${
                                        form.period === p
                                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                            : 'border-slate-200 text-slate-500 dark:border-slate-700'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <Target className="h-3 w-3" /> Spending resets at the start of each {form.period.replace('ly', '')}.
                        </p>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
