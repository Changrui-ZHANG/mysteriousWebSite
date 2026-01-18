import React, { useState, useEffect, useCallback, memo } from 'react';
import { resolveAvatarUrl } from '../utils/avatarUtils';
import { useAvatar } from '../hooks/useAvatar';

interface UserAvatarProps {
    userId?: string;
    src?: string | null;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    className?: string;
    onError?: () => void;
    showSkeleton?: boolean;
    children?: React.ReactNode;
}

/**
 * UserAvatar - Unified component for displaying user avatars
 * Handles resolution, fallbacks, and consistent styling
 */
const UserAvatarComponent: React.FC<UserAvatarProps> = ({
    userId,
    src,
    alt = 'User avatar',
    size = 'md',
    className = '',
    onError,
    showSkeleton = false,
    children
}) => {
    // Only use the hook if we have a userId, otherwise use src directly
    const { avatarUrl: hookAvatarUrl, isLoading } = useAvatar(userId);
    const [imgSrc, setImgSrc] = useState<string>('');
    const [hasError, setHasError] = useState(false);

    // Memoize the resolved URL to prevent unnecessary updates
    const resolvedUrl = React.useMemo(() => {
        if (userId) {
            return hookAvatarUrl;
        } else {
            return resolveAvatarUrl(src);
        }
    }, [userId, hookAvatarUrl, src]);

    // Update image source when resolved URL changes
    useEffect(() => {
        if (resolvedUrl !== imgSrc) {
            setImgSrc(resolvedUrl);
            setHasError(false);
        }
    }, [resolvedUrl, imgSrc]);

    const handleImgError = useCallback(() => {
        // Stop if we already failed
        if (hasError) return;

        setHasError(true);
        // We don't have a hardcoded fallback anymore, so we just clear it or show initials/placeholder
        setImgSrc('');
        onError?.();
    }, [hasError, onError]);

    // Size mapping
    const sizeClasses = typeof size === 'string' ? {
        'xs': 'w-6 h-6',
        'sm': 'w-8 h-8',
        'md': 'w-10 h-10',
        'lg': 'w-16 h-16',
        'xl': 'w-20 h-20'
    }[size] : '';

    const style = typeof size === 'number' ? { width: size, height: size } : {};

    return (
        <div
            className={`relative rounded-full overflow-hidden bg-(--bg-surface-translucent) ${sizeClasses} ${className}`}
            style={style}
        >
            {imgSrc && !showSkeleton && (
                <img
                    src={imgSrc}
                    key={imgSrc} // Force remount on change to ensure onError triggers correctly
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${hasError ? 'opacity-80' : 'opacity-100'}`}
                    onError={handleImgError}
                    loading="lazy"
                />
            )}
            {(showSkeleton || (isLoading && !imgSrc)) && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
            )}
            {children}
        </div>
    );
};

// Memoize the component to prevent unnecessary re-renders
export const UserAvatar = memo(UserAvatarComponent);