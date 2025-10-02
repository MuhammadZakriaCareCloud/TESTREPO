'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { axiosInstance, configureAxiosAuth } from '../utils/axiosInstance';

type UserType = { name: string; email: string; role: 'admin' | 'user' };

interface AuthContextType {
  user: UserType | null;
  accessToken: string | null;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const router = useRouter();

  // Central setter keeps state + localStorage in sync
  const setAccessToken = (t: string | null) => {
    setAccessTokenState(t);
    if (typeof window === 'undefined') return;
    if (t) localStorage.setItem('access', t);
    else localStorage.removeItem('access');
  };

  // Wire the axios instance to this context (once)
  useEffect(() => {
    configureAxiosAuth({
      getAccessToken: () => accessToken ?? (typeof window !== 'undefined' ? localStorage.getItem('access') : null),
      setAccessToken: (t) => setAccessToken(t),
      onLogout: () => {
        // Called when refresh fails or a second 401 occurs
        setUser(null);
        setAccessToken(null);
        setSessionExpired(true);
        // router.push('/login');
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]); // re-configures token getter if token changes

  // Hydrate access token from localStorage on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('access');
      if (t) setAccessTokenState(t);
    }
  }, []);

  // Fetch current user (triggers refresh automatically if needed)
  const getUserData = async () => {
    try {
      const { data } = await axiosInstance.get<UserType>('/api/accounts/user/data/');
      if (data) {
        // Your API returns { name, email, role }
        setUser({ name: (data as any).name, email: (data as any).email, role: (data as any).role });
      }
    } catch (err) {
      // Errors are already handled by axiosInstance (refresh, logout). We just keep UI quiet here.
      // console.error('getUserData failed', err);
    }
  };

  // Try load user on mount & whenever access token changes
  useEffect(() => {
    getUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ---- Auth actions ----
  const login = async (email: string, password: string) => {debugger
    try {
      const { data } = await axiosInstance.post<{ tokens?: any; user?: UserType; status?: string }>(
        '/api/auth/login/',
        { email, password }
      );

      if (data?.tokens.access && data?.user) {
        setSessionExpired(false);
        setAccessToken(data.tokens.access);
        setUser(data.user);

        // Redirect by role
        if (data.user.role === 'admin') router.push('/admin/dashboard');
        else router.push('/dashboard');

        toast.success('Login successful!', { position: 'bottom-right' });
        return;
      }

      if (data?.status === '402') {
        toast.error('Login failed! Please check your credentials.', { position: 'bottom-right' });
        return;
      }

      toast.error('Login failed. Please try again.', { position: 'bottom-right' });
    } catch (error) {
      toast.error('Login failed. Please try again.', { position: 'bottom-right' });
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout/', {refresh:''});
    } catch {
      // even if server fails, clear local state
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, sessionExpired, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
