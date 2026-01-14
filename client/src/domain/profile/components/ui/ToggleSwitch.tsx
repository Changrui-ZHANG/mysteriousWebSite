/**
 * ToggleSwitch Component
 * 
 * A reusable, accessible toggle switch component with full keyboard navigation
 * and screen reader support.
 * 
 * @example
 * ```tsx
 * <ToggleSwitch
 *   label="Show Email"
 *   description="Allow others to see your email address"
 *   checked={showEmail}
 *   onChange={setShowEmail}
 * />
 * ```
 */

import React from 'react';

export interface ToggleSwitchProps {
  /** The main label text for the toggle */
  label: string;
  
  /** Optional description text displayed below the label */
  description?: string;
  
  /** Current checked state of the toggle */
  checked: boolean;
  
  /** Callback function called when the toggle state changes */
  onChange: (checked: boolean) => void;
  
  /** Whether the toggle is disabled */
  disabled?: boolean;
  
  /** Optional aria-label for accessibility (defaults to label) */
  'aria-label'?: string;
  
  /** Optional CSS class name for custom styling */
  className?: string;
}

/**
 * ToggleSwitch - A fully accessible toggle switch component
 * 
 * Features:
 * - Full keyboard navigation (Space/Enter to toggle)
 * - Screen reader support with ARIA attributes
 * - Visual feedback for hover, focus, and disabled states
 * - Smooth animations
 * - Tailwind v4 compliant styling
 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  className = ''
}) => {
  /**
   * Handle toggle click
   */
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  /**
   * Handle keyboard events for accessibility
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    
    // Toggle on Space or Enter key
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Label and Description */}
      <div className="flex-1 mr-4">
        <label 
          htmlFor={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-(--text-primary) font-medium cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-(--text-secondary) text-sm mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Toggle Switch */}
      <button
        id={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full 
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-(--accent-primary) focus:ring-offset-2
          ${checked ? 'bg-(--accent-primary)' : 'bg-(--bg-tertiary)'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'}
        `}
      >
        {/* Toggle Knob */}
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white 
            transition-transform duration-200 ease-in-out
            shadow-sm
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
