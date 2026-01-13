/**
 * Test component for crop fixes - image deformation and resize handles
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestCropFixes: React.FC = () => {
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
            <h1 className="text-2xl font-bold mb-6">Test des Corrections de Crop</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour tester :
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Test checklist */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">Tests à effectuer :</h2>
                <ul className="text-yellow-800 space-y-2">
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ L'image s'affiche sans déformation (aspect ratio préservé)</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Le cadre de sélection peut être déplacé en cliquant à l'intérieur</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Les poignées de redimensionnement sont visibles aux coins</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Les poignées de redimensionnement fonctionnent (drag corners)</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Les poignées sur les bords fonctionnent (drag edges)</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Le preview se met à jour en temps réel</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Le curseur change selon l'action (grab, resize cursors)</span>
                    </li>
                </ul>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Instructions :</h2>
                <ol className="text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Sélectionnez une image (de préférence rectangulaire pour tester la déformation)</li>
                    <li>Vérifiez que l'image s'affiche correctement sans étirement</li>
                    <li>Cliquez à l'intérieur du cadre et faites glisser pour le déplacer</li>
                    <li>Cliquez sur les coins du cadre et faites glisser pour redimensionner</li>
                    <li>Cliquez sur les bords du cadre et faites glisser pour redimensionner</li>
                    <li>Vérifiez que le preview se met à jour</li>
                </ol>
            </div>

            {/* Crop result */}
            {cropResult && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-green-900 mb-2">Résultat du Crop :</h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={cropResult.croppedImageUrl}
                            alt="Résultat cropé"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-green-300"
                        />
                        <div className="text-green-800">
                            <p><strong>Dimensions:</strong> {cropResult.finalDimensions.width}×{cropResult.finalDimensions.height}px</p>
                            <p><strong>Qualité:</strong> {cropResult.quality}</p>
                            <p><strong>Taille fichier:</strong> {Math.round(cropResult.croppedImageBlob.size / 1024)}KB</p>
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

export default TestCropFixes;