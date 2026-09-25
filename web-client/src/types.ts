export interface User {
    id: string;
    name: string;
    email: string;
    currency: string;
}

export interface Account {
    id: string;
    title: string;
    amount: string;
    icon: string;
    color: string;
    createdAt?: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
    id: string;
    title: string;
    type: CategoryType;
    icon: string;
    color: string;
}

export type RecordType = 'income' | 'expense' | 'transfer';

export interface AccountRef {
    id: string;
    title: string;
    icon: string;
    color: string;
}

export interface TxRecord {
    id: string;
    type: RecordType;
    amount: string;
    notes: string | null;
    date: string;
    accountId: string | null;
    toAccountId: string | null;
    categoryId: string | null;
    account?: AccountRef | null;
    toAccount?: AccountRef | null;
    category?: (AccountRef & { type: CategoryType }) | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface RecordsResponse {
    data: TxRecord[];
    pagination: Pagination;
}

export interface Budget {
    id: string;
    limit: string;
    period: 'monthly' | 'weekly' | 'yearly';
    categoryId: string;
    category?: Category;
    spent: number;
    remaining: number;
    percentUsed: number;
    overBudget: boolean;
}

export interface Summary {
    netWorth: number;
    accountsCount: number;
    period: { from: string; to: string };
    income: number;
    expense: number;
    net: number;
    savingsRate: number;
}

export interface CategoryBreakdown {
    categoryId: string | null;
    title: string;
    icon: string;
    color: string;
    total: number;
    count: number;
    percentage: number;
}

export interface TrendPoint {
    month: string;
    label: string;
    income: number;
    expense: number;
    net: number;
}
