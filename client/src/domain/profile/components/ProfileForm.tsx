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
 * Adapted for Glassmorphism design
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
                <label htmlFor="displayName" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Display Name *
                </label>
                <input
                    type="text"
                    id="displayName"
                    {...register('displayName')}
                    className={`
                        glass-input w-full px-4 py-3 rounded-xl placeholder-[var(--text-muted)] text-[var(--text-primary)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent
                        ${errors.displayName ? 'border-red-400 focus:ring-red-400' : ''}
                    `}
                    placeholder="Enter your display name"
                    maxLength={30}
                    disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                />
                {errors.displayName && (
                    <p className="mt-1 text-sm text-red-500 font-medium">
                        {getFormErrorMessage(errors.displayName)}
                    </p>
                )}
                <div className="flex justify-end mt-1">
                    <p className="text-xs text-[var(--text-muted)]">
                        {displayNameLength}/30 characters
                    </p>
                </div>
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Bio
                </label>
                <textarea
                    id="bio"
                    {...register('bio')}
                    rows={4}
                    className={`
                        glass-input w-full px-4 py-3 rounded-xl placeholder-[var(--text-muted)] text-[var(--text-primary)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent resize-vertical
                        ${errors.bio ? 'border-red-400 focus:ring-red-400' : ''}
                    `}
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                    disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                />
                {errors.bio && (
                    <p className="mt-1 text-sm text-red-500 font-medium">
                        {getFormErrorMessage(errors.bio)}
                    </p>
                )}
                <div className="flex justify-end mt-1">
                    <p className="text-xs text-[var(--text-muted)]">
                        {bioLength}/500 characters
                    </p>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-[var(--border-subtle)] gap-4">
                <div className="flex flex-col-reverse sm:flex-row space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3 gap-3 sm:gap-0">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                        className="glass-panel px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-translucent)] hover:text-[var(--text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`
                            px-6 py-2.5 text-sm font-medium rounded-xl shadow-lg transition-all
                            ${canSubmit
                                ? 'bg-[var(--accent-primary)] text-white hover:brightness-110 hover:scale-105 hover:shadow-xl'
                                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed'}
                        `}
                    >
                        {isSubmitting || updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {isDirty && (
                    <div className="flex items-center justify-between sm:justify-end">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isLoading || isSubmitting || updateProfileMutation.isPending}
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] underline mr-4 disabled:opacity-50"
                        >
                            Reset Changes
                        </button>
                        {hasUnsavedChanges && (
                            <span className="text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-3 py-1.5 rounded-full font-medium sm:hidden">
                                Unsaved changes
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Change indicator and real-time status - Desktop only for unsaved message */}
            <div className="flex items-center justify-between">
                {hasUnsavedChanges && (
                    <div className="hidden sm:block text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-3 py-2 rounded-md font-medium">
                        ⚠️ You have unsaved changes
                    </div>
                )}

                {profile && (
                    <RealTimeStatus
                        userId={profile.userId}
                        showDetails={false}
                        className="text-xs ml-auto"
                    />
                )}
            </div>

            {/* TanStack Query mutation status indicator */}
            {updateProfileMutation.isPending && (
                <div className="text-xs text-[var(--accent-primary)] bg-blue-50/80 backdrop-blur-sm px-3 py-2 rounded-md font-medium text-center">
                    Saving changes...
                </div>
            )}
        </form>
    );
};