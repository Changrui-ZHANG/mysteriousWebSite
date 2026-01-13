import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ErrorDisplay } from '../../../shared/components';
import { RealTimeStatus } from './RealTimeStatus';
import { useUpdateProfileMutation } from '../queries/profileQueries';
import { useEditingActions, useHasUnsavedChanges, useNotificationActions } from '../stores/uiStore';
import { 
    ProfileFormData, 
    profileFormResolver, 
    transformProfileFormData,
    getFormErrorMessage 
} from '../schemas/formSchemas';
import type { UserProfile, UpdateProfileRequest } from '../types';

interface ProfileFormProps {
    profile?: UserProfile;
    onSubmit: (data: UpdateProfileRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    className?: string;
}

/**
 * ProfileForm component for editing profile information
 * Now using React Hook Form with TanStack Query mutations for better performance and validation
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
    profile,
    onSubmit,
    onCancel,
    isLoading = false,
    className = ''
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        reset,
        watch,
        setError,
        clearErrors
    } = useForm<ProfileFormData>({
        resolver: profileFormResolver,
        defaultValues: {
            displayName: profile?.displayName || '',
            bio: profile?.bio || '',
        },
        mode: 'onChange', // Real-time validation
    });

    // TanStack Query mutation for profile updates
    const updateProfileMutation = useUpdateProfileMutation();

    // Global UI state
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { setEditingProfile, setUnsavedChanges, resetEditingState } = useEditingActions();
    const { addSuccessNotification, addErrorNotification } = useNotificationActions();

    // Watch form values for character counts
    const watchedValues = watch();
    const displayNameLength = watchedValues.displayName?.length || 0;
    const bioLength = watchedValues.bio?.length || 0;

    // Reset form when profile changes
    useEffect(() => {
        if (profile) {
            reset({
                displayName: profile.displayName || '',
                bio: profile.bio || '',
            });
            setUnsavedChanges(false);
        }
    }, [profile, reset, setUnsavedChanges]);

    // Track form changes for unsaved changes indicator
    useEffect(() => {
        setUnsavedChanges(isDirty);
    }, [isDirty, setUnsavedChanges]);

    // Set editing state when component mounts/unmounts
    useEffect(() => {
        setEditingProfile(true);
        return () => {
            resetEditingState();
        };
    }, [setEditingProfile, resetEditingState]);

    const onFormSubmit = handleSubmit(async (data: ProfileFormData) => {
        if (!profile) return;
        
        try {
            clearErrors('root.submit');
            
            const updateData = transformProfileFormData(data);

            // Use TanStack Query mutation with optimistic updates
            await updateProfileMutation.mutateAsync({
                userId: profile.userId,
                data: updateData,
                requesterId: profile.userId
            });

            // Show success notification
            addSuccessNotification(
                'Profile Updated',
                'Your profile has been successfully updated.'
            );

            // Call the parent onSubmit callback for any additional handling
            await onSubmit(updateData);
            
            // Reset editing state
            setUnsavedChanges(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            setError('root.submit', { message: errorMessage });
            
            // Show error notification
            addErrorNotification(
                'Update Failed',
                errorMessage
            );
        }
    });

    const handleReset = () => {
        reset({
            displayName: profile?.displayName || '',
            bio: profile?.bio || '',
        });
        clearErrors();
        setUnsavedChanges(false);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            // Could show a confirmation modal here
            const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
            if (!confirmCancel) return;
        }
        
        handleReset();
        resetEditingState();
        onCancel();
    };

    const retrySubmit = () => {
        clearErrors('root.submit');
        onFormSubmit();
    };

    const canSubmit = isDirty && !isSubmitting && !isLoading && !updateProfileMutation.isPending;

    return (
        <form onSubmit={onFormSubmit} className={`profile-form space-y-6 ${className}`}>
            {/* Submit Error Display */}
            {errors.root?.submit && (
                <ErrorDisplay
                    error={errors.root.submit.message || 'An error occurred'}
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
                    {...register('displayName')}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.displayName 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter your display name"
                    maxLength={30}
                    disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                />
                {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600">
                        {getFormErrorMessage(errors.displayName)}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {displayNameLength}/30 characters
                </p>
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                </label>
                <textarea
                    id="bio"
                    {...register('bio')}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                        errors.bio 
                            ? 'border-red-300 focus:border-red-500' 
                            : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                    disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                />
                {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">
                        {getFormErrorMessage(errors.bio)}
                    </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {bioLength}/500 characters
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
                        {isSubmitting || updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>

                {isDirty && (
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset Changes
                    </button>
                )}
            </div>

            {/* Change indicator and real-time status */}
            <div className="flex items-center justify-between">
                {hasUnsavedChanges && (
                    <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                        You have unsaved changes
                    </div>
                )}
                
                {profile && (
                    <RealTimeStatus 
                        userId={profile.userId} 
                        showDetails={false}
                        className="text-xs"
                    />
                )}
            </div>
            
            {/* TanStack Query mutation status indicator */}
            {updateProfileMutation.isPending && (
                <div className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                    Saving changes...
                </div>
            )}
        </form>
    );
};