/**
 * TanStack Query client configuration for profile domain
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create a configured QueryClient for the profile domain
 */
export const createProfileQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Exponential backoff with max 30 seconds
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        // Exponential backoff for mutations
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      },
    },
  });
};

/**
 * Default query client instance
 */
export const profileQueryClient = createProfileQueryClient();