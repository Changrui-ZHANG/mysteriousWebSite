/**
 * AdminSiteControls - Site settings modal with Liquid Glass aesthetic
 * Allows admins to toggle site features and maintenance mode
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaCog, FaExclamationTriangle } from 'react-icons/fa';

interface AdminSiteControlsProps {
    isOpen: boolean;
    onClose: () => void;
    adminCode: string;
    onSettingsChange?: () => void;
    user?: User;
    onOpenLogin?: () => void;
}

interface SystemSetting {
    key: string;
    value: string;
    description: string;
}

interface User {
    userId: string;
    username: string;
}

export const AdminSiteControls: React.FC<AdminSiteControlsProps> = ({
    isOpen, onClose, adminCode, onSettingsChange, user, onOpenLogin
}) => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && adminCode) fetchSettings();
    }, [isOpen, adminCode]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
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
        };
    }, [isOpen]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/settings?adminCode=${adminCode}`);
            if (res.ok) {
                setSettings(await res.json());
            } else if (res.status === 401) {
                alert(t('admin.invalid_code'));
                onClose();
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
                onSettingsChange?.();
            }
        } catch (e) {
            console.error("Failed to update setting", e);
        }
    };

    const toggleSetting = (key: string, currentValue: string) => {
        if (key === 'SITE_MAINTENANCE_MODE' && currentValue === 'false' && (!user || !user.username)) {
            onOpenLogin?.();
            return;
        }
        const newValue = currentValue === 'true' ? 'false' : 'true';
        updateSetting(key, newValue);
        if (key === 'SITE_MAINTENANCE_MODE') {
            updateSetting('SITE_MAINTENANCE_BY', newValue === 'true' ? (user?.username || 'Admin') : '');
        }
    };

    const getSettingLabel = (key: string) => {
        const labels: Record<string, string> = {
            'SITE_MAINTENANCE_MODE': t('admin.settings.maintenance_mode'),
            'SITE_MAINTENANCE_MESSAGE': t('admin.settings.maintenance_message'),
            'SITE_MAINTENANCE_BY': t('admin.settings.activated_by'),
            'PAGE_CV_ENABLED': t('admin.settings.page_cv'),
            'PAGE_GAME_ENABLED': t('admin.settings.page_game'),
            'PAGE_MESSAGES_ENABLED': t('admin.settings.page_messages'),
            'PAGE_SUGGESTIONS_ENABLED': t('admin.settings.page_suggestions'),
            'PAGE_CALENDAR_ENABLED': t('admin.settings.page_calendar'),
            'PAGE_LEARNING_ENABLED': t('admin.settings.page_learning'),
            'PAGE_NOTES_ENABLED': t('admin.settings.page_notes'),
        };
        return labels[key] || key;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg rounded-3xl bg-white/[0.05] backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden"
                >
                    {/* Glass highlight */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-heading font-bold flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                                <FaCog className="w-5 h-5" />
                            </div>
                            {t('admin.site_settings')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                            aria-label={t('common.close')}
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                        {!user || !user.username ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                                    🔒
                                </div>
                                <h3 className="text-lg font-bold">{t('admin.login_required')}</h3>
                                <p className="text-sm text-secondary opacity-70 max-w-xs">
                                    {t('admin.login_audit_explanation')}
                                </p>
                                <button
                                    onClick={() => onOpenLogin?.()}
                                    className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                                >
                                    {t('auth.login')}
                                </button>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {settings.map(setting => (
                                    <div
                                        key={setting.key}
                                        className={`p-4 rounded-2xl bg-white/5 border transition-all ${setting.key === 'SITE_MAINTENANCE_MODE' && setting.value === 'true'
                                                ? 'border-red-500/30 bg-red-500/5'
                                                : 'border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium flex items-center gap-2 flex-wrap">
                                                    {getSettingLabel(setting.key)}
                                                    {setting.key === 'SITE_MAINTENANCE_MODE' && (
                                                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <FaExclamationTriangle className="w-3 h-3" />
                                                            {t('admin.critical')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-secondary opacity-60 mt-1">{setting.description}</div>
                                            </div>

                                            {(setting.value === 'true' || setting.value === 'false') && (
                                                <button
                                                    onClick={() => toggleSetting(setting.key, setting.value)}
                                                    className={`relative w-14 h-8 rounded-full transition-all ${setting.value === 'true'
                                                            ? 'bg-green-500'
                                                            : 'bg-white/10'
                                                        }`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transition-all ${setting.value === 'true' ? 'left-7' : 'left-1'
                                                        }`} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Textarea for maintenance message */}
                                        {setting.key === 'SITE_MAINTENANCE_MESSAGE' && (
                                            <div className="mt-4 flex gap-2">
                                                <textarea
                                                    className="flex-1 p-3 bg-white/5 rounded-xl border border-white/10 focus:border-accent-primary/50 outline-none text-sm resize-none"
                                                    value={setting.value}
                                                    onChange={(e) => setSettings(prev => prev.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                                                    rows={2}
                                                />
                                                <button
                                                    onClick={() => updateSetting(setting.key, setting.value)}
                                                    className="px-4 py-2 bg-accent-primary text-white rounded-xl text-sm font-bold self-end hover:bg-accent-primary/80 transition-colors"
                                                >
                                                    {t('admin.save_changes')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {user?.username && (
                            <div className="mt-6 text-xs text-secondary opacity-50 text-center">
                                {t('admin.changes_effect_warning')}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
