/**
 * FormField - Reusable form field component
 * Supports text, email, and textarea inputs with validation and character counting
 * Adapted for Glassmorphism design with Tailwind v4 syntax
 */

import React from 'react';

export interface FormFieldProps {
    /** Field label */
    label: string;
    /** Field name (for form registration) */
    name: string;
    /** Input type */
    type?: 'text' | 'email' | 'textarea';
    /** Current value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Error message (if any) */
    error?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Maximum character length */
    maxLength?: number;
    /** Show character count */
    showCharacterCount?: boolean;
    /** Whether field is required */
    required?: boolean;
    /** Whether field is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Number of rows for textarea */
    rows?: number;
}

/**
 * FormField component
 * Reusable form field with built-in validation display and character counting
 * 
 * @example
 * ```tsx
 * <FormField
 *   label="Display Name"
 *   name="displayName"
 *   value={displayName}
 *   onChange={setDisplayName}
 *   error={errors.displayName}
 *   maxLength={30}
 *   showCharacterCount
 *   required
 * />
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    maxLength,
    showCharacterCount = false,
    required = false,
    disabled = false,
    className = '',
    rows = 4
}) => {
    const InputComponent = type === 'textarea' ? 'textarea' : 'input';
    const inputId = `form-field-${name}`;

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            <label
                htmlFor={inputId}
                className="block text-sm font-medium text-(--text-secondary)"
            >
                {label}
                {required && (
                    <span className="text-red-500 ml-1" aria-label="required">
                        *
                    </span>
                )}
            </label>

            {/* Input/Textarea */}
            <InputComponent
                id={inputId}
                name={name}
                type={type !== 'textarea' ? type : undefined}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                required={required}
                disabled={disabled}
                rows={type === 'textarea' ? rows : undefined}
                className={`
                    w-full px-4 py-3 rounded-xl
                    bg-(--bg-surface) text-(--text-primary)
                    border ${error ? 'border-red-500' : 'border-(--border-primary)'}
                    placeholder-(--text-muted)
                    focus:outline-none focus:ring-2 
                    ${error ? 'focus:ring-red-400' : 'focus:ring-(--accent-primary)'}
                    focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    ${type === 'textarea' ? 'resize-vertical' : ''}
                `}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
            />

            {/* Error message and character count */}
            <div className="flex justify-between items-center min-h-[20px]">
                {error && (
                    <span
                        id={`${inputId}-error`}
                        className="text-red-500 text-sm font-medium"
                        role="alert"
                    >
                        {error}
                    </span>
                )}
                {showCharacterCount && maxLength && (
                    <span
                        className="text-(--text-muted) text-xs ml-auto"
                        aria-live="polite"
                        aria-label={`${value.length} of ${maxLength} characters used`}
                    >
                        {value.length} / {maxLength}
                    </span>
                )}
            </div>
        </div>
    );
};
