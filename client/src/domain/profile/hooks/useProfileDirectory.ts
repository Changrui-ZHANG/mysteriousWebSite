import { useState, useCallback, useEffect } from 'react';
import { ProfileService } from '../services/ProfileService';
import { useErrorHandler } from '../../../shared/hooks/useErrorHandler';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import type { 
    UserProfile, 
    ProfileSearchQuery, 
    ProfileDirectoryFilters 
} from '../types';

interface UseProfileDirectoryProps {
    viewerId?: string;
    initialFilters?: Partial<ProfileDirectoryFilters>;
    autoLoad?: boolean;
}

interface UseProfileDirectoryReturn {
    // State
    profiles: UserProfile[];
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    hasMore: boolean;
    total: number;
    currentFilters: ProfileDirectoryFilters;
    searchQuery: string;
    
    // Actions
    loadProfiles: (filters?: Partial<ProfileDirectoryFilters>) => Promise<void>;
    searchProfiles: (query: string, options?: Partial<ProfileSearchQuery>) => Promise<void>;
    loadMore: () => Promise<void>;
    refreshProfiles: () => Promise<void>;
    updateFilters: (filters: Partial<ProfileDirectoryFilters>) => void;
    clearSearch: () => void;
    clearError: () => void;
    
    // Helpers
    hasProfiles: boolean;
    isFirstLoad: boolean;
    canLoadMore: boolean;
    getRecentlyActive: () => Promise<void>;
    getMostActive: () => Promise<void>;
}

const DEFAULT_FILTERS: ProfileDirectoryFilters = {
    sortBy: 'displayName',
    sortOrder: 'asc',
    limit: 20,
    offset: 0,
    onlineOnly: false
};

/**
 * Hook for profile directory and user discovery
 * Handles profile search, directory functionality, and pagination
 */
