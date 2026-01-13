/**
 * CanvasHelpers utility class for traditional cropping
 * Display full image with movable crop area overlay
 */

import { 
    CropArea, 
    ImageDimensions 
} from '../../components/cropping/types';
import { 
    CANVAS_CONFIG, 
    PERFORMANCE_CONFIG 
} from './constants';

export class CanvasHelpers {
    private static performanceMetrics = {
        renderTime: 0,
        isPerformant: true
    };

    /**
     * Setup canvas with optimal settings
     */
    static setupCanvas(
        canvas: HTMLCanvasElement,
        width: number,
        height: number
    ): CanvasRenderingContext2D | null {
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable high DPI support
        const devicePixelRatio = window.devicePixelRatio || 1;
        if (devicePixelRatio > 1) {
            canvas.width = width * devicePixelRatio;
            canvas.height = height * devicePixelRatio;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.scale(devicePixelRatio, devicePixelRatio);
        }

        // Set optimal rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        return ctx;
    }

    /**
     * Calculate responsive canvas dimensions
     */
    static calculateCanvasDimensions(
        containerWidth: number,
        containerHeight: number,
        maxWidth: number = CANVAS_CONFIG.MAX_SIZE,
        maxHeight: number = CANVAS_CONFIG.MAX_SIZE
    ): ImageDimensions {
        // Use container dimensions directly, respecting max limits
        let width = Math.min(containerWidth, maxWidth);
        let height = Math.min(containerHeight, maxHeight);

        // Ensure minimum size
        width = Math.max(width, CANVAS_CONFIG.MIN_SIZE);
        height = Math.max(height, CANVAS_CONFIG.MIN_SIZE);

        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * Draw full image on canvas preserving aspect ratio
     * The image will fit completely within the canvas without deformation
     */
    static drawFullImage(
        ctx: CanvasRenderingContext2D,
        image: HTMLImageElement,
        canvasDimensions: ImageDimensions
    ): { imageRect: { x: number; y: number; width: number; height: number }; scale: number } {
        const startTime = performance.now();

        // Clear canvas
        ctx.clearRect(0, 0, canvasDimensions.width, canvasDimensions.height);

        // Fill background
        ctx.fillStyle = CANVAS_CONFIG.BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvasDimensions.width, canvasDimensions.height);

        // Calculate how to fit the image in the canvas while preserving aspect ratio
        const imageAspectRatio = image.width / image.height;
        const canvasAspectRatio = canvasDimensions.width / canvasDimensions.height;

        let drawWidth, drawHeight;
        
        if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider relative to canvas - fit to canvas width
            drawWidth = canvasDimensions.width;
            drawHeight = canvasDimensions.width / imageAspectRatio;
        } else {
            // Image is taller relative to canvas - fit to canvas height
            drawHeight = canvasDimensions.height;
            drawWidth = canvasDimensions.height * imageAspectRatio;
        }

        // Center the image in the canvas
        const drawX = (canvasDimensions.width - drawWidth) / 2;
        const drawY = (canvasDimensions.height - drawHeight) / 2;

        // Draw image centered and fitted
        ctx.drawImage(
            image,
            drawX,
            drawY,
            drawWidth,
            drawHeight
        );

        // Calculate scale factor (canvas pixels to image pixels)
        const scale = drawWidth / image.width;

        // Update performance metrics
        this.performanceMetrics.renderTime = performance.now() - startTime;
        this.performanceMetrics.isPerformant = this.performanceMetrics.renderTime < PERFORMANCE_CONFIG.MAX_RENDER_TIME;

