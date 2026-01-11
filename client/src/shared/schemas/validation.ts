import { z } from 'zod';

/**
 * Common validation schemas used across the application
 */

// Base schemas
export const IdSchema = z.string().min(1, 'ID is required');
export const TimestampSchema = z.number().positive('Timestamp must be positive');
export const UsernameSchema = z.string()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

// User schemas
export const UserSchema = z.object({
    userId: IdSchema,
    username: UsernameSchema,
});

export type User = z.infer<typeof UserSchema>;

// API Response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        message: z.string().nullable(),
        data: dataSchema.nullable(),
        timestamp: z.string(),
    });

export type ApiResponse<T> = {
    success: boolean;
    message: string | null;
    data: T | null;
    timestamp: string;
};

// Pagination schemas
export const PaginationParamsSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        items: z.array(itemSchema),
        total: z.number().int().nonnegative(),
        page: z.number().int().positive(),
        totalPages: z.number().int().nonnegative(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
    });

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginatedResponse<T> = {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

// Date range schema
export const DateRangeSchema = z.object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
}).refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    {
        message: 'Start date must be before or equal to end date',
        path: ['endDate'],
    }
);

export type DateRange = z.infer<typeof DateRangeSchema>;

// Form validation helpers
export const createFormSchema = <T extends z.ZodRawShape>(shape: T) => {
    return z.object(shape);
};

export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
} => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors: Record<string, string> = {};
            error.issues.forEach((err: z.ZodIssue) => {
                const path = err.path.join('.');
                errors[path] = err.message;
            });
            return { success: false, errors };
        }
        return { success: false, errors: { general: 'Validation failed' } };
    }
};

// Environment validation
export const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    VITE_API_BASE_URL: z.string().url().optional(),
    VITE_WS_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;