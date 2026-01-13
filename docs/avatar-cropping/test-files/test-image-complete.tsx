/**
 * Test component to verify that the complete image is visible
 * Tests that the entire image is displayed without cropping
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestImageComplete: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropResult, setCropResult] = useState<CropResult | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            
            // Create URL for original image comparison
            const url = URL.createObjectURL(file);
            setOriginalImageUrl(url);
            
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
        if (originalImageUrl) {
            URL.revokeObjectURL(originalImageUrl);
            setOriginalImageUrl(null);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Image Complète Visible</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour vérifier qu'elle s'affiche complètement :
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
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Instructions de Test :</h2>
                <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Sélectionnez une image avec des détails reconnaissables aux bords</li>
                    <li>Ouvrez le cropper et vérifiez que TOUTE l'image est visible</li>
                    <li>Comparez avec l'image originale ci-dessous</li>
                    <li>Vérifiez qu'aucune partie n'est coupée</li>
                    <li>Vérifiez que l'image n'est pas déformée</li>
                </ol>
            </div>

            {/* Original image for comparison */}
            {originalImageUrl && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Image Originale (pour comparaison) :</h2>
                    <div className="flex justify-center">
                        <img
                            src={originalImageUrl}
                            alt="Image originale"
                            className="max-w-md max-h-64 object-contain border border-gray-300 rounded"
                        />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 text-center">
                        Cette image doit être entièrement visible dans le cropper (sans parties coupées)
                    </p>
                </div>
            )}

            {/* Checklist */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">Checklist de Vérification :</h2>
                <ul className="text-green-800 space-y-2">
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ L'image complète est visible dans le cropper</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Aucune partie de l'image n'est coupée sur les bords</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ L'image n'est pas déformée (aspect ratio préservé)</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ L'image est centrée dans le canvas</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ La zone de crop fonctionne sur toute l'image</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Le redimensionnement de la zone de crop fonctionne</span>
                    </li>
                </ul>
            </div>

            {/* Test scenarios */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">Scénarios à Tester :</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded border">
                        <strong>📐 Image Paysage</strong>
                        <p className="text-sm text-yellow-800">Ex: 1920×1080 - Vérifiez que les bords gauche et droit sont visibles</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                        <strong>📱 Image Portrait</strong>
                        <p className="text-sm text-yellow-800">Ex: 1080×1920 - Vérifiez que les bords haut et bas sont visibles</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                        <strong>⬜ Image Carrée</strong>
                        <p className="text-sm text-yellow-800">Ex: 1000×1000 - Vérifiez que tous les bords sont visibles</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                        <strong>🖼️ Image avec Texte</strong>
                        <p className="text-sm text-yellow-800">Utilisez une image avec du texte aux bords pour vérifier</p>
                    </div>
                </div>
            </div>

            {/* Crop result */}
            {cropResult && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-purple-900 mb-2">Résultat du Crop :</h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={cropResult.croppedImageUrl}
                            alt="Résultat cropé"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-purple-300"
                        />
                        <div className="text-purple-800">
                            <p><strong>Dimensions finales :</strong> {cropResult.finalDimensions.width}×{cropResult.finalDimensions.height}px</p>
                            <p><strong>Qualité :</strong> {cropResult.quality}</p>
                            <p><strong>Taille fichier :</strong> {Math.round(cropResult.croppedImageBlob.size / 1024)}KB</p>
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

export default TestImageComplete;