/**
 * Test component for traditional cropping functionality
 * This component tests the new traditional cropping logic
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestTraditionalCropping: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropResult, setCropResult] = useState<CropResult | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setShowCropper(true);
        }
    };

    const handleCropComplete = (result: CropResult) => {
        setCropResult(result);
        setShowCropper(false);
        console.log('Crop completed:', result);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedFile(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Traditional Cropping</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select an image to test cropping:
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Traditional Cropping Features:</h2>
                <ul className="text-blue-800 space-y-1">
                    <li>• Full image is displayed without deformation</li>
                    <li>• Movable crop area overlay</li>
                    <li>• Resizable crop area with corner and edge handles</li>
                    <li>• Real-time preview of cropped result</li>
                    <li>• Drag crop area to move it</li>
                    <li>• Drag handles to resize crop area</li>
                </ul>
            </div>

            {/* Crop result */}
            {cropResult && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-green-900 mb-2">Crop Result:</h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={cropResult.croppedImageUrl}
                            alt="Cropped result"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-green-300"
                        />
                        <div className="text-green-800">
                            <p><strong>Dimensions:</strong> {cropResult.finalDimensions.width}×{cropResult.finalDimensions.height}px</p>
                            <p><strong>Quality:</strong> {cropResult.quality}</p>
                            <p><strong>File size:</strong> {Math.round(cropResult.croppedImageBlob.size / 1024)}KB</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cropper modal */}
            {showCropper && selectedFile && (
                <AvatarCropper
                    imageFile={selectedFile}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    options={{
                        outputSize: 256,
                        minCropSize: 50,
                        maxScale: 3.0
                    }}
                />
            )}
        </div>
    );
};

export default TestTraditionalCropping;