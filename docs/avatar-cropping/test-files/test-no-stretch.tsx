/**
 * Test component to verify no image stretching
 * Simple test to check that images display with correct proportions
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestNoStretch: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageInfo, setImageInfo] = useState<{ width: number; height: number; ratio: number } | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            
            // Get image info
            const img = new Image();
            img.onload = () => {
                setImageInfo({
                    width: img.width,
                    height: img.height,
                    ratio: img.width / img.height
                });
                setShowCropper(true);
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const handleCropComplete = (result: CropResult) => {
        setShowCropper(false);
        console.log('Crop completed:', result);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedFile(null);
        setImageInfo(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Pas d'Étirement</h1>
            
            {/* File input */}
            <div className="mb-6">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Image info */}
            {imageInfo && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Info Image :</h2>
                    <div className="text-blue-800">
                        <p><strong>Dimensions :</strong> {imageInfo.width} × {imageInfo.height}</p>
                        <p><strong>Ratio :</strong> {imageInfo.ratio.toFixed(2)} ({
                            imageInfo.ratio > 1.5 ? 'Très Paysage' :
                            imageInfo.ratio > 1.1 ? 'Paysage' :
                            imageInfo.ratio > 0.9 ? 'Carré' :
                            imageInfo.ratio > 0.6 ? 'Portrait' : 'Très Portrait'
                        })</p>
                    </div>
                </div>
            )}

            {/* Simple test instructions */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">Test Simple :</h2>
                <ol className="text-green-800 space-y-1 list-decimal list-inside">
                    <li>Sélectionnez une image rectangulaire (pas carrée)</li>
                    <li>Ouvrez le cropper</li>
                    <li>Vérifiez visuellement que l'image n'est pas étirée</li>
                    <li>Les cercles doivent être ronds, les carrés carrés, etc.</li>
                </ol>
            </div>

            {/* Quick visual checks */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">Vérifications Visuelles :</h2>
                <ul className="text-yellow-800 space-y-1">
                    <li>• Les visages ne sont pas déformés</li>
                    <li>• Les cercles restent ronds</li>
                    <li>• Les carrés restent carrés</li>
                    <li>• Le texte n'est pas étiré</li>
                    <li>• Les proportions semblent naturelles</li>
                </ul>
            </div>

            {/* Cropper modal */}
            {showCropper && selectedFile && (
                <AvatarCropper
                    imageFile={selectedFile}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    options={{
                        outputSize: 256,
                        minCropSize: 50
                    }}
                />
            )}
        </div>
    );
};

export default TestNoStretch;