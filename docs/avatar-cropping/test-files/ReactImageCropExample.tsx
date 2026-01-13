/**
 * Exemple d'implémentation avec react-image-crop
 * Remplace tout notre code custom par une librairie mature
 */

import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ReactImageCropExampleProps {
    imageFile: File;
    onCropComplete: (croppedImageBlob: Blob) => void;
    onCancel: () => void;
}

export const ReactImageCropExample: React.FC<ReactImageCropExampleProps> = ({
    imageFile,
    onCropComplete,
    onCancel
}) => {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null);

    // Load image
    React.useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(imageFile);
    }, [imageFile]);

    // Generate cropped image
    const generateCroppedImage = async () => {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        canvas.toBlob((blob) => {
            if (blob) onCropComplete(blob);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
                <h2 className="text-xl font-bold mb-4">Crop Avatar (react-image-crop)</h2>
                
                {imageSrc && (
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={1} // Force square aspect ratio
                        minWidth={50}
                        minHeight={50}
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            style={{ maxWidth: '100%', maxHeight: '70vh' }}
                        />
                    </ReactCrop>
                )}

                <div className="flex justify-end space-x-4 mt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={generateCroppedImage}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={!completedCrop}
                    >
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
};