        return {
            imageRect: { x: drawX, y: drawY, width: drawWidth, height: drawHeight },
            scale
        };
    }

    /**
     * Draw crop area overlay on top of image
     */
    static drawCropOverlay(
        ctx: CanvasRenderingContext2D,
        cropArea: CropArea,
        imageRect: { x: number; y: number; width: number; height: number },
        scale: number,
        isActive: boolean = false
    ): void {
        // Convert crop area from image coordinates to canvas coordinates
        const canvasCropArea = {
            x: imageRect.x + (cropArea.x * scale),
            y: imageRect.y + (cropArea.y * scale),
            width: cropArea.width * scale,
            height: cropArea.height * scale
        };

        // Draw semi-transparent overlay outside crop area
        this.drawOverlay(ctx, canvasCropArea, ctx.canvas.width, ctx.canvas.height);

        // Draw crop area border
        this.drawCropBorder(ctx, canvasCropArea, isActive);

        // Always draw resize handles (not just when active)
        this.drawResizeHandles(ctx, canvasCropArea);

        // Draw grid lines
        this.drawGridLines(ctx, canvasCropArea);
    }

    /**
     * Draw semi-transparent overlay outside crop area
     */
    private static drawOverlay(
        ctx: CanvasRenderingContext2D,
        cropArea: { x: number; y: number; width: number; height: number },
        canvasWidth: number,
        canvasHeight: number
    ): void {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        // Draw overlay in four rectangles around the crop area
        // Top
        ctx.fillRect(0, 0, canvasWidth, cropArea.y);
        // Bottom
        ctx.fillRect(0, cropArea.y + cropArea.height, canvasWidth, canvasHeight - (cropArea.y + cropArea.height));
        // Left
        ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height);
        // Right
        ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, canvasWidth - (cropArea.x + cropArea.width), cropArea.height);

        ctx.restore();
    }

    /**
     * Draw crop area border
     */
    private static drawCropBorder(
        ctx: CanvasRenderingContext2D,
        cropArea: { x: number; y: number; width: number; height: number },
        isActive: boolean
    ): void {
        ctx.save();
        ctx.strokeStyle = isActive ? CANVAS_CONFIG.CROP_BORDER_COLOR : '#ffffff';
        ctx.lineWidth = CANVAS_CONFIG.CROP_BORDER_WIDTH;
        ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
        ctx.restore();
    }

    /**
     * Draw resize handles on crop area corners (always visible)
     */
    private static drawResizeHandles(
        ctx: CanvasRenderingContext2D,
        cropArea: { x: number; y: number; width: number; height: number }
    ): void {
        const handleSize = CANVAS_CONFIG.HANDLE_SIZE;
        const halfHandle = handleSize / 2;

        // Only draw corner handles for square crop area
        const handles = [
            // 4 corners only
            { x: cropArea.x - halfHandle, y: cropArea.y - halfHandle }, // top-left
            { x: cropArea.x + cropArea.width - halfHandle, y: cropArea.y - halfHandle }, // top-right
            { x: cropArea.x - halfHandle, y: cropArea.y + cropArea.height - halfHandle }, // bottom-left
            { x: cropArea.x + cropArea.width - halfHandle, y: cropArea.y + cropArea.height - halfHandle } // bottom-right
        ];

        ctx.save();
        ctx.fillStyle = CANVAS_CONFIG.HANDLE_COLOR;
        ctx.strokeStyle = CANVAS_CONFIG.HANDLE_BORDER_COLOR;
        ctx.lineWidth = 1;

        handles.forEach(handle => {
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });

        ctx.restore();
    }

    /**
     * Draw grid lines inside crop area
     */
    private static drawGridLines(
        ctx: CanvasRenderingContext2D,
        cropArea: { x: number; y: number; width: number; height: number }
    ): void {
        ctx.save();
        ctx.strokeStyle = CANVAS_CONFIG.GRID_COLOR;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Rule of thirds lines
        const thirdWidth = cropArea.width / 3;
        const thirdHeight = cropArea.height / 3;

        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(cropArea.x + thirdWidth, cropArea.y);
        ctx.lineTo(cropArea.x + thirdWidth, cropArea.y + cropArea.height);
        ctx.moveTo(cropArea.x + thirdWidth * 2, cropArea.y);
        ctx.lineTo(cropArea.x + thirdWidth * 2, cropArea.y + cropArea.height);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(cropArea.x, cropArea.y + thirdHeight);
        ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + thirdHeight);
        ctx.moveTo(cropArea.x, cropArea.y + thirdHeight * 2);
        ctx.lineTo(cropArea.x + cropArea.width, cropArea.y + thirdHeight * 2);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Convert canvas coordinates to image coordinates
     */
    static canvasToImageCoordinates(
        canvasPoint: { x: number; y: number },
        imageRect: { x: number; y: number; width: number; height: number },
        imageDimensions: ImageDimensions
    ): { x: number; y: number } {
        // Convert canvas coordinates to image coordinates
        const relativeX = (canvasPoint.x - imageRect.x) / imageRect.width;
        const relativeY = (canvasPoint.y - imageRect.y) / imageRect.height;

        return {
            x: Math.max(0, Math.min(imageDimensions.width, relativeX * imageDimensions.width)),
            y: Math.max(0, Math.min(imageDimensions.height, relativeY * imageDimensions.height))
        };
    }

    /**
     * Check if point is inside crop area
     */
    static isPointInCropArea(
        point: { x: number; y: number },
        cropArea: CropArea,
        imageRect: { x: number; y: number; width: number; height: number },
        scale: number
    ): boolean {
        const canvasCropArea = {
            x: imageRect.x + (cropArea.x * scale),
            y: imageRect.y + (cropArea.y * scale),
            width: cropArea.width * scale,
            height: cropArea.height * scale
        };

        return point.x >= canvasCropArea.x && 
               point.x <= canvasCropArea.x + canvasCropArea.width &&
               point.y >= canvasCropArea.y && 
               point.y <= canvasCropArea.y + canvasCropArea.height;
    }

    /**
     * Get resize handle at point (corners only for square crop)
     */
    static getResizeHandleAtPoint(
        point: { x: number; y: number },
        cropArea: CropArea,
        imageRect: { x: number; y: number; width: number; height: number },
        scale: number,
        handleSize: number = CANVAS_CONFIG.HANDLE_SIZE
    ): string | null {
        const canvasCropArea = {
            x: imageRect.x + (cropArea.x * scale),
            y: imageRect.y + (cropArea.y * scale),
            width: cropArea.width * scale,
            height: cropArea.height * scale
        };

        const halfHandle = handleSize / 2;
        
        // Only check corner handles for square crop area
        const handles = [
            { name: 'top-left', x: canvasCropArea.x - halfHandle, y: canvasCropArea.y - halfHandle },
            { name: 'top-right', x: canvasCropArea.x + canvasCropArea.width - halfHandle, y: canvasCropArea.y - halfHandle },
            { name: 'bottom-left', x: canvasCropArea.x - halfHandle, y: canvasCropArea.y + canvasCropArea.height - halfHandle },
            { name: 'bottom-right', x: canvasCropArea.x + canvasCropArea.width - halfHandle, y: canvasCropArea.y + canvasCropArea.height - halfHandle }
        ];

        for (const handle of handles) {
            if (point.x >= handle.x && point.x <= handle.x + handleSize &&
                point.y >= handle.y && point.y <= handle.y + handleSize) {
                return handle.name;
            }
        }

        return null;
    }

    /**
     * Get performance metrics
     */
    static getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
}