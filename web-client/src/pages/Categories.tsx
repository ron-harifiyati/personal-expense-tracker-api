import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { IconGlyph } from '../lib/icons';
import { PageLoader, EmptyState, Modal, Spinner } from '../components/ui';
import { ColorPicker, IconPicker } from '../components/Pickers';
import type { Category, CategoryType } from '../types';

const blank = { title: '', type: 'expense' as CategoryType, icon: 'tag', color: '#22c55e' };

export default function Categories() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState(blank);
    const [busy, setBusy] = useState(false);

    async function load() {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        load();
    }, []);

    function openCreate(type: CategoryType) {
        setEditing(null);
        setForm({ ...blank, type, color: type === 'income' ? '#22c55e' : '#f97316' });
        setModal(true);
    }
    function openEdit(c: Category) {
        setEditing(c);
        setForm({ title: c.title, type: c.type, icon: c.icon, color: c.color });
        setModal(true);
    }

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        try {
            if (editing) {
                await api.patch(`/categories/${editing.id}`, form);
                toast.success('Category updated');
            } else {
                await api.post('/categories', form);
                toast.success('Category created');
            }
            setModal(false);
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setBusy(false);
        }
    }

    async function remove(c: Category) {
        if (!confirm(`Delete "${c.title}"? Related transactions will be removed and balances reconciled.`)) return;
        try {
            await api.delete(`/categories/${c.id}`);
            toast.success('Category deleted');
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    }

    if (loading) return <PageLoader />;

    const income = categories.filter((c) => c.type === 'income');
    const expense = categories.filter((c) => c.type === 'expense');

    const Section = ({ title, list, type }: { title: string; list: Category[]; type: CategoryType }) => (
        <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                    {title} <span className="text-slate-400">({list.length})</span>
                </h3>
                <button onClick={() => openCreate(type)} className="btn-secondary !py-1.5 !px-3 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add
                </button>
            </div>
            {list.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No {type} categories yet.</p>
            ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                    {list.map((c) => (
                        <li
                            key={c.id}
                            className="group flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 dark:border-slate-800"
                        >
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                                style={{ background: c.color }}
                            >
                                <IconGlyph name={c.icon} className="h-5 w-5" />
                            </div>
                            <span className="flex-1 truncate text-sm font-medium">{c.title}</span>
                            <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                                <button onClick={() => openEdit(c)} className="btn-ghost !px-1.5 !py-1.5" title="Edit">
                                    <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => remove(c)} className="btn-ghost !px-1.5 !py-1.5 text-rose-500" title="Delete">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                <p className="text-sm text-slate-500">Organise your income and spending.</p>
            </div>

            {categories.length === 0 ? (
                <EmptyState title="No categories" subtitle="Add income and expense categories to classify transactions." />
            ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Section title="Income" list={income} type="income" />
                    <Section title="Expense" list={expense} type="expense" />
                </div>
            )}

            <Modal
                open={modal}
                onClose={() => setModal(false)}
                title={editing ? 'Edit category' : 'New category'}
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
                                placeholder="e.g. Groceries"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['income', 'expense'] as CategoryType[]).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setForm({ ...form, type: t })}
                                    className={`rounded-xl border py-2.5 text-sm font-medium capitalize transition ${
                                        form.type === t
                                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                            : 'border-slate-200 text-slate-500 dark:border-slate-700'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
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
