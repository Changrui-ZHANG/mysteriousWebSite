/**
 * Test pour vérifier que le cadre de sélection est carré par défaut
 * Tests the default square crop selection
 */

import React, { useState } from 'react';
import { AvatarCropper } from '../../../client/src/domain/profile/components/cropping/AvatarCropper';

export const TestSquareDefaultCrop: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropResult, setCropResult] = useState<{
        croppedImageBlob: Blob;
        croppedImageUrl: string;
        finalDimensions: { width: number; height: number };
        quality: 'high' | 'medium' | 'low';
    } | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setShowCropper(true);
        }
    };

    const handleCropComplete = (result: {
        croppedImageBlob: Blob;
        croppedImageUrl: string;
        finalDimensions: { width: number; height: number };
        quality: 'high' | 'medium' | 'low';
    }) => {
        setCropResult(result);
        setShowCropper(false);
        console.log('Crop completed - Square default test:', result);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedFile(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Cadre de Sélection Carré par Défaut</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour tester le cadre carré par défaut :
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Test instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">🧪 Test à Effectuer :</h2>
                <div className="text-blue-800 space-y-2">
                    <p><strong>1. Sélectionnez une image</strong> - N'importe quelle image (portrait, paysage, carrée)</p>
                    <p><strong>2. Vérifiez le cadre initial</strong> - Le cadre de sélection doit être parfaitement carré dès l'ouverture</p>
                    <p><strong>3. Testez différentes images</strong> - Le cadre doit toujours être carré, peu importe les proportions de l'image</p>
                    <p><strong>4. Vérifiez le centrage</strong> - Le cadre carré doit être centré sur l'image</p>
                </div>
            </div>

            {/* Expected behavior */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">✅ Comportement Attendu :</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                    <ul className="space-y-1">
                        <li>• <strong>Cadre parfaitement carré</strong> - Largeur = Hauteur</li>
                        <li>• <strong>Centré automatiquement</strong> - Au centre de l'image</li>
                        <li>• <strong>Taille adaptée</strong> - 80% de la plus petite dimension</li>
                        <li>• <strong>Aspect ratio 1:1</strong> - Toujours maintenu</li>
                    </ul>
                    <ul className="space-y-1">
                        <li>• <strong>Fonctionne avec toutes les images</strong> - Portrait, paysage, carré</li>
                        <li>• <strong>Handles visibles</strong> - 4 coins pour redimensionner</li>
                        <li>• <strong>Déplacement fluide</strong> - Drag & drop</li>
                        <li>• <strong>Redimensionnement carré</strong> - Maintient toujours le ratio 1:1</li>
                    </ul>
                </div>
            </div>

            {/* Previous issues */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Problème Résolu :</h2>
                <div className="text-yellow-800">
                    <p><strong>Avant :</strong> Le cadre de sélection utilisait des pourcentages (80% width, 80% height) qui ne garantissaient pas un carré parfait sur des images avec des proportions différentes.</p>
                    <p><strong>Maintenant :</strong> Le cadre est calculé en pixels après le chargement de l'image pour garantir un carré parfait, centré et adapté à la taille de l'image.</p>
                </div>
            </div>

            {/* Test different image types */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">📸 Types d'Images à Tester :</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-800">
                    <div className="p-3 bg-purple-100 rounded">
                        <strong>🖼️ Image Portrait</strong>
                        <p className="text-sm mt-1">Plus haute que large (ex: 600x800)</p>
                        <p className="text-sm">Le cadre doit être carré et centré</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded">
                        <strong>🌄 Image Paysage</strong>
                        <p className="text-sm mt-1">Plus large que haute (ex: 800x600)</p>
                        <p className="text-sm">Le cadre doit être carré et centré</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded">
                        <strong>⬜ Image Carrée</strong>
                        <p className="text-sm mt-1">Même largeur et hauteur (ex: 600x600)</p>
                        <p className="text-sm">Le cadre doit occuper 80% de l'image</p>
                    </div>
                </div>
            </div>

            {/* Crop result */}
            {cropResult && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-indigo-900 mb-2">🎉 Résultat du Test :</h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={cropResult.croppedImageUrl}
                            alt="Résultat cropé"
                            className="w-32 h-32 object-cover rounded-full border-2 border-indigo-300"
                        />
                        <div className="text-indigo-800">
                            <p><strong>Dimensions :</strong> {cropResult.finalDimensions.width}×{cropResult.finalDimensions.height}px</p>
                            <p><strong>Carré parfait :</strong> {cropResult.finalDimensions.width === cropResult.finalDimensions.height ? '✅ Oui' : '❌ Non'}</p>
                            <p><strong>Qualité :</strong> {cropResult.quality}</p>
                            <p><strong>Taille fichier :</strong> {Math.round(cropResult.croppedImageBlob.size / 1024)}KB</p>
                            <p><strong>Format :</strong> {cropResult.croppedImageBlob.type}</p>
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
                        outputQuality: 0.9
                    }}
                />
            )}
        </div>
    );
};

export default TestSquareDefaultCrop;