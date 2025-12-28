import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaToggleOn, FaToggleOff, FaTimes } from 'react-icons/fa';

interface AdminSiteControlsProps {
    isOpen: boolean;
    onClose: () => void;
    adminCode: string; // We'll pass the code stored in Navbar/App state if available, or ask again? 
    // Actually, Navbar usually has the code or we rely on the component to handle it?
    // Let's assume we pass the adminCode that was already verified, 
    // OR we use the global admin check. But PUT requests need the code.
    // For now, let's pass it. If not available, we might need a prompt.
    // Simplification: Assume Navbar passes the code it used for login? 
    // Wait, Navbar state for `adminCode` is local to the input. 
    // We might need to ask the user to re-enter it or store it in App state.
    // For security, asking again or keeping it in memory is fine.
    // Let's expect it as a prop.
    isDarkMode: boolean;
    onSettingsChange?: () => void;
    user?: any; // Avoiding full interface duplication, or we can import User
    onOpenLogin?: () => void;
}

interface SystemSetting {
    key: string;
    value: string;
    description: string;
}

export const AdminSiteControls: React.FC<AdminSiteControlsProps> = ({ isOpen, onClose, adminCode, isDarkMode, onSettingsChange, user, onOpenLogin }) => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && adminCode) {
            fetchSettings();
        }
    }, [isOpen, adminCode]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            // Lock body scroll and maintain scroll position
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            // Note: We can't easily restore scroll on unmount if we don't know where we were
            // But usually this component unmounts on Close, which is handled above.
        };
    }, [isOpen]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/settings?adminCode=${adminCode}`);
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            } else {
                if (res.status === 401) {
                    alert(t('admin.invalid_code'));
                    onClose();
                }
                console.error("Failed to fetch settings");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: string, value: string) => {
        try {
            const res = await fetch(`/api/settings/${key}?adminCode=${adminCode}&value=${encodeURIComponent(value)}`, {
                method: 'POST'
            });
            if (res.ok) {
                setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
                if (onSettingsChange) {
                    onSettingsChange();
                }
            }
        } catch (e) {
            console.error("Failed to update setting", e);
        }
    };

    const toggleSetting = (key: string, currentValue: string) => {
        // Enforce personal login for Critical Maintenance Mode
        if (key === 'SITE_MAINTENANCE_MODE' && currentValue === 'false') {
            if (!user || !user.username) {
                if (!user || !user.username) {
                    // alert(t('admin.maintenance_login_required') || "You must be logged in with your personal account to enable Maintenance Mode.");
                    if (onOpenLogin) onOpenLogin();
                    return;
                }
            }
        }

        const newValue = currentValue === 'true' ? 'false' : 'true';
        updateSetting(key, newValue);

        // Track who enabled maintenance mode
        if (key === 'SITE_MAINTENANCE_MODE') {
            if (newValue === 'true') {
                const activator = user?.username ? user.username : 'Admin';
                updateSetting('SITE_MAINTENANCE_BY', activator);
            } else {
                updateSetting('SITE_MAINTENANCE_BY', '');
            }
        }
    };

    const getSettingLabel = (key: string) => {
        switch (key) {
            case 'SITE_MAINTENANCE_MODE':
                return t('admin.settings.maintenance_mode');
            case 'SITE_MAINTENANCE_MESSAGE':
                return t('admin.settings.maintenance_message');
            case 'SITE_MAINTENANCE_BY':
                return t('admin.settings.activated_by');
            case 'PAGE_CV_ENABLED':
                return t('admin.settings.page_cv');
            case 'PAGE_GAME_ENABLED':
                return t('admin.settings.page_game');
            case 'PAGE_MESSAGES_ENABLED':
                return t('admin.settings.page_messages');
            case 'PAGE_SUGGESTIONS_ENABLED':
                return t('admin.settings.page_suggestions');
            case 'PAGE_CALENDAR_ENABLED':
                return t('admin.settings.page_calendar');
            default:
                return key;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white border border-white/10' : 'bg-white text-gray-900'}`}
                >
                    <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            🛠️ {t('admin.site_settings')}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition-colors">
                            <FaTimes />
                        </button>
                    </div>

                    <div
                        className="p-6 max-h-[70vh] overflow-y-auto overscroll-contain"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {!user || !user.username ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                                <div className="text-4xl mb-2">🔒</div>
                                <h3 className="text-lg font-bold">{t('admin.login_required')}</h3>
                                <p className="text-sm opacity-70 max-w-xs">
                                    {t('admin.login_audit_explanation')}
                                </p>
                                <button
                                    onClick={() => onOpenLogin && onOpenLogin()}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-500/30"
                                >
                                    {t('auth.login')}
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-8 opacity-50">{t('admin.loading')}</div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {settings.map(setting => (
                                    <div key={setting.key} className={`p-4 rounded-xl flex flex-col gap-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-bold flex items-center gap-2">
                                                    {getSettingLabel(setting.key)}
                                                    {setting.key === 'SITE_MAINTENANCE_MODE' && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{t('admin.critical')}</span>}
                                                </div>
                                                <div className="text-sm opacity-60">{setting.description}</div>
                                            </div>

                                            {(setting.value === 'true' || setting.value === 'false') && (
                                                <button
                                                    onClick={() => toggleSetting(setting.key, setting.value)}
                                                    className={`text-3xl transition-colors ${setting.value === 'true' ? 'text-green-500' : 'text-gray-400'}`}
                                                >
                                                    {setting.value === 'true' ? <FaToggleOn /> : <FaToggleOff />}
                                                </button>
                                            )}
                                        </div>

                                        {/* Textarea for message editing */}
                                        {setting.key === 'SITE_MAINTENANCE_MESSAGE' && (
                                            <div className="flex gap-2">
                                                <textarea
                                                    className={`w-full p-2 rounded text-sm ${isDarkMode ? 'bg-black/20 text-white' : 'bg-white text-black'} border border-current/10`}
                                                    value={setting.value}
                                                    onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                                                    rows={2}
                                                />
                                                <button
                                                    onClick={() => updateSetting(setting.key, setting.value)}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs font-bold self-end"
                                                >
                                                    {t('admin.save_changes')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 text-xs opacity-50 text-center">
                            {(!user || !user.username) ? "" : t('admin.changes_effect_warning')}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
