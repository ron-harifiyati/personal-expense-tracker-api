import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { toDateInput } from '../lib/format';
import { Modal, Spinner } from './ui';
import type { Account, Category, RecordType, TxRecord } from '../types';

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
    accounts: Account[];
    categories: Category[];
    editing: TxRecord | null;
}

const TYPES: { key: RecordType; label: string; color: string }[] = [
    { key: 'expense', label: 'Expense', color: 'text-rose-600' },
    { key: 'income', label: 'Income', color: 'text-emerald-600' },
    { key: 'transfer', label: 'Transfer', color: 'text-sky-600' },
];

export default function TransactionModal({ open, onClose, onSaved, accounts, categories, editing }: Props) {
    const [type, setType] = useState<RecordType>('expense');
    const [amount, setAmount] = useState('');
    const [fromAccountId, setFromAccountId] = useState('');
    const [toAccountId, setToAccountId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(toDateInput());
    const [busy, setBusy] = useState(false);

    // Seed the form whenever it opens (create vs edit).
    useEffect(() => {
        if (!open) return;
        if (editing) {
            setType(editing.type);
            setAmount(String(editing.amount));
            setFromAccountId(editing.accountId || '');
            setToAccountId(editing.toAccountId || '');
            setCategoryId(editing.categoryId || '');
            setNotes(editing.notes || '');
            setDate(toDateInput(editing.date));
        } else {
            setType('expense');
            setAmount('');
            setFromAccountId(accounts[0]?.id || '');
            setToAccountId(accounts[1]?.id || accounts[0]?.id || '');
            setCategoryId('');
            setNotes('');
            setDate(toDateInput());
        }
    }, [open, editing, accounts]);

    const relevantCategories = categories.filter((c) => c.type === type);

    async function save(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);
        try {
            const payload: Record<string, unknown> = { type, amount: parseFloat(amount), notes, date };
            if (type === 'expense') {
                payload.fromAccountId = fromAccountId;
                payload.categoryId = categoryId;
            } else if (type === 'income') {
                payload.toAccountId = toAccountId;
                payload.categoryId = categoryId;
            } else {
                payload.fromAccountId = fromAccountId;
                payload.toAccountId = toAccountId;
            }

            if (editing) {
                await api.patch(`/records/${editing.id}`, payload);
                toast.success('Transaction updated');
            } else {
                await api.post('/records', payload);
                toast.success('Transaction added');
            }
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setBusy(false);
        }
    }

    const accountSelect = (value: string, onChange: (v: string) => void, label: string) => (
        <div>
            <label className="label">{label}</label>
            <select className="input" value={value} onChange={(e) => onChange(e.target.value)} required>
                <option value="" disabled>
                    Select account
                </option>
                {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                        {a.title}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editing ? 'Edit transaction' : 'Add transaction'}
            footer={
                <>
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={save} className="btn-primary" disabled={busy}>
                        {busy && <Spinner />} {editing ? 'Save' : 'Add'}
                    </button>
                </>
            }
        >
            <form onSubmit={save} className="space-y-4">
                {/* Type switch */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    {TYPES.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => {
                                setType(t.key);
                                setCategoryId('');
                            }}
                            className={`rounded-lg py-2 text-sm font-semibold transition ${
                                type === t.key
                                    ? `bg-white shadow-sm dark:bg-slate-900 ${t.color}`
                                    : 'text-slate-500'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div>
                    <label className="label">Amount</label>
                    <input
                        className="input text-lg font-semibold"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                        autoFocus
                    />
                </div>

                {type === 'expense' && accountSelect(fromAccountId, setFromAccountId, 'From account')}
                {type === 'income' && accountSelect(toAccountId, setToAccountId, 'To account')}
                {type === 'transfer' && (
                    <div className="grid grid-cols-2 gap-3">
                        {accountSelect(fromAccountId, setFromAccountId, 'From')}
                        {accountSelect(toAccountId, setToAccountId, 'To')}
                    </div>
                )}

                {type !== 'transfer' && (
                    <div>
                        <label className="label">Category</label>
                        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                            <option value="" disabled>
                                Select category
                            </option>
                            {relevantCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title}
                                </option>
                            ))}
                        </select>
                        {relevantCategories.length === 0 && (
                            <p className="mt-1 text-xs text-amber-600">
                                No {type} categories yet — create one on the Categories page.
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="label">Date</label>
                        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div>
                        <label className="label">Notes</label>
                        <input
                            className="input"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
