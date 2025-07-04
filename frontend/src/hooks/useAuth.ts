'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { getFromLocalStorage, setToLocalStorage, removeFromLocalStorage } from '@/lib/utils';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const trpc = useTRPC();

  const { data: user, isLoading: userLoading, error } = useQuery(
    trpc.auth.me.queryOptions(
      void 0,
      {
        enabled: !!getFromLocalStorage('accessToken'),
        retry: false,
      }
    )
  );

  useEffect(() => {
    const token = getFromLocalStorage('accessToken');
    if (token && user) {
      setIsAuthenticated(true);
    } else if (error) {
      setIsAuthenticated(false);
      removeFromLocalStorage('accessToken');
      removeFromLocalStorage('refreshToken');
      removeFromLocalStorage('userId');
    }
    setIsLoading(userLoading);
  }, [user, userLoading, error]);

  const login = (tokens: {
    access_token: string;
    refresh_token: string;
    id: string;
  }) => {
    setToLocalStorage('accessToken', tokens.access_token);
    setToLocalStorage('refreshToken', tokens.refresh_token);
    setToLocalStorage('userId', tokens.id);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeFromLocalStorage('accessToken');
    removeFromLocalStorage('refreshToken');
    removeFromLocalStorage('userId');
    setIsAuthenticated(false);
    router.push('/signin');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}