'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { axiosInstance, configureAxiosAuth } from '../utils/axiosInstance';

type UserType = { 
  name: string; 
  email: string; 
  role: 'admin' | 'user';
  has_subscription?: boolean;
  subscription_status?: 'active' | 'inactive' | 'expired' | null;
};

interface AuthContextType {
  user: UserType | null;
  accessToken: string | null;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSubscriptionStatus: (userId?: string) => Promise<{ has_subscription: boolean; subscription_status: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [isLoginFlow, setIsLoginFlow] = useState<boolean>(false);
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

  // Check user subscription status
  const checkSubscriptionStatus = async (userId?: string): Promise<{ has_subscription: boolean; subscription_status: string | null }> => {
    try {
      // For now, use mock data
      // TODO: Replace with real API call
      const { data } = await axiosInstance.get('api/accounts/users/data/');
      
      // Mock subscription check - return false for demo
      // In real implementation, this would check the actual subscription
      return {
        has_subscription: data.has_subscription, // Set to true to test dashboard redirect
        subscription_status: data.subscription_status ?? 'active'
      };
    } catch (err) {
      console.error('Failed to check subscription status:', err);
      return { has_subscription: false, subscription_status: null };
    }
  };

  // Fetch current user (triggers refresh automatically if needed)
  const getUserData = async () => {
    try {
      const { data } = await axiosInstance.get<UserType>('api/accounts/users/data/');
      if (data) {
        // Your API returns { name, email, role }
        const userData: UserType = { 
          name: (data as any).name, 
          email: (data as any).email, 
          role: (data as any).role 
        };
        
        // If user is not admin, check subscription status
        if (userData.role !== 'admin') {
          const subscriptionInfo = await checkSubscriptionStatus();
          userData.has_subscription = subscriptionInfo.has_subscription;
          userData.subscription_status = subscriptionInfo.subscription_status as any;
        }
        
        setUser(userData);
      }
    } catch (err) {
      // Errors are already handled by axiosInstance (refresh, logout). We just keep UI quiet here.
      // console.error('getUserData failed', err);
    }
  };

  // Try load user on mount & whenever access token changes
  useEffect(() => {
    // Only auto-load user data if not in login flow
    if (!isLoginFlow) {
      getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isLoginFlow]);

  // ---- Auth actions ----
  // Mock login function (client-side only, no server calls)
  const loginMock = async (email: string, password: string) => {
    try {
      setIsLoginFlow(true); // Prevent getUserData from interfering
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock validation
      if (!email || !password) {
        toast.error('Please enter both email and password.', { position: 'bottom-right' });
        setIsLoginFlow(false);
        return;
      }

      if (password.length < 3) {
        toast.error('Password too short.', { position: 'bottom-right' });
        setIsLoginFlow(false);
        return;
      }

      // Mock user data based on email
      const mockUser: UserType = {
        email: email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user',
      };

      // If user is not admin, check subscription status
      if (mockUser.role !== 'admin') {
        const subscriptionInfo = await checkSubscriptionStatus();
        mockUser.has_subscription = subscriptionInfo.has_subscription;
        mockUser.subscription_status = subscriptionInfo.subscription_status as any;
      }

      const mockToken = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      setSessionExpired(false);
      setAccessToken(mockToken);
      setUser(mockUser);

      // Small delay to ensure state is updated
      setTimeout(() => {
        // Redirect logic based on role and subscription
        if (mockUser.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          // For regular users, check subscription status
          if (mockUser.has_subscription && mockUser.subscription_status === 'active') {
            router.push('/dashboard');
          } else {
            router.push('/usersubscription'); // Redirect to package selection
          }
        }
        setIsLoginFlow(false); // Reset login flow flag
      }, 100);

      toast.success('Login successful! (Mock)', { position: 'bottom-right' });
      return;

    } catch (error) {
      toast.error('Login failed. Please try again.', { position: 'bottom-right' });
      setIsLoginFlow(false); // Reset login flow flag on error
    }
  };

  // Real login function (commented out until API is ready)
  const login = async (email: string, password: string) => {debugger
    // Use mock for now
    //return await loginMock(email, password);
    
    /* Uncomment when API is ready :*/
    try {
      setIsLoginFlow(true); // Prevent getUserData from interfering
      
      const { data } = await axiosInstance.post<{ tokens?: any; user?: UserType; status?: string }>(
        '/api/auth/login/',
        { email, password }
      );

      if (data?.tokens.access && data?.user) {
        const user = data.user;
        
        // If user is not admin, check subscription status
        if (user.role !== 'admin') {
          const subscriptionInfo = await checkSubscriptionStatus();
          user.has_subscription = subscriptionInfo.has_subscription;
          user.subscription_status = subscriptionInfo.subscription_status as any;
        }

        setSessionExpired(false);
        setAccessToken(data.tokens.access);
        setUser(user);

        // Small delay to ensure state is updated
        setTimeout(() => {
          // Redirect logic based on role and subscription
          if (user.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            // For regular users, check subscription status
            if (user.has_subscription && user.subscription_status === 'active') {
              router.push('/dashboard');
            } else {
              router.push('/usersubscription'); // Redirect to package selection
            }
          }
          setIsLoginFlow(false); // Reset login flow flag
        }, 100);

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
    } finally {
      setIsLoginFlow(false); // Reset login flow flag on error
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
    <AuthContext.Provider value={{ user, accessToken, sessionExpired, login, logout, checkSubscriptionStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
