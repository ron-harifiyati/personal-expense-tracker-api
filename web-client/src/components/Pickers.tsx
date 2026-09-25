import { ICON_KEYS, iconFor } from '../lib/icons';

const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#f59e0b', '#eab308', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#3b82f6', '#64748b', '#a855f7',
];

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
    return (
        <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className={`h-8 w-8 rounded-full transition ${
                        value === c ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900' : ''
                    }`}
                    style={{ background: c }}
                    aria-label={`Colour ${c}`}
                />
            ))}
        </div>
    );
}

export function IconPicker({ value, onChange }: { value: string; onChange: (i: string) => void }) {
    return (
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
            {ICON_KEYS.map((key) => {
                const Icon = iconFor(key);
                const active = value === key;
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onChange(key)}
                        className={`flex h-10 items-center justify-center rounded-xl border transition ${
                            active
                                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                        }`}
                        aria-label={`Icon ${key}`}
                    >
                        <Icon className="h-5 w-5" />
                    </button>
                );
            })}
        </div>
    );
}
