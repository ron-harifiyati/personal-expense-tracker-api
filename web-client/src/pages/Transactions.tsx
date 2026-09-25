import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { money, formatDate } from '../lib/format';
import { IconGlyph } from '../lib/icons';
import { PageLoader, EmptyState, TypeBadge, Spinner } from '../components/ui';
import TransactionModal from '../components/TransactionModal';
import type { Account, Category, Pagination, TxRecord } from '../types';

export default function Transactions() {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';

    const [firstLoad, setFirstLoad] = useState(true);
    const [listLoading, setListLoading] = useState(false);
    const [records, setRecords] = useState<TxRecord[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 1 });
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [filters, setFilters] = useState({ type: '', accountId: '', categoryId: '', search: '', from: '', to: '' });
    const [page, setPage] = useState(1);

    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<TxRecord | null>(null);

    // Load reference data once.
    useEffect(() => {
        (async () => {
            try {
                const [a, c] = await Promise.all([api.get('/accounts'), api.get('/categories')]);
                setAccounts(a.data);
                setCategories(c.data);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load');
            }
        })();
    }, []);

    const load = useCallback(async () => {
        setListLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '25');
            if (filters.type) params.set('type', filters.type);
            if (filters.accountId) params.set('accountId', filters.accountId);
            if (filters.categoryId) params.set('categoryId', filters.categoryId);
            if (filters.search) params.set('search', filters.search);
            if (filters.from) params.set('from', filters.from);
            if (filters.to) params.set('to', filters.to);

            const { data } = await api.get(`/records?${params.toString()}`);
            setRecords(data.data);
            setPagination(data.pagination);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setListLoading(false);
            setFirstLoad(false);
        }
    }, [page, filters]);

    // Debounce search-driven reloads a touch.
    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    function setFilter(key: string, value: string) {
        setPage(1);
        setFilters((f) => ({ ...f, [key]: value }));
    }
    function clearFilters() {
        setPage(1);
        setFilters({ type: '', accountId: '', categoryId: '', search: '', from: '', to: '' });
    }
    const hasFilters = Object.values(filters).some(Boolean);

    async function remove(r: TxRecord) {
        if (!confirm('Delete this transaction? Account balances will be reverted.')) return;
        try {
            await api.delete(`/records/${r.id}`);
            toast.success('Transaction deleted');
            load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete');
        }
    }

    if (firstLoad) return <PageLoader />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-sm text-slate-500">{pagination.total} total</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setModal(true);
                    }}
                    className="btn-primary"
                    disabled={accounts.length === 0}
                >
                    <Plus className="h-4 w-4" /> Add
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            className="input pl-9"
                            placeholder="Search notes…"
                            value={filters.search}
                            onChange={(e) => setFilter('search', e.target.value)}
                        />
                    </div>
                    <select className="input" value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
                        <option value="">All types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="transfer">Transfer</option>
                    </select>
                    <select className="input" value={filters.accountId} onChange={(e) => setFilter('accountId', e.target.value)}>
                        <option value="">All accounts</option>
                        {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.title}
                            </option>
                        ))}
                    </select>
                    <select className="input" value={filters.categoryId} onChange={(e) => setFilter('categoryId', e.target.value)}>
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                    <div>
                        <label className="mb-1 block text-xs text-slate-400">From</label>
                        <input className="input" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-slate-400">To</label>
                        <input className="input" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
                    </div>
                    {hasFilters && (
                        <button onClick={clearFilters} className="btn-ghost self-end justify-self-start text-sm">
                            <X className="h-4 w-4" /> Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="card overflow-hidden">
                {listLoading ? (
                    <div className="flex justify-center py-16">
                        <Spinner className="h-6 w-6 text-brand-500" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="p-6">
                        <EmptyState
                            title="No transactions found"
                            subtitle={hasFilters ? 'Try adjusting your filters.' : 'Add your first transaction to get started.'}
                        />
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {records.map((r) => {
                            const color = r.category?.color || r.account?.color || r.toAccount?.color || '#64748b';
                            const label =
                                r.type === 'transfer'
                                    ? `${r.account?.title ?? '?'} → ${r.toAccount?.title ?? '?'}`
                                    : r.category?.title || 'Uncategorised';
                            return (
                                <li key={r.id} className="group flex items-center gap-3 px-4 py-3 sm:px-5">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                        style={{ background: `${color}22` }}
                                    >
                                        <IconGlyph name={r.category?.icon || r.account?.icon} className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-medium">{label}</p>
                                            <TypeBadge type={r.type} />
                                        </div>
                                        <p className="truncate text-xs text-slate-400">
                                            {formatDate(r.date)}
                                            {r.type !== 'transfer' && (r.account || r.toAccount)
                                                ? ` · ${(r.account || r.toAccount)?.title}`
                                                : ''}
                                            {r.notes ? ` · ${r.notes}` : ''}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-sm font-semibold ${
                                            r.type === 'income'
                                                ? 'text-emerald-600'
                                                : r.type === 'expense'
                                                  ? 'text-rose-600'
                                                  : 'text-sky-600'
                                        }`}
                                    >
                                        {r.type === 'expense' ? '−' : r.type === 'income' ? '+' : ''}
                                        {money(r.amount, currency)}
                                    </span>
                                    <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
                                        <button
                                            onClick={() => {
                                                setEditing(r);
                                                setModal(true);
                                            }}
                                            className="btn-ghost !px-2 !py-2"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => remove(r)} className="btn-ghost !px-2 !py-2 text-rose-500" title="Delete">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm dark:border-slate-800">
                        <span className="text-slate-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                className="btn-secondary !px-2 !py-1.5"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                className="btn-secondary !px-2 !py-1.5"
                                disabled={page >= pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <TransactionModal
                open={modal}
                onClose={() => setModal(false)}
                onSaved={load}
                accounts={accounts}
                categories={categories}
                editing={editing}
            />
        </div>
    );
}
