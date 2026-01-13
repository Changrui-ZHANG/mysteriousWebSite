/**
 * Query key factory for profile domain
 * Provides consistent and hierarchical query keys for TanStack Query
 */

/**
 * Profile query keys factory
 * Follows TanStack Query best practices for key structure
 */
export const profileKeys = {
  // Base key for all profile queries
  all: ['profiles'] as const,
  
  // Profile lists (directory, search results, etc.)
  lists: () => [...profileKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...profileKeys.lists(), { filters }] as const,
  
  // Individual profile details
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (userId: string, viewerId?: string) => [
    ...profileKeys.details(), 
    userId, 
    ...(viewerId ? [{ viewerId }] : [])
  ] as const,
  
  // Profile statistics and activity
  stats: (userId: string) => [...profileKeys.detail(userId), 'stats'] as const,
  activity: (userId: string) => [...profileKeys.detail(userId), 'activity'] as const,
  
  // Avatar related queries
  avatars: () => [...profileKeys.all, 'avatars'] as const,
  avatar: (userId: string) => [...profileKeys.avatars(), userId] as const,
  defaultAvatars: () => [...profileKeys.avatars(), 'defaults'] as const,
  
  // Privacy settings
  privacy: (userId: string) => [...profileKeys.detail(userId), 'privacy'] as const,
  
  // Search queries
  search: () => [...profileKeys.all, 'search'] as const,
  searchResults: (query: string, filters?: Record<string, any>) => [
    ...profileKeys.search(), 
    query, 
    ...(filters ? [{ filters }] : [])
  ] as const,
} as const;

/**
 * Activity stats query keys
 */
export const activityKeys = {
  all: ['activity'] as const,
  stats: () => [...activityKeys.all, 'stats'] as const,
  userStats: (userId: string) => [...activityKeys.stats(), userId] as const,
  globalStats: () => [...activityKeys.stats(), 'global'] as const,
} as const;

/**
 * Achievement query keys
 */
export const achievementKeys = {
  all: ['achievements'] as const,
  definitions: () => [...achievementKeys.all, 'definitions'] as const,
  userAchievements: (userId: string) => [...achievementKeys.all, 'user', userId] as const,
} as const;

/**
 * Utility function to invalidate all profile-related queries
 */
export const getAllProfileQueryKeys = () => [
  ...profileKeys.all,
  ...activityKeys.all,
  ...achievementKeys.all,
] as const;

/**
 * Utility function to get query keys for a specific user
 */
export const getUserQueryKeys = (userId: string) => [
  profileKeys.detail(userId),
  profileKeys.stats(userId),
  profileKeys.activity(userId),
  profileKeys.avatar(userId),
  profileKeys.privacy(userId),
  activityKeys.userStats(userId),
  achievementKeys.userAchievements(userId),
] as const;

/**
 * Query key validation helper
 */
export const isProfileQueryKey = (queryKey: unknown[]): boolean => {
  return Array.isArray(queryKey) && queryKey[0] === 'profiles';
};

export const isActivityQueryKey = (queryKey: unknown[]): boolean => {
  return Array.isArray(queryKey) && queryKey[0] === 'activity';
};

export const isAchievementQueryKey = (queryKey: unknown[]): boolean => {
  return Array.isArray(queryKey) && queryKey[0] === 'achievements';
};