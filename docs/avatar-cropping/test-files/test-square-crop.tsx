/**
 * Test component to verify that crop area is always square
 * Tests that the crop selection maintains 1:1 aspect ratio
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestSquareCrop: React.FC = () => {
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
            <h1 className="text-2xl font-bold mb-6">Test Cadre de Sélection Carré</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour tester le cadre carré :
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
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Instructions de Test :</h2>
                <ol className="text-blue-800 space-y-2 list-decimal list-inside">
                    <li><strong>Sélectionnez une image</strong> (n'importe quel format)</li>
                    <li><strong>Ouvrez le cropper</strong> et observez le cadre de sélection</li>
                    <li><strong>Vérifiez que le cadre initial</strong> est parfaitement carré</li>
                    <li><strong>Essayez de redimensionner</strong> en tirant sur les coins</li>
                    <li><strong>Essayez de redimensionner</strong> en tirant sur les bords</li>
                    <li><strong>Vérifiez que le cadre reste toujours carré</strong> pendant le redimensionnement</li>
                    <li><strong>Déplacez le cadre</strong> et vérifiez qu'il reste carré</li>
                    <li><strong>Utilisez le bouton Reset</strong> et vérifiez que le nouveau cadre est carré</li>
                </ol>
            </div>

            {/* Expected behaviors */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">Comportements Attendus :</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                    <div className="space-y-2">
                        <h3 className="font-semibold">✅ Cadre Initial :</h3>
                        <ul className="space-y-1 text-sm">
                            <li>• Parfaitement carré (largeur = hauteur)</li>
                            <li>• Centré sur l'image</li>
                            <li>• Taille maximale qui rentre dans l'image</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">✅ Redimensionnement :</h3>
                        <ul className="space-y-1 text-sm">
                            <li>• Coins : redimensionnement diagonal carré</li>
                            <li>• Bords : redimensionnement carré</li>
                            <li>• Toujours ratio 1:1 maintenu</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Visual checks */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">Vérifications Visuelles :</h2>
                <div className="grid grid-cols-2 gap-4 text-yellow-800">
                    <ul className="space-y-1">
                        <li>• Le cadre a 4 côtés égaux</li>
                        <li>• Les coins forment des angles droits</li>
                        <li>• La grille interne est carrée</li>
                    </ul>
                    <ul className="space-y-1">
                        <li>• Les poignées de redimensionnement sont symétriques</li>
                        <li>• Le preview montre un carré</li>
                        <li>• Aucune déformation du cadre</li>
                    </ul>
                </div>
            </div>

            {/* Test scenarios */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">Scénarios de Test :</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded border">
                        <strong>📐 Image Paysage</strong>
                        <p className="text-sm text-purple-800">Le cadre carré doit s'adapter à la hauteur de l'image</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                        <strong>📱 Image Portrait</strong>
                        <p className="text-sm text-purple-800">Le cadre carré doit s'adapter à la largeur de l'image</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                        <strong>⬜ Image Carrée</strong>
                        <p className="text-sm text-purple-800">Le cadre carré doit remplir presque toute l'image</p>
                    </div>
                </div>
            </div>

            {/* Crop result */}
            {cropResult && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-indigo-900 mb-2">Résultat du Crop :</h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={cropResult.croppedImageUrl}
                            alt="Résultat cropé"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-300"
                        />
                        <div className="text-indigo-800">
                            <p><strong>Dimensions finales :</strong> {cropResult.finalDimensions.width}×{cropResult.finalDimensions.height}px</p>
                            <p><strong>Ratio :</strong> {(cropResult.finalDimensions.width / cropResult.finalDimensions.height).toFixed(2)}:1</p>
                            <p><strong>Est carré :</strong> {
                                cropResult.finalDimensions.width === cropResult.finalDimensions.height ? 
                                '✅ Oui' : '❌ Non'
                            }</p>
                            <p><strong>Qualité :</strong> {cropResult.quality}</p>
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
                        minCropSize: 50
                    }}
                />
            )}
        </div>
    );
};

export default TestSquareCrop;