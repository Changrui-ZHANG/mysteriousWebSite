/**
 * CropCanvas component - Traditional cropping with movable crop area
 * Displays full image with movable and resizable crop area overlay
 */

import React, { useRef, useEffect, useState } from 'react';
import { CropCanvasProps } from './types';
import { useCropCanvas } from '../../hooks/cropping';
import { CanvasHelpers } from '../../utils/cropping';
import { CANVAS_CONFIG } from '../../utils/cropping/constants';

export const CropCanvas: React.FC<CropCanvasProps> = ({
    image,
    cropArea,
    scale,
    onCropAreaChange,
    className = ''
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 400, height: 400 });
    const [isCanvasReady, setIsCanvasReady] = useState(false);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

    // Create crop state for the hook
    const cropState = {
        image,
        cropArea,
        scale,
        rotation: 0,
        isValid: true,
        quality: 'high' as const
    };

    // Use canvas interaction hook
    const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        redrawCanvas,
        interactionState
    } = useCropCanvas({
        canvasRef,
        cropState,
        onCropAreaChange,
        disabled: false
    });

    /**
     * Handle mouse move for cursor changes (separate from interaction)
     */
    const handleMouseMoveForCursor = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const mousePos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        setMousePosition(mousePos);
        
        // Call the original mouse move handler
        handleMouseMove(event);
    }, [handleMouseMove]);

    /**
     * Initialize canvas
     */
    const initializeCanvas = React.useCallback(() => {
        if (!canvasRef.current || !containerRef.current || !image) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();

        // Calculate canvas dimensions based on image aspect ratio
        // but constrained by container size
        const imageAspectRatio = image.width / image.height;
        const containerWidth = containerRect.width || CANVAS_CONFIG.DEFAULT_SIZE;
        const containerHeight = containerRect.height || CANVAS_CONFIG.DEFAULT_SIZE;
        
        let canvasWidth, canvasHeight;
        
        // Calculate canvas size to fit image aspect ratio within container
        if (imageAspectRatio > 1) {
            // Image is wider - try to fit width first
            canvasWidth = Math.min(containerWidth * 0.9, CANVAS_CONFIG.MAX_SIZE); // 90% of container width
            canvasHeight = canvasWidth / imageAspectRatio;
            
            // If height is too big, scale down
            if (canvasHeight > containerHeight * 0.9) {
                canvasHeight = containerHeight * 0.9;
                canvasWidth = canvasHeight * imageAspectRatio;
            }
        } else {
            // Image is taller or square - try to fit height first
            canvasHeight = Math.min(containerHeight * 0.9, CANVAS_CONFIG.MAX_SIZE); // 90% of container height
            canvasWidth = canvasHeight * imageAspectRatio;
            
            // If width is too big, scale down
            if (canvasWidth > containerWidth * 0.9) {
                canvasWidth = containerWidth * 0.9;
                canvasHeight = canvasWidth / imageAspectRatio;
            }
        }

        // Ensure minimum size
        const minSize = Math.min(CANVAS_CONFIG.MIN_SIZE, Math.min(containerWidth, containerHeight) * 0.5);
        canvasWidth = Math.max(canvasWidth, minSize);
        canvasHeight = Math.max(canvasHeight, minSize);

        const dimensions = {
            width: Math.round(canvasWidth),
            height: Math.round(canvasHeight)
        };

        setCanvasDimensions(dimensions);

        // Setup canvas with optimal settings
        const ctx = CanvasHelpers.setupCanvas(
            canvasRef.current,
            dimensions.width,
            dimensions.height
        );

        if (ctx) {
            setIsCanvasReady(true);
        }
    }, [image]);

    /**
     * Handle window resize to update canvas dimensions
     */
    const handleResize = React.useCallback(() => {
        initializeCanvas();
    }, [initializeCanvas]);

    // Initialize canvas on mount and image change
    useEffect(() => {
        initializeCanvas();
    }, [initializeCanvas, image]);

    // Handle window resize
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Add non-passive wheel event listener
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const wheelHandler = (e: WheelEvent) => {
            e.preventDefault();
            // Convert to React event-like object
            const syntheticEvent = {
                preventDefault: () => {},
                deltaY: e.deltaY,
                currentTarget: canvas
            } as React.WheelEvent<HTMLCanvasElement>;
            
            handleWheel(syntheticEvent);
        };

        canvas.addEventListener('wheel', wheelHandler, { passive: false });
        return () => canvas.removeEventListener('wheel', wheelHandler);
    }, [handleWheel]);

    // Redraw when ready
    useEffect(() => {
        if (isCanvasReady) {
            redrawCanvas();
        }
    }, [isCanvasReady, redrawCanvas]);

    /**
     * Get current cursor based on interaction state and mouse position
     */
    const getCurrentCursor = (): string => {
        if (interactionState.isDragging) {
            return 'grabbing';
        }
        if (interactionState.isResizing) {
            // Return appropriate resize cursor based on handle
            switch (interactionState.resizeHandle) {
                case 'top-left':
                case 'bottom-right':
                    return 'nw-resize';
                case 'top-right':
                case 'bottom-left':
                    return 'ne-resize';
                default:
                    return 'grab';
            }
        }

        // Check if mouse is over a resize handle (when not actively resizing)
        if (mousePosition && isCanvasReady) {
            // We need to get the current image rect and scale to check handle positions
            // This is a bit tricky since we don't have direct access to these values
            // Let's use CanvasHelpers to detect handle at current mouse position
            
            // Create a temporary image rect based on canvas dimensions
            // This is an approximation - ideally we'd get this from the hook
            const canvas = canvasRef.current;
            if (canvas && image) {
                // Calculate approximate image rect (simplified)
                const imageAspectRatio = image.width / image.height;
                const canvasAspectRatio = canvas.width / canvas.height;
                
                let drawWidth, drawHeight, drawX, drawY;
                
                if (imageAspectRatio > canvasAspectRatio) {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / imageAspectRatio;
                } else {
                    drawHeight = canvas.height;
                    drawWidth = canvas.height * imageAspectRatio;
                }
                
                drawX = (canvas.width - drawWidth) / 2;
                drawY = (canvas.height - drawHeight) / 2;
                
                const imageRect = { x: drawX, y: drawY, width: drawWidth, height: drawHeight };
                const scale = drawWidth / image.width;
                
                const handleAtPoint = CanvasHelpers.getResizeHandleAtPoint(
                    mousePosition,
                    cropArea,
                    imageRect,
                    scale
                );
                
                if (handleAtPoint) {
                    switch (handleAtPoint) {
                        case 'top-left':
                        case 'bottom-right':
                            return 'nw-resize';
                        case 'top-right':
                        case 'bottom-left':
                            return 'ne-resize';
                        default:
                            return 'grab';
                    }
                }
            }
        }

        return 'grab';
    };

    return (
        <div 
            ref={containerRef}
            className={`crop-canvas-container relative flex items-center justify-center ${className}`}
            style={{ width: '100%', height: '400px', minHeight: '300px' }}
        >
            {/* Canvas element */}
            <canvas
                ref={canvasRef}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                className="border border-gray-300 rounded"
                style={{ 
                    cursor: getCurrentCursor(),
                    touchAction: 'none' // Prevent default touch behaviors
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                tabIndex={0} // Make canvas focusable for keyboard events
            />

            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
                <p>🖱️ Drag to move • 📏 Drag corners to resize</p>
            </div>

            {/* Crop info */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded text-sm">
                <p>Size: {Math.round(cropArea.width)}×{Math.round(cropArea.height)}</p>
            </div>
        </div>
    );
};