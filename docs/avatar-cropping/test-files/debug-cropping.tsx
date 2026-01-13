/**
 * Debug component pour tester le cropping d'avatar
 */

import React, { useState } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const DebugCropping: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropResult, setCropResult] = useState<CropResult | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('Fichier sélectionné:', file.name, file.type, file.size);
            setSelectedFile(file);
            setShowCropper(true);
        }
    };

    const handleCropComplete = (result: CropResult) => {
        console.log('Cropping terminé:', result);
        setCropResult(result);
        setShowCropper(false);
    };

    const handleCropCancel = () => {
        console.log('Cropping annulé');
        setShowCropper(false);
        setSelectedFile(null);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Debug - Test du système de cropping</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <h2>1. Sélection de fichier</h2>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ marginBottom: '10px' }}
                />
                {selectedFile && (
                    <p>Fichier sélectionné: {selectedFile.name} ({selectedFile.type})</p>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>2. État du cropper</h2>
                <p>Cropper visible: {showCropper ? 'OUI' : 'NON'}</p>
                <p>Fichier prêt: {selectedFile ? 'OUI' : 'NON'}</p>
            </div>

            {cropResult && (
                <div style={{ marginBottom: '20px' }}>
                    <h2>3. Résultat du cropping</h2>
                    <p>Taille finale: {cropResult.finalDimensions.width}x{cropResult.finalDimensions.height}</p>
                    <p>Qualité: {cropResult.quality}</p>
                    <img 
                        src={cropResult.croppedImageUrl} 
                        alt="Résultat du cropping"
                        style={{ maxWidth: '200px', border: '1px solid #ccc' }}
                    />
                </div>
            )}

            {/* Cropper Modal */}
            {showCropper && selectedFile && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <h3>Cropper d'avatar</h3>
                        <AvatarCropper
                            imageFile={selectedFile}
                            onCropComplete={handleCropComplete}
                            onCancel={handleCropCancel}
                            options={{
                                outputSize: 256,
                                minCropSize: 128,
                                maxScale: 3.0,
                                outputQuality: 0.9
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};