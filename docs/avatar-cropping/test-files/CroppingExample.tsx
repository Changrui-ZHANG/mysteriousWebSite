/**
 * CroppingExample - Example usage of the avatar cropping system
 * Demonstrates how to integrate the cropping functionality
 */

import React, { useState } from 'react';
import { AvatarUploadWithCropping } from '../AvatarUploadWithCropping';

interface CroppingExampleProps {
    userId: string;
}

/**
 * Example component showing how to use the avatar cropping system
 */
export const CroppingExample: React.FC<CroppingExampleProps> = ({ userId }) => {
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>();
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const handleUploadComplete = (avatarUrl: string) => {
        setCurrentAvatarUrl(avatarUrl);
        setUploadStatus('✅ Avatar uploaded successfully!');
        
        // Clear status after 3 seconds
        setTimeout(() => setUploadStatus(''), 3000);
    };

    const handleUploadError = (error: string) => {
        setUploadStatus(`❌ Upload failed: ${error}`);
        
        // Clear status after 5 seconds
        setTimeout(() => setUploadStatus(''), 5000);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Avatar Cropping Example
            </h2>
            
            <p className="text-sm text-gray-600 mb-6">
                Upload an image and crop it to create the perfect avatar. 
                The cropping tool will help you select the best part of your image.
            </p>

            <AvatarUploadWithCropping
                userId={userId}
                currentAvatarUrl={currentAvatarUrl}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                enableCropping={true}
                className="mb-4"
            />

            {/* Status display */}
            {uploadStatus && (
                <div className={`p-3 rounded-md text-sm ${
                    uploadStatus.includes('✅') 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {uploadStatus}
                </div>
            )}

            {/* Feature highlights */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">✨ Features</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Interactive cropping with drag & resize</li>
                    <li>• Real-time preview (circular & square)</li>
                    <li>• Quality assessment and recommendations</li>
                    <li>• Mobile-friendly touch controls</li>
                    <li>• Zoom and pan for perfect framing</li>
                    <li>• Automatic square ratio enforcement</li>
                </ul>
            </div>

            {/* Usage instructions */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">📖 How to use</h3>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Click or drag an image to upload</li>
                    <li>Use the cropping tool to select your desired area</li>
                    <li>Adjust zoom and position for perfect framing</li>
                    <li>Preview how it will look as an avatar</li>
                    <li>Click "Apply Crop" to save your avatar</li>
                </ol>
            </div>
        </div>
    );
};