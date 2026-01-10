/**
 * Utility to help diagnose component import issues
 */
import React from 'react';

export const validateComponent = (component: any, componentName: string): boolean => {
    if (typeof component !== 'function' && typeof component !== 'object') {
        console.error(`[ComponentDiagnostics] ${componentName} is not a valid React component:`, {
            type: typeof component,
            value: component,
            isUndefined: component === undefined,
            isNull: component === null
        });
        return false;
    }
    return true;
};

export const logComponentImports = (imports: Record<string, any>, source: string): void => {
    console.group(`[ComponentDiagnostics] Validating imports from ${source}`);
    
    Object.entries(imports).forEach(([name, component]) => {
        const isValid = validateComponent(component, name);
        console.log(`${name}: ${isValid ? '✅' : '❌'}`, {
            type: typeof component,
            hasDisplayName: component?.displayName,
            hasName: component?.name
        });
    });
    
    console.groupEnd();
};

// Helper pour wrapper les composants et capturer les erreurs
export const safeComponent = <P extends object>(
    Component: React.ComponentType<P>,
    fallbackName: string = 'Unknown'
): React.ComponentType<P> => {
    if (!validateComponent(Component, fallbackName)) {
        return (_props: P) => React.createElement('div', {
            className: 'p-4 bg-red-100 border border-red-300 rounded text-red-700'
        }, `Component Error: ${fallbackName} failed to load`);
    }
    return Component;
};