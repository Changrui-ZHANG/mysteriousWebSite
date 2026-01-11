import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
}

interface UseFormValidationOptions<T> {
    schema: z.ZodSchema<T>;
    initialValues?: Partial<T>;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
}

interface FormField {
    value: unknown;
    error?: string;
    touched: boolean;
}

/**
 * Hook for form validation using Zod schemas
 * Provides real-time validation, error handling, and form state management
 */
export function useFormValidation<T extends Record<string, unknown>>({
    schema,
    initialValues = {},
    validateOnChange = false,
    validateOnBlur = true,
}: UseFormValidationOptions<T>) {
    const [fields, setFields] = useState<Record<keyof T, FormField>>(() => {
        const initialFields: Record<keyof T, FormField> = {} as Record<keyof T, FormField>;
        
        // Initialize fields from schema or initial values
        const schemaShape = (schema as z.ZodObject<any>)._def?.shape;
        if (schemaShape) {
            Object.keys(schemaShape).forEach((key) => {
                initialFields[key as keyof T] = {
                    value: initialValues[key as keyof T] ?? '',
                    touched: false,
                };
            });
        }
        
        return initialFields;
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Get current form values
    const values = useMemo(() => {
        const formValues: Partial<T> = {};
        Object.entries(fields).forEach(([key, field]) => {
            formValues[key as keyof T] = field.value as T[keyof T];
        });
        return formValues;
    }, [fields]);

    // Validate a single field
    const validateField = useCallback((name: keyof T, value: unknown): string | undefined => {
        try {
            // Create a partial schema for single field validation
            const fieldSchema = (schema as z.ZodObject<any>).shape[name];
            if (fieldSchema) {
                fieldSchema.parse(value);
            }
            return undefined;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return error.issues[0]?.message;
            }
            return 'Validation error';
        }
    }, [schema]);

    // Validate entire form
    const validateForm = useCallback((): ValidationResult<T> => {
        try {
            const validatedData = schema.parse(values);
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
    }, [schema, values]);

    // Set field value
    const setFieldValue = useCallback((name: keyof T, value: unknown) => {
        setFields(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value,
                error: validateOnChange ? validateField(name, value) : prev[name]?.error,
            },
        }));
    }, [validateField, validateOnChange]);

    // Set field error
    const setFieldError = useCallback((name: keyof T, error: string | undefined) => {
        setFields(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                error,
            },
        }));
    }, []);

    // Set field touched
    const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
        setFields(prev => {
            const field = prev[name];
            return {
                ...prev,
                [name]: {
                    ...field,
                    touched,
                    error: touched && validateOnBlur ? validateField(name, field?.value) : field?.error,
                },
            };
        });
    }, [validateField, validateOnBlur]);

    // Reset form
    const resetForm = useCallback((newValues?: Partial<T>) => {
        const resetFields: Record<keyof T, FormField> = {} as Record<keyof T, FormField>;
        
        Object.keys(fields).forEach((key) => {
            resetFields[key as keyof T] = {
                value: newValues?.[key as keyof T] ?? initialValues[key as keyof T] ?? '',
                touched: false,
                error: undefined,
            };
        });
        
        setFields(resetFields);
        setSubmitError(null);
        setIsSubmitting(false);
    }, [fields, initialValues]);

    // Handle form submission
    const handleSubmit = useCallback(async (
        onSubmit: (values: T) => Promise<void> | void
    ) => {
        setIsSubmitting(true);
        setSubmitError(null);

        // Mark all fields as touched
        setFields(prev => {
            const touchedFields = { ...prev };
            Object.keys(touchedFields).forEach((key) => {
                touchedFields[key as keyof T] = {
                    ...touchedFields[key as keyof T],
                    touched: true,
                };
            });
            return touchedFields;
        });

        // Validate form
        const validation = validateForm();
        
        if (!validation.success) {
            // Set field errors
            if (validation.errors) {
                Object.entries(validation.errors).forEach(([key, error]) => {
                    setFieldError(key as keyof T, error);
                });
            }
            setIsSubmitting(false);
            return;
        }

        try {
            await onSubmit(validation.data!);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, setFieldError]);

    // Get field props for input components
    const getFieldProps = useCallback((name: keyof T) => {
        const field = fields[name];
        return {
            name: name as string,
            value: field?.value ?? '',
            error: field?.error,
            touched: field?.touched ?? false,
            onChange: (value: unknown) => setFieldValue(name, value),
            onBlur: () => setFieldTouched(name, true),
        };
    }, [fields, setFieldValue, setFieldTouched]);

    // Check if form is valid
    const isValid = useMemo(() => {
        return validateForm().success;
    }, [validateForm]);

    // Check if form has errors
    const hasErrors = useMemo(() => {
        return Object.values(fields).some(field => field.error);
    }, [fields]);

    // Check if form is dirty (has changes)
    const isDirty = useMemo(() => {
        return Object.values(fields).some(field => field.touched);
    }, [fields]);

    return {
        // Form state
        values,
        fields,
        isValid,
        hasErrors,
        isDirty,
        isSubmitting,
        submitError,

        // Field operations
        setFieldValue,
        setFieldError,
        setFieldTouched,
        getFieldProps,

        // Form operations
        validateForm,
        validateField,
        handleSubmit,
        resetForm,
    };
}