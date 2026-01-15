import React, { useState, useEffect } from 'react';
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
}

/**
 * UserAvatar - Unified component for displaying user avatars
 * Handles resolution, fallbacks, and consistent styling
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
    userId,
    src,
    alt = 'User avatar',
    size = 'md',
    className = '',
    onError,
    showSkeleton = false
}) => {
    const { avatarUrl: hookAvatarUrl, isLoading } = useAvatar(userId);
    const [imgSrc, setImgSrc] = useState<string>(resolveAvatarUrl(src));
    const [hasError, setHasError] = useState(false);

    // Initial and reactive resolution
    useEffect(() => {
        const resolved = userId ? hookAvatarUrl : resolveAvatarUrl(src);

        // Only update if the source actually changed to avoid unnecessary re-renders
        if (resolved !== imgSrc) {
            setImgSrc(resolved);
            setHasError(false);
        }
    }, [userId, hookAvatarUrl, src, imgSrc]);

    const handleImgError = () => {
        // Stop if we already failed
        if (hasError) return;

        setHasError(true);
        // We don't have a hardcoded fallback anymore, so we just clear it or show initials/placeholder
        setImgSrc('');
        onError?.();
    };

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
        </div>
    );
};
