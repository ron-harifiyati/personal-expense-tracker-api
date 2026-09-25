import { type ReactNode, useEffect } from 'react';
import { X, Loader2, Inbox } from 'lucide-react';

/** Full-screen centered spinner. */
export function PageLoader() {
    return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
    );
}

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
    return <Loader2 className={`animate-spin ${className}`} />;
}

/** Empty-state placeholder for lists. */
export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 py-14 text-center dark:border-slate-700">
            <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800">
                <Inbox className="h-6 w-6 text-slate-400" />
            </div>
            <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

/** Accessible modal dialog. */
export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div
                className="animate-fade-in card w-full max-w-lg overflow-hidden rounded-b-none sm:rounded-2xl"
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="btn-ghost !px-2 !py-2" aria-label="Close">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Colored chip for record types. */
export function TypeBadge({ type }: { type: 'income' | 'expense' | 'transfer' }) {
    const styles: Record<string, string> = {
        income: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
        expense: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
        transfer: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
    };
    return <span className={`chip ${styles[type]}`}>{type[0].toUpperCase() + type.slice(1)}</span>;
}
