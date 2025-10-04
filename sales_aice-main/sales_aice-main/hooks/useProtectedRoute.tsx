'use client';
import { useAuth } from '../context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserRole = 'admin' | 'user';

export function useProtectedRoute(allowedRoles: UserRole[] = ['user', 'admin']) {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 useProtectedRoute - Starting auth check...');
      console.log('🔍 accessToken:', accessToken ? 'EXISTS' : 'NULL');
      console.log('🔍 user:', user);
      console.log('🔍 allowedRoles:', allowedRoles);

      // Not logged in
      if (!accessToken) {
        console.log('❌ No access token - redirecting to login');
        router.push('/login');
        return;
      }

      // No user data yet - still loading
      if (!user) {
        console.log('⏳ No user data yet - still loading');
        setIsLoading(true);
        return;
      }

      console.log('🔍 User role check:', user.role);
      console.log('🔍 Allowed roles:', allowedRoles);
      console.log('🔍 Role allowed?', allowedRoles.includes(user.role));

      // Check if user role is allowed
      if (!allowedRoles.includes(user.role)) {
        console.log('❌ Role not allowed - redirecting');
        // Redirect to appropriate dashboard based on user role
        const redirectUrl = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        console.log('🔄 Redirecting to:', redirectUrl);
        router.push(redirectUrl);
        return;
      }

      // User is authorized
      console.log('✅ User authorized');
      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [accessToken, user, router, allowedRoles]);

  return { isAuthorized, isLoading, user };
}

// Specific hooks for common use cases
export function useAdminRoute() {
  console.log('🔐 useAdminRoute called');
  return useProtectedRoute(['admin']);
}

export function useUserRoute() {
  console.log('👤 useUserRoute called');
  return useProtectedRoute(['user']);
}

export function useAnyAuthenticatedRoute() {
  console.log('🔓 useAnyAuthenticatedRoute called');
  return useProtectedRoute(['admin', 'user']);
}