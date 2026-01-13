/**
 * Test component specifically for image deformation issues
 * Tests different image aspect ratios to ensure no deformation
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestImageDeformation: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropResult, setCropResult] = useState<CropResult | null>(null);
    const [imageInfo, setImageInfo] = useState<{ width: number; height: number; aspectRatio: string } | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            
            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                const aspectRatio = (img.width / img.height).toFixed(2);
                setImageInfo({
                    width: img.width,
                    height: img.height,
                    aspectRatio: `${aspectRatio}:1`
                });
                setShowCropper(true);
            };
            img.src = URL.createObjectURL(file);
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
        setImageInfo(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Déformation d'Image</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour tester la déformation :
                </label>
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
                    <h2 className="text-lg font-semibold text-blue-900 mb-2">Informations de l'Image :</h2>
                    <div className="text-blue-800">
                        <p><strong>Dimensions originales :</strong> {imageInfo.width} × {imageInfo.height} pixels</p>
                        <p><strong>Aspect ratio :</strong> {imageInfo.aspectRatio}</p>
                        <p><strong>Type :</strong> {
                            imageInfo.width > imageInfo.height ? 'Paysage (plus large que haute)' :
                            imageInfo.height > imageInfo.width ? 'Portrait (plus haute que large)' :
                            'Carrée'
                        }</p>
                    </div>
                </div>
            )}

            {/* Test scenarios */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">Scénarios de Test :</h2>
                <div className="text-yellow-800 space-y-2">
                    <div className="p-2 bg-white rounded border">
                        <strong>📐 Image Paysage (ex: 1920×1080)</strong>
                        <p className="text-sm">L'image doit s'afficher sans être étirée verticalement</p>
                    </div>
                    <div className="p-2 bg-white rounded border">
                        <strong>📱 Image Portrait (ex: 1080×1920)</strong>
                        <p className="text-sm">L'image doit s'afficher sans être étirée horizontalement</p>
                    </div>
                    <div className="p-2 bg-white rounded border">
                        <strong>⬜ Image Carrée (ex: 1000×1000)</strong>
                        <p className="text-sm">L'image doit s'afficher parfaitement carrée</p>
                    </div>
                    <div className="p-2 bg-white rounded border">
                        <strong>📏 Image Très Large (ex: 3000×500)</strong>
                        <p className="text-sm">L'image doit s'afficher sans compression verticale</p>
                    </div>
                    <div className="p-2 bg-white rounded border">
                        <strong>📏 Image Très Haute (ex: 500×3000)</strong>
                        <p className="text-sm">L'image doit s'afficher sans compression horizontale</p>
                    </div>
                </div>
            </div>

            {/* Checklist */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">Checklist de Vérification :</h2>
                <ul className="text-green-800 space-y-2">
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ L'image s'affiche avec ses proportions originales</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Aucun étirement horizontal ou vertical visible</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ Le canvas s'adapte aux proportions de l'image</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ L'image remplit complètement le canvas</span>
                    </li>
                    <li className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>✅ La zone de crop fonctionne correctement</span>
                    </li>
                </ul>
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
                        maxScale: 3.0
                    }}
                />
            )}
        </div>
    );
};

export default TestImageDeformation;