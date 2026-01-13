/**
 * Test pour vérifier que le preview s'affiche correctement
 * Tests that the preview displays properly
 */

import React, { useState } from 'react';
import { AvatarCropper } from '../../../client/src/domain/profile/components/cropping/AvatarCropper';

export const TestPreviewFix: React.FC = () => {
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
            <h1 className="text-2xl font-bold mb-6">Test Preview Fonctionnel</h1>
            
            {/* File input */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez une image pour tester le preview :
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
                <h2 className="text-lg font-semibold text-blue-900 mb-2">✅ Checklist Preview :</h2>
                <div className="text-blue-800 space-y-2">
                    <p><strong>1. Preview initial</strong> - Le preview circulaire doit s'afficher dès que le cadre carré apparaît</p>
                    <p><strong>2. Preview temps réel</strong> - Le preview doit se mettre à jour quand on déplace/redimensionne le cadre</p>
                    <p><strong>3. Preview carré</strong> - Le contenu du preview doit être carré (pas déformé)</p>
                    <p><strong>4. Preview centré</strong> - Le preview doit être centré dans le cercle</p>
                    <p><strong>5. Qualité visible</strong> - L'indicateur de qualité doit être correct</p>
                </div>
            </div>

            {/* Expected behavior */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h2 className="text-lg font-semibold text-green-900 mb-2">🎯 Comportement Attendu :</h2>
                <div className="text-green-800 space-y-2">
                    <p><strong>Séquence :</strong></p>
                    <p>1. Image s'affiche → 2. Cadre carré calculé → 3. Preview généré automatiquement</p>
                    <p>4. Utilisateur déplace/redimensionne → 5. Preview mis à jour en temps réel</p>
                    <br />
                    <p><strong>Preview :</strong></p>
                    <p>• Cercle de 128x128px avec l'aperçu de la zone croppée</p>
                    <p>• Contenu carré (pas d'étirement)</p>
                    <p>• Mise à jour fluide lors des interactions</p>
                </div>
            </div>

            {/* Problem solved */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h2 className="text-lg font-semibold text-yellow-900 mb-2">🔧 Problème Résolu :</h2>
                <div className="text-yellow-800">
                    <p><strong>Problème :</strong> Le preview ne s'affichait plus après les corrections du cadre carré.</p>
                    <p><strong>Cause :</strong> La fonction `generatePreview` n'était appelée qu'au changement de crop, pas lors de l'initialisation.</p>
                    <p><strong>Solution :</strong> Génération du preview initial dans `onImageLoad` + réorganisation des fonctions.</p>
                </div>
            </div>

            {/* Technical details */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h2 className="text-lg font-semibold text-purple-900 mb-2">⚙️ Détails Techniques :</h2>
                <div className="text-purple-800 space-y-2">
                    <p><strong>onImageLoad :</strong></p>
                    <p>• Calcule le cadre carré</p>
                    <p>• Définit completedCrop</p>
                    <p>• Génère le preview initial avec setTimeout(100ms)</p>
                    <br />
                    <p><strong>handleCropComplete :</strong></p>
                    <p>• Appelé lors des interactions utilisateur</p>
                    <p>• Met à jour completedCrop</p>
                    <p>• Régénère le preview</p>
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

export default TestPreviewFix;