export function useProfileDirectory({ 
    viewerId, 
    initialFilters = {}, 
    autoLoad = true 
}: UseProfileDirectoryProps = {}): UseProfileDirectoryReturn {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFilters, setCurrentFilters] = useState<ProfileDirectoryFilters>({
        ...DEFAULT_FILTERS,
        ...initialFilters
    });
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    
    const { handleError } = useErrorHandler();
    const { error: showErrorToast } = useToastContext();
    const profileService = new ProfileService();

    // Computed values
    const hasProfiles = profiles.length > 0;
    const canLoadMore = hasMore && !isLoading && !isSearching;

    /**
     * Load profiles from directory
     */
    const loadProfiles = useCallback(async (filters?: Partial<ProfileDirectoryFilters>) => {
        if (isLoading) return;
        
        try {
            setIsLoading(true);
            setError(null);
            
            const filtersToUse = filters ? { ...currentFilters, ...filters } : currentFilters;
            
            // Reset offset if this is a new filter set (not pagination)
            if (filters && Object.keys(filters).some(key => key !== 'offset')) {
                filtersToUse.offset = 0;
                setProfiles([]); // Clear existing profiles for new filter
            }
            
            const result = await profileService.getProfileDirectory(filtersToUse, viewerId);
            
            if (filtersToUse.offset === 0) {
                // New search/filter - replace profiles
                setProfiles(result.profiles);
            } else {
                // Pagination - append profiles
                setProfiles(prev => [...prev, ...result.profiles]);
            }
            
            setHasMore(result.profiles.length === filtersToUse.limit && result.profiles.length < result.total);
            setTotal(result.total);
            setCurrentFilters(filtersToUse);
            setIsFirstLoad(false);
            
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
            showErrorToast('Failed to load profiles');
        } finally {
            setIsLoading(false);
        }
    }, [currentFilters, profileService, viewerId, handleError, showErrorToast, isLoading]);

    /**
     * Search profiles by query
     */
    const searchProfiles = useCallback(async (query: string, options?: Partial<ProfileSearchQuery>) => {
        if (isSearching) return;
        
        try {
            setIsSearching(true);
            setError(null);
            setSearchQuery(query);
            
            const searchOptions: ProfileSearchQuery = {
                query: query.trim(),
                limit: 20,
                offset: 0,
                includePrivate: false,
                ...options
            };
            
            const result = await profileService.searchProfiles(searchOptions, viewerId);
            
            setProfiles(result.profiles);
            setHasMore(result.profiles.length === searchOptions.limit && result.profiles.length < result.total);
            setTotal(result.total);
            setIsFirstLoad(false);
            
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
            showErrorToast('Search failed');
        } finally {
            setIsSearching(false);
        }
    }, [profileService, viewerId, handleError, showErrorToast, isSearching]);

    /**
     * Load more profiles (pagination)
     */
    const loadMore = useCallback(async () => {
        if (!canLoadMore) return;
        
        const nextOffset = currentFilters.offset + currentFilters.limit;
        
        if (searchQuery) {
            // Continue search pagination
            await searchProfiles(searchQuery, { 
                offset: nextOffset,
                limit: currentFilters.limit 
            });
        } else {
            // Continue directory pagination
            await loadProfiles({ offset: nextOffset });
        }
    }, [canLoadMore, currentFilters, searchQuery, searchProfiles, loadProfiles]);

    /**
     * Refresh current profiles
     */
    const refreshProfiles = useCallback(async () => {
        if (searchQuery) {
            await searchProfiles(searchQuery, { offset: 0 });
        } else {
            await loadProfiles({ offset: 0 });
        }
    }, [searchQuery, searchProfiles, loadProfiles]);

    /**
     * Update filters and reload
     */
    const updateFilters = useCallback((filters: Partial<ProfileDirectoryFilters>) => {
        const newFilters = { ...currentFilters, ...filters, offset: 0 };
        setCurrentFilters(newFilters);
        setSearchQuery(''); // Clear search when changing filters
        loadProfiles(newFilters);
    }, [currentFilters, loadProfiles]);

    /**
     * Clear search and return to directory
     */
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        loadProfiles({ offset: 0 });
    }, [loadProfiles]);

    /**
     * Get recently active profiles
     */
    const getRecentlyActive = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const recentProfiles = await profileService.getRecentlyActiveProfiles(20, viewerId);
            setProfiles(recentProfiles);
            setHasMore(false);
            setTotal(recentProfiles.length);
            setSearchQuery('');
            setIsFirstLoad(false);
            
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
            showErrorToast('Failed to load recently active profiles');
        } finally {
            setIsLoading(false);
        }
    }, [profileService, viewerId, handleError, showErrorToast]);

    /**
     * Get most active profiles
     */
    const getMostActive = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const activeProfiles = await profileService.getMostActiveProfiles(20, viewerId);
            setProfiles(activeProfiles);
            setHasMore(false);
            setTotal(activeProfiles.length);
            setSearchQuery('');
            setIsFirstLoad(false);
            
        } catch (err) {
            const { userMessage } = handleError(err);
            setError(userMessage);
            showErrorToast('Failed to load most active profiles');
        } finally {
            setIsLoading(false);
        }
    }, [profileService, viewerId, handleError, showErrorToast]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto-load profiles on mount
    useEffect(() => {
        if (autoLoad && isFirstLoad) {
            loadProfiles();
        }
    }, [autoLoad, isFirstLoad, loadProfiles]);

    return {
        // State
        profiles,
        isLoading,
        isSearching,
        error,
        hasMore,
        total,
        currentFilters,
        searchQuery,
        
        // Actions
        loadProfiles,
        searchProfiles,
        loadMore,
        refreshProfiles,
        updateFilters,
        clearSearch,
        clearError,
        
        // Helpers
        hasProfiles,
        isFirstLoad,
        canLoadMore,
        getRecentlyActive,
        getMostActive
    };
}