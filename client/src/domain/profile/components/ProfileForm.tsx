import React, { useState, useEffect } from 'react';
import { validateDisplayNameField, validateBioField } from '../schemas/profileSchemas';
import { ErrorDisplay } from '../../../shared/components';
import type { UserProfile, UpdateProfileRequest } from '../types';

interface ProfileFormProps {
    profile?: UserProfile;
    onSubmit: (data: UpdateProfileRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    className?: string;
}

interface FormData {
    displayName: string;
    bio: string;
}

interface FormErrors {
    displayName?: string;
    bio?: string;
    submit?: string;
}

/**
 * ProfileForm component for editing profile information
 * Includes real-time validation and change tracking
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
    profile,
    onSubmit,
    onCancel,
    isLoading = false,
    className = ''
}) => {
    const [formData, setFormData] = useState<FormData>({
        displayName: profile?.displayName || '',
        bio: profile?.bio || ''
    });
    
    const [errors, setErrors] = useState<FormErrors>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Track changes
    useEffect(() => {
        const hasDisplayNameChanged = formData.displayName !== (profile?.displayName || '');
        const hasBioChanged = formData.bio !== (profile?.bio || '');
        setHasChanges(hasDisplayNameChanged || hasBioChanged);
    }, [formData, profile]);

    // Real-time validation
    const validateField = (field: keyof FormData, value: string) => {
        let error: string | undefined;

        switch (field) {
            case 'displayName':
                const displayNameResult = validateDisplayNameField(value);
                if (!displayNameResult.success) {
                    error = displayNameResult.error.issues[0]?.message;
                }
                break;
            case 'bio':
                const bioResult = validateBioField(value);
                if (!bioResult.success) {
                    error = bioResult.error.issues[0]?.message;
                }
                break;
        }

        setErrors(prev => ({
            ...prev,
            [field]: error
        }));

        return !error;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Validate on change
        validateField(field, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting || isLoading) return;

        // Validate all fields
        const isDisplayNameValid = validateField('displayName', formData.displayName);
        const isBioValid = validateField('bio', formData.bio);

        if (!isDisplayNameValid || !isBioValid) {
            return;
        }

        try {
            setIsSubmitting(true);
            setErrors(prev => ({ ...prev, submit: undefined })); // Clear previous submit error

            const updateData: UpdateProfileRequest = {
                displayName: formData.displayName.trim(),
                bio: formData.bio.trim() || undefined
            };

            await onSubmit(updateData);
        } catch (error) {
            // Set submit error for display
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            setErrors(prev => ({ ...prev, submit: errorMessage }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            displayName: profile?.displayName || '',
            bio: profile?.bio || ''
        });
        setErrors({});
    };

    const retrySubmit = () => {
        setErrors(prev => ({ ...prev, submit: undefined }));
        handleSubmit(new Event('submit') as any);
    };

    const isFormValid = !errors.displayName && !errors.bio && formData.displayName.trim().length >= 2;
    const canSubmit = isFormValid && hasChanges && !isSubmitting && !isLoading;

    return (
        <form onSubmit={handleSubmit} className={`profile-form space-y-6 ${className}`}>
            {/* Submit Error Display */}
            {errors.submit && (
                <ErrorDisplay
                    error={errors.submit}
                    onRetry={retrySubmit}
                    canRetry={true}
                    className="mb-4"
                />
            )}
            {/* Display Name */}
            <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                </label>
                <input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.displayName 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your display name"
                    maxLength={30}
                    disabled={isLoading || isSubmitting}
                />
                {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {formData.displayName.length}/30 characters
                </p>
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                </label>
                <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                        errors.bio 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                    disabled={isLoading || isSubmitting}
                />
                {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {formData.bio.length}/500 characters
                </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            canSubmit
                                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading || isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>

                {hasChanges && (
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading || isSubmitting}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset Changes
                    </button>
                )}
            </div>

            {/* Change indicator */}
            {hasChanges && (
                <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                    You have unsaved changes
                </div>
            )}
        </form>
    );
};