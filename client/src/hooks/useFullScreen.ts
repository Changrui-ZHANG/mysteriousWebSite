import { useState, useCallback, useEffect } from 'react';

/**
 * A hook to handle full screen functionality for a specific element.
 * @param elementRef A React ref to the element that should go full screen.
 */
export function useFullScreen(elementRef: React.RefObject<HTMLElement>) {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = useCallback(async () => {
        if (!elementRef.current) return;

        try {
            if (!document.fullscreenElement) {
                await elementRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error toggling full screen:', error);
        }
    }, [elementRef]);

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
        document.addEventListener('mozfullscreenchange', handleFullScreenChange);
        document.addEventListener('MSFullscreenChange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
        };
    }, []);

    return { isFullScreen, toggleFullScreen };
}
