import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api, getToken, setToken } from '../lib/api';
import type { User } from '../types';

interface AuthCtx {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, currency: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<Pick<User, 'name' | 'currency'>> & { password?: string }) => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session on load.
    useEffect(() => {
        let active = true;
        async function bootstrap() {
            if (!getToken()) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get('/auth/me');
                if (active) setUser(data.user);
            } catch {
                setToken(null);
            } finally {
                if (active) setLoading(false);
            }
        }
        bootstrap();
        return () => {
            active = false;
        };
    }, []);

    // React to global 401s from the axios interceptor.
    useEffect(() => {
        const onUnauth = () => setUser(null);
        window.addEventListener('pet:unauthorized', onUnauth);
        return () => window.removeEventListener('pet:unauthorized', onUnauth);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        setToken(data.token);
        setUser(data.user);
    }, []);

    const register = useCallback(
        async (name: string, email: string, password: string, currency: string) => {
            const { data } = await api.post('/auth/register', { name, email, password, currency });
            setToken(data.token);
            setUser(data.user);
        },
        []
    );

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
    }, []);

    const updateProfile = useCallback<AuthCtx['updateProfile']>(async (payload) => {
        const { data } = await api.patch('/auth/me', payload);
        setUser(data.user);
    }, []);

    return (
        <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </Ctx.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
