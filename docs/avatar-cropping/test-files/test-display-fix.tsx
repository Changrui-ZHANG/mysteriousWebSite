/**
 * Test pour vérifier que la photo et le cadre de sélection s'affichent correctement
 * Tests that the image and crop selection display properly
 */

import React, { useState } from 'react';
import { AvatarCropper } from '../../../client/src/domain/profile/components/cropping/AvatarCropper';

export const TestDisplayFix: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setShowCropper(true);
        }
    };

    const handleCropComplete = (result: any) => {
        console.log('Crop completed:', result);
        setShowCropper(false);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedFile(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Affichage Photo et Cadre</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour tester l'affichage :
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Test checklist */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">✅ Checklist de Test :</h2>
                <div className="text-blue-800 space-y-2">
                    <p><strong>1. Image s'affiche</strong> - L'image doit apparaître immédiatement</p>
                    <p><strong>2. Cadre de sélection apparaît</strong> - Le cadre carré doit apparaître après le chargement</p>
                    <p><strong>3. Cadre est carré</strong> - Le cadre doit être parfaitement carré</p>
                    <p><strong>4. Cadre est centré</strong> - Le cadre doit être au centre de l'image</p>
                    <p><strong>5. Handles visibles</strong> - Les 4 coins de redimensionnement doivent être visibles</p>
                </div>
            </div>

            {/* Expected sequence */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">🔄 Séquence Attendue :</h2>
                <div className="text-green-800 space-y-2">
                    <p><strong>Étape 1 :</strong> Modal s'ouvre avec l'image visible</p>
                    <p><strong>Étape 2 :</strong> Image se charge (onLoad déclenché)</p>
                    <p><strong>Étape 3 :</strong> Cadre carré calculé et affiché</p>
                    <p><strong>Étape 4 :</strong> ReactCrop activé avec le cadre carré</p>
                    <p><strong>Étape 5 :</strong> Utilisateur peut interagir avec le cadre</p>
                </div>
            </div>

            {/* Problem solved */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">🔧 Problème Résolu :</h2>
                <div className="text-yellow-800">
                    <p><strong>Problème :</strong> Condition `{imageSrc && crop && (` empêchait l'affichage car `crop` n'était défini qu'après `onLoad`, mais `onLoad` ne pouvait pas se déclencher si l'image n'était pas affichée.</p>
                    <p><strong>Solution :</strong> Affichage conditionnel - d'abord l'image seule, puis ReactCrop quand le crop est calculé.</p>
                </div>
            </div>

            {/* Cropper modal */}
            {showCropper && selectedFile && (
                <AvatarCropper
                    imageFile={selectedFile}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    options={{
                        outputSize: 256,
                        minCropSize: 50,
                        outputQuality: 0.9
                    }}
                />
            )}
        </div>
    );
};

export default TestDisplayFix;