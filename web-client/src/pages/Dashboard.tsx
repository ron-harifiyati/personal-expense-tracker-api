import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { money, moneyCompact, formatDate } from '../lib/format';
import { IconGlyph } from '../lib/icons';
import { PageLoader, EmptyState } from '../components/ui';
import type { Summary, TrendPoint, CategoryBreakdown, Budget, TxRecord } from '../types';

function StatCard({
    label,
    value,
    icon,
    accent,
    hint,
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    accent: string;
    hint?: React.ReactNode;
}) {
    return (
        <div className="card p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className={`rounded-lg p-2 ${accent}`}>{icon}</div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';

    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [trend, setTrend] = useState<TrendPoint[]>([]);
    const [byCat, setByCat] = useState<CategoryBreakdown[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [recent, setRecent] = useState<TxRecord[]>([]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [s, t, c, b, r] = await Promise.all([
                    api.get('/analytics/summary'),
                    api.get('/analytics/trend?months=6'),
                    api.get('/analytics/by-category?type=expense'),
                    api.get('/budgets'),
                    api.get('/records?limit=5&sort=date:desc'),
                ]);
                if (!active) return;
                setSummary(s.data);
                setTrend(t.data);
                setByCat(c.data);
                setBudgets(b.data);
                setRecent(r.data.data);
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to load dashboard');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    if (loading) return <PageLoader />;

    const topBudgets = [...budgets].sort((a, b) => b.percentUsed - a.percentUsed).slice(0, 4);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Hi {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-slate-500">Here's your financial snapshot for this month.</p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Net worth"
                    value={money(summary?.netWorth ?? 0, currency)}
                    icon={<Wallet className="h-5 w-5 text-brand-600" />}
                    accent="bg-brand-100 dark:bg-brand-900/40"
                    hint={`${summary?.accountsCount ?? 0} accounts`}
                />
                <StatCard
                    label="Income (this month)"
                    value={money(summary?.income ?? 0, currency)}
                    icon={<ArrowUpRight className="h-5 w-5 text-emerald-600" />}
                    accent="bg-emerald-100 dark:bg-emerald-900/30"
                />
                <StatCard
                    label="Expenses (this month)"
                    value={money(summary?.expense ?? 0, currency)}
                    icon={<ArrowDownRight className="h-5 w-5 text-rose-600" />}
                    accent="bg-rose-100 dark:bg-rose-900/30"
                />
                <StatCard
                    label="Savings rate"
                    value={`${summary?.savingsRate ?? 0}%`}
                    icon={
                        (summary?.net ?? 0) >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-emerald-600" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-rose-600" />
                        )
                    }
                    accent="bg-indigo-100 dark:bg-indigo-900/30"
                    hint={`Net ${money(summary?.net ?? 0, currency)}`}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Trend chart */}
                <div className="card p-5 lg:col-span-3">
                    <h3 className="font-semibold">Income vs Expenses</h3>
                    <p className="mb-4 text-sm text-slate-500">Last 6 months</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ left: -18, right: 8, top: 4 }}>
                                <defs>
                                    <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => moneyCompact(v, currency)}
                                />
                                <Tooltip
                                    formatter={(v: number) => money(v, currency)}
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: 'none',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        background: '#1e293b',
                                        color: '#fff',
                                    }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#inc)" name="Income" />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2.5} fill="url(#exp)" name="Expense" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category donut */}
                <div className="card p-5 lg:col-span-2">
                    <h3 className="font-semibold">Spending by category</h3>
                    <p className="mb-4 text-sm text-slate-500">This month</p>
                    {byCat.length === 0 ? (
                        <EmptyState title="No spending yet" subtitle="Log an expense to see the breakdown." />
                    ) : (
                        <>
                            <div className="h-44">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={byCat}
                                            dataKey="total"
                                            nameKey="title"
                                            innerRadius={48}
                                            outerRadius={72}
                                            paddingAngle={2}
                                        >
                                            {byCat.map((c) => (
                                                <Cell key={c.categoryId} fill={c.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v: number) => money(v, currency)}
                                            contentStyle={{
                                                borderRadius: 12,
                                                border: 'none',
                                                background: '#1e293b',
                                                color: '#fff',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-3 space-y-2">
                                {byCat.slice(0, 4).map((c) => (
                                    <div key={c.categoryId} className="flex items-center gap-2 text-sm">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                                        <span className="flex-1 truncate">{c.title}</span>
                                        <span className="font-medium">{money(c.total, currency)}</span>
                                        <span className="w-10 text-right text-xs text-slate-400">{c.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Recent transactions */}
                <div className="card p-5 lg:col-span-3">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Recent transactions</h3>
                        <Link to="/transactions" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <EmptyState title="No transactions yet" subtitle="Your latest activity will appear here." />
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recent.map((r) => (
                                <li key={r.id} className="flex items-center gap-3 py-3">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-full"
                                        style={{ background: `${(r.category?.color || r.account?.color || '#64748b')}22` }}
                                    >
                                        <IconGlyph
                                            name={r.category?.icon || r.account?.icon}
                                            className="h-5 w-5"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {r.category?.title || (r.type === 'transfer' ? 'Transfer' : 'Uncategorised')}
                                        </p>
                                        <p className="truncate text-xs text-slate-400">
                                            {formatDate(r.date)}
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
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Budgets */}
                <div className="card p-5 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Budgets</h3>
                        <Link to="/budgets" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
                            Manage <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    {topBudgets.length === 0 ? (
                        <EmptyState title="No budgets set" subtitle="Set limits to stay on track." />
                    ) : (
                        <div className="space-y-4">
                            {topBudgets.map((b) => (
                                <div key={b.id}>
                                    <div className="mb-1 flex items-center justify-between text-sm">
                                        <span className="font-medium">{b.category?.title}</span>
                                        <span className={b.overBudget ? 'text-rose-600' : 'text-slate-500'}>
                                            {money(b.spent, currency)} / {money(b.limit, currency)}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className={`h-full rounded-full ${b.overBudget ? 'bg-rose-500' : 'bg-brand-500'}`}
                                            style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
