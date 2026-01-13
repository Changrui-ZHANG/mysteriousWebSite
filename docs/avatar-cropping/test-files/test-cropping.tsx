/**
 * Test simple pour vérifier que le système de cropping fonctionne
 */

import React from 'react';
import { AvatarUploadWithCropping } from './domain/profile/components/AvatarUploadWithCropping';

export const TestCropping: React.FC = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Test du système de cropping d'avatar</h1>
            <p>Sélectionnez une image pour tester la fonctionnalité de découpage :</p>
            
            <AvatarUploadWithCropping
                userId="test-user"
                enableCropping={true}
                onUploadComplete={(url) => {
                    console.log('Upload terminé:', url);
                    alert('Upload terminé avec succès !');
                }}
                onUploadError={(error) => {
                    console.error('Erreur upload:', error);
                    alert('Erreur lors de l\'upload: ' + error);
                }}
            />
        </div>
    );
};