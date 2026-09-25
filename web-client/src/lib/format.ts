import { format, parseISO } from 'date-fns';

/** Format a numeric/string amount as currency. */
export function money(value: number | string, currency = 'USD'): string {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    const safe = Number.isFinite(n) ? n : 0;
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
        }).format(safe);
    } catch {
        // Fall back if an unknown currency code is stored.
        return `${currency} ${safe.toFixed(2)}`;
    }
}

/** Compact currency, e.g. $12.3k — used on chart axes. */
export function moneyCompact(value: number, currency = 'USD'): string {
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    } catch {
        return `${currency} ${value}`;
    }
}

export function formatDate(iso: string): string {
    try {
        return format(typeof iso === 'string' ? parseISO(iso) : iso, 'dd MMM yyyy');
    } catch {
        return iso;
    }
}

export function formatDateTime(iso: string): string {
    try {
        return format(parseISO(iso), 'dd MMM yyyy, HH:mm');
    } catch {
        return iso;
    }
}

/** yyyy-MM-dd for <input type="date"> values. */
export function toDateInput(iso?: string): string {
    const d = iso ? new Date(iso) : new Date();
    return format(d, 'yyyy-MM-dd');
}
