/**
 * Test pour vérifier que les images PNG sont supportées
 * Tests that PNG images are properly supported
 */

import React, { useState } from 'react';
import { AvatarCropper } from '../../../client/src/domain/profile/components/cropping/AvatarCropper';

export const TestPngSupport: React.FC = () => {
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
        console.log('PNG Crop completed:', result);
    };

    const handleCropCancel = () => {
        setShowCropper(false);
        setSelectedFile(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Test Support PNG</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image PNG pour tester le support :
                </label>
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {/* Test instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">🧪 Test à Effectuer :</h2>
                <div className="text-blue-800 space-y-2">
                    <p><strong>1. Testez PNG avec transparence</strong> - Sélectionnez un PNG avec fond transparent</p>
                    <p><strong>2. Testez PNG sans transparence</strong> - Sélectionnez un PNG avec fond opaque</p>
                    <p><strong>3. Testez JPEG</strong> - Sélectionnez un JPEG pour comparaison</p>
                    <p><strong>4. Testez WebP</strong> - Sélectionnez un WebP si disponible</p>
                    <p><strong>5. Vérifiez le format de sortie</strong> - Le format doit être préservé</p>
                </div>
            </div>

            {/* Expected behavior */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">✅ Comportement Attendu :</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                    <ul className="space-y-1">
                        <li>• <strong>PNG accepté</strong> - Pas d'erreur de validation</li>
                        <li>• <strong>Transparence préservée</strong> - Fond transparent maintenu</li>
                        <li>• <strong>Format préservé</strong> - Sortie en PNG si entrée en PNG</li>
                        <li>• <strong>Qualité maintenue</strong> - Pas de compression JPEG</li>
                    </ul>
                    <ul className="space-y-1">
                        <li>• <strong>JPEG → JPEG</strong> - Fond blanc ajouté</li>
                        <li>• <strong>WebP → WebP</strong> - Format préservé</li>
                        <li>• <strong>Cropping fonctionnel</strong> - Toutes les fonctionnalités</li>
                        <li>• <strong>Upload possible</strong> - Pas de rejet serveur</li>
                    </ul>
                </div>
            </div>

            {/* Problem solved */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">🔧 Problème Résolu :</h2>
                <div className="text-yellow-800">
                    <p><strong>Problème :</strong> Les PNG étaient convertis en JPEG, perdant la transparence.</p>
                    <p><strong>Cause :</strong> Conversion forcée en JPEG dans AvatarCropper et AvatarService.</p>
                    <p><strong>Solution :</strong> Détection du format original et préservation (PNG → PNG, WebP → WebP, JPEG → JPEG).</p>
                </div>
            </div>

            {/* Technical details */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">⚙️ Détails Techniques :</h2>
                <div className="text-purple-800 space-y-2">
                    <p><strong>Formats Supportés :</strong></p>
                    <ul className="ml-4 space-y-1">
                        <li>• <strong>PNG</strong> - Transparence préservée, pas de compression</li>
                        <li>• <strong>JPEG</strong> - Fond blanc ajouté, compression 90%</li>
                        <li>• <strong>WebP</strong> - Format moderne préservé</li>
                    </ul>
                    <br />
                    <p><strong>Logique de Conversion :</strong></p>
                    <p>• PNG/WebP → Même format (transparence préservée)</p>
                    <p>• JPEG → JPEG (fond blanc ajouté)</p>
                    <p>• Autres → JPEG (fallback sécurisé)</p>
                </div>
            </div>

            {/* Format detection */}
            {selectedFile && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                    <h2 className="text-lg font-semibold text-indigo-900 mb-2">📄 Fichier Sélectionné :</h2>
                    <div className="text-indigo-800">
                        <p><strong>Nom :</strong> {selectedFile.name}</p>
                        <p><strong>Type :</strong> {selectedFile.type}</p>
                        <p><strong>Taille :</strong> {Math.round(selectedFile.size / 1024)}KB</p>
                        <p><strong>Format attendu en sortie :</strong> {
                            ['image/png', 'image/webp'].includes(selectedFile.type) 
                                ? selectedFile.type 
                                : 'image/jpeg'
                        }</p>
                    </div>
                </div>
            )}

            {/* Crop result */}
            {cropResult && (
                <div className="mb-6 p-4 bg-green-100 rounded-lg">
                    <h2 className="text-lg font-semibold text-green-900 mb-2">🎉 Résultat du Test :</h2>
                    <div className="flex items-start space-x-4">
                        <img
                            src={cropResult.croppedImageUrl}
                            alt="Résultat cropé"
                            className="w-32 h-32 object-cover rounded-full border-2 border-green-300"
                        />
                        <div className="text-green-800">
                            <p><strong>Dimensions :</strong> {cropResult.finalDimensions.width}×{cropResult.finalDimensions.height}px</p>
                            <p><strong>Format de sortie :</strong> {cropResult.croppedImageBlob.type}</p>
                            <p><strong>Taille finale :</strong> {Math.round(cropResult.croppedImageBlob.size / 1024)}KB</p>
                            <p><strong>Qualité :</strong> {cropResult.quality}</p>
                            <p><strong>Format préservé :</strong> {
                                selectedFile && cropResult.croppedImageBlob.type === selectedFile.type 
                                    ? '✅ Oui' 
                                    : selectedFile && ['image/png', 'image/webp'].includes(selectedFile.type) && cropResult.croppedImageBlob.type === selectedFile.type
                                        ? '✅ Oui'
                                        : selectedFile && selectedFile.type !== 'image/jpeg' && cropResult.croppedImageBlob.type === 'image/jpeg'
                                            ? '⚠️ Converti en JPEG'
                                            : '✅ Correct'
                            }</p>
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

export default TestPngSupport;