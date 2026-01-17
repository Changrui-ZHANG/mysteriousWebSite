import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ErrorDisplay } from '../../../shared/components';
import { RealTimeStatus } from './RealTimeStatus';
import { useEditingActions, useHasUnsavedChanges } from '../stores/editingStore';
import { useNotificationActions } from '../stores/notificationStore';
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
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitting },
        reset,
        watch,
        setValue,
        setError,
        clearErrors
    } = useForm<ProfileFormData>({
        resolver: profileFormResolver,
        defaultValues: {
            displayName: profile?.displayName || '',
            bio: profile?.bio || '',
            gender: profile?.gender || '',
        },
        mode: 'onChange', // Real-time validation
    });

    // Global UI state
    const hasUnsavedChanges = useHasUnsavedChanges();
    const { startEditing, markUnsavedChanges, resetEditingState } = useEditingActions();
    const { addSuccessNotification, addErrorNotification } = useNotificationActions();

    // Explicitly register hidden fields or fields updated via setValue
    useEffect(() => {
        register('gender');
    }, [register]);

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
                gender: profile.gender || '',
            });
            markUnsavedChanges(false);
        }
    }, [profile, reset, markUnsavedChanges]);

    // Track form changes for unsaved changes indicator
    useEffect(() => {
        markUnsavedChanges(isDirty);
    }, [isDirty, markUnsavedChanges]);

    // Set editing state when component mounts/unmounts
    useEffect(() => {
        startEditing('profile');
        return () => {
            resetEditingState();
        };
    }, [startEditing, resetEditingState]);

    const onFormSubmit = handleSubmit(async (data: ProfileFormData) => {
        if (!profile) return;

        try {
            clearErrors('root.submit');
            const updateData = transformProfileFormData(data);

            // Call the parent onSubmit callback which handles the mutation
            await onSubmit(updateData);

            // Show success notification
            addSuccessNotification(
                t('profile.form.success'),
                ''
            );

            // Reset editing state
            markUnsavedChanges(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            setError('root.submit', { message: errorMessage });

            // Show error notification
            addErrorNotification(
                t('common.unknown_error'),
                errorMessage
            );
        }
    });

    const handleReset = () => {
        reset({
            displayName: profile?.displayName || '',
            bio: profile?.bio || '',
            gender: profile?.gender || '',
        });
        clearErrors();
        markUnsavedChanges(false);
    };

    const handleCancel = () => {
        if (hasUnsavedChanges) {
            const confirmCancel = window.confirm(t('profile.form.cancel_confirm'));
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

    const canSubmit = isDirty && !isSubmitting && !isLoading;

    return (
        <form onSubmit={onFormSubmit} className={`profile-form space-y-6 ${className}`}>
            {/* Submit Error Display */}
            {errors.root?.submit && (
                <ErrorDisplay
                    error={errors.root.submit.message || t('common.unknown_error')}
                    onRetry={retrySubmit}
                    canRetry={true}
                    className="mb-4"
                />
            )}

            {/* Display Name */}
            <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-(--text-secondary) mb-2">
                    {t('profile.form.display_name')} *
                </label>
                <input
                    type="text"
                    id="displayName"
                    {...register('displayName')}
                    className={`
                        glass-input w-full px-4 py-3 rounded-xl placeholder-(--text-muted) text-(--text-primary)
                        focus:outline-none focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent
                        ${errors.displayName ? 'border-red-400 focus:ring-red-400' : ''}
                    `}
                    placeholder={t('profile.form.display_name')}
                    maxLength={30}
                    disabled={isLoading || isSubmitting}
                />
                {errors.displayName && (
                    <p className="mt-1 text-sm text-red-500 font-medium">
                        {getFormErrorMessage(errors.displayName)}
                    </p>
                )}
                <div className="flex justify-end mt-1">
                    <p className="text-xs text-(--text-muted)">
                        {displayNameLength}/30 characters
                    </p>
                </div>
            </div>

            {/* Gender */}
            <div>
                <label className="block text-sm font-medium text-(--text-secondary) mb-2">
                    {t('profile.gender.title')}
                </label>
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => setValue('gender', 'H', { shouldDirty: true })}
                        disabled={isLoading || isSubmitting}
                        className={`flex-1 py-3 rounded-xl border transition-all ${watch('gender')?.toUpperCase() === 'H' ? 'bg-(--accent-primary)/20 border-(--accent-primary) text-(--text-primary)' : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-secondary) hover:bg-(--bg-surface-translucent)'}`}
                    >
                        ♂️ {t('profile.gender.male')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue('gender', 'F', { shouldDirty: true })}
                        disabled={isLoading || isSubmitting}
                        className={`flex-1 py-3 rounded-xl border transition-all ${watch('gender')?.toUpperCase() === 'F' ? 'bg-(--accent-secondary)/20 border-(--accent-secondary) text-(--text-primary)' : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-secondary) hover:bg-(--bg-surface-translucent)'}`}
                    >
                        ♀️ {t('profile.gender.female')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setValue('gender', '', { shouldDirty: true })}
                        disabled={isLoading || isSubmitting}
                        className={`flex-1 py-3 rounded-xl border transition-all ${!watch('gender') ? 'bg-(--accent-primary)/10 border-(--accent-primary) text-(--text-primary)' : 'bg-(--bg-surface) border-(--border-subtle) text-(--text-secondary) hover:bg-(--bg-surface-translucent)'}`}
                    >
                        {t('profile.gender.not_specified')}
                    </button>
                </div>
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-(--text-secondary) mb-2">
                    {t('profile.form.bio')}
                </label>
                <textarea
                    id="bio"
                    {...register('bio')}
                    rows={4}
                    className={`
                        glass-input w-full px-4 py-3 rounded-xl placeholder-(--text-muted) text-(--text-primary)
                        focus:outline-none focus:ring-2 focus:ring-(--accent-primary) focus:border-transparent resize-vertical
                        ${errors.bio ? 'border-red-400 focus:ring-red-400' : ''}
                    `}
                    placeholder={t('profile.form.bio_placeholder')}
                    maxLength={500}
                    disabled={isLoading || isSubmitting}
                />
                {errors.bio && (
                    <p className="mt-1 text-sm text-red-500 font-medium">
                        {getFormErrorMessage(errors.bio)}
                    </p>
                )}
                <div className="flex justify-end mt-1">
                    <p className="text-xs text-(--text-muted)">
                        {bioLength}/500 characters
                    </p>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-(--border-subtle) gap-4">
                <div className="flex flex-col-reverse sm:flex-row space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3 gap-3 sm:gap-0">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading || isSubmitting}
                        className="glass-panel px-6 py-2.5 text-sm font-medium text-(--text-secondary) hover:bg-(--bg-surface-translucent) hover:text-(--text-primary) transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('common.cancel')}
                    </button>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`
                            px-6 py-2.5 text-sm font-medium rounded-xl shadow-lg transition-all
                            ${canSubmit
                                ? 'bg-(--accent-primary) text-white hover:brightness-110 hover:scale-105 hover:shadow-xl'
                                : 'bg-(--bg-surface) text-(--text-muted) border border-(--border-subtle) cursor-not-allowed'}
                        `}
                    >
                        {isSubmitting ? t('profile.form.saving') : t('profile.form.save')}
                    </button>
                </div>

                {isDirty && (
                    <div className="flex items-center justify-between sm:justify-end">
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={isLoading || isSubmitting}
                            className="text-xs text-(--text-muted) hover:text-(--text-secondary) underline mr-4 disabled:opacity-50"
                        >
                            {t('profile.form.reset')}
                        </button>
                        {hasUnsavedChanges && (
                            <span className="text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-3 py-1.5 rounded-full font-medium sm:hidden">
                                {t('profile.form.unsaved')}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Change indicator and real-time status - Desktop only for unsaved message */}
            <div className="flex items-center justify-between">
                {hasUnsavedChanges && (
                    <div className="hidden sm:block text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-3 py-2 rounded-md font-medium">
                        ⚠️ {t('profile.form.unsaved')}
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

            {/* Loading status indicator */}
            {isSubmitting && (
                <div className="text-xs text-(--accent-primary) bg-blue-50/80 backdrop-blur-sm px-3 py-2 rounded-md font-medium text-center">
                    {t('profile.form.saving')}
                </div>
            )}
        </form>
    );
};