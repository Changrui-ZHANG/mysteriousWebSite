/**
 * Test component to verify correct aspect ratio handling
 * Tests that images display with their natural proportions
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestAspectRatio: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imageInfo, setImageInfo] = useState<{ 
        width: number; 
        height: number; 
        aspectRatio: number;
        type: string;
    } | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            
            // Get image info
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                let type = '';
                
                if (aspectRatio > 1.5) type = 'Très Paysage';
                else if (aspectRatio > 1.1) type = 'Paysage';
                else if (aspectRatio > 0.9) type = 'Carré';
                else if (aspectRatio > 0.6) type = 'Portrait';
                else type = 'Très Portrait';
                
                setImageInfo({
                    width: img.width,
                    height: img.height,
                    aspectRatio,
                    type
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
            <h1 className="text-2xl font-bold mb-6">Test Aspect Ratio Correct</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Testez différents types d'images :
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Image analysis */}
            {imageInfo && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Analyse de l'Image :</h2>
                    <div className="grid grid-cols-2 gap-4 text-blue-800">
                        <div>
                            <p><strong>Dimensions :</strong> {imageInfo.width} × {imageInfo.height}</p>
                            <p><strong>Type :</strong> {imageInfo.type}</p>
                        </div>
                        <div>
                            <p><strong>Aspect Ratio :</strong> {imageInfo.aspectRatio.toFixed(2)}:1</p>
                            <p><strong>Attendu :</strong> Canvas adapté à ces proportions</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Test instructions */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">Instructions de Test :</h2>
                <ol className="text-green-800 space-y-2 list-decimal list-inside">
                    <li><strong>Sélectionnez une image</strong> (paysage, portrait, ou carrée)</li>
                    <li><strong>Ouvrez le cropper</strong> et observez le canvas</li>
                    <li><strong>Vérifiez que le canvas</strong> a les mêmes proportions que l'image</li>
                    <li><strong>Vérifiez que l'image</strong> remplit complètement le canvas sans déformation</li>
                    <li><strong>Testez la zone de crop</strong> pour confiruer qu'elle fonctionne</li>
                </ol>
            </div>

            {/* Expected results */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">Résultats Attendus :</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-yellow-800">
                    <div className="p-3 bg-white rounded border">
                        <strong>📐 Image Paysage</strong>
                        <p className="text-sm">Canvas plus large que haut</p>
                        <p className="text-sm">Image remplit le canvas sans étirement</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                        <strong>📱 Image Portrait</strong>
                        <p className="text-sm">Canvas plus haut que large</p>
                        <p className="text-sm">Image remplit le canvas sans étirement</p>
                    </div>
                    <div className="p-3 bg-white rounded border">
                        <strong>⬜ Image Carrée</strong>
                        <p className="text-sm">Canvas carré</p>
                        <p className="text-sm">Image remplit le canvas parfaitement</p>
                    </div>
                </div>
            </div>

            {/* Visual checks */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">Vérifications Visuelles :</h2>
                <div className="grid grid-cols-2 gap-4 text-purple-800">
                    <ul className="space-y-1">
                        <li>• Les cercles restent ronds</li>
                        <li>• Les carrés restent carrés</li>
                        <li>• Les visages ont des proportions naturelles</li>
                    </ul>
                    <ul className="space-y-1">
                        <li>• Le texte n'est pas déformé</li>
                        <li>• Les objets gardent leurs proportions</li>
                        <li>• Aucun étirement visible</li>
                    </ul>
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
                        minCropSize: 50
                    }}
                />
            )}
        </div>
    );
};

export default TestAspectRatio;