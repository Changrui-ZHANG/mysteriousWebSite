/**
 * Test simple pour vérifier que la zone de crop est correctement positionnée
 */

import React, { useState, useRef } from 'react';
import { AvatarCropper } from './domain/profile/components/cropping/AvatarCropper';
import { CropResult } from './domain/profile/components/cropping/types';

export const TestCropZone: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [cropResult, setCropResult] = useState<CropResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            console.log('📁 Fichier sélectionné:', file.name, file.type);
            setSelectedFile(file);
            setShowCropper(true);
        }
    };

    const handleCropComplete = (result: CropResult) => {
        console.log('✅ Cropping terminé:', result);
        setCropResult(result);
        setShowCropper(false);
    };

    const handleCropCancel = () => {
        console.log('❌ Cropping annulé');
        setShowCropper(false);
        setSelectedFile(null);
    };

    const handleTestDifferentImages = () => {
        fileInputRef.current?.click();
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1>Test - Zone de crop correctement positionnée</h1>
            
            <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>Instructions de test</h2>
                <ol>
                    <li><strong>Testez différents ratios d'image :</strong>
                        <ul>
                            <li>Image carrée (1:1)</li>
                            <li>Image paysage (16:9, 4:3)</li>
                            <li>Image portrait (9:16, 3:4)</li>
                        </ul>
                    </li>
                    <li><strong>Vérifiez que :</strong>
                        <ul>
                            <li>L'image n'est pas déformée</li>
                            <li>La zone de crop est bien centrée</li>
                            <li>La zone de crop est carrée</li>
                            <li>Les handles de redimensionnement sont visibles</li>
                        </ul>
                    </li>
                    <li><strong>Testez les interactions :</strong>
                        <ul>
                            <li>Zoom avec la molette (doux et progressif)</li>
                            <li>Redimensionnement par les handles</li>
                            <li>Déplacement de la zone</li>
                        </ul>
                    </li>
                </ol>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <button
                    onClick={handleTestDifferentImages}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    📁 Sélectionner une image de test
                </button>
            </div>

            {selectedFile && !showCropper && (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                    <p><strong>Fichier sélectionné :</strong> {selectedFile.name}</p>
                    <p><strong>Type :</strong> {selectedFile.type}</p>
                    <p><strong>Taille :</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                        onClick={() => setShowCropper(true)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🎨 Ouvrir le cropper
                    </button>
                </div>
            )}

            {cropResult && (
                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '6px' }}>
                    <h3>✅ Résultat du cropping</h3>
                    <p><strong>Dimensions finales :</strong> {cropResult.finalDimensions.width}x{cropResult.finalDimensions.height}</p>
                    <p><strong>Qualité :</strong> {cropResult.quality}</p>
                    <div style={{ marginTop: '10px' }}>
                        <img 
                            src={cropResult.croppedImageUrl} 
                            alt="Résultat du cropping"
                            style={{ 
                                maxWidth: '200px', 
                                border: '2px solid #28a745',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
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
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                    }}>
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

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '6px' }}>
                <h3>🔍 Points à vérifier</h3>
                <ul>
                    <li>L'image conserve son ratio d'aspect (pas de déformation)</li>
                    <li>La zone de crop est parfaitement carrée</li>
                    <li>La zone de crop est centrée sur l'image</li>
                    <li>Les 8 handles de redimensionnement sont visibles et fonctionnels</li>
                    <li>Le zoom est fluide et progressif</li>
                    <li>La zone peut être déplacée en cliquant à l'intérieur</li>
                    <li>La zone peut être redimensionnée par tous les handles</li>
                </ul>
            </div>
        </div>
    );
};