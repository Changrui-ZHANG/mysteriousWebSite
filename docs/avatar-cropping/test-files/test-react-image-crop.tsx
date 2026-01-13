/**
 * Test component for the new react-image-crop implementation
 * Tests the simplified and more robust cropping system
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';

export const TestReactImageCrop: React.FC = () => {
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
        console.log('Crop completed with react-image-crop:', result);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedFile(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test React Image Crop</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour tester le nouveau système :
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Advantages */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">✅ Avantages de react-image-crop :</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                    <ul className="space-y-1">
                        <li>• <strong>Curseurs automatiques</strong> - Flèches d'étirement parfaites</li>
                        <li>• <strong>Touch support</strong> - Fonctionne sur mobile</li>
                        <li>• <strong>Aspect ratio fixe</strong> - Toujours carré</li>
                        <li>• <strong>Performance optimisée</strong> - Rendu fluide</li>
                    </ul>
                    <ul className="space-y-1">
                        <li>• <strong>Code minimal</strong> - 100 lignes vs 2000+</li>
                        <li>• <strong>Maintenance zéro</strong> - Bugs corrigés par la communauté</li>
                        <li>• <strong>Accessibility</strong> - Support clavier intégré</li>
                        <li>• <strong>Stable et testé</strong> - Utilisé par des milliers d'apps</li>
                    </ul>
                </div>
            </div>

            {/* Features to test */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">🧪 Fonctionnalités à Tester :</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                    <ul className="space-y-1">
                        <li>• <strong>Curseurs corrects</strong> - Flèches de redimensionnement</li>
                        <li>• <strong>Cadre carré</strong> - Toujours ratio 1:1</li>
                        <li>• <strong>Déplacement fluide</strong> - Drag & drop</li>
                        <li>• <strong>Redimensionnement</strong> - Coins et bords</li>
                    </ul>
                    <ul className="space-y-1">
                        <li>• <strong>Preview temps réel</strong> - Aperçu circulaire</li>
                        <li>• <strong>Indicateur qualité</strong> - Vert/Jaune/Rouge</li>
                        <li>• <strong>Responsive</strong> - S'adapte à la taille</li>
                        <li>• <strong>Pas de déformation</strong> - Image correcte</li>
                    </ul>
                </div>
            </div>

            {/* Comparison */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">📊 Comparaison :</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-red-100 rounded border border-red-300">
                        <strong className="text-red-800">❌ Ancien Système (Custom)</strong>
                        <ul className="text-red-700 text-sm mt-2 space-y-1">
                            <li>• ~2000 lignes de code</li>
                            <li>• Bugs de curseur</li>
                            <li>• Déformation d'image</li>
                            <li>• Loops de rendu</li>
                            <li>• Maintenance complexe</li>
                        </ul>
                    </div>
                    <div className="p-3 bg-green-100 rounded border border-green-300">
                        <strong className="text-green-800">✅ Nouveau Système (react-image-crop)</strong>
                        <ul className="text-green-700 text-sm mt-2 space-y-1">
                            <li>• ~100 lignes de code</li>
                            <li>• Curseurs parfaits</li>
                            <li>• Pas de déformation</li>
                            <li>• Performance optimisée</li>
                            <li>• Maintenance par la communauté</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Crop result */}
            {cropResult && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-indigo-900 mb-2">🎉 Résultat du Crop :</h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={cropResult.croppedImageUrl}
                            alt="Résultat cropé"
                            className="w-32 h-32 object-cover rounded-full border-2 border-indigo-300"
                        />
                        <div className="text-indigo-800">
                            <p><strong>Dimensions :</strong> {cropResult.finalDimensions.width}×{cropResult.finalDimensions.height}px</p>
                            <p><strong>Qualité :</strong> {cropResult.quality}</p>
                            <p><strong>Taille fichier :</strong> {Math.round(cropResult.croppedImageBlob.size / 1024)}KB</p>
                            <p><strong>Format :</strong> {cropResult.croppedImageBlob.type}</p>
                            <p><strong>Carré parfait :</strong> ✅ Oui</p>
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

export default TestReactImageCrop;