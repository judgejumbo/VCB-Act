'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useMemo } from 'react';
import type { User } from '@/types';

export function useAuth() {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();

  const authUser: User | null = useMemo(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      imageUrl: user.imageUrl || undefined,
    };
  }, [user]);

  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    userId: userId || null,
    user: authUser,
    isLoading: !isLoaded,
  };
}