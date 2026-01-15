/**
 * Diagnostic Logger for Avatar Upload System
 * Provides detailed logging to identify upload issues
 */

export type DiagnosticPhase = 
    | 'file-select' 
    | 'validation' 
    | 'crop-start' 
    | 'crop-complete' 
    | 'file-conversion'
    | 'upload-start' 
    | 'upload-progress' 
    | 'upload-complete' 
    | 'cache-update' 
    | 'error';

export interface DiagnosticLog {
    timestamp: number;
    phase: DiagnosticPhase;
    component: string;
    data: any;
    error?: Error;
}

class DiagnosticLogger {
    private logs: DiagnosticLog[] = [];
    private enabled: boolean = true; // Set to false in production

    log(phase: DiagnosticPhase, component: string, data: any, error?: Error) {
        if (!this.enabled) return;

        const log: DiagnosticLog = {
            timestamp: Date.now(),
            phase,
            component,
            data,
            error
        };

        this.logs.push(log);

        // Console output with color coding
        const emoji = this.getPhaseEmoji(phase);
        const style = this.getPhaseStyle(phase);
        
        console.log(
            `%c${emoji} [Avatar Upload] ${phase.toUpperCase()} - ${component}`,
            style,
            data,
            error || ''
        );
    }

    getLogs(): DiagnosticLog[] {
        return [...this.logs];
    }

    getLogsByPhase(phase: DiagnosticPhase): DiagnosticLog[] {
        return this.logs.filter(log => log.phase === phase);
    }

    getLogsByComponent(component: string): DiagnosticLog[] {
        return this.logs.filter(log => log.component === component);
    }

    clearLogs() {
        this.logs = [];
        console.log('%c[Avatar Upload] Logs cleared', 'color: gray');
    }

    exportLogs(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    printSummary() {
        console.group('%c[Avatar Upload] Diagnostic Summary', 'color: blue; font-weight: bold');
        
        const phases = Array.from(new Set(this.logs.map(log => log.phase)));
        phases.forEach(phase => {
            const phaseLogs = this.getLogsByPhase(phase);
            console.log(`${this.getPhaseEmoji(phase)} ${phase}: ${phaseLogs.length} events`);
        });

        const errors = this.getLogsByPhase('error');
        if (errors.length > 0) {
            console.error('❌ Errors found:', errors);
        }

        console.groupEnd();
    }

    private getPhaseEmoji(phase: DiagnosticPhase): string {
        const emojiMap: Record<DiagnosticPhase, string> = {
            'file-select': '📁',
            'validation': '✅',
            'crop-start': '✂️',
            'crop-complete': '🎨',
            'file-conversion': '🔄',
            'upload-start': '📤',
            'upload-progress': '⏳',
            'upload-complete': '✨',
            'cache-update': '💾',
            'error': '❌'
        };
        return emojiMap[phase] || '📝';
    }

    private getPhaseStyle(phase: DiagnosticPhase): string {
        const styleMap: Record<DiagnosticPhase, string> = {
            'file-select': 'color: blue; font-weight: bold',
            'validation': 'color: green; font-weight: bold',
            'crop-start': 'color: purple; font-weight: bold',
            'crop-complete': 'color: purple; font-weight: bold',
            'file-conversion': 'color: orange; font-weight: bold',
            'upload-start': 'color: teal; font-weight: bold',
            'upload-progress': 'color: gray',
            'upload-complete': 'color: green; font-weight: bold',
            'cache-update': 'color: blue; font-weight: bold',
            'error': 'color: red; font-weight: bold'
        };
        return styleMap[phase] || 'color: black';
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        console.log(`%c[Avatar Upload] Diagnostic logging ${enabled ? 'enabled' : 'disabled'}`, 'color: gray');
    }
}

// Singleton instance
export const diagnosticLogger = new DiagnosticLogger();

// Convenience functions
export const logAvatarUpload = (phase: DiagnosticPhase, component: string, data: any, error?: Error) => {
    diagnosticLogger.log(phase, component, data, error);
};

export const getUploadLogs = () => diagnosticLogger.getLogs();
export const clearUploadLogs = () => diagnosticLogger.clearLogs();
export const printUploadSummary = () => diagnosticLogger.printSummary();
export const exportUploadLogs = () => diagnosticLogger.exportLogs();

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
    (window as any).avatarDiagnostics = {
        getLogs: getUploadLogs,
        clearLogs: clearUploadLogs,
        printSummary: printUploadSummary,
        exportLogs: exportUploadLogs,
        enable: () => diagnosticLogger.setEnabled(true),
        disable: () => diagnosticLogger.setEnabled(false)
    };
    
    console.log(
        '%c[Avatar Upload] Diagnostic tools available via window.avatarDiagnostics',
        'color: blue; font-weight: bold'
    );
}
