/**
 * useCropCanvas hook - Traditional cropping with movable crop area
 * Display full image with movable and resizable crop area overlay
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { CanvasInteractionState, ResizeHandle } from '../../components/cropping/types';
import { UseCropCanvasOptions, UseCropCanvasReturn } from './types';
import { CanvasHelpers } from '../../utils/cropping';

export function useCropCanvas(options: UseCropCanvasOptions): UseCropCanvasReturn {
    const {
        canvasRef,
        cropState,
        onCropAreaChange,
        disabled = false
    } = options;

    // State for interactions
    const [interactionState, setInteractionState] = useState<CanvasInteractionState>({
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        lastPosition: null,
        startPosition: null,
        startCropArea: null
    });

    // Refs for image drawing state
    const imageRectRef = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
    const scaleRef = useRef(1.0);
    const lastRenderTimeRef = useRef(0);

    /**
     * Redraw canvas with current state
     */
    const redrawCanvas = useCallback(() => {
        if (!canvasRef.current || !cropState.image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Throttle rendering for performance
        const now = performance.now();
        if (now - lastRenderTimeRef.current < 16) return; // 60 FPS limit
        lastRenderTimeRef.current = now;

        // Draw full image preserving aspect ratio
        const result = CanvasHelpers.drawFullImage(
            ctx,
            cropState.image,
            { width: canvas.width, height: canvas.height }
        );

        // Store image rect and scale for coordinate calculations
        imageRectRef.current = result.imageRect;
        scaleRef.current = result.scale;

        // Draw crop area overlay (handles are always visible now)
        CanvasHelpers.drawCropOverlay(
            ctx,
            cropState.cropArea,
            result.imageRect,
            result.scale,
            interactionState.isDragging || interactionState.isResizing
        );
    }, [canvasRef, cropState.image, cropState.cropArea, interactionState.isDragging, interactionState.isResizing]);

    /**
     * Get canvas coordinates from client coordinates
     */
    const getCanvasCoordinates = useCallback((clientX: number, clientY: number) => {
        if (!canvasRef.current) return { x: 0, y: 0 };

        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }, [canvasRef]);

    /**
     * Handle mouse down events - start dragging or resizing crop area
     */
    const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabled || !cropState.image) return;

        event.preventDefault();
        const canvasCoords = getCanvasCoordinates(event.clientX, event.clientY);

        // Check for resize handle first (only corners)
        const resizeHandle = CanvasHelpers.getResizeHandleAtPoint(
            canvasCoords,
            cropState.cropArea,
            imageRectRef.current,
            scaleRef.current
        ) as ResizeHandle | null;

        if (resizeHandle) {
            // Start resizing
            setInteractionState({
                isDragging: false,
                isResizing: true,
                resizeHandle,
                lastPosition: canvasCoords,
                startPosition: canvasCoords,
                startCropArea: { ...cropState.cropArea }
            });
        } else if (CanvasHelpers.isPointInCropArea(
            canvasCoords,
            cropState.cropArea,
            imageRectRef.current,
            scaleRef.current
        )) {
            // Start dragging crop area
            setInteractionState({
                isDragging: true,
                isResizing: false,
                resizeHandle: null,
                lastPosition: canvasCoords,
                startPosition: canvasCoords,
                startCropArea: { ...cropState.cropArea }
            });
        }
    }, [disabled, cropState.image, cropState.cropArea, getCanvasCoordinates]);

    /**
     * Handle mouse move events - drag or resize crop area (always square)
     */
    const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabled || !cropState.image) return;

        const canvasCoords = getCanvasCoordinates(event.clientX, event.clientY);

        if (interactionState.isResizing && interactionState.resizeHandle && interactionState.startCropArea && interactionState.startPosition) {
            // Handle resizing - maintain square aspect ratio
            const deltaX = canvasCoords.x - interactionState.startPosition.x;
            const deltaY = canvasCoords.y - interactionState.startPosition.y;

            // Convert canvas deltas to image coordinates
            const imageDeltaX = deltaX / scaleRef.current;
            const imageDeltaY = deltaY / scaleRef.current;

            let newCropArea = { ...interactionState.startCropArea };
            let newSize = Math.min(newCropArea.width, newCropArea.height);

            // Calculate new size based on corner handle (only corners for square crop)
            switch (interactionState.resizeHandle) {
                case 'top-left':
                    const deltaTopLeft = Math.max(imageDeltaX, imageDeltaY);
                    newSize = newCropArea.width - deltaTopLeft;
                    newCropArea.x = interactionState.startCropArea.x + deltaTopLeft;
                    newCropArea.y = interactionState.startCropArea.y + deltaTopLeft;
                    break;
                case 'top-right':
                    const deltaTopRight = Math.max(imageDeltaX, -imageDeltaY);
                    newSize = newCropArea.width + deltaTopRight;
                    newCropArea.y = interactionState.startCropArea.y - deltaTopRight;
                    break;
                case 'bottom-left':
                    const deltaBottomLeft = Math.max(-imageDeltaX, imageDeltaY);
                    newSize = newCropArea.width + deltaBottomLeft;
                    newCropArea.x = interactionState.startCropArea.x - deltaBottomLeft;
                    break;
                case 'bottom-right':
                    const deltaBottomRight = Math.max(imageDeltaX, imageDeltaY);
                    newSize = newCropArea.width + deltaBottomRight;
                    break;
            }

            // Ensure minimum size
            const minSize = 50;
            newSize = Math.max(minSize, newSize);

            // Apply square dimensions
            newCropArea.width = newSize;
            newCropArea.height = newSize;

            // Constrain to image bounds
            newCropArea.x = Math.max(0, newCropArea.x);
            newCropArea.y = Math.max(0, newCropArea.y);
            
            // Ensure crop area doesn't extend beyond image
            if (newCropArea.x + newCropArea.width > cropState.image.width) {
                newCropArea.x = cropState.image.width - newCropArea.width;
            }
            if (newCropArea.y + newCropArea.height > cropState.image.height) {
                newCropArea.y = cropState.image.height - newCropArea.height;
            }

            // Final check - if crop area is too big, scale it down
            const maxSize = Math.min(
                cropState.image.width - newCropArea.x,
                cropState.image.height - newCropArea.y
            );
            if (newCropArea.width > maxSize) {
                newCropArea.width = maxSize;
                newCropArea.height = maxSize;
            }

            onCropAreaChange?.(newCropArea);

        } else if (interactionState.isDragging && interactionState.lastPosition) {
            // Handle dragging - keep square dimensions
            const deltaX = canvasCoords.x - interactionState.lastPosition.x;
            const deltaY = canvasCoords.y - interactionState.lastPosition.y;

            // Convert canvas deltas to image coordinates
            const imageDeltaX = deltaX / scaleRef.current;
            const imageDeltaY = deltaY / scaleRef.current;

            const newCropArea = {
                ...cropState.cropArea,
                x: Math.max(0, Math.min(cropState.image.width - cropState.cropArea.width, cropState.cropArea.x + imageDeltaX)),
                y: Math.max(0, Math.min(cropState.image.height - cropState.cropArea.height, cropState.cropArea.y + imageDeltaY))
            };

            onCropAreaChange?.(newCropArea);
        }

        // Update interaction state
        setInteractionState(prev => ({
            ...prev,
            lastPosition: canvasCoords
        }));

    }, [disabled, cropState.image, cropState.cropArea, interactionState, getCanvasCoordinates, onCropAreaChange]);

    /**
     * Handle mouse up events - stop dragging or resizing
     */
    const handleMouseUp = useCallback(() => {
        if (interactionState.isDragging || interactionState.isResizing) {
            setInteractionState({
                isDragging: false,
                isResizing: false,
                resizeHandle: null,
                lastPosition: null,
                startPosition: null,
                startCropArea: null
            });
        }
    }, [interactionState.isDragging, interactionState.isResizing]);

    /**
     * Handle wheel events - not used in traditional cropping
     */
    const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
        // Traditional cropping doesn't use zoom - crop area size controls the zoom level
        event.preventDefault();
    }, []);

    /**
     * Handle touch start events
     */
    const handleTouchStart = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        if (disabled || !cropState.image || event.touches.length === 0) return;

        event.preventDefault();
        const touch = event.touches[0];
        const canvasCoords = getCanvasCoordinates(touch.clientX, touch.clientY);

        // Check for resize handle first
        const resizeHandle = CanvasHelpers.getResizeHandleAtPoint(
            canvasCoords,
            cropState.cropArea,
            imageRectRef.current,
            scaleRef.current
        ) as ResizeHandle | null;

        if (resizeHandle) {
            setInteractionState({
                isDragging: false,
                isResizing: true,
                resizeHandle,
                lastPosition: canvasCoords,
                startPosition: canvasCoords,
                startCropArea: { ...cropState.cropArea }
            });
        } else if (CanvasHelpers.isPointInCropArea(
            canvasCoords,
            cropState.cropArea,
            imageRectRef.current,
            scaleRef.current
        )) {
            setInteractionState({
                isDragging: true,
                isResizing: false,
                resizeHandle: null,
                lastPosition: canvasCoords,
                startPosition: canvasCoords,
                startCropArea: { ...cropState.cropArea }
            });
        }
    }, [disabled, cropState.image, cropState.cropArea, getCanvasCoordinates]);

    /**
     * Handle touch move events
     */
    const handleTouchMove = useCallback((event: React.TouchEvent<HTMLCanvasElement>) => {
        if (disabled || !cropState.image || event.touches.length === 0) return;

        event.preventDefault();
        const touch = event.touches[0];

        // Use same logic as mouse move
        const syntheticEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY
        } as React.MouseEvent<HTMLCanvasElement>;

        handleMouseMove(syntheticEvent);
    }, [disabled, cropState.image, handleMouseMove]);

    /**
     * Handle touch end events
     */
    const handleTouchEnd = useCallback(() => {
        setInteractionState({
            isDragging: false,
            isResizing: false,
            resizeHandle: null,
            lastPosition: null,
            startPosition: null,
            startCropArea: null
        });
    }, []);

    // Redraw when crop state changes
    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas, cropState]);

    // Initialize crop area when image changes
    useEffect(() => {
        if (cropState.image && cropState.image.src) {
            // Set initial crop area to center square if not already set
            if (cropState.cropArea.width === 0 || cropState.cropArea.height === 0) {
                // Calculate the largest possible square that fits in the image
                const maxSquareSize = Math.min(cropState.image.width, cropState.image.height) * 0.8;
                const x = (cropState.image.width - maxSquareSize) / 2;
                const y = (cropState.image.height - maxSquareSize) / 2;
                
                onCropAreaChange?.({
                    x,
                    y,
                    width: maxSquareSize,
                    height: maxSquareSize // Always square
                });
            } else {
                // Ensure existing crop area is square
                const size = Math.min(cropState.cropArea.width, cropState.cropArea.height);
                const x = cropState.cropArea.x;
                const y = cropState.cropArea.y;
                
                // Adjust position if square doesn't fit
                const adjustedX = Math.min(x, cropState.image.width - size);
                const adjustedY = Math.min(y, cropState.image.height - size);
                
                onCropAreaChange?.({
                    x: Math.max(0, adjustedX),
                    y: Math.max(0, adjustedY),
                    width: size,
                    height: size // Always square
                });
            }
            redrawCanvas();
        }
    }, [cropState.image, cropState.cropArea.width, cropState.cropArea.height, onCropAreaChange, redrawCanvas]);

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        redrawCanvas,
        getCanvasCoordinates,
        interactionState
    };
}