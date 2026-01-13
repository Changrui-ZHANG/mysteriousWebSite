/**
 * React Hook Form integration schemas
 * Integrates existing Zod schemas with React Hook Form resolvers
 */

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
    DisplayNameSchema, 
    PrivacySettingsSchema 
} from './profileSchemas';

/**
 * Profile form schema for React Hook Form
 * Used for editing existing profiles
 */
export const ProfileFormSchema = z.object({
    displayName: DisplayNameSchema,
    bio: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof ProfileFormSchema>;

/**
 * Create profile form schema for React Hook Form
 * Used for creating new profiles
 */
export const CreateProfileFormSchema = z.object({
    displayName: DisplayNameSchema,
    bio: z.string().optional(),
    privacySettings: PrivacySettingsSchema.partial().optional(),
});

export type CreateProfileFormData = z.infer<typeof CreateProfileFormSchema>;

/**
 * Privacy settings form schema for React Hook Form
 */
export const PrivacyFormSchema = PrivacySettingsSchema;

export type PrivacyFormData = z.infer<typeof PrivacyFormSchema>;

/**
 * React Hook Form resolvers
 */
export const profileFormResolver = zodResolver(ProfileFormSchema);
export const createProfileFormResolver = zodResolver(CreateProfileFormSchema);
export const privacyFormResolver = zodResolver(PrivacyFormSchema);

/**
 * Default form values
 */
export const defaultProfileFormValues: Partial<ProfileFormData> = {
    displayName: '',
    bio: '',
};

export const defaultCreateProfileFormValues: Partial<CreateProfileFormData> = {
    displayName: '',
    bio: '',
    privacySettings: {
        profileVisibility: 'public',
        showBio: true,
        showStats: true,
        showAchievements: true,
        showLastActive: true,
    },
};

export const defaultPrivacyFormValues: PrivacyFormData = {
    profileVisibility: 'public',
    showBio: true,
    showStats: true,
    showAchievements: true,
    showLastActive: true,
};

/**
 * Form validation helpers for React Hook Form
 */
export const getFormErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'Invalid input';
};

/**
 * Transform form data to API format
 */
export const transformProfileFormData = (data: ProfileFormData) => {
    return {
        displayName: data.displayName.trim(),
        bio: data.bio?.trim() || undefined,
    };
};

export const transformCreateProfileFormData = (data: CreateProfileFormData) => {
    return {
        displayName: data.displayName.trim(),
        bio: data.bio?.trim() || undefined,
        privacySettings: data.privacySettings,
    };
};